'use client'

import { useEffect } from 'react'
import { withBasePath } from '@/lib/basePath'
import { getPublicSiteSetting } from '@/lib/publicApi'
import type { PageBehaviorName } from '@/content/pageRegistry'

type PageBehaviorProps = { behavior?: PageBehaviorName }

/**
 * Swiper 스크립트와 대상 요소가 모두 준비되면 run을 실행한다.
 * 페이지 본문은 Suspense 스트리밍으로 늦게 도착할 수 있어, Swiper만 기다리면 요소가 없는 채로 초기화를 건너뛴다.
 * 요소가 끝내 나타나지 않으면(목록이 0건이라 슬라이더 자체가 없는 경우) 약 3초 뒤 조용히 포기한다.
 */
function whenSlidersReady(selectors: string[], run: () => void) {
	let attempts = 0
	let timer: ReturnType<typeof setTimeout> | undefined
	const tick = () => {
		const ready = window.Swiper && selectors.some((selector) => document.querySelector(selector))
		if (!ready && attempts++ < 60) {
			timer = setTimeout(tick, 50)
			return
		}
		if (window.Swiper) run()
	}
	tick()
	return () => { if (timer) clearTimeout(timer) }
}

function matchHeightByRow(selector: string) {
	const items = Array.from(document.querySelectorAll<HTMLElement>(selector))
	items.forEach((item) => { item.style.height = 'auto' })
	const rows = new Map<number, HTMLElement[]>()
	items.forEach((item) => rows.set(item.offsetTop, [...(rows.get(item.offsetTop) || []), item]))
	rows.forEach((row) => {
		const height = Math.max(...row.map((item) => item.offsetHeight))
		row.forEach((item) => { item.style.height = `${height}px` })
	})
}

export default function PageBehavior({ behavior }: PageBehaviorProps) {
	useEffect(() => {
		if (behavior === 'faq') {
			const questions = Array.from(document.querySelectorAll<HTMLButtonElement>('.faq_wrap .question'))
			const onClick = (event: Event) => {
				const question = event.currentTarget as HTMLButtonElement
				const box = question.closest('.box')
				if (!box) return
				const wasOpen = box.classList.contains('on')
				document.querySelectorAll('.faq_wrap .box.on').forEach((item) => {
					item.classList.remove('on')
					item.querySelector('.question')?.setAttribute('aria-expanded', 'false')
				})
				if (!wasOpen) {
					box.classList.add('on')
					question.setAttribute('aria-expanded', 'true')
				}
			}
			questions.forEach((question) => {
				question.setAttribute('aria-expanded', 'false')
				question.addEventListener('click', onClick)
			})
			return () => questions.forEach((question) => question.removeEventListener('click', onClick))
		}

		if (behavior === 'location-map') {
			type Coordinate = object
			type Bounds = { extend: (coordinate: Coordinate) => void }
			type Marker = { setMap: (map: KakaoMap | null) => void }
			type KakaoMap = { setCenter: (coordinate: Coordinate) => void; setLevel: (level: number) => void; setBounds: (bounds: Bounds, top?: number, right?: number, bottom?: number, left?: number) => void }
			type KakaoMaps = {
				load: (callback: () => void) => void
				LatLng: new (latitude: number, longitude: number) => Coordinate
				LatLngBounds: new () => Bounds
				Map: new (container: HTMLElement, options: { center: Coordinate; level: number }) => KakaoMap
				Size: new (width: number, height: number) => object
				Point: new (x: number, y: number) => object
				MarkerImage: new (source: string, size: object, options: { offset: object }) => object
				Marker: new (options: { map?: KakaoMap; position: Coordinate; image?: object; title?: string }) => Marker
				services: {
					Status: { OK: string }
					Geocoder: new () => {
						addressSearch: (address: string, callback: (result: Array<{ x: string; y: string }>, status: string) => void) => void
					}
					Places: new () => {
						keywordSearch: (keyword: string, callback: (result: Array<{ x: string; y: string; place_name: string }>, status: string) => void) => void
					}
				}
			}
			type KakaoWindow = typeof window & { kakao?: { maps: KakaoMaps } }
			const kakaoWindow = window as KakaoWindow
			const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.tabs_location button'))
			let activeTabIndex = Math.max(tabs.findIndex((tab) => tab.parentElement?.classList.contains('on')), 0)
			const setActiveTab = (index: number) => {
				activeTabIndex = index
				tabs.forEach((tab, tabIndex) => {
					tab.parentElement?.classList.toggle('on', tabIndex === index)
					tab.setAttribute('aria-selected', String(tabIndex === index))
				})
			}
			let showTab = setActiveTab
			const handlers = tabs.map((_tab, index) => () => showTab(index))
			tabs.forEach((tab, index) => tab.addEventListener('click', handlers[index]))
			const destinationAddress = '울산광역시 북구 무룡로 1119-6'
			let disposed = false

			const initializeMap = () => {
				const kakao = kakaoWindow.kakao
				const container = document.getElementById('map')
				if (!kakao || !container || disposed) return
				kakao.maps.load(() => {
					if (disposed) return
					const map = new kakao.maps.Map(container, {
						center: new kakao.maps.LatLng(35.5975, 129.3730),
						level: 3
					})
					const geocoder = new kakao.maps.services.Geocoder()
					const places = new kakao.maps.services.Places()
					let destination: Coordinate | null = null
					let originMarker: Marker | null = null

					// 출발지가 없는 첫 탭은 기관 위치만, 나머지 탭은 출발지와 기관이 모두 보이도록 지도 범위를 맞춘다.
					showTab = (index: number) => {
						setActiveTab(index)
						originMarker?.setMap(null)
						originMarker = null
						const origin = tabs[index]?.dataset.origin
						if (!destination) return
						if (!origin) {
							map.setLevel(3)
							map.setCenter(destination)
							return
						}
						places.keywordSearch(origin, (result, status) => {
							if (disposed || status !== kakao.maps.services.Status.OK || !result[0] || !destination) return
							const place = result[0]
							const coordinate = new kakao.maps.LatLng(Number(place.y), Number(place.x))
							originMarker = new kakao.maps.Marker({ map, position: coordinate, title: place.place_name })
							const bounds = new kakao.maps.LatLngBounds()
							bounds.extend(coordinate)
							bounds.extend(destination)
							map.setBounds(bounds, 100, 40, 40, 40)
						})
					}

					geocoder.addressSearch(destinationAddress, (result, status) => {
						if (disposed || status !== kakao.maps.services.Status.OK || !result[0]) return
						destination = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x))
						const markerImage = new kakao.maps.MarkerImage(
							withBasePath('/pub/images/img_marker.svg'),
							new kakao.maps.Size(197, 84),
							{ offset: new kakao.maps.Point(98, 84) }
						)
						new kakao.maps.Marker({ map, position: destination, image: markerImage })
						showTab(activeTabIndex)
					})
				})
			}

			const loadKakaoMap = (appKey: string) => {
				if (kakaoWindow.kakao) {
					initializeMap()
					return
				}
				const existingScript = document.querySelector<HTMLScriptElement>('script[data-kakao-map]')
				if (existingScript) {
					existingScript.addEventListener('load', initializeMap, { once: true })
					return
				}
				const script = document.createElement('script')
				script.dataset.kakaoMap = 'true'
				script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
				script.addEventListener('load', initializeMap, { once: true })
				document.head.appendChild(script)
			}

			void (async () => {
				// 정적 WAR 는 application.yml 값을 /api/user/site-setting 으로 받는다. 로컬 next 는 NEXT_PUBLIC 도 허용.
				let appKey = ''
				try {
					const setting = await getPublicSiteSetting()
					appKey = setting?.kakaoMapAppKey?.trim() || ''
				} catch {
					appKey = ''
				}
				if (!appKey) {
					appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim() || ''
				}
				if (disposed) return
				if (!appKey) {
					console.error('카카오맵 앱 키가 설정되지 않아 카카오맵을 불러올 수 없습니다.')
					return
				}
				loadKakaoMap(appKey)
			})()

			return () => {
				disposed = true
				tabs.forEach((tab, index) => tab.removeEventListener('click', handlers[index]))
			}
		}

		if (behavior === 'popup') {
			type Slider = {
				activeIndex: number
				slides: ArrayLike<Element>
				destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void
				on: (eventName: string, callback: () => void) => void
				slideTo: (index: number, speed?: number) => void
			}
			type SliderConstructor = new (element: Element, options: Record<string, unknown>) => Slider
			let sliders: Slider[] = []
			let galleryCleanups: Array<() => void> = []
			let stopWaiting: (() => void) | undefined
			let lastFocused: HTMLElement | null = null
			const initializeSliders = () => {
				const Swiper = window.Swiper as unknown as SliderConstructor
				sliders = Array.from(document.querySelectorAll('.popup .imgfit')).map((element) => new Swiper(element, {
					loop: true,
					pagination: { el: element.querySelector('.pagination'), clickable: true }
				}))
				const galleryNavigation = document.querySelector<HTMLElement>('.pop_gallery .gallery_nav')
				const galleryMain = document.querySelector<HTMLElement>('.pop_gallery .gallery_for')
				if (galleryNavigation && galleryMain) {
					const navigationSlider = new Swiper(galleryNavigation, {
						spaceBetween: 8,
						freeMode: true,
						watchSlidesProgress: true,
						slidesPerView: 3,
						breakpoints: { 768: { slidesPerView: 4, spaceBetween: 10 }, 1024: { slidesPerView: 6, spaceBetween: 12 } }
					})
					const mainSlider = new Swiper(galleryMain, {
						speed: 300,
						spaceBetween: 10,
						pagination: { el: galleryMain.querySelector('.pagination'), clickable: true },
						thumbs: { swiper: navigationSlider }
					})
					sliders.push(navigationSlider, mainSlider)

					const navigationSlides = Array.from(galleryNavigation.querySelectorAll<HTMLElement>('.swiper-slide'))
					const syncNavigation = (index: number) => {
						navigationSlides.forEach((slide, slideIndex) => {
							slide.classList.toggle('swiper-slide-thumb-active', slideIndex === index)
						})
					}
					const moveTo = (index: number) => {
						const targetIndex = Math.max(0, Math.min(index, mainSlider.slides.length - 1))
						mainSlider.slideTo(targetIndex, 300)
						syncNavigation(targetIndex)
					}
					const onNavigationClick = (event: Event) => {
						const target = event.target as Element
						const slide = target.closest<HTMLElement>('.swiper-slide')
						const index = slide ? navigationSlides.indexOf(slide) : -1
						if (index < 0) return
						event.preventDefault()
						moveTo(index)
					}
					let dragStartX: number | null = null
					let dragStartIndex = 0
					const onPointerDown = (event: PointerEvent) => {
						dragStartX = event.clientX
						dragStartIndex = mainSlider.activeIndex
					}
					const onPointerUp = (event: PointerEvent) => {
						if (dragStartX === null) return
						const distance = event.clientX - dragStartX
						dragStartX = null
						if (Math.abs(distance) >= 30) moveTo(dragStartIndex + (distance < 0 ? 1 : -1))
					}
					const onDragStart = (event: Event) => event.preventDefault()

					galleryNavigation.addEventListener('click', onNavigationClick)
					galleryMain.addEventListener('pointerdown', onPointerDown, true)
					galleryMain.addEventListener('pointerup', onPointerUp, true)
					galleryMain.addEventListener('dragstart', onDragStart)
					mainSlider.on('slideChange', () => syncNavigation(mainSlider.activeIndex))
					syncNavigation(mainSlider.activeIndex)
					galleryCleanups.push(() => {
						galleryNavigation.removeEventListener('click', onNavigationClick)
						galleryMain.removeEventListener('pointerdown', onPointerDown, true)
						galleryMain.removeEventListener('pointerup', onPointerUp, true)
						galleryMain.removeEventListener('dragstart', onDragStart)
					})
				}
			}
			const onClick = (event: MouseEvent) => {
				const target = event.target as Element
				const openButton = target.closest<HTMLElement>('.btn_popup')
				if (openButton?.dataset.target) {
					event.preventDefault()
					const popup = document.getElementById(openButton.dataset.target)
					if (popup) {
						lastFocused = openButton
						popup.classList.add('open')
						popup.setAttribute('aria-hidden', 'false')
						popup.setAttribute('style', 'visibility: visible; opacity: 1; pointer-events: auto; user-select: auto;')
						popup.querySelector<HTMLElement>('.btn_close')?.focus()
					}
					return
				}
				const closeButton = target.closest<HTMLElement>('.btn_close, .popup .dm, .popup .btn_clo')
				if (closeButton) {
					const popup = closeButton.closest('.popup')
					popup?.classList.remove('open')
					popup?.setAttribute('aria-hidden', 'true')
					popup?.removeAttribute('style')
					lastFocused?.focus()
				}
			}
			const onKeyDown = (event: KeyboardEvent) => {
				if (event.key !== 'Escape') return
				const popup = document.querySelector('.popup.open')
				popup?.classList.remove('open')
				popup?.setAttribute('aria-hidden', 'true')
				popup?.removeAttribute('style')
				lastFocused?.focus()
			}
			stopWaiting = whenSlidersReady(['.popup .imgfit', '.pop_gallery .gallery_for'], initializeSliders)
			document.addEventListener('click', onClick)
			window.addEventListener('keydown', onKeyDown)
			return () => {
				stopWaiting?.()
				document.removeEventListener('click', onClick)
				window.removeEventListener('keydown', onKeyDown)
				galleryCleanups.forEach((cleanup) => cleanup())
				sliders.forEach((slider) => slider.destroy(true, true))
			}
		}

		if (behavior === 'program-slider') {
			type Slider = { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void }
			type SliderConstructor = new (element: string, options: Record<string, unknown>) => Slider
			let slider: Slider | null = null
			const updatePaging = () => {
				const paging = document.querySelector<HTMLElement>('.program_btm')
				if (!paging) return
				// 슬라이드 수는 초기화 시점에 세야 한다. 본문이 늦게 도착하면 모듈 진입 시점에는 0이다.
				const sourceSlideCount = document.querySelectorAll('.program_slide .swiper-slide').length
				const slidesPerView = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 1
				paging.style.display = sourceSlideCount <= slidesPerView ? 'none' : ''
			}
			const initialize = () => {
				const Swiper = (window as typeof window & { Swiper?: SliderConstructor }).Swiper as SliderConstructor
				slider = new Swiper('.program_slide', {
					slidesPerView: 1,
					spaceBetween: 10,
					loop: true,
					autoplay: { delay: 3000, disableOnInteraction: false },
					breakpoints: {
						768: { slidesPerView: 3, spaceBetween: 20 },
						1024: { slidesPerView: 4, spaceBetween: 30 },
						1280: { slidesPerView: 4, spaceBetween: 40 }
					},
					pagination: {
						el: '.program_btm .paging',
						type: 'custom',
						renderCustom: (_slider: Slider, current: number, total: number) => `<strong>${String(current).padStart(2, '0')}</strong>/<span>${String(total).padStart(2, '0')}</span>`
					},
					navigation: { nextEl: '.program_btm .next', prevEl: '.program_btm .prev' }
				})
				updatePaging()
			}
			const stopWaiting = whenSlidersReady(['.program_slide'], initialize)
			window.addEventListener('resize', updatePaging)
			return () => {
				stopWaiting()
				window.removeEventListener('resize', updatePaging)
				slider?.destroy(true, true)
			}
		}

		if (behavior === 'library-sliders') {
			type Slider = { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void }
			type SliderConstructor = new (element: string, options: Record<string, unknown>) => Slider
			let sliders: Slider[] = []
			const renderPaging = (_slider: Slider, current: number, total: number) => `<strong>${String(current).padStart(2, '0')}</strong>/<span>${String(total).padStart(2, '0')}</span>`
			const initialize = () => {
				const Swiper = (window as typeof window & { Swiper?: SliderConstructor }).Swiper as SliderConstructor
				if (document.querySelector('.book_slide')) sliders.push(new Swiper('.book_slide', {
					slidesPerView: 2, spaceBetween: 10,
					navigation: { nextEl: '.book_slide .arrow.next', prevEl: '.book_slide .arrow.prev' },
					pagination: { el: '.book_slide .paging', type: 'custom', renderCustom: renderPaging },
					breakpoints: { 768: { slidesPerView: 4, spaceBetween: 16 }, 1024: { slidesPerView: 3, spaceBetween: 20 }, 1280: { slidesPerView: 4, spaceBetween: 30 } }
				}))
				if (document.querySelector('.new_book_slide')) sliders.push(new Swiper('.new_book_slide', {
					slidesPerView: 2, spaceBetween: 10,
					navigation: { nextEl: '.new_book_slide .arrow.next', prevEl: '.new_book_slide .arrow.prev' },
					pagination: { el: '.new_book_slide .paging', type: 'custom', renderCustom: renderPaging },
					breakpoints: { 768: { slidesPerView: 4, spaceBetween: 20 }, 1024: { slidesPerView: 4, spaceBetween: 30 }, 1280: { slidesPerView: 4, spaceBetween: 40 } }
				}))
			}
			const stopWaiting = whenSlidersReady(['.book_slide', '.new_book_slide'], initialize)
			return () => {
				stopWaiting()
				sliders.forEach((slider) => slider.destroy(true, true))
			}
		}

		if (behavior === 'library-month') {
			const dateDisplay = document.querySelector<HTMLElement>('.month_select strong')
			const previous = document.querySelector<HTMLButtonElement>('.month_select .arrow.prev')
			const next = document.querySelector<HTMLButtonElement>('.month_select .arrow.next')
			if (!dateDisplay || !previous || !next) return
			const currentDate = new Date()
			const update = () => { dateDisplay.textContent = `${currentDate.getFullYear()}. ${String(currentDate.getMonth() + 1).padStart(2, '0')}` }
			const showPrevious = () => { currentDate.setMonth(currentDate.getMonth() - 1); update() }
			const showNext = () => { currentDate.setMonth(currentDate.getMonth() + 1); update() }
			update()
			previous.addEventListener('click', showPrevious)
			next.addEventListener('click', showNext)
			return () => {
				previous.removeEventListener('click', showPrevious)
				next.removeEventListener('click', showNext)
			}
		}

		if (behavior === 'total-search-tabs') {
			const tabs = Array.from(document.querySelectorAll<HTMLLIElement>('.tabs_total_search li'))
			const boxes = Array.from(document.querySelectorAll<HTMLElement>('.total_search_contents .box'))
			const showTab = (index: number) => {
				tabs.forEach((item) => item.classList.remove('on'))
				tabs[index]?.classList.add('on')
				boxes.forEach((box, boxIndex) => { box.style.display = index === 0 || boxIndex === index - 1 ? 'block' : 'none' })
			}
			const handlers = tabs.map((_tab, index) => () => showTab(index))
			const moreButtons = Array.from(document.querySelectorAll<HTMLAnchorElement>('.total_search_contents .btn_more[data-tab-index]'))
			const moreHandlers = moreButtons.map((button) => (event: Event) => {
				event.preventDefault()
				showTab(Number(button.dataset.tabIndex || 0))
				document.querySelector('.tabs_total_search')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
			})
			tabs.forEach((tab, index) => tab.querySelector('button')?.addEventListener('click', handlers[index]))
			moreButtons.forEach((button, index) => button.addEventListener('click', moreHandlers[index]))
			return () => {
				tabs.forEach((tab, index) => tab.querySelector('button')?.removeEventListener('click', handlers[index]))
				moreButtons.forEach((button, index) => button.removeEventListener('click', moreHandlers[index]))
			}
		}

		if (behavior === 'program-height') {
			let resizeTimer: ReturnType<typeof setTimeout>
			const update = () => {
				matchHeightByRow('.program_types li h3')
				matchHeightByRow('.program_list .txt h3')
			}
			const onResize = () => {
				clearTimeout(resizeTimer)
				resizeTimer = setTimeout(update, 200)
			}
			void document.fonts?.ready.then(update)
			update()
			window.addEventListener('resize', onResize)
			return () => {
				clearTimeout(resizeTimer)
				window.removeEventListener('resize', onResize)
			}
		}

		if (behavior === 'history') {
			const bar = document.querySelector<HTMLElement>('.history_wrap .line .bar')
			const lineWrap = document.querySelector<HTMLElement>('.history_wrap')
			const items = document.querySelectorAll('.history_wrap .list > li')
			if (!bar || !lineWrap) return
			let frame = 0
			const update = () => {
				const middle = window.scrollY + window.innerHeight / 2
				const progress = Math.min(Math.max(((middle - lineWrap.offsetTop) / lineWrap.offsetHeight) * 100, 0), 100)
				bar.style.height = `${progress}%`
			}
			const onScroll = () => {
				if (frame) return
				frame = window.requestAnimationFrame(() => { frame = 0; update() })
			}
			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('on') })
			}, { rootMargin: '-49% 0px -49% 0px' })
			items.forEach((item) => observer.observe(item))
			update()
			window.addEventListener('scroll', onScroll, { passive: true })
			return () => {
				if (frame) window.cancelAnimationFrame(frame)
				observer.disconnect()
				window.removeEventListener('scroll', onScroll)
			}
		}
	}, [behavior])

	return <span hidden data-page-behavior={behavior || 'none'} />
}

'use client'

import { useEffect } from 'react'
import type { PageBehaviorName } from '@/content/pageRegistry'

type PageBehaviorProps = { behavior?: PageBehaviorName }

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
			type KakaoMap = { setCenter: (coordinate: Coordinate) => void }
			type KakaoMaps = {
				load: (callback: () => void) => void
				LatLng: new (latitude: number, longitude: number) => Coordinate
				Map: new (container: HTMLElement, options: { center: Coordinate; level: number }) => KakaoMap
				Size: new (width: number, height: number) => object
				Point: new (x: number, y: number) => object
				MarkerImage: new (source: string, size: object, options: { offset: object }) => object
				Marker: new (options: { map: KakaoMap; position: Coordinate; image: object }) => object
				services: {
					Status: { OK: string }
					Geocoder: new () => {
						addressSearch: (address: string, callback: (result: Array<{ x: string; y: string }>, status: string) => void) => void
					}
				}
			}
			type KakaoWindow = typeof window & { kakao?: { maps: KakaoMaps } }
			const kakaoWindow = window as KakaoWindow
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
					geocoder.addressSearch('울산광역시 북구 무룡로 1119-6', (result, status) => {
						if (disposed || status !== kakao.maps.services.Status.OK || !result[0]) return
						const coordinate = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x))
						map.setCenter(coordinate)
						const markerImage = new kakao.maps.MarkerImage(
							'/pub/images/img_marker.svg',
							new kakao.maps.Size(197, 84),
							{ offset: new kakao.maps.Point(98, 84) }
						)
						new kakao.maps.Marker({ map, position: coordinate, image: markerImage })
					})
				})
			}

			if (kakaoWindow.kakao) {
				initializeMap()
			} else {
				const existingScript = document.querySelector<HTMLScriptElement>('script[data-kakao-map]')
				if (existingScript) {
					existingScript.addEventListener('load', initializeMap, { once: true })
				} else {
					const script = document.createElement('script')
					script.dataset.kakaoMap = 'true'
					script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=fb0bc87a6e3abc550a07197cacf991f0&libraries=services&autoload=false'
					script.addEventListener('load', initializeMap, { once: true })
					document.head.appendChild(script)
				}
			}

			return () => {
				disposed = true
				document.querySelector<HTMLScriptElement>('script[data-kakao-map]')?.removeEventListener('load', initializeMap)
			}
		}

		if (behavior === 'popup') {
			type Slider = { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void }
			type SliderConstructor = new (element: Element, options: Record<string, unknown>) => Slider
			let sliders: Slider[] = []
			let retryTimer: ReturnType<typeof setTimeout> | undefined
			let lastFocused: HTMLElement | null = null
			const initializeSliders = () => {
				const Swiper = (window as typeof window & { Swiper?: SliderConstructor }).Swiper
				if (!Swiper) {
					retryTimer = setTimeout(initializeSliders, 50)
					return
				}
				sliders = Array.from(document.querySelectorAll('.popup .imgfit')).map((element) => new Swiper(element, {
					loop: true,
					pagination: { el: element.querySelector('.pagination'), clickable: true }
				}))
				const galleryNavigation = document.querySelector('.pop_gallery .gallery_nav')
				const galleryMain = document.querySelector('.pop_gallery .gallery_for')
				if (galleryNavigation && galleryMain) {
					const navigationSlider = new Swiper(galleryNavigation, {
						spaceBetween: 8,
						freeMode: true,
						watchSlidesProgress: true,
						slidesPerView: 3,
						breakpoints: { 768: { slidesPerView: 4, spaceBetween: 10 }, 1024: { slidesPerView: 6, spaceBetween: 12 } }
					})
					sliders.push(navigationSlider)
					sliders.push(new Swiper(galleryMain, {
						spaceBetween: 10,
						pagination: { el: galleryMain.querySelector('.pagination'), clickable: true },
						thumbs: { swiper: navigationSlider }
					}))
				}
			}
			const onClick = (event: MouseEvent) => {
				const target = event.target as Element
				const openButton = target.closest<HTMLElement>('.btn_popup')
				if (openButton) {
					event.preventDefault()
					const popup = document.getElementById(openButton.dataset.target || '')
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
			initializeSliders()
			document.addEventListener('click', onClick)
			window.addEventListener('keydown', onKeyDown)
			return () => {
				if (retryTimer) clearTimeout(retryTimer)
				document.removeEventListener('click', onClick)
				window.removeEventListener('keydown', onKeyDown)
				sliders.forEach((slider) => slider.destroy(true, true))
			}
		}

		if (behavior === 'program-slider') {
			type Slider = { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void }
			type SliderConstructor = new (element: string, options: Record<string, unknown>) => Slider
			let slider: Slider | null = null
			let retryTimer: ReturnType<typeof setTimeout> | undefined
			const sourceSlideCount = document.querySelectorAll('.program_slide .swiper-slide').length
			const updatePaging = () => {
				const paging = document.querySelector<HTMLElement>('.program_btm')
				if (!paging) return
				const slidesPerView = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 1
				paging.style.display = sourceSlideCount <= slidesPerView ? 'none' : ''
			}
			const initialize = () => {
				const Swiper = (window as typeof window & { Swiper?: SliderConstructor }).Swiper
				if (!Swiper) {
					retryTimer = setTimeout(initialize, 50)
					return
				}
				if (!document.querySelector('.program_slide')) return
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
			initialize()
			window.addEventListener('resize', updatePaging)
			return () => {
				if (retryTimer) clearTimeout(retryTimer)
				window.removeEventListener('resize', updatePaging)
				slider?.destroy(true, true)
			}
		}

		if (behavior === 'library-sliders') {
			type Slider = { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void }
			type SliderConstructor = new (element: string, options: Record<string, unknown>) => Slider
			let sliders: Slider[] = []
			let retryTimer: ReturnType<typeof setTimeout> | undefined
			const renderPaging = (_slider: Slider, current: number, total: number) => `<strong>${String(current).padStart(2, '0')}</strong>/<span>${String(total).padStart(2, '0')}</span>`
			const initialize = () => {
				const Swiper = (window as typeof window & { Swiper?: SliderConstructor }).Swiper
				if (!Swiper) {
					retryTimer = setTimeout(initialize, 50)
					return
				}
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
			initialize()
			return () => {
				if (retryTimer) clearTimeout(retryTimer)
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
			const handlers = tabs.map((tab, index) => () => {
				tabs.forEach((item) => item.classList.remove('on'))
				tab.classList.add('on')
				boxes.forEach((box, boxIndex) => { box.style.display = index === 0 || boxIndex === index - 1 ? 'block' : 'none' })
			})
			tabs.forEach((tab, index) => tab.querySelector('button')?.addEventListener('click', handlers[index]))
			return () => tabs.forEach((tab, index) => tab.querySelector('button')?.removeEventListener('click', handlers[index]))
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

'use client'

import { useEffect } from 'react'
import type { LegacyEffect } from '@/lib/legacyPages'

type LegacyPageEffectsProps = { effect?: LegacyEffect }

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

export default function LegacyPageEffects({ effect }: LegacyPageEffectsProps) {
	useEffect(() => {
		if (effect === 'location-map') {
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

		if (effect === 'popup') {
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
						popup.querySelector<HTMLElement>('.btn_close')?.focus()
					}
					return
				}
				const closeButton = target.closest<HTMLElement>('.btn_close, .popup .dm, .popup .btn_clo')
				if (closeButton) {
					const popup = closeButton.closest('.popup')
					popup?.classList.remove('open')
					lastFocused?.focus()
				}
			}
			const onKeyDown = (event: KeyboardEvent) => {
				if (event.key !== 'Escape') return
				const popup = document.querySelector('.popup.open')
				popup?.classList.remove('open')
				lastFocused?.focus()
			}
			initializeSliders()
			document.addEventListener('click', onClick)
			window.addEventListener('keydown', onKeyDown)
			return () => {
				if (retryTimer) clearTimeout(retryTimer)
				document.removeEventListener('click', onClick)
				window.removeEventListener('keydown', onKeyDown)
				document.querySelectorAll('.popup.open').forEach((popup) => popup.classList.remove('open'))
				sliders.forEach((slider) => slider.destroy(true, true))
			}
		}

		if (effect === 'program-slider') {
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

		if (effect === 'program-height') {
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

		if (effect === 'history') {
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
	}, [effect])

	return null
}

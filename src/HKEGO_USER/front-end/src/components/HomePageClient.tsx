'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { PublicBoardPost, PublicMainBanner, PublicPopup } from '@/lib/publicApi'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'

type SwiperInstance = {
	autoplay?: { running: boolean; start: () => void; stop: () => void }
	realIndex?: number
	slideNext?: () => void
	slidePrev?: () => void
	destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void
}

type SwiperConstructor = new (element: Element | string, options: Record<string, unknown>) => SwiperInstance

declare global {
	interface Window {
		Swiper?: SwiperConstructor
	}
}

function safeBannerHref(value: string | null) {
	const href = value?.trim() || ''
	return /^(https?:\/\/|\/(?!\/)|#)/i.test(href) ? href : ''
}

function isInternalHref(href: string) {
	return href.startsWith('/')
}

function formatDate(value: string | null) {
	return value ? value.slice(0, 10).replaceAll('-', '.') : ''
}

function plainText(value: string | null) {
	return (value || '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/\s+/g, ' ')
		.trim()
}

type HomePageClientProps = {
	initialBanners: PublicMainBanner[]
	initialExhibits: PublicBoardPost[]
	initialNotices: PublicBoardPost[]
	initialGalleryItems: PublicBoardPost[]
	initialEvents: PublicBoardPost[]
	initialPopups: PublicPopup[]
	initialPopupOpen: boolean
}

export default function HomePageClient({
	initialBanners,
	initialExhibits,
	initialNotices,
	initialGalleryItems,
	initialEvents,
	initialPopups,
	initialPopupOpen
}: HomePageClientProps) {
	const [mainPlaying, setMainPlaying] = useState(true)
	const [activeBannerIndex, setActiveBannerIndex] = useState(0)
	const [exhibitPlaying, setExhibitPlaying] = useState(true)
	const [eventPlaying, setEventPlaying] = useState(true)
	const [popupOpen, setPopupOpen] = useState(initialPopupOpen)
	const [activePopupIndex, setActivePopupIndex] = useState(0)
	const visualRef = useRef<HTMLDivElement>(null)
	const exhibitRef = useRef<HTMLDivElement>(null)
	const galleryRef = useRef<HTMLDivElement>(null)
	const eventRef = useRef<HTMLDivElement>(null)
	const popupRef = useRef<HTMLDivElement>(null)
	const popupCloseRef = useRef<HTMLButtonElement>(null)
	const progressRef = useRef<HTMLDivElement>(null)
	const mainSwiperRef = useRef<SwiperInstance | null>(null)
	const exhibitSwiperRef = useRef<SwiperInstance | null>(null)
	const eventSwiperRef = useRef<SwiperInstance | null>(null)
	const popupSwiperRef = useRef<SwiperInstance | null>(null)

	useEffect(() => {
		let cancelled = false
		let retryTimer: ReturnType<typeof setTimeout> | undefined
		let instances: SwiperInstance[] = []

		const resetProgress = () => {
			if (!progressRef.current) return
			progressRef.current.style.transition = 'none'
			progressRef.current.style.width = '0%'
		}
		const startProgress = () => {
			if (!progressRef.current) return
			resetProgress()
			requestAnimationFrame(() => {
				if (!progressRef.current) return
				progressRef.current.style.transition = 'width 5000ms linear'
				progressRef.current.style.width = '100%'
			})
		}

		const initialize = () => {
			if (cancelled) return
			const Swiper = window.Swiper
			if (!Swiper) {
				retryTimer = setTimeout(initialize, 50)
				return
			}
			if (!visualRef.current || !exhibitRef.current || !galleryRef.current || !eventRef.current) return

			let mainSwiper: SwiperInstance | null = null
			if (initialBanners.length > 0) {
				mainSwiper = new Swiper(visualRef.current, {
					loop: initialBanners.length > 1,
					autoplay: { delay: 5000, disableOnInteraction: false },
					navigation: { nextEl: '.mvisual_wrap .arrow.next', prevEl: '.mvisual_wrap .arrow.prev' },
					pagination: {
						el: '.mvisual_wrap .paging',
						type: 'custom',
						renderCustom: (_swiper: SwiperInstance, current: number, total: number) => `<strong>${current}</strong>/<span>${total}</span>`
					},
					on: {
						init: (swiper: SwiperInstance) => {
							setActiveBannerIndex(swiper.realIndex ?? 0)
							startProgress()
						},
						slideChangeTransitionStart: resetProgress,
						slideChangeTransitionEnd: (swiper: SwiperInstance) => {
							setActiveBannerIndex(swiper.realIndex ?? 0)
							if (swiper.autoplay?.running) startProgress()
						}
					}
				})
			}
			let exhibitSwiper: SwiperInstance | null = null
			if (initialExhibits.length > 0) exhibitSwiper = new Swiper(exhibitRef.current, {
				loop: initialExhibits.length > 3,
				autoplay: { delay: 3000, disableOnInteraction: false },
				navigation: { nextEl: '.mc03 .left .arrow.next', prevEl: '.mc03 .left .arrow.prev' },
				slidesPerView: 1,
				spaceBetween: 16,
				breakpoints: {
					768: { slidesPerView: 2, spaceBetween: 20 },
					1024: { slidesPerView: 3, spaceBetween: 24 }
				}
			})
			let gallerySwiper: SwiperInstance | null = null
			if (initialGalleryItems.length > 0) gallerySwiper = new Swiper(galleryRef.current, {
				loop: initialGalleryItems.length > 3,
				autoplay: { delay: 3000, disableOnInteraction: false },
				slidesPerView: 1,
				spaceBetween: 12,
				breakpoints: {
					768: { slidesPerView: 3, spaceBetween: 16 },
					1024: { slidesPerView: 3, spaceBetween: 20 },
					1600: { slidesPerView: 3, spaceBetween: 24 }
				}
			})
			let eventSwiper: SwiperInstance | null = null
			if (initialEvents.length > 0) eventSwiper = new Swiper(eventRef.current, {
				loop: initialEvents.length > 1,
				autoplay: { delay: 3000, disableOnInteraction: false },
				navigation: { nextEl: '.mc03 .right .arrow.next', prevEl: '.mc03 .right .arrow.prev' },
				pagination: {
					el: '.mc03 .right .paging',
					type: 'custom',
					renderCustom: (_swiper: SwiperInstance, current: number, total: number) => `<strong>${String(current).padStart(2, '0')}</strong>/<span>${String(total).padStart(2, '0')}</span>`
				}
			})
			mainSwiperRef.current = mainSwiper
			exhibitSwiperRef.current = exhibitSwiper
			eventSwiperRef.current = eventSwiper
			instances = [exhibitSwiper, gallerySwiper, eventSwiper].filter((instance): instance is SwiperInstance => instance !== null)
			if (mainSwiper) instances.unshift(mainSwiper)
		}

		initialize()
		return () => {
			cancelled = true
			if (retryTimer) clearTimeout(retryTimer)
			instances.forEach((instance) => instance.destroy(true, true))
			mainSwiperRef.current = null
			exhibitSwiperRef.current = null
			eventSwiperRef.current = null
		}
	}, [initialBanners, initialEvents, initialExhibits, initialGalleryItems])

	useEffect(() => {
		if (!popupOpen || !popupRef.current) return
		let cancelled = false
		let retryTimer: ReturnType<typeof setTimeout> | undefined
		const initialize = () => {
			if (cancelled || !popupRef.current) return
			const Swiper = window.Swiper
			if (!Swiper) {
				retryTimer = setTimeout(initialize, 50)
				return
			}
			popupSwiperRef.current = new Swiper(popupRef.current, {
				loop: initialPopups.length > 1,
				autoplay: initialPopups.length > 1 ? { delay: 3000, disableOnInteraction: false } : false,
				pagination: {
					el: '.pop_slide_wrap .paging',
					type: 'custom',
					renderCustom: (_swiper: SwiperInstance, current: number, total: number) => `${current}/${total}`
				},
				on: {
					init: (swiper: SwiperInstance) => setActivePopupIndex(swiper.realIndex ?? 0),
					slideChangeTransitionEnd: (swiper: SwiperInstance) => setActivePopupIndex(swiper.realIndex ?? 0)
				}
			})
			requestAnimationFrame(() => popupCloseRef.current?.focus())
		}
		initialize()
		return () => {
			cancelled = true
			if (retryTimer) clearTimeout(retryTimer)
			popupSwiperRef.current?.destroy(true, true)
			popupSwiperRef.current = null
		}
	}, [initialPopups.length, popupOpen])

	useEffect(() => {
		if (!popupOpen) return
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setPopupOpen(false)
			else if (event.key === 'ArrowRight') popupSwiperRef.current?.slideNext?.()
			else if (event.key === 'ArrowLeft') popupSwiperRef.current?.slidePrev?.()
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [popupOpen])

	const toggleAutoplay = (
		ref: { current: SwiperInstance | null },
		playing: boolean,
		setPlaying: (playing: boolean) => void,
		withProgress = false
	) => {
		const swiper = ref.current
		if (!swiper?.autoplay) return
		if (playing) {
			swiper.autoplay.stop()
			if (withProgress && progressRef.current) {
				const width = window.getComputedStyle(progressRef.current).width
				progressRef.current.style.transition = 'none'
				progressRef.current.style.width = width
			}
			setPlaying(false)
		} else {
			swiper.autoplay.start()
			if (withProgress && progressRef.current) {
				progressRef.current.style.transition = 'width 5000ms linear'
				progressRef.current.style.width = '100%'
			}
			setPlaying(true)
		}
	}

	const activeBanner = initialBanners[activeBannerIndex] ?? initialBanners[0]
	const activePopup = initialPopups[activePopupIndex] ?? initialPopups[0]
	const popupPositionStyle: CSSProperties = {}
	if (activePopup?.width && activePopup.width > 0) popupPositionStyle.width = activePopup.width
	if (activePopup && (activePopup.positionX !== null || activePopup.positionY !== null)) {
		if (activePopup.positionX !== null) popupPositionStyle.left = activePopup.positionX
		if (activePopup.positionY !== null) popupPositionStyle.top = activePopup.positionY
		popupPositionStyle.transform = `translate(${activePopup.positionX === null ? '-50%' : '0'}, ${activePopup.positionY === null ? '-50%' : '0'})`
	}
	const closePopupsToday = () => {
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
		document.cookie = `ulmfeMainPopupClosed=Y; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
		setPopupOpen(false)
	}

	return (
		<>
			<h1 className="sound_only">울산광역시미래교육관</h1>
			<SiteHeader />
			<main className="container" id="mainContent">
				<section className="mvisual_wrap">
					<div ref={visualRef} className="mvisual swiper">
						<div className="swiper-wrapper">
							{initialBanners.map((banner) => {
								const imageUrl = banner.pcImageUrl || banner.mobileImageUrl
								if (!imageUrl) return null
								const href = safeBannerHref(banner.linkUrl)
								const picture = (
									<picture style={{ display: 'block', width: '100%', height: '100%' }}>
										{banner.mobileImageUrl && <source media="(max-width: 767px)" srcSet={banner.mobileImageUrl} />}
										<img src={imageUrl} alt={banner.name || ''} />
									</picture>
								)
								return (
									<div className="swiper-slide" key={banner.bannerId}>
										{href && isInternalHref(href) && banner.linkTargetCode !== 'B' ? (
											<Link href={href} style={{ display: 'block', width: '100%', height: '100%' }}>{picture}</Link>
										) : href ? (
											<a href={href} target={banner.linkTargetCode === 'B' ? '_blank' : undefined} rel={banner.linkTargetCode === 'B' ? 'noopener noreferrer' : undefined} style={{ display: 'block', width: '100%', height: '100%' }}>{picture}</a>
										) : picture}
									</div>
								)
							})}
						</div>
					</div>
					{activeBanner && <div className="txt">
						<div className="inner">
							<h2 style={{ whiteSpace: 'pre-line' }}>{activeBanner.mainText || ''}</h2>
							<p style={{ whiteSpace: 'pre-line' }}>{activeBanner.subText || ''}</p>
							<div className="control">
								<div className="line"><div ref={progressRef} className="bar" /></div>
								<div className="paging" />
								<button type="button" className={`papl pause${mainPlaying ? ' on' : ''}`} onClick={() => toggleAutoplay(mainSwiperRef, mainPlaying, setMainPlaying, true)}>일시정지</button>
								<button type="button" className={`papl play${mainPlaying ? '' : ' on'}`} onClick={() => toggleAutoplay(mainSwiperRef, mainPlaying, setMainPlaying, true)}>재생</button>
								<button type="button" className="arrow prev">이전</button>
								<button type="button" className="arrow next">다음</button>
							</div>
						</div>
					</div>}
				</section>

				<section className="mcon mc01">
					<div className="inner">
						<div className="left flex">
							<div className="txt"><h2 className="tit">자주 찾는 메뉴</h2><p>울산광역시 미래교육관의 <br />자주 찾는 메뉴들을 만나보세요!</p></div>
							<ul className="links">
								<li className="i1"><Link href="/program/reserve"><i aria-hidden="true" />예약 안내</Link></li>
								<li className="i2"><Link href="/about/location"><i aria-hidden="true" />오시는 길</Link></li>
								<li className="i3"><Link href="/exhibit/floor_1f"><i aria-hidden="true" />전시 소개</Link></li>
								<li className="i4"><Link href="/support/faq"><i aria-hidden="true" />FAQ</Link></li>
							</ul>
						</div>
						<div className="right flex">
							<div className="txt"><h2 className="tit">이용안내</h2><a href="https://use.go.kr/booking/index.do;jsessionid=18A242975D5071CBE5C0B679CB59722B" target="_blank" rel="noopener noreferrer" className="btn">통합 예약 바로가기</a></div>
							<ul className="info">
								<li className="i1"><h3>운영시간</h3><strong>09:00 ~ 18:00</strong><span>(※ 온라인 사전 예약 후 이용이 가능합니다.)</span></li>
								<li className="i2"><h3>휴관안내</h3><strong>매주 수요일 / 공휴일</strong></li>
								<li className="i3"><h3>이용요금</h3><strong>무료</strong></li>
							</ul>
						</div>
					</div>
				</section>

				<section className="mcon mc02">
					<div className="inner">
						<div className="mtit"><h2>울산광역시 미래교육관</h2><strong>교육 프로그램</strong><Link href="/program/esd_pbl" className="btn_more">더보기</Link></div>
						<ul className="program_list">
							<li className="c1"><Link href="/program/elementary"><i aria-hidden="true"><img src="/pub/images/icon_mc02_01.svg" alt="" /></i><h3>사건탐구 프로그램(초5)</h3><p>울산의 문제를 직접 탐구하고 <br />해결하는 프로젝트 학습</p></Link></li>
							<li className="c2"><Link href="/program/mission"><i aria-hidden="true"><img src="/pub/images/icon_mc02_02.svg" alt="" /></i><h3>미션 프로그램(중1)</h3><p>스토리 속 미션을 해결하며 <br />지속가능한 미래를 발견하는 체험</p></Link></li>
							<li className="c3"><Link href="/program/biggame"><i aria-hidden="true"><img src="/pub/images/icon_mc02_03.svg" alt="" /></i><h3>빅게임 프로그램</h3><p>팀과 함께 퀘스트를 수행하며 <br />몰입과 재미로 배우는 모험</p></Link></li>
						</ul>
					</div>
				</section>

				<section className="mcon mc03">
					<div className="inner">
						<div className="flex">
							<div className="left">
								<h2 className="mtit">기획전</h2>
								<div className="control">
									<button type="button" className={`papl pause${exhibitPlaying ? ' on' : ''}`} onClick={() => toggleAutoplay(exhibitSwiperRef, exhibitPlaying, setExhibitPlaying)}>일시정지</button>
									<button type="button" className={`papl play${exhibitPlaying ? '' : ' on'}`} onClick={() => toggleAutoplay(exhibitSwiperRef, exhibitPlaying, setExhibitPlaying)}>재생</button>
									<button type="button" className="arrow prev">이전</button><button type="button" className="arrow next">다음</button>
								</div>
								<div ref={exhibitRef} className="mc03a_slide swiper"><div className="swiper-wrapper">
									{initialExhibits.map((post) => <div className="swiper-slide" key={post.postId}><Link href={`/news/exhibit_view?id=${encodeURIComponent(post.postId)}`}>{post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" />}<h3>{post.title}</h3></Link></div>)}
								</div></div>
							</div>
							<div className="right">
								<h2 className="mtit">공지사항</h2><Link href="/news/notice" className="btn_more">더보기</Link>
								<ul className="main_notice">
									{initialNotices.map((post) => <li key={post.postId}><Link href={`/news/notice_view?id=${encodeURIComponent(post.postId)}`}><span className="imgfit">{post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" />}</span><span className="txt"><h3>{post.title}</h3><p>{plainText(post.content)}</p><span className="date">{formatDate(post.publishedDate || post.registeredAt)}</span></span></Link></li>)}
								</ul>
							</div>
						</div>
						<div className="flex">
							<div className="left">
								<h2 className="mtit">갤러리</h2><Link href="/gallery/index" className="btn_more">더보기</Link>
								<div ref={galleryRef} className="main_gallery swiper"><div className="swiper-wrapper">
									{initialGalleryItems.map((post) => <div className="swiper-slide" key={post.postId}><Link href={`/gallery?post_id=${encodeURIComponent(post.postId)}`}><span className="imgfit">{post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" />}</span><span className="txt"><h3>{post.title}</h3><span className="date">{formatDate(post.publishedDate || post.registeredAt)}</span></span></Link></div>)}
								</div></div>
							</div>
							<div className="right">
								<h2 className="mtit">이벤트</h2>
								<div className="control"><div className="paging" />
									<button type="button" className={`papl pause${eventPlaying ? ' on' : ''}`} onClick={() => toggleAutoplay(eventSwiperRef, eventPlaying, setEventPlaying)}>일시정지</button>
									<button type="button" className={`papl play${eventPlaying ? '' : ' on'}`} onClick={() => toggleAutoplay(eventSwiperRef, eventPlaying, setEventPlaying)}>재생</button>
									<button type="button" className="arrow prev">이전</button><button type="button" className="arrow next">다음</button>
								</div>
								<div ref={eventRef} className="mc03d_slide swiper"><div className="swiper-wrapper">
									{initialEvents.map((post) => <div className="swiper-slide" key={post.postId}><Link href={`/news/event_view?id=${encodeURIComponent(post.postId)}`}>{post.thumbnailUrl && <img src={post.thumbnailUrl} alt={post.title} />}</Link></div>)}
								</div></div>
							</div>
						</div>
					</div>
				</section>
				{popupOpen && activePopup && (
					<div className="pop_gen" role="dialog" aria-modal="true" aria-labelledby="main-popup-title" style={popupPositionStyle}>
						<h2 id="main-popup-title" className="sound_only">{activePopup.name}</h2>
						<div ref={popupRef} className="pop_slide_wrap swiper" style={{ height: activePopup.height && activePopup.height > 0 ? activePopup.height : 500 }}>
							<div className="pop_slide swiper-wrapper">
								{initialPopups.map((popup, index) => {
									const href = safeBannerHref(popup.linkUrl)
									const body = popup.imageUrl ? (
										<img src={popup.imageUrl} alt={popup.name} loading="eager" fetchPriority={index === 0 ? 'high' : 'auto'} />
									) : (
										<div className="pop_content" dangerouslySetInnerHTML={{ __html: popup.content || '' }} />
									)
									return (
										<div className="slide swiper-slide" key={popup.popupId}>
											{href && isInternalHref(href) && popup.linkTargetCode !== 'B'
												? <Link href={href}>{body}</Link>
												: href
													? <a href={href} target={popup.linkTargetCode === 'B' ? '_blank' : undefined} rel={popup.linkTargetCode === 'B' ? 'noopener noreferrer' : undefined}>{body}</a>
													: body}
										</div>
									)
								})}
							</div>
							<div className="paging swiper-pagination" />
						</div>
						<div className="btns">
							<button type="button" className="btn" onClick={closePopupsToday}>오늘 그만 보기</button>
							<button ref={popupCloseRef} type="button" className="btn" onClick={() => setPopupOpen(false)}>닫기</button>
						</div>
					</div>
				)}
			</main>
			<SiteFooter />
		</>
	)
}

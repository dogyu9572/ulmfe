'use client'
import { BASE_PATH, withBasePath } from '@/lib/basePath'

import Link from 'next/link'

/*
 * 메인의 바로가기 링크도 prefetch 를 끈다.
 * 전시·프로그램 페이지를 미리 받아오면 그 페이지들의 이미지 preload 힌트가
 * 메인 문서로 딸려 와, 정작 메인에서 쓰지도 않는 사진을 수십 장 내려받게 된다.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { getPublicBoardPosts, getPublicClosedDays, getPublicMainBanners, getPublicPopups, type PublicBoardPost, type PublicClosedDayMonth, type PublicMainBanner, type PublicPopup, resolvePublicHtmlMediaUrls, resolvePublicMediaUrl } from '@/lib/publicApi'
import { hoursText, LUNCH_BREAK, OPENING_HOURS } from '@/lib/siteMeta'
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

const KNOWN_SITE_HOSTS = new Set([
	'ulmfe-user.hk-test.co.kr',
	'use.go.kr',
	'dev.use.go.kr',
	'localhost',
	'127.0.0.1'
])

function stripBasePath(pathname: string) {
	let path = pathname || '/'
	if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
		path = path.slice(BASE_PATH.length) || '/'
	}
	return path
}

/** Link 용 앱 경로(basePath 제외). 외부 URL 은 그대로. */
function safeBannerHref(value: string | null) {
	const href = value?.trim() || ''
	if (!href) return ''
	if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return href
	try {
		if (href.startsWith('/') && !href.startsWith('//')) {
			const url = new URL(href, 'https://use.go.kr')
			return `${stripBasePath(url.pathname)}${url.search}${url.hash}`
		}
		if (/^https?:\/\//i.test(href)) {
			const url = new URL(href)
			if (KNOWN_SITE_HOSTS.has(url.hostname)) {
				return `${stripBasePath(url.pathname)}${url.search}${url.hash}`
			}
			return href
		}
	} catch {
		return ''
	}
	return ''
}

function isInternalHref(href: string) {
	return href.startsWith('/') && !href.startsWith('//')
}

function formatDate(value: string | null) {
	return value ? value.slice(0, 10).replaceAll('-', '.') : ''
}

// ponytail: 관리자가 입력한 <br> 태그를 개행으로 바꿔 white-space:pre-line 으로 처리한다
function brToNewline(value: string | null) {
	return (value || '').replace(/<br\s*\/?>/gi, '\n')
}

// 'YYYY-MM' 을 delta 개월만큼 옮긴다. 월만 다루므로 Date 의 말일 보정 문제는 생기지 않는다.
function shiftMonth(month: string, delta: number) {
	const [year, mm] = month.split('-').map(Number)
	const moved = new Date(year, mm - 1 + delta, 1)
	return `${moved.getFullYear()}-${String(moved.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(month: string) {
	const [year, mm] = month.split('-')
	return `${year}년 ${Number(mm)}월`
}

// ponytail: 요일 표기는 화면 전용이라 클라이언트에서 계산한다. 휴관일을 쓰는 화면이 늘어나면
// 서버 PublicClosedDayMonthVO 가 요일까지 내려주도록 올린다(서버에도 DAY_NAMES 테이블이 있다).
function weekdayOf(month: string, day: number) {
	const [year, mm] = month.split('-').map(Number)
	return '일월화수목금토'[new Date(year, mm - 1, day).getDay()]
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

function popupClosedToday() {
	return document.cookie.split(';').some((part) => part.trim() === 'ulmfeMainPopupClosed=Y')
}

export default function HomePageClient() {
	const [banners, setBanners] = useState<PublicMainBanner[]>([])
	const [exhibits, setExhibits] = useState<PublicBoardPost[]>([])
	const [notices, setNotices] = useState<PublicBoardPost[]>([])
	const [galleryItems, setGalleryItems] = useState<PublicBoardPost[]>([])
	const [events, setEvents] = useState<PublicBoardPost[]>([])
	const [popups, setPopups] = useState<PublicPopup[]>([])
	const [closedDays, setClosedDays] = useState<PublicClosedDayMonth | null>(null)
	const [closedDaysLoading, setClosedDaysLoading] = useState(false)
	const [mainPlaying, setMainPlaying] = useState(true)
	const [activeBannerIndex, setActiveBannerIndex] = useState(0)
	const [eventPlaying, setEventPlaying] = useState(true)
	const [popupOpen, setPopupOpen] = useState(false)
	const [homeReady, setHomeReady] = useState(false)
	const [activePopupIndex, setActivePopupIndex] = useState(0)
	const visualRef = useRef<HTMLDivElement>(null)
	const galleryRef = useRef<HTMLDivElement>(null)
	const eventRef = useRef<HTMLDivElement>(null)
	const popupRef = useRef<HTMLDivElement>(null)
	const popupCloseRef = useRef<HTMLButtonElement>(null)
	const progressRef = useRef<HTMLDivElement>(null)
	const mainSwiperRef = useRef<SwiperInstance | null>(null)
	const eventSwiperRef = useRef<SwiperInstance | null>(null)
	const popupSwiperRef = useRef<SwiperInstance | null>(null)

	useEffect(() => {
		let cancelled = false
		void Promise.all([
			getPublicMainBanners().catch(() => [] as PublicMainBanner[]),
			getPublicBoardPosts('EXHBT', { page: 1, size: 4 }).then((result) => result.list).catch(() => [] as PublicBoardPost[]),
			getPublicBoardPosts('ZEHSB', { page: 1, size: 3 }).then((result) => result.list).catch(() => [] as PublicBoardPost[]),
			getPublicBoardPosts('GALRY', { page: 1, size: 3 }).then((result) => result.list).catch(() => [] as PublicBoardPost[]),
			getPublicBoardPosts('EVENT', { page: 1, size: 2 }).then((result) => result.list).catch(() => [] as PublicBoardPost[]),
			getPublicPopups().catch(() => [] as PublicPopup[]),
			getPublicClosedDays().catch(() => null)
		]).then(([nextBanners, nextExhibits, nextNotices, nextGalleryItems, nextEvents, nextPopups, nextClosedDays]) => {
			if (cancelled) return
			setBanners(nextBanners)
			setExhibits(nextExhibits)
			setNotices(nextNotices)
			setGalleryItems(nextGalleryItems)
			setEvents(nextEvents)
			setPopups(nextPopups)
			setClosedDays(nextClosedDays)
			setPopupOpen(nextPopups.length > 0 && !popupClosedToday())
			setHomeReady(true)
		})
		return () => {
			cancelled = true
		}
	}, [])

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
			if (!homeReady || !visualRef.current || !galleryRef.current || !eventRef.current) return

			let mainSwiper: SwiperInstance | null = null
			if (banners.length > 0) {
				mainSwiper = new Swiper(visualRef.current, {
					loop: banners.length > 1,
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
			let gallerySwiper: SwiperInstance | null = null
			if (galleryItems.length > 0) gallerySwiper = new Swiper(galleryRef.current, {
				loop: galleryItems.length > 3,
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
			if (events.length > 0) eventSwiper = new Swiper(eventRef.current, {
				loop: events.length > 1,
				autoplay: { delay: 3000, disableOnInteraction: false },
				navigation: { nextEl: '.mc03 .right .arrow.next', prevEl: '.mc03 .right .arrow.prev' },
				pagination: {
					el: '.mc03 .right .paging',
					type: 'custom',
					renderCustom: (_swiper: SwiperInstance, current: number, total: number) => `<strong>${String(current).padStart(2, '0')}</strong>/<span>${String(total).padStart(2, '0')}</span>`
				}
			})
			mainSwiperRef.current = mainSwiper
			eventSwiperRef.current = eventSwiper
			instances = [gallerySwiper, eventSwiper].filter((instance): instance is SwiperInstance => instance !== null)
			if (mainSwiper) instances.unshift(mainSwiper)
		}

		initialize()
		return () => {
			cancelled = true
			if (retryTimer) clearTimeout(retryTimer)
			instances.forEach((instance) => instance.destroy(true, true))
			mainSwiperRef.current = null
			eventSwiperRef.current = null
		}
	}, [banners, events, exhibits, galleryItems, homeReady])

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
				loop: popups.length > 1,
				autoplay: popups.length > 1 ? { delay: 3000, disableOnInteraction: false } : false,
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
	}, [popups.length, popupOpen])

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

	const moveClosedDayMonth = async (delta: number) => {
		if (!closedDays || closedDaysLoading) return
		setClosedDaysLoading(true)
		try {
			setClosedDays(await getPublicClosedDays(shiftMonth(closedDays.month, delta)))
		} catch {
			// 조회에 실패하면 직전 달 정보를 그대로 두어 화면이 비지 않게 한다.
		} finally {
			setClosedDaysLoading(false)
		}
	}

	const activeBanner = banners[activeBannerIndex] ?? banners[0]
	const activePopup = popups[activePopupIndex] ?? popups[0]
	const popupPositionStyle: CSSProperties = {}
	if (activePopup?.width && activePopup.width > 0) popupPositionStyle.width = activePopup.width
	if (activePopup && (activePopup.positionX !== null || activePopup.positionY !== null)) {
		if (activePopup.positionX !== null) popupPositionStyle.left = activePopup.positionX
		if (activePopup.positionY !== null) popupPositionStyle.top = activePopup.positionY
		popupPositionStyle.transform = `translate(${activePopup.positionX === null ? '-50%' : '0'}, ${activePopup.positionY === null ? '-50%' : '0'})`
	}
	const closePopupsToday = () => {
		const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
		document.cookie = `ulmfeMainPopupClosed=Y; path=${BASE_PATH || '/'}; expires=${expires.toUTCString()}; SameSite=Lax`
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
							{banners.map((banner) => {
								const imageUrl = resolvePublicMediaUrl(banner.pcImageUrl || banner.mobileImageUrl)
								if (!imageUrl) return null
								const href = safeBannerHref(banner.linkUrl)
								const picture = (
									<picture style={{ display: 'block', width: '100%', height: '100%' }}>
										{banner.mobileImageUrl && <source media="(max-width: 767px)" srcSet={resolvePublicMediaUrl(banner.mobileImageUrl)} />}
										<img src={imageUrl} alt={banner.name || ''} />
									</picture>
								)
								return (
									<div className="swiper-slide" key={banner.bannerId}>
										{href && isInternalHref(href) && banner.linkTargetCode !== 'B' ? (
											<Link prefetch={false} href={href} style={{ display: 'block', width: '100%', height: '100%' }}>{picture}</Link>
										) : href ? (
											<a href={isInternalHref(href) ? withBasePath(href) : href} target={banner.linkTargetCode === 'B' ? '_blank' : undefined} rel={banner.linkTargetCode === 'B' ? 'noopener noreferrer' : undefined} style={{ display: 'block', width: '100%', height: '100%' }}>{picture}</a>
										) : picture}
									</div>
								)
							})}
						</div>
					</div>
					{activeBanner && <div className="txt">
						<div className="inner">
							<h2 style={{ whiteSpace: 'pre-line' }}>{brToNewline(activeBanner.mainText)}</h2>
							<p style={{ whiteSpace: 'pre-line' }}>{brToNewline(activeBanner.subText)}</p>
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

				{closedDays && (
					<section className="mcon mclosed" aria-labelledby="closed-day-title">
						<div className="inner">
							<div className="mclosed_box">
								<div className="mclosed_head">
									<h2 className="mclosed_tit" id="closed-day-title">이달의 휴관일</h2>
									<div className="mclosed_nav">
										<button
											type="button"
											className="mclosed_arrow prev"
											onClick={() => moveClosedDayMonth(-1)}
											disabled={closedDaysLoading}
										>이전달 보기</button>
										<strong className="mclosed_month">{formatMonthLabel(closedDays.month)}</strong>
										<button
											type="button"
											className="mclosed_arrow next"
											onClick={() => moveClosedDayMonth(1)}
											disabled={closedDaysLoading}
										>다음달 보기</button>
									</div>
								</div>
								<div className="mclosed_body" aria-live="polite">
									{closedDays.days.length > 0 ? (
										<ul className="mclosed_days">
											{closedDays.days.map((day) => (
												<li key={day}>{day}일({weekdayOf(closedDays.month, day)})</li>
											))}
										</ul>
									) : (
										<p className="mclosed_empty">이 달에는 휴관일이 없습니다.</p>
									)}
								</div>
								<p className="mclosed_notice">{closedDays.noticeText}</p>
							</div>
						</div>
					</section>
				)}

				<section className="mcon mc01">
					<div className="inner">
						<div className="left">
							<h2 className="tit">자주 찾는 메뉴</h2>
							<ul className="links">
								<li className="i1"><Link prefetch={false} href="/program/reserve"><i aria-hidden="true" />예약 안내</Link></li>
								<li className="i2"><Link prefetch={false} href="/about/location"><i aria-hidden="true" />오시는 길</Link></li>
								<li className="i3"><Link prefetch={false} href="/program/list"><i aria-hidden="true" />교육프로그램 소개</Link></li>
								<li className="i4"><Link prefetch={false} href="/news/faq"><i aria-hidden="true" />FAQ</Link></li>
							</ul>
						</div>
						<div className="right">
							<div className="head"><h2 className="tit">이용안내</h2><a href="https://use.go.kr/booking/index.do;jsessionid=18A242975D5071CBE5C0B679CB59722B" target="_blank" rel="noopener noreferrer" className="btn">통합 예약 바로가기</a></div>
							<ul className="info">
								<li><span className="badge">{OPENING_HOURS.weekday.label}</span><strong>{hoursText(OPENING_HOURS.weekday)}</strong><p>관내 초·중·고 학교<br />지속가능발전교육 체험</p><span className="note">점심시간({hoursText(LUNCH_BREAK)}) 제외</span></li>
								<li><span className="badge">{OPENING_HOURS.weekend.label}</span><strong>{hoursText(OPENING_HOURS.weekend)}</strong><p>시민 체험프로그램 및<br />주말 프로그램 운영, 자율 관람</p><span className="note">점심시간({hoursText(LUNCH_BREAK)}) 제외</span></li>
								<li className="rest"><span className="badge">휴관일</span><strong>월요일, 법정공휴일,<br />시설점검기간</strong></li>
							</ul>
						</div>
					</div>
				</section>

				<section className="mcon mc02">
					<div className="inner">
						<div className="mtit"><h2>울산광역시미래교육관</h2><strong>교육 프로그램</strong><Link prefetch={false} href="/program/esd_pbl" className="btn_more"><span>자세히 보기</span></Link></div>
						<ul className="program_list">
							<li className="c1"><Link prefetch={false} href="/program/elementary"><i aria-hidden="true"><img src={withBasePath('/pub/images/icon_mc02_01.svg')} alt="" /></i><h3>사건탐구 프로그램(초5)</h3><p>울산의 문제를 직접 탐구하고 <br />해결하는 프로젝트 학습</p><span className="go">자세히 보기 ›</span></Link></li>
							<li className="c2"><Link prefetch={false} href="/program/mission"><i aria-hidden="true"><img src={withBasePath('/pub/images/icon_mc02_02.svg')} alt="" /></i><h3>미션 프로그램(중1)</h3><p>스토리 속 미션을 해결하며 <br />지속가능한 미래를 발견하는 체험</p><span className="go">자세히 보기 ›</span></Link></li>
							<li className="c3"><Link prefetch={false} href="/program/biggame"><i aria-hidden="true"><img src={withBasePath('/pub/images/icon_mc02_03.svg')} alt="" /></i><h3>빅게임 프로그램</h3><p>팀과 함께 퀘스트를 수행하며 <br />몰입과 재미로 배우는 모험</p><span className="go">자세히 보기 ›</span></Link></li>
						</ul>
					</div>
				</section>

				<section className="mcon mc03">
					<div className="inner">
						<div className="flex news-row">
							<div className="left">
								<h2 className="mtit">공지사항</h2><Link prefetch={false} href="/news/notice" className="btn_more"><span>자세히 보기</span></Link>
								<ul className="main_notice">
									{notices.map((post) => <li key={post.postId}><Link prefetch={false} href={`/news/notice_view?id=${encodeURIComponent(post.postId)}`}><span className={`imgfit${post.thumbnailUrl ? ' in' : ''}`}>{post.thumbnailUrl && <img src={resolvePublicMediaUrl(post.thumbnailUrl)} alt="" />}</span><span className="txt"><h3>{post.title}</h3><p>{plainText(post.content)}</p><span className="date">{formatDate(post.publishedDate || post.registeredAt)}</span></span></Link></li>)}
								</ul>
							</div>
							<div className="right">
								<h2 className="mtit">이벤트</h2>
								<div className="control"><div className="paging" />
									<button type="button" className={`papl pause${eventPlaying ? ' on' : ''}`} onClick={() => toggleAutoplay(eventSwiperRef, eventPlaying, setEventPlaying)}>일시정지</button>
									<button type="button" className={`papl play${eventPlaying ? '' : ' on'}`} onClick={() => toggleAutoplay(eventSwiperRef, eventPlaying, setEventPlaying)}>재생</button>
									<button type="button" className="arrow prev">이전</button><button type="button" className="arrow next">다음</button>
								</div>
								<div ref={eventRef} className="mc03d_slide swiper"><div className="swiper-wrapper">
									{events.map((post) => <div className="swiper-slide" key={post.postId}><Link prefetch={false} href={`/news/event_view?id=${encodeURIComponent(post.postId)}`} className={post.thumbnailUrl ? 'in' : ''}>{post.thumbnailUrl && <img src={resolvePublicMediaUrl(post.thumbnailUrl)} alt={post.title} />}</Link></div>)}
								</div></div>
							</div>
						</div>
						<div className="flex">
							<div className="left">
								<h2 className="mtit">갤러리</h2><Link prefetch={false} href="/news/gallery" className="btn_more"><span>자세히 보기</span></Link>
								<div ref={galleryRef} className="main_gallery swiper"><div className="swiper-wrapper">
									{galleryItems.map((post) => <div className="swiper-slide" key={post.postId}><Link prefetch={false} href={`/news/gallery?post_id=${encodeURIComponent(post.postId)}`}><span className={`imgfit${post.thumbnailUrl ? ' in' : ''}`}>{post.thumbnailUrl && <img src={resolvePublicMediaUrl(post.thumbnailUrl)} alt="" />}</span><span className="txt"><h3>{post.title}</h3><span className="date">{formatDate(post.publishedDate || post.registeredAt)}</span></span></Link></div>)}
								</div></div>
							</div>
							<div className="right">
								<h2 className="mtit">기획전</h2>
								<div className="mc03a_slide">
									{exhibits[0] && <Link prefetch={false} href={`/news/exhibit_view?id=${encodeURIComponent(exhibits[0].postId)}`} className="exhibit_card"><span className={`imgfit${exhibits[0].thumbnailUrl ? ' in' : ''}`}>{exhibits[0].thumbnailUrl && <img src={resolvePublicMediaUrl(exhibits[0].thumbnailUrl)} alt="" />}</span><div className="txt"><h3>{exhibits[0].title}</h3></div></Link>}
								</div>
							</div>
						</div>
					</div>
				</section>
				{popupOpen && activePopup && (
					<div className="pop_gen" role="dialog" aria-modal="true" aria-labelledby="main-popup-title" style={popupPositionStyle}>
						<h2 id="main-popup-title" className="sound_only">{activePopup.name}</h2>
						<div ref={popupRef} className="pop_slide_wrap swiper" style={{ height: activePopup.height && activePopup.height > 0 ? activePopup.height : 500 }}>
							<div className="pop_slide swiper-wrapper">
								{popups.map((popup, index) => {
									const href = safeBannerHref(popup.linkUrl)
									const body = popup.imageUrl ? (
										<img src={resolvePublicMediaUrl(popup.imageUrl)} alt={popup.name} loading="eager" fetchPriority={index === 0 ? 'high' : 'auto'} />
									) : (
										<div className="pop_content" dangerouslySetInnerHTML={{ __html: resolvePublicHtmlMediaUrls(popup.content || '') }} />
									)
									return (
										<div className="slide swiper-slide" key={popup.popupId}>
											{href && isInternalHref(href) && popup.linkTargetCode !== 'B'
												? <Link prefetch={false} href={href}>{body}</Link>
												: href
													? <a href={isInternalHref(href) ? withBasePath(href) : href} target={popup.linkTargetCode === 'B' ? '_blank' : undefined} rel={popup.linkTargetCode === 'B' ? 'noopener noreferrer' : undefined}>{body}</a>
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

'use client'

import { useEffect, useRef, useState } from 'react'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'

type SwiperInstance = {
	autoplay?: { running: boolean; start: () => void; stop: () => void }
	destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void
}

type SwiperConstructor = new (element: Element | string, options: Record<string, unknown>) => SwiperInstance

declare global {
	interface Window {
		Swiper?: SwiperConstructor
	}
}

const EXHIBITS = Array.from({ length: 4 })
const NOTICES = Array.from({ length: 3 })
const GALLERY_ITEMS = Array.from({ length: 3 })
const EVENTS = Array.from({ length: 2 })

export default function HomePageClient() {
	const [mainPlaying, setMainPlaying] = useState(true)
	const [exhibitPlaying, setExhibitPlaying] = useState(true)
	const [eventPlaying, setEventPlaying] = useState(true)
	const visualRef = useRef<HTMLDivElement>(null)
	const exhibitRef = useRef<HTMLDivElement>(null)
	const galleryRef = useRef<HTMLDivElement>(null)
	const eventRef = useRef<HTMLDivElement>(null)
	const progressRef = useRef<HTMLDivElement>(null)
	const mainSwiperRef = useRef<SwiperInstance | null>(null)
	const exhibitSwiperRef = useRef<SwiperInstance | null>(null)
	const eventSwiperRef = useRef<SwiperInstance | null>(null)

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

			const mainSwiper = new Swiper(visualRef.current, {
				loop: true,
				autoplay: { delay: 5000, disableOnInteraction: false },
				navigation: { nextEl: '.mvisual_wrap .arrow.next', prevEl: '.mvisual_wrap .arrow.prev' },
				pagination: {
					el: '.mvisual_wrap .paging',
					type: 'custom',
					renderCustom: (_swiper: SwiperInstance, current: number, total: number) => `<strong>${current}</strong>/<span>${total}</span>`
				},
				on: {
					init: startProgress,
					slideChangeTransitionStart: resetProgress,
					slideChangeTransitionEnd: (swiper: SwiperInstance) => {
						if (swiper.autoplay?.running) startProgress()
					}
				}
			})
			const exhibitSwiper = new Swiper(exhibitRef.current, {
				loop: true,
				autoplay: { delay: 3000, disableOnInteraction: false },
				navigation: { nextEl: '.mc03 .left .arrow.next', prevEl: '.mc03 .left .arrow.prev' },
				slidesPerView: 1,
				spaceBetween: 16,
				breakpoints: {
					768: { slidesPerView: 2, spaceBetween: 20 },
					1024: { slidesPerView: 3, spaceBetween: 24 }
				}
			})
			const gallerySwiper = new Swiper(galleryRef.current, {
				loop: true,
				autoplay: { delay: 3000, disableOnInteraction: false },
				slidesPerView: 1,
				spaceBetween: 12,
				breakpoints: {
					768: { slidesPerView: 3, spaceBetween: 16 },
					1024: { slidesPerView: 3, spaceBetween: 20 },
					1600: { slidesPerView: 3, spaceBetween: 24 }
				}
			})
			const eventSwiper = new Swiper(eventRef.current, {
				loop: true,
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
			instances = [mainSwiper, exhibitSwiper, gallerySwiper, eventSwiper]
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
	}, [])

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

	return (
		<>
			<h1 className="sound_only">울산광역시미래교육관</h1>
			<SiteHeader />
			<main className="container" id="mainContent">
				<section className="mvisual_wrap">
					<div ref={visualRef} className="mvisual swiper">
						<div className="swiper-wrapper">
							<div className="swiper-slide"><img src="/pub/images/mvisual01.webp" alt="" /></div>
							<div className="swiper-slide"><img src="/pub/images/mvisual01.webp" alt="" /></div>
						</div>
					</div>
					<div className="txt">
						<div className="inner">
							<h2>지속가능한 내일을 <br className="mo_vw" />꿈꾸는 <br className="pc_vw" />울산의 <br className="mo_vw" />새로운 교육 공간</h2>
							<p>울산광역시미래교육관 홈페이지를 방문해주신 <br className="mo_vw" />여러분을 진심으로 환영합니다.</p>
							<div className="control">
								<div className="line"><div ref={progressRef} className="bar" /></div>
								<div className="paging" />
								<button type="button" className={`papl pause${mainPlaying ? ' on' : ''}`} onClick={() => toggleAutoplay(mainSwiperRef, mainPlaying, setMainPlaying, true)}>일시정지</button>
								<button type="button" className={`papl play${mainPlaying ? '' : ' on'}`} onClick={() => toggleAutoplay(mainSwiperRef, mainPlaying, setMainPlaying, true)}>재생</button>
								<button type="button" className="arrow prev">이전</button>
								<button type="button" className="arrow next">다음</button>
							</div>
						</div>
					</div>
				</section>

				<section className="mcon mc01">
					<div className="inner">
						<div className="left flex">
							<div className="txt"><h2 className="tit">자주 찾는 메뉴</h2><p>울산광역시 미래교육관의 <br />자주 찾는 메뉴들을 만나보세요!</p></div>
							<ul className="links">
								<li className="i1"><a href="/program/reserve"><i aria-hidden="true" />예약 안내</a></li>
								<li className="i2"><a href="/about/location.html"><i aria-hidden="true" />오시는 길</a></li>
								<li className="i3"><a href="/exhibit/floor_1f.html"><i aria-hidden="true" />전시 소개</a></li>
								<li className="i4"><a href="/support/faq.html"><i aria-hidden="true" />FAQ</a></li>
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
						<div className="mtit"><h2>울산광역시 미래교육관</h2><strong>교육 프로그램</strong><a href="/program/esd_pbl" className="btn_more">더보기</a></div>
						<ul className="program_list">
							<li className="c1"><a href="/program/elementary"><i aria-hidden="true"><img src="/pub/images/icon_mc02_01.svg" alt="" /></i><h3>사건탐구 프로그램(초5)</h3><p>울산의 문제를 직접 탐구하고 <br />해결하는 프로젝트 학습</p></a></li>
							<li className="c2"><a href="/program/mission"><i aria-hidden="true"><img src="/pub/images/icon_mc02_02.svg" alt="" /></i><h3>미션 프로그램(중1)</h3><p>스토리 속 미션을 해결하며 <br />지속가능한 미래를 발견하는 체험</p></a></li>
							<li className="c3"><a href="/program/biggame"><i aria-hidden="true"><img src="/pub/images/icon_mc02_03.svg" alt="" /></i><h3>빅게임 프로그램</h3><p>팀과 함께 퀘스트를 수행하며 <br />몰입과 재미로 배우는 모험</p></a></li>
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
									{EXHIBITS.map((_, index) => <div className="swiper-slide" key={index}><a href="/news/exhibit_view.html"><img src="/pub/images/img_sample_mc03_a.webp" alt="" /><h3>울산미래교육관 기관 상징 공모</h3></a></div>)}
								</div></div>
							</div>
							<div className="right">
								<h2 className="mtit">공지사항</h2><a href="/news/notice.html" className="btn_more">더보기</a>
								<ul className="main_notice">
									{NOTICES.map((_, index) => <li key={index}><a href="/news/notice_view.html"><span className="imgfit"><img src="/pub/images/img_sample_mc03_b.webp" alt="" /></span><span className="txt"><h3>공무원 사칭 피해 주의하세요!</h3><p>최근 교육청 직원으로 속여 대량 발주를 미끼로 접근한 뒤, &quot;물품 대금을 대신 입금해달라&quot;며 돈을 가로채는 사기 피해가 발생하고 있습니다. 울산광역시교육청은 공식 절차 없이 물품납품, 결제액 대납 등을 요구하지 않습니다.</p><span className="date">2026-06-10</span></span></a></li>)}
								</ul>
							</div>
						</div>
						<div className="flex">
							<div className="left">
								<h2 className="mtit">갤러리</h2><a href="/gallery/index.html" className="btn_more">더보기</a>
								<div ref={galleryRef} className="main_gallery swiper"><div className="swiper-wrapper">
									{GALLERY_ITEMS.map((_, index) => <div className="swiper-slide" key={index}><a href="/gallery/view.html"><span className="imgfit"><img src="/pub/images/img_sample_mc03_c.webp" alt="" /></span><span className="txt"><h3>울산 미래 마을 디자이너를 찾아라!</h3><span className="date">2026-06-12</span></span></a></div>)}
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
									{EVENTS.map((_, index) => <div className="swiper-slide" key={index}><img src="/pub/images/img_sample_mc03_d.webp" alt="" /></div>)}
								</div></div>
							</div>
						</div>
					</div>
				</section>
			</main>
			<SiteFooter />
		</>
	)
}

'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const RESERVATION_URL = 'https://use.go.kr/booking/index.do;jsessionid=18A242975D5071CBE5C0B679CB59722B'

export default function SiteFooter() {
	const [unfixed, setUnfixed] = useState(false)
	const [familyOpen, setFamilyOpen] = useState(false)
	const footerRef = useRef<HTMLElement>(null)
	const quickRef = useRef<HTMLDivElement>(null)
	const topButtonRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		const updatePosition = () => {
			const footer = footerRef.current
			const topButton = topButtonRef.current
			if (!footer || !topButton) return
			const quickBottom = window.matchMedia('(max-width: 767px)').matches ? 20 : 24
			const triggerPoint = window.innerHeight - (quickBottom + topButton.offsetHeight / 2)
			setUnfixed(footer.getBoundingClientRect().top <= triggerPoint)
		}
		updatePosition()
		window.addEventListener('scroll', updatePosition, { passive: true })
		window.addEventListener('resize', updatePosition)
		return () => {
			window.removeEventListener('scroll', updatePosition)
			window.removeEventListener('resize', updatePosition)
		}
	}, [])

	return (
		<footer ref={footerRef} className={`footer${unfixed ? ' unfixed' : ''}`}>
			<div ref={quickRef} className="quick_area">
				<a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="btn btn_youtube">유튜브</a>
				<a href={RESERVATION_URL} target="_blank" rel="noopener noreferrer" className="btn btn_reserve">통합예약</a>
				<button ref={topButtonRef} type="button" className="btn gotop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>TOP</button>
			</div>
			<div className="footer_info">
				<div className="inner">
					<div className="top">
						<div className="logo" aria-hidden="true" />
						<ul className="links">
							<li><Link href="/terms/policy">이용약관</Link></li>
							<li><Link href="/terms/privacy"><strong>개인정보처리방침</strong></Link></li>
							<li><Link href="/terms/no_email">이메일 무단수집거부</Link></li>
							<li><Link href="/terms/cctv">영상정보처리기기 운영방침</Link></li>
						</ul>
					</div>
					<div className="btm">
						<div className="txt">
							<ul className="info">
								<li className="w100p"><strong>주소</strong>(우) 44985 울산광역시 북구 무룡로 1119-6 (강동동) 울산광역시미래교육관</li>
								<li><strong>전화</strong>052-000-0000</li>
								<li><strong>팩스</strong>052-000-0000</li>
							</ul>
							<p className="copy">Copyright © 2026 울산광역시미래교육관. All rights reserved.</p>
						</div>
						<ul className="out_link">
							<li className="btn_reserve"><a href={RESERVATION_URL} target="_blank" rel="noopener noreferrer">울산광역시교육청 통합예약</a></li>
							<li className="btn_youtube"><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">울산광역시미래교육관 유튜브</a></li>
							<li className={`family_site${familyOpen ? ' on' : ''}`}>
								<button type="button" className="btn" aria-expanded={familyOpen} onClick={() => setFamilyOpen((open) => !open)}>관련 기관 사이트<i aria-hidden="true" /></button>
								<ul>
									<li><a href="#this" target="_blank">관련 기관 사이트</a></li>
									<li><a href="#this" target="_blank">관련 기관 사이트</a></li>
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	)
}

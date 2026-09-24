'use client'

import Link from 'next/link'

/* 푸터 약관 링크도 같은 이유로 prefetch 를 끈다. */
import { useEffect, useRef, useState } from 'react'
import type { PublicSiteSetting } from '@/lib/publicApi'
import { getSiteChrome } from '@/lib/siteChrome'

const RESERVATION_URL = 'https://use.go.kr/booking/index.do;jsessionid=18A242975D5071CBE5C0B679CB59722B'

const FAMILY_SITES = [
	{ name: '울산광역시교육청', url: 'https://use.go.kr/use/index.do' },
	{ name: '울산광역시강북교육지원청', url: 'https://use.go.kr/usgbe/index.do' },
	{ name: '울산광역시강남교육지원청', url: 'https://use.go.kr/usgne/index.do' },
	{ name: '울산과학관', url: 'https://use.go.kr/usm/index.do' },
	{ name: '울산수학문화관', url: 'https://use.go.kr/usmcc/index.do' },
	{ name: '울산들꽃학습원', url: 'https://use.go.kr/uwf/index.do' },
	{ name: '울산기후위기대응교육센터', url: 'https://use.go.kr/climate/index.do' },
	{ name: '울산광역시교육연구정보원', url: 'https://use.go.kr/edu/index.do' },
	{ name: '울산광역시교육연수원', url: 'https://edu.ueti.or.kr/' },
	{ name: '울산광역시교육수련원', url: 'https://use.go.kr/usetc/index.do' },
]

/** 관리자 기본설정을 못 받았을 때 쓰는 기본 문구 */
const DEFAULT_ADDRESS = '(우) 44233 울산광역시 북구 무룡로 1119-6 (강동동) 울산광역시미래교육관'
const DEFAULT_TEL = '052-231-8500'
const DEFAULT_NAME = '울산광역시미래교육관'

export default function SiteFooter() {
	const [setting, setSetting] = useState<PublicSiteSetting | null>(null)
	const address = setting?.institutionAddress?.trim() || DEFAULT_ADDRESS
	const telephone = setting?.institutionTel?.trim() || DEFAULT_TEL
	const institutionName = setting?.institutionName?.trim() || DEFAULT_NAME
	const footerContent = setting?.footerContent?.trim()
	const [unfixed, setUnfixed] = useState(false)
	const [familyOpen, setFamilyOpen] = useState(false)
	const footerRef = useRef<HTMLElement>(null)
	const quickRef = useRef<HTMLDivElement>(null)
	const topButtonRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		let cancelled = false
		void getSiteChrome().then(({ setting: nextSetting }) => {
			if (!cancelled) setSetting(nextSetting)
		})
		return () => {
			cancelled = true
		}
	}, [])

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
				<a href="https://www.instagram.com/usfec.official/" target="_blank" rel="noopener noreferrer" className="btn btn_youtube">인스타그램</a>
				<a href={RESERVATION_URL} target="_blank" rel="noopener noreferrer" className="btn btn_reserve">통합예약</a>
				<button ref={topButtonRef} type="button" className="btn gotop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>TOP</button>
			</div>
			<div className="footer_info">
				<div className="inner">
					<div className="top">
						<div className="logo" aria-hidden="true" />
						<ul className="links">
							<li><Link prefetch={false} href="/terms/policy">이용약관</Link></li>
							<li><Link prefetch={false} href="/terms/privacy"><strong>개인정보처리방침</strong></Link></li>
							<li><Link prefetch={false} href="/terms/no_email">이메일 무단수집거부</Link></li>
							<li><Link prefetch={false} href="/terms/cctv">영상정보처리기기 운영방침</Link></li>
						</ul>
					</div>
					<div className="btm">
						<div className="txt">
							<ul className="info">
								<li className="w100p"><strong>주소</strong>{address}</li>
								<li><strong>전화</strong>{telephone}</li>
								{/* ponytail: 팩스는 관리자 기본설정에 대응하는 항목이 없어 그대로 둔다. */}
								<li><strong>팩스</strong>052-231-8559</li>
							</ul>
							{/* 관리자 '푸터 텍스트'는 textarea 로 받는 평문이라 줄바꿈만 살려 그대로 찍는다. */}
							{footerContent ? <p className="copy" style={{ whiteSpace: 'pre-line' }}>{footerContent}</p> : null}
							<p className="copy">Copyright © 2026 {institutionName}. All rights reserved.</p>
						</div>
						<ul className="out_link">
							<li className="btn_reserve"><a href={RESERVATION_URL} target="_blank" rel="noopener noreferrer">울산광역시교육청 통합예약</a></li>
							<li className="btn_youtube"><a href="https://www.instagram.com/usfec.official/" target="_blank" rel="noopener noreferrer">울산광역시미래교육관 인스타그램</a></li>
							<li className={`family_site${familyOpen ? ' on' : ''}`}>
								<button type="button" className="btn" aria-expanded={familyOpen} onClick={() => setFamilyOpen((open) => !open)}>관련 기관 사이트<i aria-hidden="true" /></button>
								<ul>
									{FAMILY_SITES.map((site) => (
										<li key={site.url}><a href={site.url} target="_blank" rel="noopener noreferrer">{site.name}</a></li>
									))}
								</ul>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	)
}

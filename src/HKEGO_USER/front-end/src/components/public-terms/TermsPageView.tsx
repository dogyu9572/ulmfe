import type { PublicTerms } from '@/lib/publicApi'

const TERMS_NAVIGATION = [
	{ code: 'USE', label: '이용약관', href: '/terms/policy' },
	{ code: 'PRIVACY', label: '개인정보처리방침', href: '/terms/privacy', strong: true },
	{ code: 'EMAIL', label: '이메일 무단수집거부', href: '/terms/no_email' },
	{ code: 'VIDEO', label: '영상정보처리기기 운영방침', href: '/terms/cctv' }
] as const

const escapeHtml = (value: string) => value
	.replaceAll('&', '&amp;')
	.replaceAll('<', '&lt;')
	.replaceAll('>', '&gt;')
	.replaceAll('"', '&quot;')
	.replaceAll("'", '&#039;')

const formatEffectiveDate = (value: string | null) => {
	if (!value) return ''
	const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
	if (!matched) return ''
	return `${Number(matched[1])}년 ${Number(matched[2])}월 ${Number(matched[3])}일`
}

export default function TermsPageView({
	activeTypeCode,
	terms
}: {
	activeTypeCode: PublicTerms['termsTypeCode']
	terms: PublicTerms | null
}) {
	const activeIndex = TERMS_NAVIGATION.findIndex((item) => item.code === activeTypeCode)
	const emailType = activeTypeCode === 'EMAIL'
	const effectiveDate = formatEffectiveDate(terms?.registeredAt ?? null)
	const termsHtml = terms
		? emailType
			? `<h2>${escapeHtml(terms.title)}</h2>${terms.content || ''}`
			: `<div class="tit"><h2>${escapeHtml(terms.title)}</h2>${effectiveDate ? `<span>시행일: ${effectiveDate}</span>` : ''}</div>${terms.content || ''}`
		: ''

	return (
		<section className="inner" aria-labelledby="total-search-title">
			<h1 id="total-search-title" className="subtitle">약관 및 정책</h1>
			<div className="aside_wrap no_image">
				<nav className="aside">
					<ul className="snb">
						{TERMS_NAVIGATION.map((item, index) => (
							<li
								key={item.code}
								className={[
									item.code === activeTypeCode ? 'on' : '',
									index === activeIndex - 1 ? 'no_before' : ''
								].filter(Boolean).join(' ') || undefined}
							>
								<a href={item.href}>{item.code === 'PRIVACY' ? <strong>{item.label}</strong> : item.label}</a>
							</li>
						))}
					</ul>
				</nav>
			</div>
			{terms ? (
				<div className={`gbox terms_box${emailType ? ' email_box' : ''}`} dangerouslySetInnerHTML={{ __html: termsHtml }} />
			) : (
				<div className={`gbox terms_box${emailType ? ' email_box' : ''}`}><p>등록된 약관이 없습니다.</p></div>
			)}
		</section>
	)
}

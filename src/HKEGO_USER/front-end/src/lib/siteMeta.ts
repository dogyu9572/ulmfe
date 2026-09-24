// 사이트 전역 SEO 메타데이터·구조화 데이터·색인 정책을 모아 둔 모듈

import type { Metadata } from 'next'
import { SITE_MENUS } from '@/components/siteNavigation'
import type { PublicEduProgram } from '@/lib/publicApi'
import { BASE_PATH } from '@/lib/basePath'

/**
 * 운영 도메인(path 포함). config/user.env 의 NEXT_PUBLIC_SITE_URL 로 덮어쓴다.
 * 기본값: https://use.go.kr/usfec
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://use.go.kr/usfec').replace(/\/+$/, '')


export const SITE_NAME = '울산광역시미래교육관'
export const SITE_SHORT_NAME = '미래교육관'
export const SITE_DESCRIPTION =
	'울산광역시미래교육관은 전시 관람과 체험형 교육 프로그램, 도서관 서비스를 제공하는 울산광역시교육청 소속 미래교육 기관입니다. 층별 전시, 초등 교육과정 연계 프로그램, ESD 미션 프로그램, 단체 예약 안내를 제공합니다.'

export const SITE_KEYWORDS = [
	'울산광역시미래교육관',
	'울산 미래교육관',
	'울산 미래교육',
	'울산광역시교육청',
	'미래교육 체험',
	'초등 교육 프로그램',
	'ESD 프로그램',
	'전시 관람 예약',
	'울산 도서관'
]

/**
 * OG·파비콘 앱 경로(basePath 제외).
 * Metadata 는 metadataBase(/usfec) 와 조인되므로 withBasePath 를 붙이면 이중 prefix 가 난다.
 * HTML <link>/<img> 가 필요하면 absoluteAssetUrl 또는 withBasePath 를 따로 쓴다.
 */
export const OG_IMAGE_PATH: string | null = '/pub/images/og_image.jpg'

/** ponytail: 실제 파일 크기다. 1200x630 원본을 받으면 이 값만 바꾼다. */
export const OG_IMAGE_SIZE = { width: 400, height: 210 }

export const FAVICON_PATH = '/pub/images/favicon.svg'

/** SVG 파비콘을 지원하지 않는 구형 브라우저용 대체 아이콘 */
export const FAVICON_ICO_PATH = '/pub/images/favicon.ico'

/** 푸터에 노출되는 기관 소재지. 구조화 데이터의 PostalAddress 와 값을 맞춘다. */
export const ORGANIZATION_ADDRESS = {
	postalCode: '44233',
	addressRegion: '울산광역시',
	addressLocality: '북구',
	streetAddress: '무룡로 1119-6 (강동동)'
}

export const ORGANIZATION_SAME_AS = ['https://www.youtube.com/@happy_use']

/**
 * 관람 운영시간. 메인 이용안내와 예약 안내가 같은 값을 쓰도록 여기 한 곳에 모았다.
 * 두 화면이 각자 하드코딩하던 때에는 09:00~18:00 과 09:30~15:00 으로 값이 어긋나 있었다.
 */
export const OPENING_HOURS = {
	weekday: { label: '평일(화~금)', dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:30', closes: '15:00' },
	weekend: { label: '주말(토, 일)', dayOfWeek: ['Saturday', 'Sunday'], opens: '09:30', closes: '16:30' }
} as const

/** 관람이 중단되는 점심시간. 구조화 데이터에서는 이 구간을 기준으로 운영시간을 둘로 쪼갠다. */
export const LUNCH_BREAK = { opens: '12:00', closes: '13:00' }

/** 메인 이용안내는 카드 폭에 맞춘 수동 개행이 들어가 같은 문구를 직접 적어 둔다. */
export const CLOSED_DAYS_TEXT = '월요일, 법정공휴일, 시설점검기간'

/** 화면에 찍는 '09:30~15:00' 형태의 문자열 */
export function hoursText(hours: { opens: string; closes: string }): string {
	return `${hours.opens}~${hours.closes}`
}

/**
 * 색인 정책은 두 축으로 나뉜다.
 * - 색인 차단: 검색어가 있어야 내용이 생기는 화면 (빈 문서가 색인되면 검색 품질을 떨어뜨린다)
 * - sitemap 제외: 쿼리스트링이 있어야 내용이 생기는 화면 (색인은 허용하되 목록 링크로 발견되게 둔다)
 */
const NOINDEX_PATHS = new Set([
	'library/search_list',
	'total_search/index'
])

/** 쿼리스트링이 없으면 빈 문서가 되므로 sitemap 에는 넣지 않는 화면 */
const SITEMAP_EXCLUDED_SUFFIXES = ['_view', '_write', '_modify']

/**
 * 메뉴에서 '준비중' 으로 막아 둔 섹션.
 * 사람은 메뉴로 들어갈 수 없는데 검색 결과로만 닿으면 안내가 어긋나므로 색인도 막는다.
 */
const COMING_SOON_SECTIONS = new Set(SITE_MENUS.filter((menu) => menu.comingSoon).map((menu) => menu.section))

export function isIndexablePage(section: string, slug: string): boolean {
	if (COMING_SOON_SECTIONS.has(section)) return false
	return !NOINDEX_PATHS.has(`${section}/${slug}`)
}

export function isSitemapPage(section: string, slug: string): boolean {
	if (!isIndexablePage(section, slug)) return false
	return !SITEMAP_EXCLUDED_SUFFIXES.some((suffix) => slug.endsWith(suffix))
}

/** 쿼리스트링으로 내용이 결정되는 화면은 canonical 을 고정하면 모든 글이 한 URL 로 합쳐진다. */
export function hasFixedCanonical(slug: string): boolean {
	return !SITEMAP_EXCLUDED_SUFFIXES.some((suffix) => slug.endsWith(suffix))
}

/**
 * next.config 의 trailingSlash: true 와 canonical 형식을 맞추기 위해 끝 슬래시를 보장한다.
 * 게시판 상세처럼 쿼리스트링이 붙는 경로는 경로 부분에만 슬래시를 붙인다.
 */
export function toCanonicalPath(path: string): string {
	if (!path || path === '/') return '/'
	const [pathname, query] = path.split('?')
	const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
	const withSlash = normalized.endsWith('/') ? normalized : `${normalized}/`
	return query ? `${withSlash}?${query}` : withSlash
}

export function absoluteUrl(path: string): string {
	return `${SITE_URL}${toCanonicalPath(path)}`
}

/**
 * 파일·이미지용 절대 URL. trailingSlash 를 붙이지 않고, 이미 있는 basePath 는 한 번만 유지한다.
 */
export function absoluteAssetUrl(path: string): string {
	const raw = path.trim()
	if (!raw) return SITE_URL
	if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw
	let pathname = raw.startsWith('/') ? raw : `/${raw}`
	if (BASE_PATH && (pathname === BASE_PATH || pathname.startsWith(`${BASE_PATH}/`))) {
		pathname = pathname.slice(BASE_PATH.length) || '/'
	}
	return `${SITE_URL}${pathname}`
}

type PageMetaInput = {
	title: string
	description?: string
	path: string
	indexable?: boolean
	/** 목록형 화면처럼 제목을 그대로 쓰고 싶을 때 사이트명 접미사를 끈다. */
	appendSiteName?: boolean
	/** 쿼리스트링으로 내용이 갈리는 상세 화면은 canonical 을 고정하지 않는다. */
	withCanonical?: boolean
	/** 관리자 기본설정에서 사이트 제목을 바꾸면 그 값을 넘긴다. 비우면 코드 기본값을 쓴다. */
	siteName?: string
}

/** 모든 페이지가 동일한 형식의 title·canonical·openGraph·twitter 를 갖도록 한 곳에서 조립한다. */
export function buildPageMetadata({
	title,
	description,
	path,
	indexable = true,
	appendSiteName = true,
	withCanonical = true,
	siteName = SITE_NAME
}: PageMetaInput): Metadata {
	const fullTitle = appendSiteName && title !== siteName ? `${title} | ${siteName}` : title
	const pageDescription = description?.trim() || SITE_DESCRIPTION
	const canonical = toCanonicalPath(path)
	const images = OG_IMAGE_PATH ? [{ url: absoluteAssetUrl(OG_IMAGE_PATH), ...OG_IMAGE_SIZE, alt: siteName }] : undefined

	return {
		// layout 의 title.template 이 사이트명을 한 번 더 붙이지 않도록 절대 제목으로 지정한다.
		title: { absolute: fullTitle },
		description: pageDescription,
		alternates: withCanonical ? { canonical } : undefined,
		robots: indexable
			? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
			: { index: false, follow: true },
		openGraph: {
			type: 'website',
			siteName,
			locale: 'ko_KR',
			url: canonical,
			title: fullTitle,
			description: pageDescription,
			images
		},
		twitter: {
			card: images ? 'summary_large_image' : 'summary',
			title: fullTitle,
			description: pageDescription,
			images: images?.map((image) => image.url)
		}
	}
}

/** 대메뉴 라벨을 찾는다. pageRegistry 의 menuIndex 가 null 이면 빵부스러기를 2단계로 만든다. */
export function menuLabelByIndex(menuIndex: number | null): string | null {
	if (menuIndex === null) return null
	return SITE_MENUS[menuIndex]?.label ?? null
}

export function menuHrefByIndex(menuIndex: number | null): string | null {
	if (menuIndex === null) return null
	return SITE_MENUS[menuIndex]?.href ?? null
}

/* ------------------------------------------------------------------ *
 * 구조화 데이터(JSON-LD)
 * 검색엔진(SEO)뿐 아니라 생성형 검색(GEO)·답변 엔진(AEO)이 기관 정보와
 * 질의응답을 근거 있게 추출할 수 있도록 schema.org 타입으로 기술한다.
 * ------------------------------------------------------------------ */

export const ORGANIZATION_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
const PLACE_ID = `${SITE_URL}/#place`

function postalAddressJsonLd() {
	return {
		'@type': 'PostalAddress',
		addressCountry: 'KR',
		postalCode: ORGANIZATION_ADDRESS.postalCode,
		addressRegion: ORGANIZATION_ADDRESS.addressRegion,
		addressLocality: ORGANIZATION_ADDRESS.addressLocality,
		streetAddress: ORGANIZATION_ADDRESS.streetAddress
	}
}

/**
 * 점심시간에는 관람이 중단되므로 요일군마다 오전·오후 두 구간으로 나눠 기술한다.
 * 휴관일인 월요일을 아예 넣지 않는 것이 schema.org 에서 '그날은 닫는다' 는 뜻이다.
 * 법정공휴일과 시설점검기간은 날짜가 매번 달라져 여기서는 표현하지 않는다.
 */
function openingHoursSpecification() {
	return Object.values(OPENING_HOURS).flatMap(({ dayOfWeek, opens, closes }) => [
		{ '@type': 'OpeningHoursSpecification', dayOfWeek: [...dayOfWeek], opens, closes: LUNCH_BREAK.opens },
		{ '@type': 'OpeningHoursSpecification', dayOfWeek: [...dayOfWeek], opens: LUNCH_BREAK.closes, closes }
	])
}

/**
 * 운영시간·좌표는 schema.org 에서 Place 의 속성이라 Organization 에 직접 붙이면 무시된다.
 * 건물을 Place 로 세우고 Organization 에서 location 으로 연결한다.
 */
function placeJsonLd() {
	return {
		'@type': 'Place',
		'@id': PLACE_ID,
		name: SITE_NAME,
		address: postalAddressJsonLd(),
		geo: {
			'@type': 'GeoCoordinates',
			// PageBehavior 의 카카오맵 초기 중심 좌표와 동일한 값이다. 정밀 좌표가 확정되면 두 곳을 함께 고친다.
			latitude: 35.5975,
			longitude: 129.373
		},
		openingHoursSpecification: openingHoursSpecification(),
		/** 관람료가 없다는 사실도 답변 엔진이 자주 받는 질문이라 명시한다. */
		isAccessibleForFree: true,
		publicAccess: true
	}
}

export function organizationJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'EducationalOrganization',
		'@id': ORGANIZATION_ID,
		name: SITE_NAME,
		alternateName: SITE_SHORT_NAME,
		url: `${SITE_URL}/`,
		logo: absoluteAssetUrl('/pub/images/logo.svg'),
		description: SITE_DESCRIPTION,
		inLanguage: 'ko-KR',
		parentOrganization: { '@type': 'GovernmentOrganization', name: '울산광역시교육청' },
		address: postalAddressJsonLd(),
		location: placeJsonLd(),
		sameAs: ORGANIZATION_SAME_AS,
		telephone: '052-231-8500',
		faxNumber: '052-231-8559'
	}
}

export function webSiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		url: `${SITE_URL}/`,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		inLanguage: 'ko-KR',
		publisher: { '@id': ORGANIZATION_ID },
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${SITE_URL}/total_search/index/?search_keyword={search_term_string}`
			},
			'query-input': 'required name=search_term_string'
		}
	}
}

export type BreadcrumbItem = { name: string; path: string }

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [{ name: '홈', path: '/' }, ...items].map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path)
		}))
	}
}

/** 답변 엔진이 본문을 그대로 인용할 수 있도록 HTML 을 평문으로 정리한다. */
export function toPlainText(html: string | null | undefined, maxLength = 800): string {
	if (!html) return ''
	const text = html
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<\/(p|div|li|tr|h[1-6])>/gi, ' ')
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim()
	return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

export type FaqEntry = { question: string; answer: string }

export function faqJsonLd(entries: FaqEntry[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'@id': `${absoluteUrl('/news/faq')}#faq`,
		inLanguage: 'ko-KR',
		mainEntity: entries.map((entry) => ({
			'@type': 'Question',
			name: entry.question,
			acceptedAnswer: { '@type': 'Answer', text: entry.answer }
		}))
	}
}

/** 게시판 상세·공지 등 개별 글을 답변 엔진이 출처로 인식하도록 기술한다. */
export function articleJsonLd(input: { title: string; description: string; path: string; publishedAt?: string | null; modifiedAt?: string | null }) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: input.title,
		description: input.description,
		url: absoluteUrl(input.path),
		inLanguage: 'ko-KR',
		datePublished: input.publishedAt || undefined,
		dateModified: input.modifiedAt || input.publishedAt || undefined,
		author: { '@id': ORGANIZATION_ID },
		publisher: { '@id': ORGANIZATION_ID }
	}
}

/**
 * 교육프로그램 목록을 답변 엔진이 개별 강좌로 구분하도록 ItemList 안에 Course 로 기술한다.
 * 프로그램마다 상세 페이지가 따로 없어 url 은 모두 목록 주소를 가리킨다.
 */
export function eduProgramListJsonLd(programs: PublicEduProgram[]) {
	const listed = programs.filter((program) => program.title)
	if (listed.length === 0) return null

	const listUrl = absoluteUrl('/program/list')
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		'@id': `${listUrl}#programs`,
		name: '울산광역시미래교육관 교육프로그램',
		inLanguage: 'ko-KR',
		numberOfItems: listed.length,
		itemListElement: listed.map((program, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				'@type': 'Course',
				name: program.title,
				description: program.description || program.title,
				url: listUrl,
				inLanguage: 'ko-KR',
				provider: { '@id': ORGANIZATION_ID },
				about: program.categoryName || undefined,
				// 프로그램의 place 는 '메이커실' 같은 관내 공간 이름이라 건물 Place 안에 넣는다.
				hasCourseInstance: {
					'@type': 'CourseInstance',
					courseMode: 'Onsite',
					location: program.place
						? { '@type': 'Place', name: program.place, containedInPlace: { '@id': PLACE_ID } }
						: { '@id': PLACE_ID }
				}
				// ponytail: capacity 는 '학급당 25명' 처럼 자유 문구라 정수를 요구하는
				// maximumAttendeeCapacity 에 넣지 않는다. 관리자에서 숫자로 받게 되면 그때 추가한다.
			}
		}))
	}
}

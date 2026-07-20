export type SiteMenu = {
	label: string
	href: string
	children: Array<{ label: string; href: string }>
}

export const SITE_MENUS: SiteMenu[] = [
	{
		label: '울산광역시미래교육관 소개',
		href: '/about/greeting.html',
		children: [
			{ label: '인사말', href: '/about/greeting.html' },
			{ label: '미션 및 비전', href: '/about/vision.html' },
			{ label: '연혁', href: '/about/history.html' },
			{ label: '조직도', href: '/about/organization.html' },
			{ label: 'CI', href: '/about/ci.html' },
			{ label: '오시는 길', href: '/about/location.html' }
		]
	},
	{
		label: '전시소개',
		href: '/exhibit/floor_1f.html',
		children: [
			{ label: '1F [질문]', href: '/exhibit/floor_1f.html' },
			{ label: '2F [탐구]', href: '/exhibit/floor_2f.html' },
			{ label: '3F [모험]', href: '/exhibit/floor_3f.html' },
			{ label: '별관 [생각]', href: '/exhibit/annex.html' },
			{ label: '야외 [놀이]', href: '/exhibit/outdoor.html' }
		]
	},
	{
		label: '교육프로그램 소개',
		href: '/program/esd_pbl.html',
		children: [
			{ label: 'ESD/PBL 소개', href: '/program/esd_pbl.html' },
			{ label: '사건탐구 프로그램(초5)', href: '/program/elementary.html' },
			{ label: '미션 프로그램(중1)', href: '/program/mission.html' },
			{ label: '빅게임 프로그램', href: '/program/biggame.html' },
			{ label: '방학/주말 특별프로그램', href: '/program/special.html' },
			{ label: '자유 체험', href: '/program/free.html' },
			{ label: '예약 안내', href: '/program/reserve.html' }
		]
	},
	{
		label: '학습지원 자료실',
		href: '/archive/elementary.html',
		children: [
			{ label: '사건탐구 프로그램', href: '/archive/elementary.html' },
			{ label: '미션 프로그램', href: '/archive/mission.html' }
		]
	},
	{
		label: '소식',
		href: '/news/notice.html',
		children: [
			{ label: '공지사항', href: '/news/notice.html' },
			{ label: '기획전', href: '/news/exhibit.html' },
			{ label: '이벤트', href: '/news/event.html' }
		]
	},
	{
		label: '고객지원',
		href: '/support/faq.html',
		children: [
			{ label: 'FAQ', href: '/support/faq.html' },
			{ label: '1:1문의', href: '/support/qna.html' }
		]
	},
	{
		label: '갤러리',
		href: '/gallery/index.html',
		children: [{ label: '갤러리', href: '/gallery/index.html' }]
	},
	{
		label: '도서관',
		href: '/library/info.html',
		children: [
			{ label: '도서관 안내', href: '/library/info.html' },
			{ label: '자료검색', href: '/library/search.html' },
			{ label: '사서 추천도서', href: '/library/recommend.html' },
			{ label: '새로 들어온 도서', href: '/library/new.html' }
		]
	}
]

const CONVERTED_LEGACY_HREFS = new Set([
	'/about/greeting.html',
	'/about/vision.html',
	'/about/history.html',
	'/about/organization.html',
	'/about/ci.html',
	'/about/location.html',
	'/exhibit/floor_1f.html',
	'/exhibit/floor_2f.html',
	'/exhibit/floor_3f.html',
	'/exhibit/annex.html',
	'/exhibit/outdoor.html',
	'/program/esd_pbl.html',
	'/program/elementary.html',
	'/program/mission.html',
	'/program/biggame.html',
	'/program/special.html',
	'/program/free.html',
	'/program/reserve.html',
	'/archive/elementary.html',
	'/archive/mission.html',
	'/news/notice.html',
	'/news/exhibit.html',
	'/news/event.html',
	'/support/faq.html',
	'/support/qna.html',
	'/gallery/index.html',
	'/library/info.html',
	'/library/search.html',
	'/library/recommend.html',
	'/library/new.html',
	'/total_search/index.html',
	'/terms/policy.html',
	'/terms/privacy.html',
	'/terms/no_email.html',
	'/terms/cctv.html'
])

export function resolveSiteHref(href: string): string {
	return CONVERTED_LEGACY_HREFS.has(href) ? href.slice(0, -5) : href
}

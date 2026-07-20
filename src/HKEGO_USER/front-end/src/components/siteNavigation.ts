export type SiteMenu = {
	label: string
	href: string
	children: Array<{ label: string; href: string }>
}

export const SITE_MENUS: SiteMenu[] = [
	{
		label: '울산광역시미래교육관 소개',
		href: '/about/greeting',
		children: [
			{ label: '인사말', href: '/about/greeting' },
			{ label: '미션 및 비전', href: '/about/vision' },
			{ label: '연혁', href: '/about/history' },
			{ label: '조직도', href: '/about/organization' },
			{ label: 'CI', href: '/about/ci' },
			{ label: '오시는 길', href: '/about/location' }
		]
	},
	{
		label: '전시소개',
		href: '/exhibit/floor_1f',
		children: [
			{ label: '1F [질문]', href: '/exhibit/floor_1f' },
			{ label: '2F [탐구]', href: '/exhibit/floor_2f' },
			{ label: '3F [모험]', href: '/exhibit/floor_3f' },
			{ label: '별관 [생각]', href: '/exhibit/annex' },
			{ label: '야외 [놀이]', href: '/exhibit/outdoor' }
		]
	},
	{
		label: '교육프로그램 소개',
		href: '/program/esd_pbl',
		children: [
			{ label: 'ESD/PBL 소개', href: '/program/esd_pbl' },
			{ label: '사건탐구 프로그램(초5)', href: '/program/elementary' },
			{ label: '미션 프로그램(중1)', href: '/program/mission' },
			{ label: '빅게임 프로그램', href: '/program/biggame' },
			{ label: '방학/주말 특별프로그램', href: '/program/special' },
			{ label: '자유 체험', href: '/program/free' },
			{ label: '예약 안내', href: '/program/reserve' }
		]
	},
	{
		label: '학습지원 자료실',
		href: '/archive/elementary',
		children: [
			{ label: '사건탐구 프로그램', href: '/archive/elementary' },
			{ label: '미션 프로그램', href: '/archive/mission' }
		]
	},
	{
		label: '소식',
		href: '/news/notice',
		children: [
			{ label: '공지사항', href: '/news/notice' },
			{ label: '기획전', href: '/news/exhibit' },
			{ label: '이벤트', href: '/news/event' }
		]
	},
	{
		label: '고객지원',
		href: '/support/faq',
		children: [
			{ label: 'FAQ', href: '/support/faq' },
			{ label: '1:1문의', href: '/support/qna' }
		]
	},
	{
		label: '갤러리',
		href: '/gallery/index',
		children: [{ label: '갤러리', href: '/gallery/index' }]
	},
	{
		label: '도서관',
		href: '/library/info',
		children: [
			{ label: '도서관 안내', href: '/library/info' },
			{ label: '자료검색', href: '/library/search' },
			{ label: '사서 추천도서', href: '/library/recommend' },
			{ label: '새로 들어온 도서', href: '/library/new' }
		]
	}
]

export type SiteMenuChild = {
	label: string
	href: string
	/** 관리자 메뉴 관리(HMPG_MENU)의 메뉴 코드. 이름과 노출 여부를 이 코드로 맞춘다. */
	menuCd?: string
}

export type SiteMenu = {
	/** 이 대메뉴가 담당하는 페이지 섹션. pageRegistry 의 section 과 짝을 이룬다. */
	section: string
	label: string
	href: string
	children: SiteMenuChild[]
	comingSoon?: boolean
	/** 관리자 메뉴 관리(HMPG_MENU)의 메뉴 코드 */
	menuCd?: string
}

/**
 * 메뉴의 구조와 주소는 코드가 소유한다. 관리자 메뉴 관리에서 바꿀 수 있는 값은
 * 표시 이름과 노출 여부 둘뿐이라, menuCd 로 짝을 지어 그 두 가지만 덮어쓴다.
 * menuCd 가 없는 항목은 관리자 화면에 대응하는 메뉴가 없어 늘 코드 값 그대로 나온다.
 */
export const SITE_MENUS: SiteMenu[] = [
	{
		section: 'about',
		label: '울산미래교육관',
		href: '/about/greeting',
		menuCd: 'M0002',
		children: [
			{ label: '인사말', href: '/about/greeting', menuCd: 'M0003' },
			{ label: '미션 및 비전', href: '/about/vision', menuCd: 'M0004' },
			{ label: '연혁', href: '/about/history', menuCd: 'M0005' },
			{ label: '조직도', href: '/about/organization', menuCd: 'M0006' },
			{ label: 'CI', href: '/about/ci', menuCd: 'M0007' },
			{ label: '오시는 길', href: '/about/location', menuCd: 'M0008' }
		]
	},
	{
		section: 'exhibit',
		label: '시설안내',
		href: '/exhibit/floor_1f',
		menuCd: 'M0009',
		children: [
			{ label: '1F [질문]', href: '/exhibit/floor_1f', menuCd: 'M0010' },
			{ label: '2F [탐구]', href: '/exhibit/floor_2f', menuCd: 'M0013' },
			{ label: '3F [모험]', href: '/exhibit/floor_3f', menuCd: 'M0016' },
			{ label: '별관 [생각]', href: '/exhibit/annex', menuCd: 'M0019' },
			{ label: '야외 [놀이]', href: '/exhibit/outdoor', menuCd: 'M0022' }
		]
	},
	{
		section: 'program',
		label: '교육프로그램 소개',
		href: '/program/list',
		comingSoon: true,
		menuCd: 'M0025',
		children: [
			// 교육프로그램 목록은 관리자 메뉴 관리에 대응하는 항목이 없어 코드 이름을 쓴다.
			{ label: '교육프로그램', href: '/program/list' },
			{ label: '예약 안내', href: '/program/reserve', menuCd: 'M0046' }
		]
	},
	{
		section: 'archive',
		label: '학습지원 자료실',
		href: '/archive/elementary',
		menuCd: 'M0048',
		children: [
			{ label: 'ESD 체험터', href: '/archive/elementary' },
			{ label: '학교단위 프로그램', href: '/archive/mission' }
		]
	},
	{
		section: 'news',
		label: '소식',
		href: '/news/notice',
		menuCd: 'M0054',
		children: [
			{ label: '공지사항', href: '/news/notice', menuCd: 'M0055' },
			{ label: '기획전', href: '/news/exhibit', menuCd: 'M0057' },
			{ label: '이벤트', href: '/news/event', menuCd: 'M0059' },
			{ label: 'FAQ', href: '/news/faq', menuCd: 'M0063' },
			{ label: '갤러리', href: '/news/gallery', menuCd: 'M0070' }
		]
	},
	{
		section: 'library',
		label: '도서관',
		href: '/library/info',
		menuCd: 'M0073',
		children: [
			{ label: '도서관 안내', href: '/library/info', menuCd: 'M0074' }
			// 아래 하위메뉴는 노출하지 않기로 했다. 페이지와 데이터는 그대로 살아 있어
			// 주소로 직접 들어가거나 통합검색 결과에서 도달할 수 있다.
			// { label: '자료검색', href: '/library/search' },
			// { label: '사서 추천도서', href: '/library/recommend' },
			// { label: '새로 들어온 도서', href: '/library/new' },
			// { label: '자료실', href: '/library/archive' }
		]
	}
]

/**
 * 관리자 메뉴 관리가 내려준 이름·노출 여부를 코드 메뉴에 입힌다.
 * managed 가 null 이면 조회에 실패한 것이므로 코드 값을 그대로 쓴다.
 * 빈 배열은 관리자가 모든 메뉴의 노출을 끈 상태이므로 그대로 비워서 돌려준다.
 */
export function applyManagedMenus(
	menus: SiteMenu[],
	managed: Array<{ menuCd: string; menuNm: string }> | null
): SiteMenu[] {
	if (managed === null) return menus
	const nameByCode = new Map(managed.map((item) => [item.menuCd, item.menuNm]))
	// 목록에 없는 코드는 관리자에서 노출을 껐거나 지운 메뉴다.
	const isVisible = (menuCd?: string) => !menuCd || nameByCode.has(menuCd)
	const labelOf = (menuCd: string | undefined, fallback: string) => {
		const managedName = menuCd ? nameByCode.get(menuCd) : undefined
		return managedName?.trim() || fallback
	}

	return menus
		.filter((menu) => isVisible(menu.menuCd))
		.map((menu) => ({
			...menu,
			label: labelOf(menu.menuCd, menu.label),
			children: menu.children
				.filter((child) => isVisible(child.menuCd))
				.map((child) => ({ ...child, label: labelOf(child.menuCd, child.label) }))
		}))
}

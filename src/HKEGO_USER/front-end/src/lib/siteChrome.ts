// 헤더·푸터가 공통으로 쓰는 메뉴와 기본설정을 한 번에 읽어 오는 모듈

import { applyManagedMenus, SITE_MENUS, SiteMenu } from '@/components/siteNavigation'
import { getPublicMenus, getPublicSiteSetting } from './publicApi'
import type { PublicSiteSetting } from './publicApi'

export type SiteChrome = {
	menus: SiteMenu[]
	setting: PublicSiteSetting | null
}

let inflight: Promise<SiteChrome> | null = null

/**
 * 관리자에서 바꾼 메뉴 이름·노출 여부와 기본설정을 함께 읽는다.
 * 두 조회 모두 실패해도 예외를 던지지 않으므로, 백엔드가 멈춰도 사이트는 코드 기본값으로 뜬다.
 * 같은 화면의 헤더·푸터가 동시에 호출해도 요청은 한 번만 나간다.
 */
export function getSiteChrome(): Promise<SiteChrome> {
	if (!inflight) {
		inflight = Promise.all([
			getPublicMenus(),
			getPublicSiteSetting()
		]).then(([managedMenus, setting]) => ({
			menus: applyManagedMenus(SITE_MENUS, managedMenus),
			setting
		})).finally(() => {
			inflight = null
		})
	}
	return inflight
}

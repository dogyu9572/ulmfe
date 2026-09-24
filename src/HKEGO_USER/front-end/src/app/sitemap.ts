// pageRegistry 에 등록된 공개 페이지로 sitemap.xml 을 생성하는 Next.js 라우트
// 정적 export 빌드 시 백엔드가 없을 수 있어 게시글 URL은 넣지 않는다.

import type { MetadataRoute } from 'next'
import { SITE_MENUS } from '@/components/siteNavigation'
import { PAGE_DEFINITIONS } from '@/content/pageRegistry'
import { absoluteUrl, isSitemapPage } from '@/lib/siteMeta'

export const dynamic = 'force-static'

/** 섹션별 갱신 주기와 우선순위. 명시하지 않은 섹션은 기본값을 쓴다. */
const SECTION_HINTS: Record<string, { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = {
	about: { changeFrequency: 'yearly', priority: 0.6 },
	exhibit: { changeFrequency: 'monthly', priority: 0.8 },
	program: { changeFrequency: 'monthly', priority: 0.9 },
	archive: { changeFrequency: 'weekly', priority: 0.6 },
	news: { changeFrequency: 'daily', priority: 0.8 },
	library: { changeFrequency: 'weekly', priority: 0.7 },
	terms: { changeFrequency: 'yearly', priority: 0.3 }
}

const DEFAULT_HINT = { changeFrequency: 'monthly' as const, priority: 0.5 }

/**
 * 메뉴에서 '준비중' 으로 막아 둔 섹션은 검색엔진에도 알리지 않는다.
 * 사람은 메뉴로 못 들어가는데 검색 결과로만 닿는 상태가 되면 안내가 어긋난다.
 */
const COMING_SOON_SECTIONS = new Set(SITE_MENUS.filter((menu) => menu.comingSoon).map((menu) => menu.section))

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date()
	const pages = PAGE_DEFINITIONS
		.filter((page) => isSitemapPage(page.section, page.slug) && !COMING_SOON_SECTIONS.has(page.section))
		.map((page) => {
			const hint = SECTION_HINTS[page.section] ?? DEFAULT_HINT
			return {
				url: absoluteUrl(`/${page.section}/${page.slug}`),
				lastModified,
				changeFrequency: hint.changeFrequency,
				priority: hint.priority
			}
		})

	return [
		{ url: absoluteUrl('/'), lastModified, changeFrequency: 'daily' as const, priority: 1 },
		...pages
	]
}

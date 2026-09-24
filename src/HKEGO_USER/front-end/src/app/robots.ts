// 크롤러 접근 정책과 sitemap 위치를 제공하는 Next.js 라우트 (robots.txt 생성)

import type { MetadataRoute } from 'next'
import { withBasePath } from '@/lib/basePath'
import { SITE_URL } from '@/lib/siteMeta'

export const dynamic = 'force-static'

/**
 * 공개 검색에 노출되면 안 되거나 무한 조합이 생기는 경로만 막는다.
 * 공지·행사·자료 상세(`*_view`)는 쿼리스트링으로 열리더라도 색인 가치가 있어 허용한다.
 *
 * 이 파일이 robots.txt 의 유일한 출처다.
 * 예전에는 `public/robots.txt` 가 함께 있었는데, 정적 파일이 라우트보다 먼저 응답해
 * 이 규칙이 통째로 무시되고 있었다. 두 벌을 두면 또 어긋나므로 정적 파일은 지웠다.
 */
const DISALLOW = [
	withBasePath('/backoffice'),
	withBasePath('/api/'),
	withBasePath('/uploads/'),
	withBasePath('/publishing-original/'),
	'/*_write/',
	'/*_modify/',
	withBasePath('/library/search_list/'),
	withBasePath('/total_search/'),
	'/*?search_keyword='
]

/** 생성형 검색(GEO)·답변 엔진(AEO) 크롤러. 기관 정보가 인용되도록 명시적으로 허용한다. */
const AI_CRAWLERS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-SearchBot',
	'PerplexityBot',
	'Google-Extended',
	'Applebot-Extended'
]

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{ userAgent: '*', allow: '/', disallow: DISALLOW },
			...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW }))
		],
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL
	}
}

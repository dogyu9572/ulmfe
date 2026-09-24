import type { NextConfig } from 'next'

const backendUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:9032'
/** 운영: https://use.go.kr/usfec */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '/usfec').replace(/\/+$/, '') || ''
/** next build 때만 정적 export. next dev 에서는 rewrite 로 9032 API 를 붙인다. */
const isStaticExport = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
	...(isStaticExport ? { output: 'export' as const } : {}),
	basePath,
	trailingSlash: true,
	skipTrailingSlashRedirect: true,
	allowedDevOrigins: [
		'ulmfe-user.hk-test.co.kr',
		'use.go.kr',
		'dev.use.go.kr',
		'192.168.0.5',
		'106.240.255.10'
	],
	env: {
		NEXT_PUBLIC_BASE_PATH: basePath
	},
	images: {
		unoptimized: true
	},
	/** FAQ·갤러리를 소식 하위로 옮기면서 바뀐 주소. 기존 링크와 검색엔진 색인을 살린다. */
	async redirects() {
		return [
			{ source: '/support/faq', destination: '/news/faq', permanent: true },
			{ source: '/gallery', destination: '/news/gallery', permanent: true },
			{ source: '/gallery/index', destination: '/news/gallery', permanent: true },
			/**
			 * 교육프로그램 소개를 /program/list 한 페이지로 통합하면서 내린 주소들.
			 * program 섹션은 sitemap 우선순위가 가장 높아 색인된 유입을 잃지 않도록 넘긴다.
			 */
			...[
				'esd_pbl', 'elementary', 'mission', 'biggame', 'special', 'free',
				'elementary1', 'elementary2', 'elementary3', 'elementary4', 'elementary5',
				'mission1', 'mission2', 'mission3'
			].map((slug) => ({
				source: `/program/${slug}`,
				destination: '/program/list',
				permanent: true
			}))
		]
	},
	/**
	 * next dev: /usfec/api, /usfec/uploads 를 Spring(context-path /usfec)으로 넘긴다.
	 * 운영 톰캣 usfec.war 도 같은 경로이므로 Ingress 는 /usfec/api|/uploads 를 그대로 전달한다.
	 */
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${backendUrl}${basePath}/api/:path*`
			},
			{
				source: '/uploads/:path*',
				destination: `${backendUrl}${basePath}/uploads/:path*`
			}
		]
	}
}

export default nextConfig

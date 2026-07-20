import type { NextConfig } from 'next'

const backendUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:9032'

const nextConfig: NextConfig = {
	output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
	trailingSlash: true,
	skipTrailingSlashRedirect: true,
	allowedDevOrigins: ['ulmfe-user.hk-test.co.kr'],
	images: {
		unoptimized: true
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${backendUrl}/api/:path*`
			}
		]
	}
}

export default nextConfig

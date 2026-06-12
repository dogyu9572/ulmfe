import type { NextConfig } from 'next'

const backendUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:9032'

const nextConfig: NextConfig = {
	output: 'export',
	trailingSlash: true,
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

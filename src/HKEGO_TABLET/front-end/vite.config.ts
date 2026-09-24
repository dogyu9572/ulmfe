import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const backendTarget = process.env.TABLET_BACKEND_URL ?? 'http://127.0.0.1:9033'
const devHost = process.env.TABLET_FRONTEND_HOST ?? '127.0.0.1'
const devPort = Number(process.env.TABLET_FRONTEND_PORT ?? '9133')
const hmrHost = process.env.TABLET_HMR_HOST
/** 운영 path: https://use.go.kr/usfec-tab */
const basePath = (process.env.VITE_BASE_PATH ?? '/usfec-tab').replace(/\/+$/, '') || ''

const backendDevProxy = basePath
	? {
			[`${basePath}/api`]: { target: backendTarget, changeOrigin: true },
			[`${basePath}/uploads`]: { target: backendTarget, changeOrigin: true }
		}
	: {
			'/api': { target: backendTarget, changeOrigin: true },
			'/uploads': { target: backendTarget, changeOrigin: true }
		}

const listen = {
	host: devHost,
	port: devPort,
	strictPort: true,
	allowedHosts: true as const
}

/** index.html 의 /pub/... 절대경로에 basePath 를 붙인다. (%BASE_URL% 미치환 대비) */
function rewritePublicAssetPaths(base: string): Plugin {
	const prefix = base ? `${base}/` : '/'
	return {
		name: 'rewrite-public-asset-paths',
		transformIndexHtml(html) {
			return html
				.replaceAll('%BASE_URL%', prefix)
				.replace(/(href|src)=["']\/pub\//g, `$1="${prefix}pub/`)
		}
	}
}

export default defineConfig({
	base: basePath ? `${basePath}/` : '/',
	server: {
		...listen,
		hmr: hmrHost
			? {
					host: hmrHost,
					protocol: (process.env.TABLET_HMR_PROTOCOL ?? 'wss') as 'ws' | 'wss',
					clientPort: Number(process.env.TABLET_HMR_CLIENT_PORT ?? '443')
				}
			: undefined,
		proxy: backendDevProxy
	},
	preview: {
		...listen,
		proxy: backendDevProxy
	},
	plugins: [react(), rewritePublicAssetPaths(basePath)]
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const backendTarget = process.env.ADM_BACKEND_URL ?? 'http://127.0.0.1:9031'
const devHost = process.env.ADM_FRONTEND_HOST ?? '127.0.0.1'
const devPort = Number(process.env.ADM_FRONTEND_PORT ?? '9131')
const hmrHost = process.env.ADM_HMR_HOST
/** 운영 path: https://use.go.kr/usfec-adm */
const basePath = (process.env.VITE_BASE_PATH ?? '/usfec-adm').replace(/\/+$/, '') || ''

/** 개발: Vite 가 /usfec-adm/api 를 Spring(context-path 포함)으로 그대로 전달 */
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

export default defineConfig({
	base: basePath ? `${basePath}/` : '/',
	server: {
		...listen,
		hmr: hmrHost
			? {
					host: hmrHost,
					protocol: (process.env.ADM_HMR_PROTOCOL ?? 'wss') as 'ws' | 'wss',
					clientPort: Number(process.env.ADM_HMR_CLIENT_PORT ?? '443')
				}
			: undefined,
		proxy: backendDevProxy
	},
	preview: {
		...listen,
		proxy: backendDevProxy
	},
	plugins: [react()]
})

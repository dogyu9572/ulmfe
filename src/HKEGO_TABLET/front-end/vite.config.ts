import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const backendTarget = process.env.TABLET_BACKEND_URL ?? 'http://127.0.0.1:9033'
const devHost = process.env.TABLET_FRONTEND_HOST ?? '127.0.0.1'
const devPort = Number(process.env.TABLET_FRONTEND_PORT ?? '9133')
const hmrHost = process.env.TABLET_HMR_HOST

/** 개발·preview 공통: API·업로드 파일은 로컬 백엔드로 프록시 */
const backendDevProxy = {
	'/api': { target: backendTarget, changeOrigin: true },
	'/uploads': { target: backendTarget, changeOrigin: true }
} as const

const listen = {
	host: devHost,
	port: devPort,
	strictPort: true,
	allowedHosts: true as const
}

export default defineConfig({
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
	plugins: [react()]
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const backendTarget = process.env.TABLET_BACKEND_URL ?? 'http://127.0.0.1:9032'
const devHost = process.env.TABLET_FRONTEND_HOST ?? '127.0.0.1'
const devPort = Number(process.env.TABLET_FRONTEND_PORT ?? '9133')
const hmrHost = process.env.TABLET_HMR_HOST

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

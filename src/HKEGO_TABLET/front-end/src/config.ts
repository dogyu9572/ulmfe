/**
 * 태블릿 공개 path. 운영: https://use.go.kr/usfec-tab
 */
export const BASE_PATH = (import.meta.env.VITE_BASE_PATH ?? '/usfec-tab').replace(/\/+$/, '')

const rawApiBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
export const API_BASE_URL = (rawApiBase || BASE_PATH).replace(/\/$/, '')

export function withBasePath(path: string): string {
	if (!path) return path
	if (
		path.startsWith('http://')
		|| path.startsWith('https://')
		|| path.startsWith('data:')
		|| path.startsWith('blob:')
		|| path.startsWith('mailto:')
		|| path.startsWith('#')
	) {
		return path
	}
	if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path
	const normalized = path.startsWith('/') ? path : `/${path}`
	return `${BASE_PATH}${normalized}`
}

/** public/pub 정적 자산. '/pub/...' 또는 'images/...' 모두 허용 */
export function pubUrl(path: string): string {
	if (!path) return path
	if (
		path.startsWith('http://')
		|| path.startsWith('https://')
		|| path.startsWith('data:')
		|| path.startsWith('blob:')
	) {
		return path
	}
	const normalized = path.startsWith('/') ? path : `/${path}`
	const withPub = normalized.startsWith('/pub/') ? normalized : `/pub${normalized}`
	return withBasePath(withPub)
}

export function appPath(path: string): string {
	return withBasePath(path.startsWith('/') ? path : `/${path}`)
}

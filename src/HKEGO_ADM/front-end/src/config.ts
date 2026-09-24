/**
 * API·공개 path 베이스.
 * - 운영: https://use.go.kr/usfec-adm
 * - VITE_API_BASE_URL 이 있으면 그 값을 쓰고(cross-origin), 없으면 BASE_PATH 를 API prefix 로 쓴다.
 */
export const BASE_PATH = (import.meta.env.VITE_BASE_PATH ?? '/usfec-adm').replace(/\/+$/, '')

const rawApiBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
export const API_BASE_URL = (rawApiBase || BASE_PATH).replace(/\/$/, '')

/** cross-origin 백엔드 직접 호출 여부 (http(s) origin) */
export const IS_SPLIT_API_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)

/**
 * API·업로드 상대 경로를 브라우저 접근 URL로 변환.
 */
export function resolveBackendUrl(path: string): string {
	if (!path) return ''
	const trimmed = path.trim()
	if (
		trimmed.startsWith('http://')
		|| trimmed.startsWith('https://')
		|| trimmed.startsWith('blob:')
		|| trimmed.startsWith('data:')
	) {
		return trimmed
	}
	const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
	if (!API_BASE_URL) return normalized
	return `${API_BASE_URL}${normalized}`
}

export function adminFileDownloadUrl(fiId: string, fiSn: number | string): string {
	return resolveBackendUrl(
		`/api/admin/upload/download/${encodeURIComponent(fiId)}/${encodeURIComponent(String(fiSn))}`
	)
}

/** window.location 등 basename 이 자동으로 안 붙는 이동 */
export function appPath(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`
	return `${BASE_PATH}${normalized}`
}

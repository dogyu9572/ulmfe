/**
 * API 베이스 URL.
 * - 빈 문자열: 현재 페이지 origin 사용 (개발 Vite 프록시·운영 nginx /api·/uploads 프록시)
 * - 값 설정: 백엔드 origin 직접 호출 (예: http://106.240.255.10:9013)
 */
const rawApiBase = (import.meta.env.VITE_API_BASE_URL ?? '').trim()
export const API_BASE_URL = rawApiBase.replace(/\/$/, '')

/** 분리 배포 시 백엔드 origin 직접 호출 여부 */
export const IS_SPLIT_API_ORIGIN = API_BASE_URL.length > 0

/**
 * API·업로드 상대 경로를 브라우저 접근 URL로 변환.
 * nginx 프록시(API_BASE_URL='')면 /uploads/... 그대로, cross-origin이면 백엔드 origin 접두.
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

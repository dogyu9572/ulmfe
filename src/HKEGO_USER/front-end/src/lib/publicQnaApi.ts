import type { ApiResponse, PublicPageResult } from './publicApi'

const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'

export type QnaSearchType = 'all' | 'title' | 'content' | 'writer'

export type PublicQnaSummary = {
	postId: string
	title: string
	writerNameMasked: string | null
	registeredAt: string | null
	answerStatus: string | null
	passwordProtected: boolean
	newYn?: string | null
	rowNumber?: number | null
}

export type PublicQnaDetail = {
	postId: string
	title: string
	content: string | null
	writerName: string | null
	registeredAt: string | null
	viewCount: number
	answerStatus: string | null
	answerContent: string | null
	answererName: string | null
	answerDate: string | null
	passwordProtected: boolean
}

export type QnaCreatePayload = {
	title: string
	writerName: string
	password: string
	content: string
	captcha: string
}

export type QnaUpdatePayload = {
	title: string
	content: string
	password: string
	captcha: string
}

function readCsrfToken() {
	if (typeof document === 'undefined') return ''
	const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`))
	return match ? decodeURIComponent(match[1]) : ''
}

async function ensureCsrfToken() {
	let token = readCsrfToken()
	if (token) return token
	const response = await fetch('/api/user/main', {
		credentials: 'same-origin',
		cache: 'no-store'
	})
	token = response.headers.get(CSRF_HEADER_NAME) || readCsrfToken()
	return token
}

async function parseResponse<T>(response: Response): Promise<T> {
	let result: ApiResponse<T> | null = null
	try {
		result = await response.json() as ApiResponse<T>
	} catch {
		throw new Error(response.ok ? '서버 응답을 확인할 수 없습니다.' : '요청을 처리하지 못했습니다.')
	}
	if (!response.ok || !result.success) {
		throw new Error(result.message || '요청을 처리하지 못했습니다.')
	}
	return result.data
}

async function request<T>(url: string, init?: RequestInit) {
	const method = (init?.method || 'GET').toUpperCase()
	const headers = new Headers(init?.headers)
	if (method !== 'GET' && method !== 'HEAD') {
		const csrfToken = await ensureCsrfToken()
		if (csrfToken) headers.set(CSRF_HEADER_NAME, csrfToken)
	}
	if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
	const response = await fetch(url, {
		...init,
		headers,
		credentials: 'same-origin',
		cache: 'no-store'
	})
	return parseResponse<T>(response)
}

export function getPublicQnaList(params: {
	page: number
	size: number
	searchType: QnaSearchType
	keyword: string
}) {
	const query = new URLSearchParams({
		page: String(params.page),
		size: String(params.size),
		searchType: params.searchType
	})
	if (params.keyword) query.set('keyword', params.keyword)
	return request<PublicPageResult<PublicQnaSummary>>(`/api/user/qna?${query.toString()}`)
}

export function verifyPublicQna(postId: string, password: string) {
	return request<{ verified?: boolean } | boolean | null>(`/api/user/qna/${encodeURIComponent(postId)}/verify`, {
		method: 'POST',
		body: JSON.stringify({ password })
	})
}

export function getPublicQna(postId: string, increaseViewCount = true) {
	const query = increaseViewCount ? '' : '?increaseViewCount=false'
	return request<PublicQnaDetail>(`/api/user/qna/${encodeURIComponent(postId)}${query}`)
}

export function createPublicQna(payload: QnaCreatePayload) {
	return request<{ postId?: string } | string>('/api/user/qna', {
		method: 'POST',
		body: JSON.stringify(payload)
	})
}

export function updatePublicQna(postId: string, payload: QnaUpdatePayload) {
	return request<PublicQnaDetail | null>(`/api/user/qna/${encodeURIComponent(postId)}`, {
		method: 'PUT',
		body: JSON.stringify(payload)
	})
}

export function deletePublicQna(postId: string) {
	return request<null>(`/api/user/qna/${encodeURIComponent(postId)}`, { method: 'DELETE' })
}

export function getQnaCaptchaUrl(nonce: number) {
	return `/api/user/qna/captcha?v=${nonce}`
}

export function extractCreatedPostId(data: { postId?: string } | string) {
	return typeof data === 'string' ? data : data.postId || ''
}

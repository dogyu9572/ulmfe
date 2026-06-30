export type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type ErrorResponse = Partial<ApiResponse<unknown>> & {
	error?: string
	detail?: string
}

export type TabletLoginResponse = {
	valid: boolean
	adminId: string
	adminName: string
	adminRole: string
}

export type TabletReservation = {
	rsvtSn: number
	rsvtNo: string
	schlNm: string
	scyrNm: string
	rsvtYmd: string
	vstHm: string
	rsvtNope: number
	actlNope: number
	prgrmTypeCd: string
	prgrmTypeNm: string
	prgrmSn: number
	prgrmNm: string
	lrnSttsCd: string
	lrnSttsNm: string
	stdntCnt: number
}

export type TabletStudent = {
	stdntSn: number
	rsvtSn: number
	stdntNo: string
	clasNm: string
	clasNo: string
	stdntNm: string
	atndYn: string
	teamNm: string
	asgnNm: string
	routeCn: string
	lrnSttsCd: string
	prgrsRt: number
}

export type TabletSession = {
	rsvtYmd: string
	reservation: TabletReservation | null
	students: TabletStudent[]
}

const CSRF_HEADER = 'X-XSRF-TOKEN'
let csrfToken = ''

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
	const headers = new Headers(init?.headers)
	const method = (init?.method ?? 'GET').toUpperCase()

	if (method !== 'GET' && csrfToken) {
		headers.set(CSRF_HEADER, csrfToken)
	}
	if (init?.body && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json')
	}

	const response = await fetch(url, {
		...init,
		headers,
		credentials: 'include'
	})
	const nextToken = response.headers.get(CSRF_HEADER)
	if (nextToken) csrfToken = nextToken

	const result = await response.json() as ApiResponse<T> | ErrorResponse
	if (!response.ok || !result.success) {
		const errorResult = result as ErrorResponse
		throw new Error(errorResult.message || errorResult.error || errorResult.detail || '요청 처리 중 오류가 발생했습니다.')
	}
	return (result as ApiResponse<T>).data
}

export const loginTablet = (userId: string, password: string) => request<TabletLoginResponse>('/api/tablet/auth/login', {
	method: 'POST',
	body: JSON.stringify({ userId, password })
})

export const fetchTabletSession = () => request<TabletSession>('/api/tablet/session')

export const markTabletAttendance = (rsvtSn: number, studentSns: number[]) => request<void>(`/api/tablet/reservations/${rsvtSn}/attendance`, {
	method: 'POST',
	body: JSON.stringify({ studentSns })
})

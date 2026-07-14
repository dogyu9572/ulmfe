import { unregisterAndroidPushContext } from '../push/androidPush'

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
	trgtCn?: string
	totalTmMnt?: number
	maxNope?: number
	simpleExpln?: string
	startExpln?: string
	teamCnt?: number
	routeJson?: string
	stepJson?: string
	evalJson?: string
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

export type TabletProgressLog = {
	stdntSn: number
	stepCd: string
	actvtNm?: string
	stepSttsCd: string
}

export type TabletSavedAnswer = {
	lrnAnsSn: number
	rsvtSn: number
	stdntSn: number
	ansTypeCd: string
	stepCd: string
	cntnSn?: number
	qstnrSn?: number
	qstnSn?: number
	qstnCn?: string
	ansCn: string
}

export type TabletQuestionnaireQuestion = {
	qstnrSn: number
	qstnSn: number
	qstnNo?: string
	ansTypeCd: string
	ansTypeNm?: string
	qstnCn: string
	sortSeq?: number
}

export type TabletLearningResource = {
	pstSn: string
	pstTtl: string
	pstCn?: string
	lrnTypeCd?: string
	lrnTypeNm?: string
	dataTypeCd?: string
	dataTypeNm?: string
	prgrmTypeCd?: string
	prgrmTypeNm?: string
	prgrmSn?: number
	prgrmNm?: string
	linkUrl?: string
	videoEmbedUrl?: string
	atchFileMngNo?: string
	fileSeq?: number
	fileUrl?: string
	orgnlFileNm?: string
	pstgYmd?: string
}

export type TabletTeacherCall = {
	callSn: number
	rsvtSn: number
	teamNm?: string
	studentNames?: string
	studentCount?: number
	placeNm?: string
	callCn?: string
	callSttsCd: string
	callSttsNm?: string
	regDt?: string
	readDt?: string
}

export type TabletTeacherMessage = {
	msgSn: number
	rsvtSn: number
	targetNm?: string
	studentCount: number
	messageCn: string
	readCount?: number
	regDt?: string
}

export type TabletContentQuestion = {
	cntnQstnSn: number
	cntnSn: number
	qstnTypeCd: string
	qstnTypeNm?: string
	qstnNm: string
	qstnImgAtchFileId?: string
	optnCn?: string
	sortSeq?: number
}

export type TabletContent = {
	cntnSn: number
	cntnTypeCd: string
	cntnTypeNm?: string
	cardClsfCd?: string
	cardClsfNm?: string
	cntnTtl: string
	cntnCn?: string
	prvdTypeCd?: string
	prvdTypeNm?: string
	imgAtchFileId?: string
	videoUrlAddr?: string
	videoThmbAtchFileId?: string
	videoTtl?: string
	questions: TabletContentQuestion[]
}

export type TabletSession = {
	rsvtYmd: string
	reservation: TabletReservation | null
	students: TabletStudent[]
	contents: TabletContent[]
	progressLogs: TabletProgressLog[]
	savedAnswers: TabletSavedAnswer[]
	evaluationQuestions: TabletQuestionnaireQuestion[]
	surveyQuestions: TabletQuestionnaireQuestion[]
}

export type TabletMissionAnswer = {
	cntnSn?: number
	qstnSn?: number
	qstnCn: string
	ansCn: string
	cardClsfCd?: string
	files?: {
		label: string
		fileName: string
		fieldName: string
	}[]
}

export type TabletQuestionnaireAnswer = {
	qstnrSn?: number
	qstnSn?: number
	qstnCn: string
	ansCn: string
}

const CSRF_HEADER = 'X-XSRF-TOKEN'
const CSRF_COOKIE = 'XSRF-TOKEN'
let csrfToken = ''
let authRedirecting = false

const readCookie = (name: string) => {
	if (typeof document === 'undefined') return ''
	const cookie = document.cookie
		.split('; ')
		.find((item) => item.startsWith(`${name}=`))
	const value = cookie?.slice(name.length + 1)
	return value ? decodeURIComponent(value) : ''
}

const redirectToLoginOnAuthExpired = (url: string, response: Response) => {
	if (typeof window === 'undefined') return false
	if (url === '/api/tablet/auth/login') return false
	if (response.status !== 401 && response.status !== 403) return false
	if (authRedirecting) return true

	authRedirecting = true
	unregisterAndroidPushContext()
	window.sessionStorage.removeItem('hkegoTabletStudentFlowSession')
	window.sessionStorage.removeItem('hkegoTabletAdminId')
	if (window.location.pathname !== '/') {
		window.alert('로그인이 필요합니다.')
		window.location.replace('/')
	}
	return true
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
	const headers = new Headers(init?.headers)
	const method = (init?.method ?? 'GET').toUpperCase()

	if (method !== 'GET') {
		const token = readCookie(CSRF_COOKIE) || csrfToken
		if (token) headers.set(CSRF_HEADER, token)
	}
	if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json')
	}

	const response = await fetch(url, {
		...init,
		headers,
		credentials: 'include'
	})
	if (redirectToLoginOnAuthExpired(url, response)) {
		return new Promise<T>(() => undefined)
	}
	const nextToken = response.headers.get(CSRF_HEADER)
	if (nextToken) csrfToken = nextToken

	const responseText = await response.text()
	let result: ApiResponse<T> | ErrorResponse
	try {
		result = responseText
			? JSON.parse(responseText) as ApiResponse<T> | ErrorResponse
			: ({ success: response.ok, message: '', data: undefined as T } satisfies ApiResponse<T>)
	} catch {
		result = { success: false, message: responseText || '요청 처리 중 오류가 발생했습니다.' }
	}
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

export const fetchTabletAuthSession = () => request<TabletLoginResponse>('/api/tablet/auth/session', {
	cache: 'no-store'
})

export const fetchTabletSession = () => request<TabletSession>('/api/tablet/session', {
	cache: 'no-store'
})

export const markTabletAttendance = (rsvtSn: number, studentSns: number[]) => request<void>(`/api/tablet/reservations/${rsvtSn}/attendance`, {
	method: 'POST',
	body: JSON.stringify({ studentSns })
})

export const submitTabletMission = (rsvtSn: number, payload: {
	studentSns: number[]
	routeIndex: number
	routeName: string
	stepCd?: string
	totalRouteCount: number
	answers: TabletMissionAnswer[]
}) => request<void>(`/api/tablet/reservations/${rsvtSn}/mission`, {
	method: 'POST',
	body: JSON.stringify(payload)
})

export const submitTabletMissionFiles = (rsvtSn: number, payload: {
	studentSns: number[]
	routeIndex: number
	routeName: string
	stepCd?: string
	totalRouteCount: number
	answers: TabletMissionAnswer[]
}, files: Record<string, File>) => {
	const formData = new FormData()
	formData.append('payload', JSON.stringify(payload))
	Object.entries(files).forEach(([fieldName, file]) => formData.append(fieldName, file))
	return request<void>(`/api/tablet/reservations/${rsvtSn}/mission-files`, {
		method: 'POST',
		body: formData
	})
}

export const submitTabletMaker = (rsvtSn: number, answers: {
	studentSn: number
	description: string
	file?: File | null
}[]) => {
	const formData = new FormData()
	formData.append('answers', JSON.stringify(answers.map(({ studentSn, description }) => ({ studentSn, description }))))
	answers.forEach((answer) => {
		if (answer.file) formData.append(`file_${answer.studentSn}`, answer.file)
	})
	return request<void>(`/api/tablet/reservations/${rsvtSn}/maker`, {
		method: 'POST',
		body: formData
	})
}

export const submitTabletMissionFinal = (rsvtSn: number, payload: {
	studentSns: number[]
	heroName: string
	updateHero?: boolean
	updateEvaluation?: boolean
	updateSurvey?: boolean
	complete?: boolean
	evaluationAnswers: TabletQuestionnaireAnswer[]
	surveyAnswers: TabletQuestionnaireAnswer[]
}) => request<void>(`/api/tablet/reservations/${rsvtSn}/mission-final`, {
	method: 'POST',
	body: JSON.stringify(payload)
})

export const fetchTabletLearningResources = (prgrmTypeCd: string, prgrmSn: number) => {
	const params = new URLSearchParams({
		prgrmTypeCd,
		prgrmSn: String(prgrmSn)
	})
	return request<TabletLearningResource[]>(`/api/tablet/learning-resources?${params.toString()}`, {
		cache: 'no-store'
	})
}

export const fetchTabletTeacherCalls = (rsvtSn: number) => request<TabletTeacherCall[]>(`/api/tablet/reservations/${rsvtSn}/teacher-calls`, {
	cache: 'no-store'
})

export const createTabletTeacherCall = (rsvtSn: number, payload: {
	studentSns: number[]
	placeNm?: string
}) => request<void>(`/api/tablet/reservations/${rsvtSn}/teacher-calls`, {
	method: 'POST',
	body: JSON.stringify(payload)
})

export const markTabletTeacherCallRead = (callSn: number) => request<void>(`/api/tablet/teacher-calls/${callSn}/read`, {
	method: 'POST'
})

export const markAllTabletTeacherCallsRead = (rsvtSn: number) => request<void>(`/api/tablet/reservations/${rsvtSn}/teacher-calls/read-all`, {
	method: 'POST'
})

export const fetchTabletTeacherMessages = (rsvtSn: number) => request<TabletTeacherMessage[]>(`/api/tablet/reservations/${rsvtSn}/teacher-messages`, {
	cache: 'no-store'
})

export const fetchUnreadTabletTeacherMessages = (rsvtSn: number, studentSns: number[]) => {
	const params = new URLSearchParams()
	studentSns.forEach((studentSn) => params.append('studentSns', String(studentSn)))
	return request<TabletTeacherMessage[]>(`/api/tablet/reservations/${rsvtSn}/teacher-messages/unread?${params.toString()}`, {
		cache: 'no-store'
	})
}

export const createTabletTeacherMessage = (rsvtSn: number, payload: {
	studentSns: number[]
	messageCn: string
}) => request<void>(`/api/tablet/reservations/${rsvtSn}/teacher-messages`, {
	method: 'POST',
	body: JSON.stringify(payload)
})

export const markTabletTeacherMessageRead = (msgSn: number, studentSns: number[]) => request<void>(`/api/tablet/teacher-messages/${msgSn}/read`, {
	method: 'POST',
	body: JSON.stringify({ studentSns })
})

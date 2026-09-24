import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './style.css'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminListPage } from './pages/AdminListPage'
import { AuthGroupPage } from './pages/AuthGroupPage'
import { CodePage } from './pages/CodePage'
import { BbsMasterPage } from './pages/BbsMasterPage'
import { BbsPostPage } from './pages/BbsPostPage'
import { BannerPage } from './pages/BannerPage'
import { ClosedDayPage } from './pages/ClosedDayPage'
import { PopupPage } from './pages/PopupPage'
import { SiteBasicSettingPage } from './pages/SiteBasicSettingPage'
import { AccessEnvironmentPage } from './pages/AccessEnvironmentPage'
import { HomepageMenuPage } from './pages/HomepageMenuPage'
import { HomepageHistoryPage } from './pages/HomepageHistoryPage'
import { OrgChartPage } from './pages/OrgChartPage'
import { CiPage } from './pages/CiPage'
import { TermsPage } from './pages/TermsPage'
import { SearchPageManagementPage } from './pages/SearchPageManagementPage'
import { UserInfoPage } from './pages/UserInfoPage'
import { AccessLogPage } from './pages/AccessLogPage'
import { UserAccessLogPage } from './pages/UserAccessLogPage'
import { UserVisitorStatsPage } from './pages/UserVisitorStatsPage'
import { NotificationSendLogPage } from './pages/NotificationSendLogPage'
import { VisitCountStatsPage } from './pages/VisitCountStatsPage'
import { EducationProgramStatsPage } from './pages/EducationProgramStatsPage'
import { MaterialDownloadStatsPage } from './pages/MaterialDownloadStatsPage'
import { LibraryBookPage } from './pages/LibraryBookPage'
import { EvaluationFormPage } from './pages/EvaluationFormPage'
import { SurveyFormPage } from './pages/SurveyFormPage'
import { EducationContentPage } from './pages/EducationContentPage'
import { EducationProgramPage } from './pages/EducationProgramPage'
import { EduProgramIntroPage } from './pages/EduProgramIntroPage'
import { EsdQuestionBankPage } from './pages/EsdQuestionBankPage'
import { LearningCalendarPage } from './pages/LearningCalendarPage'
import { LearningFieldStatusPage } from './pages/LearningFieldStatusPage'
import { LearningResultPage } from './pages/LearningResultPage'
import { LearningReservationPage } from './pages/LearningReservationPage'
import { LearningSupportMaterialPage } from './pages/LearningSupportMaterialPage'
import { AdminManageRoute } from './components/AdminManageRoute'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { API_BASE_URL, BASE_PATH, appPath } from './config'

const CSRF_HEADER = 'X-XSRF-TOKEN'
const CSRF_COOKIE = 'XSRF-TOKEN'
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

let csrfTokenCache = ''

function readCsrfFromCookie(): string {
	const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]*)`))
	return match ? decodeURIComponent(match[1]) : ''
}

function getCsrfToken(): string {
	return csrfTokenCache || readCsrfFromCookie()
}

function rememberCsrfToken(token: string | null) {
	if (token) {
		csrfTokenCache = token
	}
}

const originalFetch = window.fetch.bind(window)

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
	const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
	const isAdminApi = requestUrl.includes('/api/admin/')
	const isAuthApi = requestUrl.includes('/api/admin/auth/login') || requestUrl.includes('/api/admin/auth/session')
	const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
	const needsCsrf = isAdminApi && MUTATING_METHODS.has(method) && !requestUrl.includes('/api/admin/auth/login')

	const mergedInit: RequestInit = {
		...init,
		credentials: init?.credentials ?? (isAdminApi ? 'include' : 'same-origin')
	}

	if (needsCsrf) {
		let token = getCsrfToken()
		if (!token) {
			// 토큰 없이 보내면 403 이 오고 아래에서 /admin/forbidden 으로 튕겨 작성 중인 내용이 사라진다.
			// 세션 조회 응답 헤더로 토큰을 먼저 회수한다(SpaCsrfHeaderFilter 가 모든 응답에 붙인다).
			await originalFetch(`${API_BASE_URL}/api/admin/auth/session`, { credentials: 'include' })
				.then((res) => rememberCsrfToken(res.headers.get(CSRF_HEADER)))
				.catch(() => {
					/* 토큰 확보 실패는 아래 원래 요청의 응답 코드로 드러난다 */
				})
			token = getCsrfToken()
		}
		if (token) {
			const headers = new Headers(mergedInit.headers ?? (input instanceof Request ? input.headers : undefined))
			headers.set(CSRF_HEADER, token)
			mergedInit.headers = headers
		}
	}

	const response = await originalFetch(input, mergedInit)
	rememberCsrfToken(response.headers.get(CSRF_HEADER))

	if (response.status === 401 && isAdminApi && !isAuthApi) {
		// 이유를 붙여 보낸다. AdminLayout 의 타이머 만료 경로와 같은 파라미터를 쓴다.
		window.location.replace(appPath('/admin/login?expired=1'))
	}
	if (response.status === 403 && isAdminApi && !isAuthApi) {
		window.location.replace(appPath('/admin/forbidden'))
	}

	return response
}

const App: React.FC = () => {
	return (
		<BrowserRouter basename={BASE_PATH || undefined} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
			<Routes>
				<Route path="/admin/login" element={<LoginPage />} />
				<Route path="/admin/dashboard" element={<DashboardPage />} />
				<Route path="/admin/forbidden" element={<ForbiddenPage />} />
				<Route
					path="/admin/admins"
					element={
						<AdminManageRoute>
							<AdminListPage />
						</AdminManageRoute>
					}
				/>
				<Route
					path="/admin/admin-groups"
					element={
						<AdminManageRoute>
							<AuthGroupPage />
						</AdminManageRoute>
					}
				/>
				<Route path="/admin/codes" element={<CodePage />} />
				<Route path="/admin/menus" element={<HomepageMenuPage />} />
				<Route path="/admin/basic-setting" element={<SiteBasicSettingPage />} />
				<Route path="/admin/access-env" element={<AccessEnvironmentPage />} />
				<Route path="/admin/bbs-master" element={<BbsMasterPage />} />
				<Route path="/admin/bbs-post/:bbsId" element={<BbsPostPage />} />
				<Route path="/admin/banners" element={<BannerPage />} />
				<Route path="/admin/popups" element={<PopupPage />} />
				<Route path="/admin/history" element={<HomepageHistoryPage />} />
				<Route path="/admin/org-chart" element={<OrgChartPage />} />
				<Route path="/admin/ci" element={<CiPage />} />
				<Route path="/admin/terms" element={<TermsPage />} />
				<Route path="/admin/search-pages" element={<SearchPageManagementPage />} />
				<Route path="/admin/closed-days" element={<ClosedDayPage />} />
				<Route
					path="/admin/users"
					element={
						<AdminManageRoute>
							<UserInfoPage />
						</AdminManageRoute>
					}
				/>
				<Route path="/admin/user-visitor-stats" element={<UserVisitorStatsPage />} />
				<Route path="/admin/access-log" element={<AccessLogPage />} />
				<Route path="/admin/user-access-log" element={<UserAccessLogPage />} />
				<Route path="/admin/notification-log" element={<NotificationSendLogPage />} />
				<Route path="/admin/visitor-stats" element={<VisitCountStatsPage />} />
				<Route path="/admin/education-program-stats" element={<EducationProgramStatsPage />} />
				<Route path="/admin/material-download-stats" element={<MaterialDownloadStatsPage />} />
				<Route path="/admin/library-books" element={<LibraryBookPage />} />
				<Route path="/admin/exploration-programs" element={<EducationProgramPage programType="EXPLORE" />} />
				<Route path="/admin/mission-programs" element={<EducationProgramPage programType="MISSION" />} />
				<Route path="/admin/edu-program-intros" element={<EduProgramIntroPage />} />
				<Route path="/admin/esd-question-bank" element={<EsdQuestionBankPage />} />
				<Route path="/admin/evaluation-forms" element={<EvaluationFormPage />} />
				<Route path="/admin/survey-forms" element={<SurveyFormPage />} />
				<Route path="/admin/education-contents" element={<EducationContentPage />} />
				<Route path="/admin/learning-reservations" element={<LearningReservationPage />} />
				<Route path="/admin/learning-calendar" element={<LearningCalendarPage />} />
				<Route path="/admin/field-operation-status" element={<LearningFieldStatusPage />} />
				<Route path="/admin/learning-results" element={<LearningResultPage />} />
				<Route path="/admin/learning-support-materials" element={<LearningSupportMaterialPage />} />
				<Route path="/" element={<Navigate to="/admin/login" replace />} />
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

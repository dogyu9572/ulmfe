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
import { PopupPage } from './pages/PopupPage'
import { SiteBasicSettingPage } from './pages/SiteBasicSettingPage'
import { AccessEnvironmentPage } from './pages/AccessEnvironmentPage'
import { HomepageMenuPage } from './pages/HomepageMenuPage'
import { HomepageHistoryPage } from './pages/HomepageHistoryPage'
import { OrgChartPage } from './pages/OrgChartPage'
import { TermsPage } from './pages/TermsPage'
import { SearchPageManagementPage } from './pages/SearchPageManagementPage'
import { UserInfoPage } from './pages/UserInfoPage'
import { AccessLogPage } from './pages/AccessLogPage'
import { UserAccessLogPage } from './pages/UserAccessLogPage'
import { UserVisitorStatsPage } from './pages/UserVisitorStatsPage'
import { LibraryBookPage } from './pages/LibraryBookPage'
import { AdminManageRoute } from './components/AdminManageRoute'
import { ForbiddenPage } from './pages/ForbiddenPage'

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
		const token = getCsrfToken()
		if (token) {
			const headers = new Headers(mergedInit.headers ?? (input instanceof Request ? input.headers : undefined))
			headers.set(CSRF_HEADER, token)
			mergedInit.headers = headers
		}
	}

	const response = await originalFetch(input, mergedInit)
	rememberCsrfToken(response.headers.get(CSRF_HEADER))

	if (response.status === 401 && isAdminApi && !isAuthApi) {
		window.location.replace('/admin/login')
	}
	if (response.status === 403 && isAdminApi && !isAuthApi) {
		window.location.replace('/admin/forbidden')
	}

	return response
}

const App: React.FC = () => {
	return (
		<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
				<Route path="/admin/terms" element={<TermsPage />} />
				<Route path="/admin/search-pages" element={<SearchPageManagementPage />} />
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
				<Route path="/admin/library-books" element={<LibraryBookPage />} />
				<Route path="*" element={<Navigate to="/admin/login" replace />} />
			</Routes>
		</BrowserRouter>
	)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

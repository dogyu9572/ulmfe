import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from './pages/common/LoginPage'
import { SelectUserPage } from './pages/common/SelectUserPage'
import { StudentAboutPage } from './pages/student/StudentAboutPage'
import { StudentAttendancePage } from './pages/student/StudentAttendancePage'
import { StudentWelcomePage } from './pages/student/StudentWelcomePage'
import { QuestIntroPage } from './pages/student/QuestIntroPage'
import { Quest01Page } from './pages/student/Quest01Page'
import { Quest01SecondPage } from './pages/student/Quest01SecondPage'
import { Quest01ThirdPage } from './pages/student/Quest01ThirdPage'
import { Quest02Page } from './pages/student/Quest02Page'
import { Quest02SecondPage } from './pages/student/Quest02SecondPage'
import { Quest02ThirdPage } from './pages/student/Quest02ThirdPage'
import { Quest03Page } from './pages/student/Quest03Page'
import { Quest03SecondPage } from './pages/student/Quest03SecondPage'
import { Quest04Page } from './pages/student/Quest04Page'
import { Quest04SecondPage } from './pages/student/Quest04SecondPage'
import { Quest05Page } from './pages/student/Quest05Page'
import { QuestEndPage } from './pages/student/QuestEndPage'
import { QuestStepEndPage } from './pages/student/QuestStepEndPage'
import { QuestSurveyPage } from './pages/student/QuestSurveyPage'
import { QuestVideoPage } from './pages/student/QuestVideoPage'
import { ResourceCenterPage } from './pages/student/ResourceCenterPage'
import { QuestDynamicContentPage } from './pages/student/questDynamicShared'
import {
	Mission01Page,
	Mission02Page,
	Mission03EndPage,
	Mission03Page,
	Mission04EndPage,
	Mission04Page,
	Mission05EndPage,
	Mission05Page,
	Mission06EndPage,
	Mission06Page,
	MissionAboutPage,
	MissionEndPage,
	MissionResourceCenterPage,
	MissionWelcomePage
} from './pages/student/mission'
import {
	TeacherAttendancePage,
	TeacherCallHistoryPage,
	TeacherMessageSendingPage,
	TeacherMonitoringPage,
	TeacherRealTimeLocationPage,
	TeacherResourceCenterPage,
	TeacherSessionManagementPage
} from './pages/teacher'
import './style.css'

const plannedPages = [
	'index',
	'select_user',
	'student/about',
	'student/attendance',
	'student/mission01',
	'student/mission02',
	'student/mission03',
	'student/mission03_end',
	'student/mission04',
	'student/mission04_end',
	'student/mission05',
	'student/mission05_end',
	'student/mission06',
	'student/mission06_end',
	'student/mission_about',
	'student/mission_end',
	'student/mission_resource_center',
	'student/mission_welcome',
	'student/quest00',
	'student/quest01',
	'student/quest01_2',
	'student/quest01_3',
	'student/quest01_end',
	'student/quest02',
	'student/quest02_2',
	'student/quest02_3',
	'student/quest02_end',
	'student/quest03',
	'student/quest03_2',
	'student/quest03_end',
	'student/quest04',
	'student/quest04_2',
	'student/quest04_end',
	'student/quest05',
	'student/quest_end',
	'student/quest_survey',
	'student/quest_video',
	'student/resource_center',
	'student/welcome',
	'teacher/attendance',
	'teacher/call_history',
	'teacher/message_sending',
	'teacher/monitoring',
	'teacher/real_time_location',
	'teacher/resource_center',
	'teacher/session_management'
] as const

type PlannedPage = (typeof plannedPages)[number]

const plannedPageSet = new Set<string>(plannedPages)

const pageFromLocation = (pathname: string): PlannedPage | null => {
	if (pathname === '/' || pathname === '/index' || pathname === '/index.html') return 'index'
	if (pathname === '/select-user' || pathname === '/select_user' || pathname === '/select_user.html') return 'select_user'

	const key = pathname.replace(/^\//, '').replace(/\.html$/, '')
	return plannedPageSet.has(key) ? (key as PlannedPage) : null
}

const displayPath = (page: PlannedPage) => {
	if (page === 'index') return '/'
	if (page === 'select_user') return '/select-user'
	return `/${page}`
}

const UnconvertedPage = ({ page }: { page: PlannedPage }) => (
	<main className="container flex_center conversion_pending" id="mainContent">
		<section className="conversion_pending_box">
			<h1>React 컨버팅 대기 화면입니다.</h1>
			<p>{displayPath(page)}</p>
			<p>퍼블리싱 HTML 표시를 제거했습니다. 이 화면은 TSX 페이지로 변환된 뒤 확인할 수 있습니다.</p>
		</section>
	</main>
)

const UnknownPage = () => (
	<main className="container flex_center conversion_pending" id="mainContent">
		<section className="conversion_pending_box">
			<h1>등록되지 않은 태블릿 화면입니다.</h1>
			<p>React 라우트 등록 또는 컨버팅 계획 확인이 필요합니다.</p>
		</section>
	</main>
)

const PageRoute = () => {
	const location = useLocation()
	const dynamicQuestMatch = location.pathname.replace(/\.html$/, '').match(/^\/student\/quest(0[1-4])(?:_(\d+))?$/)
	if (dynamicQuestMatch) {
		const routeIndex = Number(dynamicQuestMatch[1]) - 1
		const contentIndex = dynamicQuestMatch[2] ? Number(dynamicQuestMatch[2]) - 1 : 0
		if (contentIndex >= 0) return <QuestDynamicContentPage routeIndex={routeIndex} contentIndex={contentIndex} />
	}
	const page = pageFromLocation(location.pathname)

	if (!page) return <UnknownPage />
	if (page === 'index') return <LoginPage />
	if (page === 'select_user') return <SelectUserPage />
	if (page === 'student/attendance') return <StudentAttendancePage />
	if (page === 'student/welcome') return <StudentWelcomePage />
	if (page === 'student/about') return <StudentAboutPage />
	if (page === 'student/quest00') return <QuestIntroPage />
	if (page === 'student/quest01') return <Quest01Page />
	if (page === 'student/quest01_2') return <Quest01SecondPage />
	if (page === 'student/quest01_3') return <Quest01ThirdPage />
	if (page === 'student/quest01_end') return <QuestStepEndPage routeIndex={0} />
	if (page === 'student/quest02') return <Quest02Page />
	if (page === 'student/quest02_2') return <Quest02SecondPage />
	if (page === 'student/quest02_3') return <Quest02ThirdPage />
	if (page === 'student/quest02_end') return <QuestStepEndPage routeIndex={1} />
	if (page === 'student/quest03') return <Quest03Page />
	if (page === 'student/quest03_2') return <Quest03SecondPage />
	if (page === 'student/quest03_end') return <QuestStepEndPage routeIndex={2} />
	if (page === 'student/quest04') return <Quest04Page />
	if (page === 'student/quest04_2') return <Quest04SecondPage />
	if (page === 'student/quest04_end') return <QuestStepEndPage routeIndex={3} />
	if (page === 'student/quest05') return <Quest05Page />
	if (page === 'student/quest_end') return <QuestEndPage />
	if (page === 'student/quest_survey') return <QuestSurveyPage />
	if (page === 'student/quest_video') return <QuestVideoPage />
	if (page === 'student/resource_center') return <ResourceCenterPage />
	if (page === 'student/mission_welcome') return <MissionWelcomePage />
	if (page === 'student/mission_about') return <MissionAboutPage />
	if (page === 'student/mission01') return <Mission01Page />
	if (page === 'student/mission02') return <Mission02Page />
	if (page === 'student/mission03') return <Mission03Page />
	if (page === 'student/mission03_end') return <Mission03EndPage />
	if (page === 'student/mission04') return <Mission04Page />
	if (page === 'student/mission04_end') return <Mission04EndPage />
	if (page === 'student/mission05') return <Mission05Page />
	if (page === 'student/mission05_end') return <Mission05EndPage />
	if (page === 'student/mission06') return <Mission06Page />
	if (page === 'student/mission06_end') return <Mission06EndPage />
	if (page === 'student/mission_end') return <MissionEndPage />
	if (page === 'student/mission_resource_center') return <MissionResourceCenterPage />
	if (page === 'teacher/attendance') return <TeacherAttendancePage />
	if (page === 'teacher/monitoring') return <TeacherMonitoringPage />
	if (page === 'teacher/real_time_location') return <TeacherRealTimeLocationPage />
	if (page === 'teacher/message_sending') return <TeacherMessageSendingPage />
	if (page === 'teacher/call_history') return <TeacherCallHistoryPage />
	if (page === 'teacher/session_management') return <TeacherSessionManagementPage />
	if (page === 'teacher/resource_center') return <TeacherResourceCenterPage />

	return <UnconvertedPage page={page} />
}

const App = () => (
	<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
		<Routes>
			<Route path="/" element={<PageRoute />} />
			<Route path="/index" element={<PageRoute />} />
			<Route path="/index.html" element={<PageRoute />} />
			<Route path="/select-user" element={<PageRoute />} />
			<Route path="/select_user" element={<PageRoute />} />
			<Route path="/select_user.html" element={<PageRoute />} />
			<Route path="/student/*" element={<PageRoute />} />
			<Route path="/teacher/*" element={<PageRoute />} />
			<Route path="*" element={<UnknownPage />} />
		</Routes>
	</BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

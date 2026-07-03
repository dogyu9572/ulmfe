import { StudentPopups } from './TabletPopup'
import { useTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { useTabletSidebarToggle } from '../../hooks/useTabletSidebarToggle'
import { useLocation } from 'react-router-dom'
import {
	studentFlowClassName,
	studentFlowCompletedExploreStepCodes,
	studentFlowExploreIntroStep,
	studentFlowExploreQuestByRouteIndex,
	studentFlowRouteItems,
	studentFlowStoredProgressRate,
	studentFlowTeamName
} from '../../state/tabletStudentFlowSession'
import { missionRouteIconSrc } from '../../pages/student/mission/missionShared'

const progressClassName = (progress: number) => {
	if (progress >= 67) return 'line_area pct_step3'
	if (progress >= 34) return 'line_area pct_step2'
	return 'line_area pct_step1'
}

const getExploreHeaderProgress = (pathname: string, dynamicStepCount: number) => {
	const totalSteps = 1 + dynamicStepCount + 2
	const endStepIndex = totalSteps - 1
	const match = pathname.match(/\/student\/quest(0[1-4])(_end)?$/)
	let activeIndex = pathname.endsWith('/student/quest00') || pathname.endsWith('/student/quest_video') ? 0 : 0
	let completedUntil = -1

	if (match) {
		const routeIndex = Number(match[1]) - 1
		const currentStepIndex = 1 + routeIndex
		if (match[2]) {
			completedUntil = currentStepIndex
			activeIndex = Math.min(currentStepIndex + 1, endStepIndex)
		} else {
			activeIndex = currentStepIndex
			completedUntil = currentStepIndex - 1
		}
	} else if (pathname.endsWith('/student/quest05')) {
		activeIndex = 1 + dynamicStepCount
		completedUntil = activeIndex - 1
	} else if (pathname.endsWith('/student/quest_end')) {
		activeIndex = endStepIndex
		completedUntil = endStepIndex - 1
	} else if (pathname.endsWith('/student/resource_center')) {
		activeIndex = -1
		completedUntil = -1
	}

	const progress = endStepIndex <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((Math.max(activeIndex, 0) / endStepIndex) * 100)))
	return { activeIndex, completedUntil, progress }
}

export const StudentCaseHeader = () => {
	const flowSession = useTabletStudentFlowSession()
	const location = useLocation()
	const { collapsed, toggleSidebar } = useTabletSidebarToggle()
	if (!flowSession) return null

	const teamName = studentFlowTeamName(flowSession)
	const selectedStudents = flowSession.selectedStudents
	const teamCount = selectedStudents.length
	const routeItems = studentFlowRouteItems(flowSession)
	const introStep = studentFlowExploreIntroStep(flowSession)
	const dynamicSteps = routeItems.map((routeName, index) => {
		const quest = studentFlowExploreQuestByRouteIndex(flowSession, index)
		return {
			title: routeName,
			description: quest?.title || '',
			time: quest?.limitMin ? `${quest.limitMin}분` : '',
			icon: missionRouteIconSrc(routeName)
		}
	})
	const steps = [
		{ title: '사건제시', description: introStep?.title || '', time: introStep?.limitMin ? `${introStep.limitMin}분` : '', icon: '/pub/images/icon_activity_order01.webp' },
		...dynamicSteps,
		{ title: '메이커 활동', description: '메이커 활동', time: '', icon: '/pub/images/icon_activity_order_make.webp' },
		{ title: '정리 및 일반화', description: '마무리', time: '', icon: '/pub/images/icon_activity_order06.webp' }
	]
	const completedExploreStepCodes = studentFlowCompletedExploreStepCodes(flowSession)
	const { activeIndex, completedUntil, progress: routeProgress } = getExploreHeaderProgress(location.pathname, routeItems.length)
	const storedProgress = studentFlowStoredProgressRate(flowSession)
	const progress = Math.max(routeProgress, storedProgress)

	return (
	<>
		<header className={`header student_header${collapsed ? ' off' : ''}`}>
			<h2 className="sound_only">메인메뉴 영역</h2>
			<div className="inbox_scroll">
				<div className="student_info">
					<div className="flex">
						<div className="img" aria-hidden="true"></div>
						<div className="txt">
							<div className="school_class">{studentFlowClassName(flowSession)}</div>
							<div className="people">총 {flowSession.totalStudentCount}명</div>
						</div>
					</div>
					<div className="btns">
						<a href="/student/resource_center" className="btn btn_kgg">자료실</a>
						<button type="button" className="btn btn_kgg btn_open" data-target="pop_teacher_call">선생님 호출</button>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>{teamName} 정보</h3><div className="people">{teamCount}명</div></div>
					<ul className="people_list">
						{selectedStudents.map((student, index) => (
							<li key={student.stdntSn}>{index === 0 ? <strong>{student.stdntNm}(나)</strong> : student.stdntNm}</li>
						))}
					</ul>
				</div>
				<div className="area">
					<div className="tit"><h3>전체 진척률</h3></div>
					<div className={progressClassName(progress)}>
						<div className="pct"><strong>{progress}</strong>%</div>
						<div className="bar" style={{ width: `${Math.max(progress, 1)}%` }}><div className="pct"><strong>{progress}</strong>%</div></div>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>활동 순서</h3></div>
					<div className="step_list">
						<ul>
							{steps.map((step, index) => {
								const className = [
									`step${index}`,
									index === activeIndex ? 'on' : '',
									index <= completedUntil || (index > 0 && index <= routeItems.length && completedExploreStepCodes.has(`QUEST${String(index).padStart(2, '0')}`)) ? 'end' : ''
								].filter(Boolean).join(' ')
								return (
									<li className={className} key={`${step.title}-${index}`}>
										<i aria-hidden="true"><img src={step.icon} alt="" /></i>
										<strong>{step.title}</strong>
										<p>
											{step.description && <span>{step.description}</span>}
											{step.time && <span>{step.time}</span>}
										</p>
									</li>
								)
							})}
						</ul>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>획득한 도장</h3></div>
					<ul className="stamp_area type_stamp">
						<li className="i1">퀘스트1 도장</li>
						<li className="i2">퀘스트2 도장</li>
						<li className="i3">퀘스트3 도장</li>
						<li className="i4">퀘스트4 도장</li>
					</ul>
				</div>
			</div>
			<button type="button" className="btn_menu" onClick={toggleSidebar}>{collapsed ? '메뉴 열기' : '메뉴 닫기'}</button>
		</header>
		<StudentPopups />
	</>
	)
}

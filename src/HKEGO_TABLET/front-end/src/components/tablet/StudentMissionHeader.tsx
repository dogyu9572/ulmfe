import { Link, useLocation } from 'react-router-dom'
import { StudentPopups } from './TabletPopup'
import { useTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { useTabletSidebarToggle } from '../../hooks/useTabletSidebarToggle'
import {
	studentFlowClassName,
	studentFlowCompletedMissionStepCodes,
	studentFlowExploreIntroStep,
	studentFlowMissionQuestByRouteIndex,
	studentFlowRouteItems,
	studentFlowStoredProgressRate,
	studentFlowTeamName
} from '../../state/tabletStudentFlowSession'
import { missionRouteIconSrc } from '../../pages/student/mission/missionShared'

type MissionSideStep = {
	title: string
	description: string
	time: string
	icon: string
}

const fixedEndStep: MissionSideStep = {
	title: '실천력 부여',
	description: 'SDGs 히어로 완성·평가/설문',
	time: '10분',
	icon: '/pub/images/icon_activity_mission_end.webp'
}

const fixedStartStepCount = 2

const getMissionHeaderProgress = (pathname: string, dynamicStepCount: number) => {
	const totalSteps = fixedStartStepCount + dynamicStepCount + 1
	const endStepIndex = totalSteps - 1
	const match = pathname.match(/\/student\/mission(0[3-6])(_end)?$/)
	let activeIndex = 0
	let completedUntil = -1

	if (pathname.endsWith('/student/mission02')) {
		activeIndex = 1
		completedUntil = 0
	} else if (match) {
		const routeIndex = Number(match[1]) - 3
		const currentStepIndex = fixedStartStepCount + routeIndex
		if (match[2]) {
			completedUntil = currentStepIndex
			activeIndex = Math.min(currentStepIndex + 1, endStepIndex)
		} else {
			activeIndex = currentStepIndex
			completedUntil = currentStepIndex - 1
		}
	} else if (pathname.endsWith('/student/mission_end')) {
		activeIndex = endStepIndex
		completedUntil = endStepIndex - 1
	} else if (pathname.endsWith('/student/mission_resource_center')) {
		activeIndex = -1
		completedUntil = -1
	}

	const progress = endStepIndex <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((Math.max(activeIndex, 0) / endStepIndex) * 100)))
	return { activeIndex, completedUntil, progress }
}

const progressClassName = (progress: number) => {
	if (progress >= 67) return 'line_area pct_step3'
	if (progress >= 34) return 'line_area pct_step2'
	return 'line_area pct_step1'
}

export const StudentMissionHeader = () => {
	const flowSession = useTabletStudentFlowSession()
	const location = useLocation()
	const { collapsed, toggleSidebar } = useTabletSidebarToggle()
	if (!flowSession) return null

	const teamName = studentFlowTeamName(flowSession)
	const routeItems = studentFlowRouteItems(flowSession)
	const selectedCount = flowSession.totalStudentCount
	const introStep = studentFlowExploreIntroStep(flowSession)
	const fixedStartSteps: MissionSideStep[] = [
		{
			title: introStep?.stepName || '스토리 제시',
			description: introStep?.title || '',
			time: introStep?.limitMin ? `${introStep.limitMin}분` : '',
			icon: '/pub/images/icon_activity_order01.webp'
		},
		{ title: '미션 탐색', description: '미션 열어보기, 동선안내', time: '20분', icon: '/pub/images/icon_activity_mission02.webp' }
	]
	const dynamicSteps = routeItems.map((routeName, index) => {
		const quest = studentFlowMissionQuestByRouteIndex(flowSession, index)
		return {
			title: routeName,
			description: quest?.title || '',
			time: quest?.limitMin ? `${quest.limitMin}분` : '',
			icon: missionRouteIconSrc(routeName)
		}
	})
	const steps = [...fixedStartSteps, ...dynamicSteps, fixedEndStep]
	const completedMissionStepCodes = studentFlowCompletedMissionStepCodes(flowSession)
	const { activeIndex, completedUntil, progress: routeProgress } = getMissionHeaderProgress(location.pathname, routeItems.length)
	const storedProgress = studentFlowStoredProgressRate(flowSession)
	const progress = Math.max(routeProgress, storedProgress)

	return (
	<>
		<header className={`header student_header mission_header${collapsed ? ' off' : ''}`}>
			<h2 className="sound_only">메인메뉴 영역</h2>
			<div className="inbox_scroll">
				<div className="student_info">
					<div className="flex">
						<div className="img" aria-hidden="true"></div>
						<div className="txt">
							<div className="school_class">{studentFlowClassName(flowSession)}</div>
							<div className="people">총 {selectedCount}명</div>
						</div>
					</div>
					<div className="btns">
						<Link to="/student/mission_resource_center" className="btn btn_kgg">자료실</Link>
						<button type="button" className="btn btn_kgg btn_open" data-target="pop_teacher_call">선생님 호출</button>
					</div>
				</div>
				<div className="area">
					<div className="team_area"><div className="team">{teamName}</div><span>{flowSession.prgrmNm}</span></div>
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
									index <= completedUntil || (index >= fixedStartSteps.length && completedMissionStepCodes.has(`MISSION${String(index - fixedStartSteps.length + 1).padStart(2, '0')}`)) ? 'end' : ''
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
					<div className="tit"><h3>획득한 스티커</h3></div>
					<ul className="stamp_area type_sticker1">
						<li className="i1">미션1 스티커</li>
						<li className="i2">미션2 스티커</li>
						<li className="i3">미션3 스티커</li>
					</ul>
				</div>
				<div className="area">
					<div className="tit"><h3>보너스 스티커</h3></div>
					<ul className="stamp_area type_sticker2">
						<li className="i1">보너스1 스티커</li>
						<li className="i2">보너스2 스티커</li>
						<li className="i3">보너스3 스티커</li>
						<li className="i4">보너스4 스티커</li>
					</ul>
				</div>
			</div>
			<button type="button" className="btn_menu" onClick={toggleSidebar}>{collapsed ? '메뉴 열기' : '메뉴 닫기'}</button>
		</header>
		<StudentPopups />
	</>
	)
}

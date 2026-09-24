import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkTabletEsdQuestion, fetchRandomTabletEsdQuestion, fetchTabletBonusOpened, fetchTabletSession, submitTabletMission } from '../../../api/tabletApi'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { missionProgramForName, missionProgramTitle, missionZoneForRoute, normalizeMissionZoneName, puzzleQuestionSn, type MissionProgramPuzzles } from '../../../state/missionPuzzleData'
import { saveTabletStudentFlowSession, studentFlowMissionStepCode, studentFlowRouteItems, studentFlowTeamName, type TabletStudentFlowSession } from '../../../state/tabletStudentFlowSession'
import type { MissionPuzzle } from '../../../state/missionPuzzleTypes'
import { stripEmphasisMarkers } from '../../../utils/emphasisText'
import { PuzzleRunner } from './puzzles/PuzzleRunner'
import { ProtoQuestText, ProtoStepBar } from './puzzles/puzzleShared'
import { MissionPlaySidebar } from './MissionPlaySidebar'
import { MissionZoneMap } from './MissionZoneMap'

const SESSION_TOTAL_SEC = 25 * 60

const remainLabelOf = (elapsedSec: number) => {
	const left = Math.max(0, SESSION_TOTAL_SEC - elapsedSec)
	return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
}

const missionResultQuestionName = (puzzle: MissionPuzzle, fallbackZoneName: string) => {
	const stepLabel = stripEmphasisMarkers(puzzle.stepLabel || '').trim()
	const separatorIndex = stepLabel.indexOf('—')
	return (separatorIndex >= 0 ? stepLabel.slice(separatorIndex + 1).trim() : stepLabel) || fallbackZoneName
}

const loadEsdQuizQuestion = async (excludeQuestionId?: number) => {
	const question = await fetchRandomTabletEsdQuestion(excludeQuestionId)
	if (!question || question.options.length === 0) return null
	return {
		id: question.questionId,
		question: question.question,
		options: question.options,
		imageUrl: question.imageUrl
	}
}

const completedZoneCountOf = (flowSession: TabletStudentFlowSession, zones: { name: string }[]) => {
	const studentSns = flowSession.selectedStudents.map((student) => student.stdntSn)
	for (let routeIndex = 0; routeIndex < zones.length; routeIndex += 1) {
		const stepCd = studentFlowMissionStepCode(routeIndex)
		const zoneName = normalizeMissionZoneName(zones[routeIndex].name)
		const completedByEveryStudent = studentSns.length > 0 && studentSns.every((studentSn) =>
			flowSession.progressLogs.some((log) => log.stdntSn === studentSn && log.stepSttsCd === 'DONE' &&
				(log.actvtNm ? normalizeMissionZoneName(log.actvtNm) === zoneName : log.stepCd === stepCd)))
		if (!completedByEveryStudent) return routeIndex
	}
	return zones.length
}

const MissionPlayExperience = ({ flowSession, program }: { flowSession: TabletStudentFlowSession; program: MissionProgramPuzzles }) => {
	const navigate = useNavigate()
	const routeItems = studentFlowRouteItems(flowSession)
	const routeZones = routeItems.flatMap((routeName) => {
		const zone = missionZoneForRoute(program, routeName)
		return zone ? [zone] : []
	})
	const finalZone = missionZoneForRoute(program, '최종 미션')
	const orderedZones = finalZone && !routeZones.includes(finalZone) ? [...routeZones, finalZone] : routeZones
	const sceneNames = [program.story.name, ...orderedZones.map((zone) => zone.name), '완료']
	const lastScene = sceneNames.length - 1
	const persistedCompletedZoneCount = completedZoneCountOf(flowSession, orderedZones)
	const [scene, setScene] = useState(() => persistedCompletedZoneCount > 0 ? Math.min(persistedCompletedZoneCount + 1, lastScene) : 0)
	const [stickers, setStickers] = useState(() => persistedCompletedZoneCount)
	const [elapsedSec, setElapsedSec] = useState(0)
	const [runKey, setRunKey] = useState(0)
	const [saving, setSaving] = useState(false)
	const solvedAnswerRef = useRef<Record<string, string>>({})

	useEffect(() => {
		const timer = window.setInterval(() => setElapsedSec((sec) => sec + 1), 1000)
		return () => window.clearInterval(timer)
	}, [])

	const remain = remainLabelOf(elapsedSec)
	const current = scene >= 1 && scene <= orderedZones.length ? orderedZones[scene - 1] : null
	const goScene = (next: number, nextStickers = stickers) => {
		solvedAnswerRef.current = {}
		setScene(Math.min(Math.max(next, 0), lastScene))
		setStickers(Math.min(Math.max(nextStickers, 0), orderedZones.length))
		setRunKey((key) => key + 1)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}
	const collectSolvedAnswer = (puzzle: MissionPuzzle, answerValue: string) => {
		solvedAnswerRef.current[puzzle.id] = answerValue
	}
	const completeCurrentZone = async () => {
		if (!current || saving) return
		const routeIndex = scene - 1
		const answers = current.puzzles.flatMap((puzzle) => {
			const answerValue = solvedAnswerRef.current[puzzle.id]
			return answerValue ? [{
				cntnSn: 0,
				qstnSn: puzzleQuestionSn(puzzle.id),
				qstnCn: missionResultQuestionName(puzzle, current.name),
				ansCn: answerValue,
				cardClsfCd: 'MISSION'
			}] : []
		})
		const studentSns = flowSession.selectedStudents.map((student) => student.stdntSn)
		try {
			setSaving(true)
			await submitTabletMission(flowSession.rsvtSn, {
				studentSns,
				routeIndex,
				routeName: current.name,
				stepCd: studentFlowMissionStepCode(routeIndex),
				totalRouteCount: orderedZones.length,
				answers
			})
			try {
				const refreshedSession = await fetchTabletSession()
				saveTabletStudentFlowSession(refreshedSession, studentSns)
			} catch {
				// 저장은 완료되었으므로 다음 화면 진입은 유지하고, 새로고침 때 다시 최신 세션을 조회합니다.
			}
			goScene(scene + 1, stickers + 1)
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '미션 결과를 저장하지 못했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{program.name} 미션 수행</h1>
			<MissionPlaySidebar flowSession={flowSession} program={program} sceneNames={sceneNames} scene={scene} stickers={stickers} />
			<MissionZoneMap sceneNames={sceneNames} scene={scene} />
			<section className="basic_board mission_wrap mproto_wrap">
				{/* 더미 자산 경고는 검수용 테스트 예약(프로그램명에 '테스트')에서만 띄운다. 시연 도구(정답 표시·빨리감기·바로가기)는 mission_proto 에만 있다 */}
				{program.caution && /테스트/.test(flowSession.prgrmNm) && <div className="mproto_caution">⚠ {program.caution}</div>}
				{orderedZones.length === 0 && <div className="mproto_stage"><div className="mproto_quest">연결된 하드코딩 미션 내용이 없습니다.</div></div>}
				{scene === 0 && (
					<><ProtoStepBar label={program.story.stepLabel} remain={remain} /><div className="mproto_stage"><div className="mproto_quest mproto_story">{program.story.paragraphs.map((paragraph, index) => <p key={index}><ProtoQuestText text={paragraph} /></p>)}</div>{program.story.team && <div className="mproto_quest mproto_team"><strong>함께할 팀과 활동 순서</strong><p className="muted">나는 <strong>{studentFlowTeamName(flowSession)}</strong> · {flowSession.selectedStudents.length}명</p><p>{routeItems.join(' → ')}</p></div>}{program.story.notice && <div className="mproto_hintbar" style={{ justifyContent: 'center' }}>{program.story.notice}</div>}</div><div className="btns_btm"><button type="button" className="btn btn_wbb" onClick={() => goScene(1)}>체험 시작</button></div></>
				)}
				{current && <><PuzzleRunner key={`${scene}-${runKey}`} zone={current} quizBank={[]} loadQuiz={loadEsdQuizQuestion} checkQuizAnswer={checkTabletEsdQuestion} stepBar={{ remain, step: scene, title: missionProgramTitle(flowSession.prgrmNm) }} onPuzzleSolved={collectSolvedAnswer} onZoneComplete={() => void completeCurrentZone()} />{saving && <div className="mproto_hintbar" style={{ justifyContent: 'center' }}>미션 결과를 저장하고 있습니다.</div>}</>}
				{orderedZones.length > 0 && scene === lastScene && (
					<div className="mproto_stage end_stage_area"><div className="mproto_done"><h2 className="tit" aria-hidden="true">미션 수행 완료!</h2><p><ProtoQuestText text={program.done.title} /></p><p className="muted">{program.done.text}</p><div className="img"></div><p>태블릿은 선생님에게 반납해주세요</p><button type="button" className="btn btn_wbb" onClick={() => navigate('/student/attendance')}>활동 종료하기</button></div></div>
				)}
			</section>
		</main>
	)
}

/**
 * 추가미션은 관리자가 반 단위로 열어준 뒤에만 들어갈 수 있는 보너스 스테이지다(0728 메모19).
 * 개방 순간을 실시간으로 잡지 않고 진입 시점에 한 번만 조회한다. 학생은 닫혀 있으면 다시 시도하면 된다.
 */
const MissionBonusGate = ({ flowSession, program }: { flowSession: TabletStudentFlowSession; program: MissionProgramPuzzles }) => {
	const [opened, setOpened] = useState<boolean | null>(null)

	useEffect(() => {
		let alive = true
		const studentSns = flowSession.selectedStudents.map((student) => student.stdntSn)
		fetchTabletBonusOpened(flowSession.rsvtSn, studentSns)
			.then((result) => { if (alive) setOpened(result?.opened === true) })
			// 조회에 실패하면 닫힌 것으로 본다. 실패가 개방으로 읽히면 안 된다
			.catch(() => { if (alive) setOpened(false) })
		return () => { alive = false }
	}, [flowSession.rsvtSn, flowSession.selectedStudents])

	if (opened === null) return <main className="container flex_center" id="mainContent"><section className="conversion_pending_box"><h1>참여할 수 있는지 확인하고 있습니다.</h1></section></main>
	if (!opened) return <main className="container flex_center" id="mainContent"><section className="conversion_pending_box"><h1>아직 참여할 수 없습니다.</h1><p>선생님이 열어주면 참여할 수 있습니다.</p></section></main>
	return <MissionPlayExperience flowSession={flowSession} program={program} />
}

export const MissionPlayPage = () => {
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null
	const program = missionProgramForName(flowSession.prgrmNm)
	if (!program) return <main className="container flex_center" id="mainContent"><section className="conversion_pending_box"><h1>연결된 미션 내용이 없습니다.</h1><p>{flowSession.prgrmNm}</p></section></main>
	if (program.key === 'mx') return <MissionBonusGate flowSession={flowSession} program={program} />
	return <MissionPlayExperience flowSession={flowSession} program={program} />
}

import { useEffect, useRef, useState } from 'react'
import { checkTabletEsdQuestion, fetchRandomTabletEsdQuestion, fetchTabletSession, submitTabletMission } from '../../../api/tabletApi'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { missionProgramForName, missionZoneForRoute, puzzleQuestionSn, type MissionProgramPuzzles } from '../../../state/missionPuzzleData'
import { saveTabletStudentFlowSession, studentFlowMissionStepCode, studentFlowRouteItems, studentFlowTeamName, type TabletStudentFlowSession } from '../../../state/tabletStudentFlowSession'
import type { MissionPuzzle } from '../../../state/missionPuzzleTypes'
import { stripEmphasisMarkers } from '../../../utils/emphasisText'
import { PuzzleRunner } from './puzzles/PuzzleRunner'
import { type DemoState, ProtoModal, ProtoQuestText, ProtoStepBar } from './puzzles/puzzleShared'
import { MissionPlaySidebar } from './MissionPlaySidebar'

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

const completedZoneCountOf = (flowSession: TabletStudentFlowSession, zoneCount: number) => {
	const studentSns = flowSession.selectedStudents.map((student) => student.stdntSn)
	for (let routeIndex = 0; routeIndex < zoneCount; routeIndex += 1) {
		const stepCd = studentFlowMissionStepCode(routeIndex)
		const completedByEveryStudent = studentSns.length > 0 && studentSns.every((studentSn) =>
			flowSession.progressLogs.some((log) => log.stdntSn === studentSn && log.stepCd === stepCd && log.stepSttsCd === 'DONE'))
		if (!completedByEveryStudent) return routeIndex
	}
	return zoneCount
}

const MissionPlayExperience = ({ flowSession, program }: { flowSession: TabletStudentFlowSession; program: MissionProgramPuzzles }) => {
	const routeItems = studentFlowRouteItems(flowSession)
	const routeZones = routeItems.flatMap((routeName) => {
		const zone = missionZoneForRoute(program, routeName)
		return zone ? [zone] : []
	})
	const finalZone = missionZoneForRoute(program, '최종 미션')
	const orderedZones = finalZone && !routeZones.includes(finalZone) ? [...routeZones, finalZone] : routeZones
	const sceneNames = [program.story.name, ...orderedZones.map((zone) => zone.name), '완료']
	const lastScene = sceneNames.length - 1
	const persistedCompletedZoneCount = completedZoneCountOf(flowSession, orderedZones.length)
	const [scene, setScene] = useState(() => persistedCompletedZoneCount > 0 ? Math.min(persistedCompletedZoneCount + 1, lastScene) : 0)
	const [stickers, setStickers] = useState(() => persistedCompletedZoneCount)
	const [elapsedSec, setElapsedSec] = useState(0)
	const [runKey, setRunKey] = useState(0)
	const [showAnswer, setShowAnswer] = useState(true)
	const [fastForward, setFastForward] = useState(false)
	const [jumpOpen, setJumpOpen] = useState(false)
	const [saving, setSaving] = useState(false)
	const solvedAnswerRef = useRef<Record<string, string>>({})

	useEffect(() => {
		const timer = window.setInterval(() => setElapsedSec((sec) => sec + 1), 1000)
		return () => window.clearInterval(timer)
	}, [])

	const demo: DemoState = { showAnswer, fastForward, speed: 10 }
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
			<section className="basic_board mission_wrap mproto_wrap">
				<div className="mproto_toolbar">
					<div className="txt"><strong>{program.name} — 학생 태블릿 화면 프로토타입</strong><span>{program.sourceNote}</span></div>
					<div className="btns">
						<button type="button" className={`mproto_tool${showAnswer ? ' on' : ''}`} onClick={() => setShowAnswer((value) => !value)}>정답 표시</button>
						<button type="button" className={`mproto_tool${fastForward ? ' on' : ''}`} onClick={() => setFastForward((value) => !value)}>힌트 타이머 빨리감기</button>
						<button type="button" className="mproto_tool" onClick={() => setJumpOpen(true)}>화면 바로가기</button>
						<button type="button" className="mproto_tool" onClick={() => goScene(0, 0)}>처음부터</button>
					</div>
				</div>
				{orderedZones.length === 0 && <div className="mproto_stage"><div className="mproto_quest">연결된 하드코딩 미션 내용이 없습니다.</div></div>}
				{scene === 0 && (
					<><ProtoStepBar label={program.story.stepLabel} remain={remain} /><div className="mproto_stage"><div className="mproto_quest mproto_story">{program.story.paragraphs.map((paragraph, index) => <p key={index}><ProtoQuestText text={paragraph} /></p>)}</div>{program.story.team && <div className="mproto_quest mproto_team"><strong>함께할 팀과 활동 순서</strong><p className="muted">나는 <strong>{studentFlowTeamName(flowSession)}</strong> · {flowSession.selectedStudents.length}명</p><p>{routeItems.join(' → ')}</p></div>}{program.story.notice && <div className="mproto_hintbar" style={{ justifyContent: 'center' }}>{program.story.notice}</div>}</div><div className="btns_btm"><button type="button" className="btn btn_wbb" onClick={() => goScene(1)}>체험 시작</button></div></>
				)}
				{current && <><PuzzleRunner key={`${scene}-${runKey}`} zone={current} quizBank={[]} loadQuiz={loadEsdQuizQuestion} checkQuizAnswer={checkTabletEsdQuestion} demo={demo} stepBar={{ remain }} onPuzzleSolved={collectSolvedAnswer} onZoneComplete={() => void completeCurrentZone()} />{saving && <div className="mproto_hintbar" style={{ justifyContent: 'center' }}>미션 결과를 저장하고 있습니다.</div>}<div className="mproto_skiprow"><button type="button" className="mproto_tool" disabled={saving} onClick={() => goScene(scene + 1, stickers + 1)}>생략하고 다음 →</button></div></>}
				{orderedZones.length > 0 && scene === lastScene && (
					<><ProtoStepBar label={program.done.stepLabel} remain={remain} /><div className="mproto_stage"><div className="mproto_done"><div className="big" aria-hidden="true">{program.done.emoji}</div><h2>{program.done.title}</h2><p className="muted">{program.done.text}</p></div></div></>
				)}
				{jumpOpen && (
					<ProtoModal title="화면 바로가기" onClose={() => setJumpOpen(false)}><div className="mproto_opts">{sceneNames.map((name, index) => <button type="button" className="mproto_opt" key={`${name}-${index}`} onClick={() => { setJumpOpen(false); goScene(index, index - 1) }}>{index}. {name}</button>)}</div></ProtoModal>
				)}
			</section>
		</main>
	)
}

export const MissionPlayPage = () => {
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null
	const program = missionProgramForName(flowSession.prgrmNm)
	if (!program) return <main className="container flex_center" id="mainContent"><section className="conversion_pending_box"><h1>연결된 미션 내용이 없습니다.</h1><p>{flowSession.prgrmNm}</p></section></main>
	return <MissionPlayExperience flowSession={flowSession} program={program} />
}

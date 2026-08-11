// 미션 학생화면 동작 프로토타입 페이지 — 목 데이터 기반 scene 오케스트레이션 + 시연 도구 (세션·API 무의존)
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MISSION_PROGRAMS } from '../../../../state/missionPuzzleData'
import { PuzzleRunner } from '../puzzles/PuzzleRunner'
import { DemoState, ProtoModal, ProtoQuestText, ProtoStepBar } from '../puzzles/puzzleShared'
import { MissionProtoSidebar } from './MissionProtoSidebar'

const SESSION_TOTAL_SEC = 25 * 60

const remainLabelOf = (elapsedSec: number) => {
	const left = Math.max(0, SESSION_TOTAL_SEC - elapsedSec)
	return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
}

export const MissionProtoPage = () => {
	const [searchParams] = useSearchParams()
	const [programKey, setProgramKey] = useState(() => {
		const raw = searchParams.get('mission')
		return MISSION_PROGRAMS.some((item) => item.key === raw) ? (raw as string) : MISSION_PROGRAMS[0].key
	})
	const program = MISSION_PROGRAMS.find((item) => item.key === programKey) || MISSION_PROGRAMS[0]
	const sceneNames = [program.story.name, ...program.zones.map((zone) => zone.name), '완료']
	const lastScene = sceneNames.length - 1

	const [scene, setScene] = useState(() => {
		const raw = Number(searchParams.get('scene'))
		return Number.isInteger(raw) && raw >= 0 && raw <= lastScene ? raw : 0
	})
	const [stickers, setStickers] = useState(() => Math.min(Math.max(scene - 1, 0), program.zones.length))
	const [showAnswer, setShowAnswer] = useState(true)
	const [fastForward, setFastForward] = useState(false)
	const [jumpOpen, setJumpOpen] = useState(false)
	const [elapsedSec, setElapsedSec] = useState(0)
	const [runKey, setRunKey] = useState(0)

	useEffect(() => {
		const timer = window.setInterval(() => setElapsedSec((sec) => sec + 1), 1000)
		return () => window.clearInterval(timer)
	}, [])

	const demo: DemoState = { showAnswer, fastForward, speed: 10 }
	const remain = remainLabelOf(elapsedSec)

	const goScene = (next: number, nextStickers?: number) => {
		setScene(next)
		if (typeof nextStickers === 'number') setStickers(Math.min(Math.max(nextStickers, 0), program.zones.length))
		setRunKey((key) => key + 1)
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const selectMission = (key: string) => {
		setProgramKey(key)
		goScene(0, 0)
	}

	const zone = scene >= 1 && scene <= program.zones.length ? program.zones[scene - 1] : null

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{program.name} — 학생 태블릿 화면 프로토타입</h1>
			<MissionProtoSidebar program={program} sceneNames={sceneNames} scene={scene} stickers={stickers} />
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

				<div className="mproto_tabs">
					{MISSION_PROGRAMS.map((item) => <button type="button" className={`mproto_tool${item.key === program.key ? ' on' : ''}`} key={item.key} onClick={() => selectMission(item.key)}>{item.tabLabel}</button>)}
				</div>

				{program.caution && <div className="mproto_caution">⚠ {program.caution}</div>}

				{scene === 0 && (
					<><ProtoStepBar label={program.story.stepLabel} remain={remain} /><div className="mproto_stage"><div className="mproto_quest mproto_story">{program.story.paragraphs.map((paragraph, index) => <p key={index}><ProtoQuestText text={paragraph} /></p>)}</div>{program.story.team && <div className="mproto_quest mproto_team"><strong>함께할 팀과 활동 순서</strong><p className="muted">나는 <strong>{program.story.team.label}</strong> · {program.story.team.size}명</p><p>{program.story.team.routeOrder}</p></div>}{program.story.notice && <div className="mproto_hintbar" style={{ justifyContent: 'center' }}>{program.story.notice}</div>}</div><div className="btns_btm"><button type="button" className="btn btn_wbb" onClick={() => goScene(1)}>체험 시작</button></div></>
				)}

				{zone && (
					<><PuzzleRunner key={`${scene}-${runKey}`} zone={zone} quizBank={program.quizBank} demo={demo} stepBar={{ remain }} onZoneComplete={() => goScene(scene + 1, stickers + 1)} /><div className="mproto_skiprow"><button type="button" className="mproto_tool" onClick={() => goScene(scene + 1, stickers + 1)}>생략하고 다음 →</button></div></>
				)}

				{scene === lastScene && (
					<><ProtoStepBar label={program.done.stepLabel} remain={remain} /><div className="mproto_stage"><div className="mproto_done"><div className="big" aria-hidden="true">{program.done.emoji}</div><h2>{program.done.title}</h2><p className="muted">{program.done.text}</p></div></div><div className="btns_btm"><button type="button" className="btn btn_kwg" onClick={() => goScene(0, 0)}>처음부터 다시</button></div></>
				)}

				{jumpOpen && (
					<ProtoModal title="화면 바로가기" onClose={() => setJumpOpen(false)}><div className="mproto_opts">{sceneNames.map((name, index) => <button type="button" className="mproto_opt" key={`${name}-${index}`} onClick={() => { setJumpOpen(false); goScene(index, index - 1) }}>{index}. {name}</button>)}</div></ProtoModal>
				)}
			</section>
		</main>
	)
}

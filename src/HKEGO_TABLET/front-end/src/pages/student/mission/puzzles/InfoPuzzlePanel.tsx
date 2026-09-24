// 판정 없는 안내 화면 패널 — 미션3 E-16처럼 문제(암기) 화면과 입력 화면이 분리된 구성에서 앞 화면을 담당
import { useEffect, useRef, useState } from 'react'
import type { InfoPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState, INTRO_IMGBOX_CLASS } from './puzzleShared'

/**
 * 활동 시작 화면의 글자판 공개 시점(초) — 3분에 두 번째, 다시 2분 뒤(=5분)에 세 번째가 열린다.
 * 마지막 글자판이 열릴 때까지 「활동 시작」은 누를 수 없다.
 */
const FUTURE_START_STAGE_SEC = [180, 300]

/**
 * 활동 시작 화면의 단계별 글자판 — 뒤집힌 자모에서 시작해 콘텐츠 이름으로 맞춰진다.
 * 여기 등록된 퍼즐만 글자판·지연 공개·버튼 잠금이 적용된다.
 */
const STAGE_BOARDS: Record<string, { className: string; items: string[] }[]> = {
	'm1-future-start': [
		{ className: 'gbox rev', items: ['끼', 'ㅎ', 'ㄴ', 'ㅏ', 'ㄹ', 'ㅓ'] },
		{ className: 'gbox rev', items: ['끼', '한', '른', '다', '로', '서'] },
		{ className: 'gbox', items: ['서', '로', '다', '른', '한', '끼'] }
	],
	'm2-future-start': [
		{ className: 'gbox rev2', items: ['ㅏ', 'ㄱ', 'ㅇ', 'ㅁ', 'ㅔ', 'ㅐ'] },
		{ className: 'gbox rev2', items: ['사', '역', '의', '믹', '데', '팬'] },
		{ className: 'gbox', items: ['팬', '데', '믹', '의', '역', '사'] }
	]
}

export const InfoPuzzlePanel = ({ puzzle, demo, onSubmit, onBack }: { puzzle: InfoPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void; onBack?: () => void }) => {
	const [revealStage, setRevealStage] = useState(0)
	// 힌트 지연과 같은 배율로 압축한다 (시연 툴바의 speed). 화면 진입 시점 값을 쓰고, 도중 변경으로 타이머를 되감지 않는다
	const speedRef = useRef(1)
	speedRef.current = demo?.speed || 1
	const stageBoards = STAGE_BOARDS[puzzle.id]
	const activityLocked = Boolean(stageBoards) && revealStage < FUTURE_START_STAGE_SEC.length

	useEffect(() => {
		setRevealStage(0)
		if (!STAGE_BOARDS[puzzle.id]) return
		const speed = speedRef.current || 1
		const timers = FUTURE_START_STAGE_SEC.map((sec, index) => window.setTimeout(() => setRevealStage(index + 1), (sec * 1000) / speed))
		return () => timers.forEach((timer) => window.clearTimeout(timer))
	}, [puzzle.id])

	const content = (
		<>
			{stageBoards && (
				<div className="other_food_area">
					{(() => {
						const box = stageBoards[Math.min(revealStage, stageBoards.length - 1)]
						return <ul className={box.className}>{box.items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
					})()}
				</div>
			)}
			{puzzle.imageUrl && <div className="mproto_map"><img src={puzzle.imageUrl} alt="" /></div>}
			{/* 카드 박스 안에 배경 이미지로 그리는 안내 화면은 여기서 중복 렌더하지 않는다 */}
			{!puzzle.imageUrl && puzzle.imagePlaceholder && !INTRO_IMGBOX_CLASS[puzzle.id] && <div className="mproto_imgslot">{puzzle.imagePlaceholder}</div>}
			{puzzle.displayText && <div className="mproto_display">{puzzle.displayText}</div>}
			{puzzle.notice && <div className="mproto_hintbar" style={{ justifyContent: 'center' }}>{puzzle.notice}</div>}
		</>
	)

	return (
		<>
			{puzzle.contentBox ? <div className="wbox mproto_slots_wrap mt">{content}</div> : content}
			<div className="mproto_center">
				{puzzle.showBackButton && onBack && <button type="button" className="btn btn_kwg mproto_btn" onClick={onBack}>이전</button>}
				<button type="button" className="btn btn_wbb mproto_btn" disabled={activityLocked} onClick={() => onSubmit(true)}>{puzzle.buttonLabel || '다음'}</button>
			</div>
			{puzzle.answerNote && <AnswerBox demo={demo}>{puzzle.answerNote}</AnswerBox>}
		</>
	)
}

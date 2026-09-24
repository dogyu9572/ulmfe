// E1 변형 — 칸을 눌러 항목을 순환시키는 패널 (미션3 미래존 F-08). 출발·도착은 고정이고 가운데 칸만 돌아간다
import { useEffect, useState } from 'react'
import type { SlotPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

const answerPositions = (puzzle: SlotPuzzle) =>
	puzzle.reels.map((reel, index) => reel.indexOf(puzzle.answers[index]))

/** 시작 위치는 매번 무작위로 잡되 정답 항목은 피한다 — 0번으로 고정하면 칸 대부분이 정답인 채로 시작한다 */
const startPositions = (puzzle: SlotPuzzle) =>
	answerPositions(puzzle).map((answerIndex, reelIndex) => {
		const size = puzzle.reels[reelIndex].length
		if (size < 2) return 0
		return (answerIndex + 1 + Math.floor(Math.random() * (size - 1))) % size
	})

/** 항목이 한두 글자면 큰 글자 한 칸, 그보다 길면 여러 줄이 들어가는 넓은 칸을 쓴다 (F-08) */
const isWide = (puzzle: SlotPuzzle) =>
	puzzle.reels.some((reel) => reel.some((item) => item.length > 2)) ||
	(puzzle.fixedHead || '').length > 2 ||
	(puzzle.fixedTail || '').length > 2

export type SlotInput = ReturnType<typeof useSlotInput>

/**
 * 칸 회전 상태 — 칸판과 조작 버튼을 화면의 서로 다른 위치에 그려야 할 때
 * (예: 칸판은 지문 카드 안, 완료 버튼은 카드 밖) 호출한 쪽에서 상태를 들고 나눠 그린다.
 * puzzle이 null이면 아무것도 하지 않는다 — 슬롯 퍼즐이 아닐 때도 훅 호출 순서를 유지하기 위함이다.
 */
export const useSlotInput = (puzzle: SlotPuzzle | null, onSubmit: (ok: boolean) => void) => {
	const [positions, setPositions] = useState<number[]>(() => (puzzle ? startPositions(puzzle) : []))

	// 퍼즐이 바뀌면 칸을 새로 섞는다 (패널을 key로 새로 만들지 않고 상태만 들고 있는 경우 대비)
	useEffect(() => setPositions(puzzle ? startPositions(puzzle) : []), [puzzle?.id])

	/** 칸을 누르면 다음 항목으로 순환한다 (0728 메모16 — ① 순환 방식) */
	const spin = (reelIndex: number, delta: number) => {
		if (!puzzle) return
		const size = puzzle.reels[reelIndex].length
		setPositions(positions.map((position, index) => (index === reelIndex ? (position + delta + size) % size : position)))
	}

	const confirm = () => {
		if (!puzzle || positions.length === 0) return
		onSubmit(puzzle.reels.every((reel, index) => reel[positions[index]] === puzzle.answers[index]))
	}

	const solve = () => puzzle && setPositions(answerPositions(puzzle))

	return { puzzle, positions, spin, confirm, solve }
}

/** 칸판 — 출발·최종 목적지 고정 칸과 돌아가는 가운데 칸들 */
export const SlotReels = ({ input }: { input: SlotInput }) => {
	const { puzzle, positions, spin } = input
	if (!puzzle || positions.length === 0) return null

	return (
		<div className={`mproto_reels${isWide(puzzle) ? ' wide' : ''}`}>
			{puzzle.fixedHead && (
				<div className="mproto_reel fixed">
					<div className="muted">출발</div>
					<div className="mproto_reelface">{puzzle.fixedHead}</div>
				</div>
			)}
			{puzzle.reels.map((reel, index) => {
				const current = reel[positions[index]]
				return (
					<div className="mproto_reel" key={index}>
						<button type="button" className="mproto_btn_sm" aria-label={`${index + 1}번 칸 이전 항목 — 지금은 ${current}`} onClick={() => spin(index, -1)}>▲</button>
						{/* 칸 자체가 주 터치 대상 — 누를 때마다 다음 항목으로 순환한다 (0728 메모16) */}
						<button
							type="button"
							className="mproto_reelface"
							aria-label={`${index + 1}번 칸 — 지금은 ${current}. 누르면 다음 항목으로 바뀝니다`}
							onClick={() => spin(index, 1)}
						>{current}</button>
						<button type="button" className="mproto_btn_sm" aria-label={`${index + 1}번 칸 다음 항목 — 지금은 ${current}`} onClick={() => spin(index, 1)}>▼</button>
						<div className="muted">{index + 1}번 칸 · {positions[index] + 1}/{reel.length}</div>
					</div>
				)
			})}
			{puzzle.fixedTail && (
				<div className="mproto_reel fixed">
					<div className="muted">최종 목적지</div>
					<div className="mproto_reelface">{puzzle.fixedTail}</div>
				</div>
			)}
		</div>
	)
}

/** 완료 버튼 — onBack을 주면 왼쪽에 이전 버튼이 함께 나온다 */
export const SlotActions = ({ input, onBack }: { input: SlotInput; onBack?: () => void }) => (
	<div className="mproto_center">
		{onBack && <button type="button" className="btn btn_kwg mproto_btn" onClick={onBack}>이전</button>}
		<button type="button" className="btn btn_wbb mproto_btn" onClick={input.confirm}>완료</button>
	</div>
)

/** 시연 도구의 정답 표시줄 */
export const SlotAnswerNote = ({ input, demo }: { input: SlotInput; demo?: DemoState }) => {
	const { puzzle, solve } = input
	if (!puzzle) return null

	return (
		<AnswerBox demo={demo}>
			<code>{puzzle.answers.join(' → ')}</code> 가 되도록 칸을 돌립니다.
			(각 칸 {answerPositions(puzzle).map((position) => position + 1).join(' · ')} 번째 항목) → <strong>완료</strong>
			<button type="button" className="mproto_btn_sm" style={{ marginLeft: '8px' }} onClick={solve}>정답으로 맞추기</button>
		</AnswerBox>
	)
}

export const SlotPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: SlotPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const input = useSlotInput(puzzle, onSubmit)

	return (
		<>
			<SlotReels input={input} />
			<SlotActions input={input} />
			<SlotAnswerNote input={input} demo={demo} />
		</>
	)
}

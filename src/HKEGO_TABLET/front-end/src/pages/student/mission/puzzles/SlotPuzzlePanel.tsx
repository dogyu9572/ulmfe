// E1 변형 — 슬롯 회전 패널 (미션3 미래존 F-08). 릴마다 글자판이 순환하며, 다섯 글자를 맞추면 정답
import { useState } from 'react'
import type { SlotPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

const answerPositions = (puzzle: SlotPuzzle) =>
	puzzle.reels.map((reel, index) => reel.indexOf(Array.from(puzzle.answer)[index]))

/** 시작 위치는 매번 무작위로 잡되 정답 글자는 피한다 — 0번으로 고정하면 릴 대부분이 정답인 채로 시작한다 */
const startPositions = (puzzle: SlotPuzzle) =>
	answerPositions(puzzle).map((answerIndex, reelIndex) => {
		const size = puzzle.reels[reelIndex].length
		if (size < 2) return 0
		return (answerIndex + 1 + Math.floor(Math.random() * (size - 1))) % size
	})

export const SlotPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: SlotPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [positions, setPositions] = useState(() => startPositions(puzzle))

	const spin = (reelIndex: number, delta: number) => {
		const size = puzzle.reels[reelIndex].length
		setPositions(positions.map((position, index) => (index === reelIndex ? (position + delta + size) % size : position)))
	}

	const confirm = () => onSubmit(puzzle.reels.map((reel, index) => reel[positions[index]]).join('') === puzzle.answer)

	return (
		<>
			<div className="mproto_reels">
				{puzzle.reels.map((reel, index) => (
					<div className="mproto_reel" key={index}>
						<button type="button" className="mproto_btn_sm" onClick={() => spin(index, -1)}>▲</button>
						<div className="mproto_reelface">{reel[positions[index]]}</div>
						<button type="button" className="mproto_btn_sm" onClick={() => spin(index, 1)}>▼</button>
						<div className="muted">{positions[index] + 1}/{reel.length}</div>
					</div>
				))}
			</div>
			<div className="mproto_center">
				<button type="button" className="btn btn_wbb mproto_btn" onClick={confirm}>확인</button>
			</div>
			<AnswerBox demo={demo}>
				<code>{Array.from(puzzle.answer).join(' ')}</code> 가 되도록 슬롯을 돌립니다.
				(각 슬롯 {answerPositions(puzzle).map((position) => position + 1).join(' · ')} 번째 글자) → <strong>확인</strong>
				<button type="button" className="mproto_btn_sm" style={{ marginLeft: '8px' }} onClick={() => setPositions(answerPositions(puzzle))}>정답으로 맞추기</button>
			</AnswerBox>
		</>
	)
}

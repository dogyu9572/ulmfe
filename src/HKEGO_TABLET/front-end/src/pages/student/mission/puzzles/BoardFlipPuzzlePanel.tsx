// E2 글자판 뒤집기 패널 — 앞면 글자를 순서대로 터치하면 뒷면 글자가 조합되고, 조합 결과로 판정
import { useState } from 'react'
import type { BoardFlipPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

type Picked = { row: number; col: number }

export const BoardFlipPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: BoardFlipPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [picked, setPicked] = useState<Picked[]>([])

	const isPicked = (row: number, col: number) => picked.some((p) => p.row === row && p.col === col)
	const combo = picked.map((p) => puzzle.back[p.row][p.col])

	const confirm = () => {
		if (combo.join('') === puzzle.answer) onSubmit(true)
		else {
			setPicked([])
			onSubmit(false)
		}
	}

	// 시연 정답 안내 — frontAnswer 각 글자의 좌표를 앞면 격자에서 찾는다
	const answerCoords = (puzzle.frontAnswer || '').split('').map((ch) => {
		for (let row = 0; row < puzzle.front.length; row++) {
			const col = puzzle.front[row].indexOf(ch)
			if (col >= 0) return `${row + 1}행${col + 1}열`
		}
		return '?'
	})

	return (
		<>
			<div className="mproto_board" style={{ gridTemplateColumns: `repeat(${puzzle.front[0].length}, 72px)` }}>
				{puzzle.front.map((rowChars, row) => rowChars.map((ch, col) => (
					<button
						type="button"
						className={`mproto_cell${isPicked(row, col) ? ' flip' : ''}`}
						key={`${row}-${col}`}
						onClick={() => { if (!isPicked(row, col)) setPicked([...picked, { row, col }]) }}
					>{isPicked(row, col) ? puzzle.back[row][col] : ch}</button>
				)))}
			</div>
			<div className="mproto_combo">{combo.length ? combo.join(' ') : '— '.repeat(puzzle.answer.length).trim()}</div>
			<div className="mproto_center">
				<button type="button" className="btn btn_wbb mproto_btn" onClick={confirm}>확인</button>
				<button type="button" className="mproto_btn_sm" onClick={() => setPicked([])}>다시</button>
			</div>
			<AnswerBox demo={demo}>
				앞면에서 <code>{(puzzle.frontAnswer || '').split('').join(' ')}</code> 를 이 순서대로 터치 →
				뒷면 글자가 <code>{puzzle.answer}</code> 로 조합됩니다. (좌표 순서대로 {answerCoords.join(' · ')})
			</AnswerBox>
		</>
	)
}

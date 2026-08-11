// E3 단서 매칭 패널 — 왼쪽 항목을 고른 뒤 오른쪽 물건을 눌러 연결. 4쌍 완성 시 판정
import { useState } from 'react'
import type { MatchPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

export const MatchPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: MatchPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [pick, setPick] = useState<number | null>(null)
	const [pairs, setPairs] = useState<Record<number, number>>({})
	const usedRights = Object.values(pairs)

	const pickRight = (rightIndex: number) => {
		if (pick == null || usedRights.includes(rightIndex)) return
		const nextPairs = { ...pairs, [pick]: rightIndex }
		setPairs(nextPairs)
		setPick(null)
		if (Object.keys(nextPairs).length === puzzle.left.length) {
			const ok = puzzle.answerMap.every((answer, leftIndex) => nextPairs[leftIndex] === answer)
			window.setTimeout(() => {
				if (ok) onSubmit(true)
				else {
					setPairs({})
					onSubmit(false)
				}
			}, 400)
		}
	}

	return (
		<>
			<div className="mproto_clues">
				{puzzle.clues.map((clue, index) => <div key={index}>{clue}</div>)}
			</div>
			<div className="mproto_match">
				<div className="mproto_mcol">
					{puzzle.left.map((label, index) => {
						const done = pairs[index] != null
						return (
							<button
								type="button"
								className={`mproto_mitem${done ? ' done' : ''}${pick === index ? ' pick' : ''}`}
								key={index}
								onClick={() => { if (!done) setPick(pick === index ? null : index) }}
							>{label}{done ? ` → ${puzzle.right[pairs[index]]}` : ''}</button>
						)
					})}
				</div>
				<div className="mproto_mcol">
					{puzzle.right.map((label, index) => (
						<button
							type="button"
							className={`mproto_mitem${usedRights.includes(index) ? ' done' : ''}`}
							key={index}
							onClick={() => pickRight(index)}
						>{label}</button>
					))}
				</div>
			</div>
			<AnswerBox demo={demo}>
				왼쪽 친구를 누른 뒤 오른쪽 물건을 누릅니다. — {puzzle.answerMap.map((answer, leftIndex) => (
					<code key={leftIndex}>{puzzle.left[leftIndex]} → {puzzle.right[answer]}</code>
				))}
			</AnswerBox>
		</>
	)
}

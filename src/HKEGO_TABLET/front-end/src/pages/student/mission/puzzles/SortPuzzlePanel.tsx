// E3 순서 정렬 패널 (미션2 미래존 F-06) — ▲▼로 사건을 시간순 정렬하면 글자가 이어져 문장이 된다. 연도는 정답 후 공개
import { useState } from 'react'
import type { SortPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

const shuffled = (length: number) => Array.from({ length }, (_, index) => index).sort(() => Math.random() - 0.5)
const sortedByKey = (items: SortPuzzle['items']) =>
	items.map((_, index) => index).sort((a, b) => items[a].sortKey - items[b].sortKey)

export const SortPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: SortPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [order, setOrder] = useState(() => shuffled(puzzle.items.length))
	const [revealed, setRevealed] = useState(false)

	const move = (position: number, delta: number) => {
		const target = position + delta
		if (target < 0 || target >= order.length) return
		const next = [...order]
		;[next[position], next[target]] = [next[target], next[position]]
		setOrder(next)
	}

	const confirm = () => {
		if (order.map((index) => puzzle.items[index].letter).join('') !== puzzle.answerWord) {
			onSubmit(false)
			return
		}
		setRevealed(true)
		window.setTimeout(() => onSubmit(true), 600)
	}

	return (
		<>
			<div className="mproto_mcol" style={{ gap: '6px' }}>
				{order.map((itemIndex, position) => {
					const item = puzzle.items[itemIndex]
					return revealed
						? <div className="mproto_mitem done" style={{ textAlign: 'left' }} key={itemIndex}>{item.sortKey}년 · {item.label}</div>
						: (
							<div className="mproto_mitem mproto_sortrow" key={itemIndex}>
								<span className="muted" style={{ width: '20px' }}>{position + 1}</span>
								<span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
								<span className="mproto_sortletter">{item.letter}</span>
								<button type="button" className="mproto_btn_sm" onClick={() => move(position, -1)} disabled={position === 0}>▲</button>
								<button type="button" className="mproto_btn_sm" onClick={() => move(position, 1)} disabled={position === order.length - 1}>▼</button>
							</div>
						)
				})}
			</div>
			<div className="mproto_combo" style={{ marginTop: '12px' }}>{order.map((index) => puzzle.items[index].letter).join(' ')}</div>
			<div className="mproto_center">
				<button type="button" className="btn btn_wbb mproto_btn" onClick={confirm}>확인</button>
			</div>
			<AnswerBox demo={demo}>
				▲▼로 아래 순서를 만들면 <code>{puzzle.answerWord}</code> 가 됩니다.<br />
				{sortedByKey(puzzle.items).map((index, position) => `${position + 1}. ${puzzle.items[index].label}(${puzzle.items[index].sortKey})`).join(' · ')}
				<button type="button" className="mproto_btn_sm" style={{ marginLeft: '8px' }} onClick={() => setOrder(sortedByKey(puzzle.items))}>정답 순서로 정렬</button>
			</AnswerBox>
		</>
	)
}

// E5 기억력 패널 — 색상 카드 ↔ 목표 문구 카드 이형쌍 짝짓기. 틀리면 문제은행 퀴즈 1문항 출제
import { useState } from 'react'
import type { MemoryPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

type Card = { pairId: number; kind: 'color' | 'text' }

const buildDeck = (puzzle: MemoryPuzzle): Card[] => {
	const count = Math.min(puzzle.pairCount ?? puzzle.pairs.length, puzzle.pairs.length)
	const defaultOrder = Array.from({ length: count }, (_, pairId) => pairId)
	const specifiedOrder = puzzle.pairOrder?.filter((pairId, index, order) => pairId >= 0 && pairId < count && order.indexOf(pairId) === index) ?? []
	const pairOrder = specifiedOrder.length > 0
		? [...specifiedOrder, ...defaultOrder.filter((pairId) => !specifiedOrder.includes(pairId))]
		: defaultOrder
	const deck: Card[] = []
	for (const pairId of pairOrder) {
		deck.push({ pairId, kind: 'color' }, { pairId, kind: 'text' })
	}
	return specifiedOrder.length > 0 ? deck : deck.sort(() => Math.random() - 0.5)
}

export const MemoryPuzzlePanel = ({ puzzle, demo, onSubmit, onRequestQuiz }: { puzzle: MemoryPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void; onRequestQuiz: () => void }) => {
	const [deck] = useState(() => buildDeck(puzzle))
	const [open, setOpen] = useState<number[]>([])
	const [matched, setMatched] = useState<number[]>([])
	const [peek, setPeek] = useState(false)
	const pairCount = deck.length / 2

	const flip = (index: number) => {
		if (open.includes(index) || matched.includes(deck[index].pairId) || open.length >= 2) return
		const nextOpen = [...open, index]
		setOpen(nextOpen)
		if (nextOpen.length < 2) return
		const [a, b] = nextOpen
		if (deck[a].pairId === deck[b].pairId && deck[a].kind !== deck[b].kind) {
			const nextMatched = [...matched, deck[a].pairId]
			setMatched(nextMatched)
			setOpen([])
			if (nextMatched.length === pairCount) window.setTimeout(() => onSubmit(true), 500)
		} else {
			window.setTimeout(() => {
				setOpen([])
				if (puzzle.wrongTriggersQuiz) onRequestQuiz()
			}, 650)
		}
	}

	return (
		<>
			<div className="mproto_mem wbox">
				{deck.map((card, index) => {
					const isOpen = peek || open.includes(index) || matched.includes(card.pairId)
					const isMatched = matched.includes(card.pairId)
					const item = puzzle.pairs[card.pairId]
					const itemClass = `i${String(card.pairId + 1).padStart(2, '0')}`
					if (!isOpen) {
						return <button type="button" className={`mproto_goal mproto_card ${itemClass} flex_center`} key={index} onClick={() => flip(index)}>?</button>
					}
					return card.kind === 'color'
						? (
							<button
								type="button"
								className={`mproto_goal mproto_card ${itemClass} open${isMatched ? ' matched' : ''}`}
								style={{ background: item.color, color: '#fff', borderColor: item.color }}
								key={index}
								onClick={() => flip(index)}
							><span className="flex"><strong>{card.pairId + 1}</strong><span>{item.label}</span></span></button>
						)
						: (
							<button
								type="button"
								className={`mproto_goal mproto_card ${itemClass} open${isMatched ? ' matched' : ''}`}
								style={{ background: item.color, color: '#fff', borderColor: item.color }}
								key={index}
								onClick={() => flip(index)}
							><span className="flex"><strong>{card.pairId + 1}</strong><span>{item.label}</span></span></button>
						)
				})}
			</div>
			<div className="mproto_center">맞춘 쌍 <strong>{matched.length}</strong> / {pairCount}</div>
			<AnswerBox demo={demo}>
				카드 배치는 진입할 때마다 무작위로 섞입니다. 같은 번호의 <strong>색상 카드 ↔ 목표 문구 카드</strong>를 짝지으면 됩니다.
				<button type="button" className="mproto_btn_sm" style={{ marginLeft: '8px' }} onClick={() => setPeek((v) => !v)}>
					{peek ? '다시 덮기' : '카드 전부 뒤집어 보기'}
				</button>
			</AnswerBox>
		</>
	)
}

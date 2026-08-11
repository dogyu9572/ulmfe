// E3 다중 선택 패널 — SDGs 17개 목표 그리드. 정답 개수 비공개, 문구는 지연 공개(1단계 색상만 → 2단계 문구)
import { useEffect, useState } from 'react'
import type { SelectPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

export const SelectPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: SelectPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [selected, setSelected] = useState<number[]>([])
	const [labelShown, setLabelShown] = useState(puzzle.labelRevealAfterSec == null)

	// demo가 없는 실구현에서는 원문 지연값 그대로 공개한다
	const speed = demo?.speed || 1
	useEffect(() => {
		if (puzzle.labelRevealAfterSec == null) return
		const timer = window.setTimeout(() => setLabelShown(true), (puzzle.labelRevealAfterSec / speed) * 1000)
		return () => window.clearTimeout(timer)
	}, [puzzle.id, puzzle.labelRevealAfterSec, speed])

	const toggle = (index: number) =>
		setSelected(selected.includes(index) ? selected.filter((v) => v !== index) : [...selected, index])

	const confirm = () => {
		const ok = selected.length === puzzle.answerIndexes.length && puzzle.answerIndexes.every((index) => selected.includes(index))
		if (ok) onSubmit(true)
		else {
			setSelected([])
			onSubmit(false)
		}
	}

	return (
		<>
			<p className="muted">{labelShown
				? '2단계 — 지속가능발전목표 문구까지 제시'
				: `1단계 — 색상과 이미지만 제시 (${Math.round((puzzle.labelRevealAfterSec || 0) / 60)}분 뒤 문구 공개)`}</p>
			<div className="mproto_sdgs">
				{puzzle.items.map((item, index) => (
					<button
						type="button"
						className={`mproto_goal${selected.includes(index) ? ' sel' : ''}${labelShown ? '' : ' hide'}`}
						style={{ background: item.color }}
						key={index}
						onClick={() => toggle(index)}
					>
						<strong>{index + 1}</strong>
						<span>{item.label}</span>
					</button>
				))}
			</div>
			<div className="mproto_center">
				<button type="button" className="btn btn_wbb mproto_btn" onClick={confirm}>정답 확인</button>
			</div>
			<AnswerBox demo={demo}>
				{puzzle.answerIndexes.map((index) => (
					<code key={index}>{index + 1}번 {puzzle.items[index].label}</code>
				))} 만 선택하고 <strong>정답 확인</strong>. (정답 개수는 학생에게 공개되지 않습니다)
			</AnswerBox>
		</>
	)
}

// E3 다중 선택 패널 — SDGs 17개 목표 그리드. 정답 개수 비공개, 문구는 지연 공개(1단계 색상만 → 2단계 문구)
import { useEffect, useRef, useState } from 'react'
import type { SelectPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

export const SelectPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: SelectPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [selected, setSelected] = useState<number[]>([])
	// labelRevealAfterSec(미래존 SDGs는 180초)이 지날 때까지 .unview로 목표 문구를 가린다
	const [labelRevealed, setLabelRevealed] = useState(!puzzle.labelRevealAfterSec)
	// 힌트 지연과 같은 배율로 압축한다 (시연 툴바의 speed)
	const speedRef = useRef(1)
	speedRef.current = demo?.speed || 1

	useEffect(() => {
		if (!puzzle.labelRevealAfterSec) return
		setLabelRevealed(false)
		const timer = window.setTimeout(() => setLabelRevealed(true), (puzzle.labelRevealAfterSec * 1000) / (speedRef.current || 1))
		return () => window.clearTimeout(timer)
	}, [puzzle.id, puzzle.labelRevealAfterSec])

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
			<p className="muted">지속가능발전목표 문구까지 제시</p>
			<div className={`mproto_sdgs${labelRevealed ? '' : ' unview'}`}>
				{puzzle.items.map((item, index) => (
					<button
						type="button"
						className={`mproto_goal i${String(index + 1).padStart(2, '0')}${selected.includes(index) ? ' sel' : ''}`}
						style={{ background: item.color }}
						key={index}
						onClick={() => toggle(index)}
					>
						<span className="flex">
							<strong>{index + 1}</strong>
							<span>{item.label}</span>
						</span>
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

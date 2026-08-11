// E2 변형 — 격자 순번 터치 패널 (미션2 사회존 S-07). 제시된 순서대로 눌러야 하고, 틀리면 처음부터 다시
import { useState } from 'react'
import type { GridSequencePuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

export const GridSequencePuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: GridSequencePuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [step, setStep] = useState(0)
	const word = Array.from(puzzle.word)

	const touch = (cellNumber: number) => setStep(cellNumber === puzzle.sequence[step] ? step + 1 : 0)

	const confirm = () => onSubmit(step === puzzle.sequence.length)

	return (
		<>
			{/* 두 자리 수가 갈라져 보이지 않도록 자간 대신 간격으로 띄운다 */}
			<div className="mproto_blanks mproto_seqrow">
				{puzzle.sequence.map((number, index) => (
					<span style={{ color: index === step ? '#e5001e' : undefined, opacity: index < step ? 0.35 : 1 }} key={index}>{number}</span>
				))}
			</div>
			<div className="mproto_board" style={{ gridTemplateColumns: `repeat(${puzzle.columns}, 72px)` }}>
				{Array.from({ length: puzzle.cellCount }, (_, index) => {
					const cellNumber = index + 1
					const at = puzzle.sequence.indexOf(cellNumber)
					const opened = at > -1 && at < step
					return (
						<button type="button" className={`mproto_cell${opened ? ' flip' : ''}`} key={cellNumber} onClick={() => touch(cellNumber)}>
							{opened ? word[at] : cellNumber}
						</button>
					)
				})}
			</div>
			<div className="mproto_combo" style={{ marginTop: '12px' }}>
				{step ? word.slice(0, step).join(' ') : '— '.repeat(word.length).trim()}
			</div>
			<div className="mproto_center">
				<button type="button" className="btn btn_wbb mproto_btn" onClick={confirm}>확인</button>
			</div>
			<AnswerBox demo={demo}>
				격자에서 {puzzle.sequence.map((number, index) => <code key={index}>{number}</code>)} 번을 이 순서대로 터치하면 <code>{puzzle.word}</code> 가 열립니다. 그 뒤 <strong>확인</strong>.
				<span className="muted"> 순서가 틀리면 처음으로 되돌아갑니다.</span>
			</AnswerBox>
		</>
	)
}

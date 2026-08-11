// E1 코드 입력 패널 — 숫자/영문/방향키 키패드, 고정 접미 슬롯
import { useState } from 'react'
import type { CodePuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

// ARROW 모드에서 ←는 방향값이므로 지우기는 별도 버튼으로만 제공한다
const keysOf = (puzzle: CodePuzzle): string[] => {
	if (puzzle.keypad === 'NUMERIC') return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '확인']
	if (puzzle.keypad === 'ALPHA') return [...(puzzle.alphaKeys || 'ABCDEFGHIJ').split(''), '←', '확인']
	return ['', '↑', '', '←', '↓', '→']
}

export const CodePuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: CodePuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [value, setValue] = useState('')
	const answerLen = Array.from(puzzle.answer).length
	const isArrow = puzzle.keypad === 'ARROW'
	const valueChars = Array.from(value) // 방향키(서러게이트) 안전 분할

	// 빠른 연속 입력에도 안전하도록 함수형 업데이트 사용
	const backspace = () => setValue((v) => Array.from(v).slice(0, -1).join(''))
	const confirm = () => {
		if (valueChars.length < answerLen) return
		if (value === puzzle.answer) onSubmit(true)
		else {
			setValue('')
			onSubmit(false)
		}
	}
	const press = (key: string) => {
		if (key === '확인') confirm()
		else if (!isArrow && key === '←') backspace()
		else setValue((v) => (Array.from(v).length < answerLen ? v + key : v))
	}

	return (
		<>
			<div className="mproto_slots">
				{Array.from({ length: answerLen }, (_, index) => (
					<div className={`mproto_slot${index === valueChars.length ? ' lit' : ''}`} key={index}>{valueChars[index] || ''}</div>
				))}
				{puzzle.fixedSuffix && <div className="mproto_slot fix">{puzzle.fixedSuffix}</div>}
			</div>
			<div className={`mproto_pad${puzzle.keypad === 'ALPHA' ? ' alpha' : ''}${isArrow ? ' arrow' : ''}`}>
				{keysOf(puzzle).map((key, index) => (isArrow && key === '')
					? <span key={index}></span>
					: (
						<button
							type="button"
							className={`mproto_key${key === '확인' ? ' act' : ''}`}
							key={index}
							onClick={() => press(key)}
						>{key}</button>
					))}
			</div>
			{isArrow && (
				<div className="mproto_center">
					<button type="button" className="mproto_btn_sm" onClick={backspace}>지우기</button>
					<button type="button" className="btn btn_wbb mproto_btn" style={{ marginLeft: '8px' }} onClick={confirm}>확인</button>
				</div>
			)}
			<AnswerBox demo={demo}>
				<code>{puzzle.answer}</code> {puzzle.keypad === 'ALPHA' ? '를 순서대로 누르고' : '를 입력하고'} <strong>확인</strong>
				{puzzle.fixedSuffix && <> · 마지막 <code>{puzzle.fixedSuffix}</code> 는 소문자로 고정 제시됩니다.</>}
			</AnswerBox>
		</>
	)
}

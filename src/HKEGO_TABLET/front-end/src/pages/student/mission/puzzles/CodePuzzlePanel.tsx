// E1 코드 입력 패널 — 숫자/영문/방향키 키패드, 고정 접미 슬롯
import { useEffect, useState } from 'react'
import type { CodePuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

// ARROW 모드에서 ←는 방향값이므로 지우기는 별도 버튼으로만 제공한다
const keysOf = (puzzle: CodePuzzle): string[] => {
	if (puzzle.keypad === 'NUMERIC') return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '확인']
	if (puzzle.keypad === 'ALPHA') {
		const alphaKeys = (puzzle.alphaKeys || 'ABCDEFGHIJ').split('')
		return [...alphaKeys.slice(0, 5), '←', ...alphaKeys.slice(5), '확인']
	}
	return ['', '↑', '', '←', '↓', '→']
}

export type CodeInput = ReturnType<typeof useCodeInput>

/**
 * 코드 입력 상태 — 입력판(슬롯·키패드)과 조작 버튼을 화면의 서로 다른 위치에 그려야 할 때
 * (예: 입력판은 지문 카드 안, 지우기·확인은 카드 밖) 호출한 쪽에서 상태를 들고 나눠 그린다.
 * puzzle이 null이면 아무것도 하지 않는다 — 코드 퍼즐이 아닐 때도 훅 호출 순서를 유지하기 위함이다.
 */
export const useCodeInput = (puzzle: CodePuzzle | null, onSubmit: (ok: boolean) => void) => {
	const [value, setValue] = useState('')
	const answerLen = puzzle ? Array.from(puzzle.answer).length : 0
	const isArrow = puzzle?.keypad === 'ARROW'
	const valueChars = Array.from(value) // 방향키(서러게이트) 안전 분할

	// 퍼즐이 바뀌면 입력을 비운다 (패널을 key로 새로 만들지 않고 상태만 들고 있는 경우 대비)
	useEffect(() => setValue(''), [puzzle?.id])

	// 빠른 연속 입력에도 안전하도록 함수형 업데이트 사용
	const backspace = () => setValue((v) => Array.from(v).slice(0, -1).join(''))
	const confirm = () => {
		if (!puzzle || valueChars.length < answerLen) return
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

	return { puzzle, valueChars, answerLen, isArrow, press, backspace, confirm }
}

/** 입력 슬롯 + 키패드 */
export const CodeInputBoard = ({ input }: { input: CodeInput }) => {
	const { puzzle, valueChars, answerLen, isArrow, press } = input
	if (!puzzle) return null

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
		</>
	)
}

/** 방향키 입력의 지우기·확인 버튼 — 키패드에 확인 키가 없는 ARROW 모드 전용 */
export const CodeInputActions = ({ input }: { input: CodeInput }) => (
	<div className="mproto_center">
		<button type="button" className="btn btn_kwg mproto_btn" onClick={input.backspace}>지우기</button>
		<button type="button" className="btn btn_wbb mproto_btn" onClick={input.confirm}>확인</button>
	</div>
)

/** 시연 도구의 정답 표시줄 */
export const CodeAnswerNote = ({ puzzle, demo }: { puzzle: CodePuzzle; demo?: DemoState }) => (
	<AnswerBox demo={demo}>
		<code>{puzzle.answer}</code> {puzzle.keypad === 'ALPHA' ? '를 순서대로 누르고' : '를 입력하고'} <strong>확인</strong>
		{puzzle.fixedSuffix && <> · 마지막 <code>{puzzle.fixedSuffix}</code> 는 소문자로 고정 제시됩니다.</>}
	</AnswerBox>
)

export const CodePuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: CodePuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const input = useCodeInput(puzzle, onSubmit)

	return (
		<>
			<CodeInputBoard input={input} />
			{input.isArrow && <CodeInputActions input={input} />}
			<CodeAnswerNote puzzle={puzzle} demo={demo} />
		</>
	)
}

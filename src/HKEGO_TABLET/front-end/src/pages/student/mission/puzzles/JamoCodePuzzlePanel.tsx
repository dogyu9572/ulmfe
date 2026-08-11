// E1 변형 — 한글 자모 키패드 패널 (미션2 지구존 E-09). 받침은 다음 글자 초성으로 이월되는 실기기 입력과 동일하게 동작
import { useState } from 'react'
import type { JamoCodePuzzle } from '../../../../state/missionPuzzleTypes'
import { CHO, JONG, JUNG, composeHangul } from '../../../../utils/hangulCompose'
import { AnswerBox, DemoState } from './puzzleShared'

const CONSONANT_KEYS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'.split('')
const VOWEL_KEYS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ'.split('')

type Cursor = { cho: number | null; jung: number | null; jong: number | null }
const EMPTY: Cursor = { cho: null, jung: null, jong: null }

export const JamoCodePuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: JamoCodePuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [done, setDone] = useState<string[]>([])
	const [cursor, setCursor] = useState<Cursor>(EMPTY)
	const answerLen = Array.from(puzzle.answer).length

	const cursorChar = composeHangul(cursor.cho, cursor.jung, cursor.jong)
	const text = done.join('') + cursorChar

	const reset = () => {
		setDone([])
		setCursor(EMPTY)
	}

	const press = (key: string) => {
		if (key === '←') {
			if (cursor.jong != null) setCursor({ ...cursor, jong: null })
			else if (cursor.jung != null) setCursor({ ...cursor, jung: null })
			else if (cursor.cho != null) setCursor(EMPTY)
			else setDone(done.slice(0, -1))
			return
		}
		if (key === '확인') {
			if (text === puzzle.answer) onSubmit(true)
			else {
				reset()
				onSubmit(false)
			}
			return
		}
		// 글자 수를 채운 뒤에는 마지막 글자에 중성을 붙이는 경우만 허용
		if (text.length >= answerLen && !(cursor.cho != null && cursor.jung == null)) return

		const vowelIndex = JUNG.indexOf(key)
		const choIndex = CHO.indexOf(key)
		const jongIndex = JONG.indexOf(key)

		if (vowelIndex >= 0) {
			if (cursor.cho != null && cursor.jung == null) {
				setCursor({ ...cursor, jung: vowelIndex })
			} else if (cursor.jong != null) {
				// 받침을 떼어 다음 글자의 초성으로 넘긴다
				const movedCho = CHO.indexOf(JONG[cursor.jong])
				setDone([...done, composeHangul(cursor.cho, cursor.jung, null)])
				setCursor({ cho: movedCho, jung: vowelIndex, jong: null })
			} else if (cursor.cho != null) {
				setDone([...done, cursorChar])
				setCursor(EMPTY)
			}
			return
		}

		if (choIndex >= 0) {
			if (cursor.cho == null) setCursor({ cho: choIndex, jung: null, jong: null })
			else if (cursor.jung != null && cursor.jong == null && jongIndex > 0) setCursor({ ...cursor, jong: jongIndex })
			else {
				setDone([...done, cursorChar])
				setCursor({ cho: choIndex, jung: null, jong: null })
			}
		}
	}

	return (
		<>
			<div className="mproto_slots" style={{ gap: '6px' }}>
				{Array.from({ length: answerLen }, (_, index) => (
					<div className={`mproto_slot${index === text.length - 1 && cursor.cho != null ? ' lit' : ''}`} key={index}>{text[index] || ''}</div>
				))}
			</div>
			{puzzle.colorClues && puzzle.colorClues.length > 0 && (
				<div className="mproto_clues" style={{ textAlign: 'center' }}>
					<strong>색상 자모 단서</strong>{' '}
					{puzzle.colorClues.map((clue, index) => (
						<span style={{ display: 'inline-block', margin: '0 10px', color: clue.color, fontWeight: 700 }} key={index}>
							{clue.pos}번째 {clue.jamo}
						</span>
					))}
					<div style={{ marginTop: '6px' }}>※ 전시물에서 같은 색으로 표시된 자모를 찾아 순서대로 대입</div>
				</div>
			)}
			<div className="mproto_pad jamo">
				{[...CONSONANT_KEYS, ...VOWEL_KEYS, '←', '확인'].map((key) => (
					<button type="button" className={`mproto_key${key === '확인' ? ' act' : ''}`} key={key} onClick={() => press(key)}>{key}</button>
				))}
			</div>
			<AnswerBox demo={demo}>
				<code>{puzzle.answer}</code> — 자모 키패드를 이 순서대로 누른 뒤 <strong>확인</strong>.
				<br />
				<span className="muted">받침이 다음 글자 초성으로 넘어가는 것은 정상 동작입니다 (실기기 한글 입력과 동일).</span>
			</AnswerBox>
		</>
	)
}

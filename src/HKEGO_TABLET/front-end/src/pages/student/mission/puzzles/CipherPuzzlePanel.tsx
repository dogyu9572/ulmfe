// E2 변형 — 암호표를 번호판·글자판과 대조해 낱말을 조합하는 패널 (미션2 사회존 S-07)
import { useState } from 'react'
import type { CipherPuzzle } from '../../../../state/missionPuzzleTypes'
import { CHO, JONG, JUNG, composeHangul, decomposeHangul } from '../../../../utils/hangulCompose'
import { AnswerBox, DemoState, HintBar } from './puzzleShared'

/** 자모가 글자 하나를 채웠으면 완성형으로, 아직 모자라면 자모를 이어 붙여 보여준다 */
const showGroup = (jamos: string[], size: number) => {
	if (jamos.length < size) return jamos.join('')
	const cho = CHO.indexOf(jamos[0])
	const jung = JUNG.indexOf(jamos[1])
	if (cho < 0 || jung < 0) return jamos.join('')
	const jong = jamos[2] ? JONG.indexOf(jamos[2]) : 0
	return composeHangul(cho, jung, jong < 0 ? 0 : jong)
}

/**
 * 암호표 + 번호판·글자판 대조표 — 입력 상태가 없는 제시용 블록이라 지문 카드(.a_card_box) 안쪽에서 그린다.
 * 렌더 위치는 PuzzleRunner가 정한다.
 */
export const CipherBoard = ({ puzzle }: { puzzle: CipherPuzzle }) => (
	<div className="mproto_cipher">
		<div className="mproto_cipher_code">
			<span className="lb">암호표</span>
			<strong>{puzzle.cipher}</strong>
		</div>
		<table className="mproto_cipher_tbl">
			<caption>암호표의 번호를 이 표에서 찾아 같은 자리의 글자를 읽습니다</caption>
			<tbody>
				<tr>
					<th scope="row">번호판</th>
					{puzzle.numbers.map((number, index) => <td key={index}>{number}</td>)}
				</tr>
				<tr>
					<th scope="row">글자판</th>
					{puzzle.jamo.map((jamo, index) => <td key={index}>{jamo}</td>)}
				</tr>
			</tbody>
		</table>
	</div>
)

export const CipherPuzzlePanel = ({ puzzle, demo, onSubmit, openCount, nextWait }: { puzzle: CipherPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void; openCount?: number; nextWait?: number }) => {
	const [input, setInput] = useState<string[]>([])
	const groups = decomposeHangul(puzzle.answer)
	const expected = groups.flat()

	const press = (jamo: string) => {
		if (input.length >= expected.length) return
		setInput([...input, jamo])
	}

	const submit = () => {
		const ok = input.length === expected.length && input.every((jamo, index) => jamo === expected[index])
		if (ok) onSubmit(true)
		else {
			setInput([])
			onSubmit(false)
		}
	}

	let cursor = 0
	const slots = groups.map((group) => {
		const taken = input.slice(cursor, cursor + group.length)
		cursor += group.length
		return showGroup(taken, group.length)
	})

	return (
		<div className="wbox mproto_slots_wrap mt">
			{/* 암호표(.mproto_cipher)는 PuzzleRunner가 지문 카드 안에서 그린다 */}
			<div className="mproto_slots" style={{ gap: '6px' }} aria-live="polite" aria-label={`입력한 글자 ${slots.filter(Boolean).length}/${slots.length}`}>
				{slots.map((char, index) => (
					<div className={`mproto_slot${char ? ' lit' : ''}`} key={index}>{char}</div>
				))}
			</div>

			<div className="mproto_pad jamo">
				{puzzle.jamo.map((jamo, index) => (
					<button type="button" className="mproto_key" key={index} onClick={() => press(jamo)}>{jamo}</button>
				))}
				<button type="button" className="mproto_key" aria-label="마지막 글자 지우기" onClick={() => setInput(input.slice(0, -1))}>←</button>
				<button type="button" className="mproto_key act" onClick={submit}>확인</button>
			</div>

			<AnswerBox demo={demo}>
				<code>{puzzle.answer}</code>
				{puzzle.segments && <> — 암호표를 <code>{puzzle.segments.join(' / ')}</code> 로 끊어 읽습니다.</>}
				<br />
				<span className="muted">글자판에서 {expected.join(' → ')} 순서로 누른 뒤 <strong>확인</strong>.</span>
			</AnswerBox>

			{/* 힌트바도 이 wbox 안에 둔다 — PuzzleRunner는 이 퍼즐에 바깥 힌트바를 그리지 않는다 */}
			<HintBar hints={puzzle.hints} openCount={openCount || 0} nextWait={nextWait || 0} />
		</div>
	)
}

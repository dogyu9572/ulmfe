// E3 변형 — 문항별 4지선다 후 세트 채점 패널 (미션1 사회존 S-14)
import { useState } from 'react'
import type { ChoiceSetPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState, HintBar } from './puzzleShared'

export const ChoiceSetPuzzlePanel = ({ puzzle, demo, onSubmit, onBack, openCount, nextWait }: { puzzle: ChoiceSetPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void; onBack?: () => void; openCount?: number; nextWait?: number }) => {
	const [picks, setPicks] = useState<Record<number, number>>({})
	const [friendPicks, setFriendPicks] = useState<Record<number, boolean>>({})
	const filled = puzzle.items.every((_, index) => picks[index] != null)
	const isSocialMatch = puzzle.id === 'm1-social-match'

	const submit = () => {
		const ok = puzzle.answerIndexes.every((answer, index) => picks[index] === answer)
		if (ok) onSubmit(true)
		else {
			setPicks({})
			setFriendPicks({})
			onSubmit(false)
		}
	}

	return (
		<>
			{isSocialMatch && <div className="wbox mproto_slots_wrap mt">
				<div className="mproto_choiceset">
					{puzzle.items.map((item, itemIndex) => (
						<fieldset className="mproto_choicerow" key={itemIndex}>
							<legend className="lb">{item}</legend>
							<div className={`opts frand${String(itemIndex + 1).padStart(2, '0')}`}>
								{/* i00은 문항(N번 친구) 표시용 — 고르는 대상이 아니라 체크박스를 두지 않는다 */}
								<span className="mproto_mitem i00">
									{item}
								</span>
								{puzzle.options.map((option, optionIndex) => (
									<label className={`mproto_mitem i${String(optionIndex + 1).padStart(2, '0')}${picks[itemIndex] === optionIndex ? ' pick' : ''}`} key={optionIndex}>
										<input type="radio" name={`${puzzle.id}-${itemIndex}`} checked={picks[itemIndex] === optionIndex} onChange={() => setPicks({ ...picks, [itemIndex]: optionIndex })} />
										<i></i>
										{option}
									</label>
								))}
							</div>
						</fieldset>
					))}
				</div>
				<HintBar hints={puzzle.hints} openCount={openCount || 0} nextWait={nextWait || 0} />
			</div>}
			{!isSocialMatch && <div className="mproto_choiceset">
				{puzzle.items.map((item, itemIndex) => (
					<fieldset className="mproto_choicerow" key={itemIndex}>
						<legend className="lb">{item}</legend>
						<div className={`opts frand${String(itemIndex + 1).padStart(2, '0')}`}>
							<label className={`mproto_mitem i00${friendPicks[itemIndex] ? ' pick' : ''}`}>
								<input type="checkbox" checked={Boolean(friendPicks[itemIndex])} onChange={() => setFriendPicks({ ...friendPicks, [itemIndex]: !friendPicks[itemIndex] })} />
								<i></i>
								{item}
							</label>
							{puzzle.options.map((option, optionIndex) => (
								<label className={`mproto_mitem i${String(optionIndex + 1).padStart(2, '0')}${picks[itemIndex] === optionIndex ? ' pick' : ''}`} key={optionIndex}>
									<input
										type="radio"
										name={`${puzzle.id}-${itemIndex}`}
										checked={picks[itemIndex] === optionIndex}
										onChange={() => setPicks({ ...picks, [itemIndex]: optionIndex })}
									/>
									<i></i>
									{option}
								</label>
							))}
						</div>
					</fieldset>
				))}
			</div>}

			<div className="mproto_center">
				{/* {!filled && <p className="muted">{puzzle.items.length}개 문항을 모두 고르면 확인할 수 있습니다.</p>} */}
				{isSocialMatch && onBack && <button type="button" className="btn btn_kwg mproto_btn" onClick={onBack}>이전</button>}
				<button type="button" className="btn btn_wbb mproto_btn" disabled={!filled} onClick={submit}>확인</button>
			</div>

			<AnswerBox demo={demo}>
				문항을 모두 고른 뒤 <strong>확인</strong>. 네 문항이 전부 맞아야 통과합니다. — {puzzle.answerIndexes.map((answer, index) => (
					<code key={index}>{puzzle.items[index]} → {puzzle.options[answer]}</code>
				))}
			</AnswerBox>
		</>
	)
}

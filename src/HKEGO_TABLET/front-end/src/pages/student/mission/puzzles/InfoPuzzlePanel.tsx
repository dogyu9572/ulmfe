// 판정 없는 안내 화면 패널 — 미션3 E-16처럼 문제(암기) 화면과 입력 화면이 분리된 구성에서 앞 화면을 담당
import type { InfoPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

export const InfoPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: InfoPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => (
	<>
		{puzzle.imageUrl && <div className="mproto_map"><img src={puzzle.imageUrl} alt="" /></div>}
		{!puzzle.imageUrl && puzzle.imagePlaceholder && <div className="mproto_imgslot">{puzzle.imagePlaceholder}</div>}
		{puzzle.displayText && <div className="mproto_display">{puzzle.displayText}</div>}
		{puzzle.notice && <div className="mproto_hintbar" style={{ justifyContent: 'center' }}>{puzzle.notice}</div>}
		<div className="mproto_center">
			<button type="button" className="btn btn_wbb mproto_btn" onClick={() => onSubmit(true)}>{puzzle.buttonLabel || '다음'}</button>
		</div>
		{puzzle.answerNote && <AnswerBox demo={demo}>{puzzle.answerNote}</AnswerBox>}
	</>
)

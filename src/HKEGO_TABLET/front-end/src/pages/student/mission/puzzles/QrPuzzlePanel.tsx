// E6 QR 수집 패널 (추가미션) — 정답 판정 없는 수집형. 스캔할 때마다 가려진 그림이 한 조각씩 열린다
import { useState } from 'react'
import type { QrPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

export const QrPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: QrPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [scanned, setScanned] = useState(0)
	const allScanned = scanned >= puzzle.qrCount
	const leftoverFragments = puzzle.fragmentCount - puzzle.qrCount

	return (
		<>
			<div className="mproto_center">
				<button
					type="button"
					className="btn btn_wbb mproto_btn"
					disabled={allScanned}
					onClick={() => setScanned((count) => Math.min(count + 1, puzzle.qrCount))}
				>QR 스캔하기</button>
			</div>
			<div className="mproto_qr">
				{Array.from({ length: puzzle.fragmentCount }, (_, index) => (
					<div className={`mproto_frag${index < scanned ? ' open' : ''}`} key={index}>{index < scanned ? '✓' : '?'}</div>
				))}
			</div>
			<div className="mproto_center">
				찾은 QR <strong>{scanned} / {puzzle.qrCount}</strong> &nbsp;·&nbsp; 열린 조각 <strong>{scanned} / {puzzle.fragmentCount}</strong>
			</div>
			{allScanned && leftoverFragments > 0 && (
				<div className="mproto_hintbar">
					<span>⚠ QR {puzzle.qrCount}개소를 모두 찾았지만 조각 {puzzle.fragmentCount}개 중 {leftoverFragments}개가 남습니다. <strong>QR 개수와 분할 수가 맞지 않습니다</strong> — 확정 필요(질의 대상).</span>
				</div>
			)}
			{allScanned && (
				<div className="mproto_center">
					<button type="button" className="btn btn_wbb mproto_btn" onClick={() => onSubmit(true)}>완료</button>
				</div>
			)}
			<AnswerBox demo={demo}>
				정답 판정이 없는 수집형입니다. <strong>QR 스캔하기</strong>를 {puzzle.qrCount}번 누르면 완료됩니다.
				{leftoverFragments > 0 && <> {leftoverFragments}조각이 남는 것은 <strong>의도된 개수 불일치 재현</strong>입니다.</>}
			</AnswerBox>
		</>
	)
}

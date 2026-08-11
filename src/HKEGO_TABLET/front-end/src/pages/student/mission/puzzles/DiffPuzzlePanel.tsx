// E4 다른그림찾기 패널 — 오른쪽 그림 % 좌표 히트판정, 5개소를 모두 찾으면 자동 통과
import { MouseEvent, useState } from 'react'
import type { DiffPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

export const DiffPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: DiffPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [found, setFound] = useState<number[]>([])
	const [ghostShown, setGhostShown] = useState(false)
	const total = puzzle.spots.length

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		const rect = event.currentTarget.getBoundingClientRect()
		const x = ((event.clientX - rect.left) / rect.width) * 100
		const y = ((event.clientY - rect.top) / rect.height) * 100
		const hit = puzzle.spots.findIndex((spot, index) =>
			!found.includes(index) && Math.hypot(spot.x - x, spot.y - y) < spot.radius)
		if (hit < 0) return
		const nextFound = [...found, hit]
		setFound(nextFound)
		if (nextFound.length === total) window.setTimeout(() => onSubmit(true), 450)
	}

	return (
		<>
			<div className="mproto_pics">
				<div className="mproto_pic">
					<img src={puzzle.imageAUrl} alt={puzzle.imageALabel || '원본 그림'} />
					{puzzle.imageALabel && <div className="cap">{puzzle.imageALabel}</div>}
				</div>
				<div className="mproto_pic">
					<div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleClick}>
						<img src={puzzle.imageBUrl} alt={puzzle.imageBLabel || '비교 그림'} draggable={false} />
						{found.map((index) => (
							<span className="mproto_spot" style={{ left: `${puzzle.spots[index].x}%`, top: `${puzzle.spots[index].y}%` }} key={index}></span>
						))}
						{ghostShown && puzzle.spots.map((spot, index) => found.includes(index)
							? null
							: <span className="mproto_spot ghost" style={{ left: `${spot.x}%`, top: `${spot.y}%` }} key={`g-${index}`}></span>)}
					</div>
					{puzzle.imageBLabel && <div className="cap">{puzzle.imageBLabel}</div>}
				</div>
			</div>
			<div className="mproto_center">찾은 개수 <strong>{found.length}</strong> / {total}</div>
			<AnswerBox demo={demo}>
				오른쪽 그림에서 다른 곳 {total}군데 — {puzzle.spots.map((spot, index) => (
					<code key={index}>{spot.x}% , {spot.y}%</code>
				))}
				<button type="button" className="mproto_btn_sm" style={{ marginLeft: '8px' }} onClick={() => setGhostShown((v) => !v)}>
					{ghostShown ? '정답 위치 감추기' : '정답 위치 표시'}
				</button>
			</AnswerBox>
		</>
	)
}

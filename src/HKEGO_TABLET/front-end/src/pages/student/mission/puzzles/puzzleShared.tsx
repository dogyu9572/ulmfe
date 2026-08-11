// 미션 퍼즐 공통 — 힌트 훅/바는 실구현·프로토타입 공용, 스텝바·모달·정답표시줄은 프로토타입 시연 전용
import { Fragment, ReactNode, useEffect, useRef, useState } from 'react'
import type { PuzzleHint } from '../../../../state/missionPuzzleTypes'
import { EmphasisText } from '../../../../utils/emphasisText'

/** 시연 도구 상태 — 정답 표시, 힌트 빨리감기, 힌트 지연 압축 배율 */
export type DemoState = {
	showAnswer: boolean
	fastForward: boolean
	speed: number
}

export const ProtoStepBar = ({ label, remain }: { label: string; remain: string }) => (
	<div className="mproto_stepbar">
		<span>{label}</span>
		<span className="mproto_timer">남은시간 <strong>{remain}</strong></span>
	</div>
)

/** \n 줄바꿈 + *강조* 마커를 지원하는 지문 렌더러 */
export const ProtoQuestText = ({ text }: { text: string }) => (
	<>
		{text.split('\n').map((line, index) => (
			<Fragment key={index}>
				{index > 0 && <br />}
				<EmphasisText text={line} />
			</Fragment>
		))}
	</>
)

/** 기존 .popup 마크업 패턴을 재사용한 프로토타입 모달 */
export const ProtoModal = ({ title, onClose, children, wide }: { title: string; onClose?: () => void; children: ReactNode; wide?: boolean }) => (
	<div className={`popup mproto_popup${wide ? ' mproto_popup_wide' : ''} is-active`}>
		<div className="dm" onClick={onClose}></div>
		<div className="inbox">
			{onClose && <button type="button" className="btn_close" onClick={onClose}>닫기</button>}
			<div className="tit">{title}</div>
			<div className="con">{children}</div>
		</div>
	</div>
)

/** 시연용 정답 표시줄 — 프로토타입에서 demo.showAnswer가 켜져 있을 때만 렌더 (실구현에서는 demo가 없어 렌더되지 않는다) */
export const AnswerBox = ({ demo, children }: { demo?: DemoState; children: ReactNode }) =>
	demo?.showAnswer ? <div className="mproto_ansbox"><span className="lb">정답</span>{children}</div> : null

/**
 * 힌트 자동 공개 훅 — 퍼즐 진입 후 경과 시간에 따라 순차 공개.
 * demo가 있으면 지연을 demo.speed로 압축하고 fastForward일 때 tick당 60초를 가산한다 (프로토타입 시연용).
 * 실구현에서는 demo를 넘기지 않아 원문 지연값 그대로 동작한다.
 */
export const usePuzzleHints = (puzzleId: string, hints: PuzzleHint[], demo?: DemoState) => {
	const [elapsed, setElapsed] = useState(0)
	const demoRef = useRef(demo)
	demoRef.current = demo
	const speed = demo?.speed || 1

	useEffect(() => {
		setElapsed(0)
		const timer = window.setInterval(() => setElapsed((sec) => sec + (demoRef.current?.fastForward ? 60 : 1)), 1000)
		return () => window.clearInterval(timer)
	}, [puzzleId])

	const openCount = hints.filter((hint) => elapsed >= hint.at / speed).length
	const next = hints[openCount]
	const nextWait = next ? Math.max(0, Math.ceil(next.at / speed - elapsed)) : 0
	return { openCount, nextWait }
}

/** 힌트바 + 힌트 목록 모달 — 잠긴 힌트는 「이미지 포함」 뱃지만 노출 */
export const HintBar = ({ hints, openCount, nextWait }: { hints: PuzzleHint[]; openCount: number; nextWait: number }) => {
	const [listOpen, setListOpen] = useState(false)
	if (!hints.length) return null

	return (
		<>
			<div className="mproto_hintbar">
				<span>💡 열린 힌트 <strong>{openCount} / {hints.length}</strong>{openCount < hints.length ? ` · 다음 힌트까지 ${nextWait}초` : ' · 모두 열림'}</span>
				<button type="button" className="mproto_btn_sm" onClick={() => setListOpen(true)}>힌트 보기</button>
			</div>
			{listOpen && (
				<ProtoModal title="힌트" onClose={() => setListOpen(false)}>
					<p className="muted">퍼즐 진입 후 경과 시간에 따라 순차 공개됩니다. 이미지가 등록된 힌트는 문구와 함께 이미지가 열립니다.</p>
					<ul className="mproto_hintlist">
						{hints.map((hint, index) => index < openCount
							? (
								<li key={index}>
									<strong>힌트 {index + 1}</strong> <span className="muted">({hint.at}초)</span>
									{hint.imageUrl && <span className="mproto_imgtag">이미지</span>}
									<br />{hint.text}
									{hint.imageUrl && (
										<div className="mproto_hintimg">
											<img src={hint.imageUrl} alt={`힌트 ${index + 1} 이미지`} />
											{hint.imageCaption && <div className="cap">{hint.imageCaption}</div>}
										</div>
									)}
								</li>
							)
							: (
								<li className="lock" key={index}>
									<strong>힌트 {index + 1}</strong> — 잠김 ({hint.at}초 후 열림)
									{hint.imageUrl && <span className="mproto_imgtag">이미지 포함</span>}
								</li>
							))}
					</ul>
					<div className="mproto_mrow"><button type="button" className="btn btn_wbb" onClick={() => setListOpen(false)}>닫기</button></div>
				</ProtoModal>
			)}
		</>
	)
}

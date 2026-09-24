// 미션 퍼즐 공통 — 힌트 훅/바는 실구현·프로토타입 공용, 스텝바·모달·정답표시줄은 프로토타입 시연 전용
import { ReactNode, useEffect, useRef, useState } from 'react'
import type { PuzzleHint } from '../../../../state/missionPuzzleTypes'
import { EmphasisText } from '../../../../utils/emphasisText'

/** 시연 도구 상태 — 정답 표시, 힌트 빨리감기, 힌트 지연 압축 배율 */
export type DemoState = {
	showAnswer: boolean
	fastForward: boolean
	speed: number
	/**
	 * 목 데이터로 도는 프로토타입 화면(mission_proto)에서만 true다.
	 * 실물 없이 퍼즐을 통과시키는 우회 수단은 이 표식으로만 열어야 한다 — 학생 경로에도 demo가 넘어오기 때문이다.
	 */
	proto?: boolean
}

/**
 * 미션 헤더 — step 칩에는 활동 순번만 「Mission1」~「Mission5」로 찍는다.
 * step이 없으면(스토리·완료 화면) 기존처럼 stepLabel의 「—」 앞부분을 쓴다.
 * title은 .subtitle에 들어가는 큰 제목(프로그램명, 예: 소비습관구출작전). 없으면 stepLabel의 「—」 뒷부분을 쓴다.
 */
export const ProtoStepBar = ({ label, remain, step, title }: { label: string; remain: string; step?: number; title?: string }) => {
	const [stepLabel, labelSubtitle] = label.split('—', 2).map((part) => part.trim())
	const subtitle = title || labelSubtitle
	const currentLocation = label.includes('지구존')
		? '지구존'
		: label.includes('미래존')
			? '미래존'
			: label.includes('사회존')
				? '사회존'
				: '러닝도서관'

	return (
		<div className="student_title">
			<div className="step">{step ? `Mission${step}` : stepLabel}</div>
			{subtitle && <div className="subtitle"><strong>{subtitle}</strong></div>}
			<span></span>
			{/* <div className="location">남은시간 <strong>{remain}</strong></div> */}
			<div className="location">{currentLocation}</div>
		</div>
	)
}

/** \n 줄바꿈 + *강조* · **굵게** 마커를 지원하는 지문 렌더러. 줄바꿈 처리는 EmphasisText가 맡는다(마커가 줄을 걸쳐도 깨지지 않게) */
export const ProtoQuestText = ({ text }: { text: string }) => <EmphasisText text={text} />

/**
 * 안내 화면(INFO) 중 콘텐츠 이미지를 카드 박스(.a_card_box) 안에 배경으로 까는 것들 — 퍼즐 id → .imgbox 보조 클래스.
 * 배경 이미지는 src/style.css의 `.a_card_box .imgbox.step_*` 규칙에 있다.
 * 여기 등록된 id는 InfoPuzzlePanel에서 .mproto_imgslot으로 중복 렌더하지 않는다.
 */
export const INTRO_IMGBOX_CLASS: Record<string, string> = {
	'm1-future-diff-intro': 'step_future',
	'm1-future-diff-intro2': 'step_future2',
	'm1-social-match-intro': 'step_society',
	'shared-final-memory-intro': 'step_final',
	'm2-future-sort-intro': 'step_pandemic',
	'm2-social-grid-intro': 'step_village',
	'm3-earth-intro': 'step_consume',
	'm3-future-intro': 'step_career',
	'm3-social-intro': 'step_peace'
}

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
				<span className="flex"><span className="hint">열린 힌트 <strong>{openCount} / {hints.length}</strong></span><span className="next_hint">{openCount < hints.length ? `다음 힌트까지 ${nextWait}초` : '모두 열림'}</span></span>
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

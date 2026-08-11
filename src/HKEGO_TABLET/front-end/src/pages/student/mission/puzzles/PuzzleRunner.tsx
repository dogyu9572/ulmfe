// 존 단위 퍼즐 순차 실행 허브 — 지문·힌트·오답퀴즈·정답 모달을 소유하고 판정은 엔진 패널 콜백으로 받는다 (실화면·프로토타입 공용)
import { useState } from 'react'
import type { MissionPuzzle, QuizQuestion } from '../../../../state/missionPuzzleTypes'
import type { MissionZonePuzzles } from '../../../../state/missionPuzzleData'
import { puzzleAnswerValue } from '../../../../state/missionPuzzleData'
import { BoardFlipPuzzlePanel } from './BoardFlipPuzzlePanel'
import { CodePuzzlePanel } from './CodePuzzlePanel'
import { DiffPuzzlePanel } from './DiffPuzzlePanel'
import { GridSequencePuzzlePanel } from './GridSequencePuzzlePanel'
import { InfoPuzzlePanel } from './InfoPuzzlePanel'
import { JamoCodePuzzlePanel } from './JamoCodePuzzlePanel'
import { MatchPuzzlePanel } from './MatchPuzzlePanel'
import { MemoryPuzzlePanel } from './MemoryPuzzlePanel'
import { QrPuzzlePanel } from './QrPuzzlePanel'
import { SelectPuzzlePanel } from './SelectPuzzlePanel'
import { SlotPuzzlePanel } from './SlotPuzzlePanel'
import { SortPuzzlePanel } from './SortPuzzlePanel'
import { DemoState, HintBar, ProtoModal, ProtoQuestText, ProtoStepBar, usePuzzleHints } from './puzzleShared'

// 오답 시 입력 초기화는 각 엔진 패널이 스스로 처리한다 (정렬·기억력처럼 상태를 유지해야 하는 엔진도 있으므로)
type Flow =
	| { kind: 'wrong' }
	| { kind: 'quizLoading' }
	| { kind: 'quiz'; question: QuizQuestion }
	| { kind: 'quizRight'; question: QuizQuestion }
	| { kind: 'quizWrong'; question: QuizQuestion }
	| { kind: 'quizUnavailable'; message: string; excludeQuestionId?: number }
	| { kind: 'correct' }
	| null

type PanelProps = {
	puzzle: MissionPuzzle
	demo?: DemoState
	onSubmit: (ok: boolean) => void
	onRequestQuiz: () => void
}

const PuzzlePanel = ({ puzzle, demo, onSubmit, onRequestQuiz }: PanelProps) => {
	switch (puzzle.type) {
		case 'INFO': return <InfoPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E1_CODE': return <CodePuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E1_JAMO': return <JamoCodePuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E1_SLOT': return <SlotPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E2_BOARD': return <BoardFlipPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E2_GRID': return <GridSequencePuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E3_SORT': return <SortPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E3_SELECT': return <SelectPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E3_MATCH': return <MatchPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E4_DIFF': return <DiffPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E5_MEMORY': return <MemoryPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} onRequestQuiz={onRequestQuiz} />
		case 'E6_QR': return <QrPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
	}
}

type PuzzleRunnerProps = {
	zone: MissionZonePuzzles
	/** 오답 시 출제할 문제은행. 비어 있으면 퀴즈를 건너뛰고 오답 모달만 띄운다 */
	quizBank: QuizQuestion[]
	/** 실제 미션에서 관리자 문제은행 문항을 1개 가져온다. 프로토타입은 quizBank를 그대로 쓴다 */
	loadQuiz?: (excludeQuestionId?: number) => Promise<QuizQuestion | null>
	/** 실제 미션 문항의 정답은 서버에서 판정한다 */
	checkQuizAnswer?: (questionId: number, answerIndex: number) => Promise<{ correct: boolean; explanation?: string }>
	/** 프로토타입 시연 도구 상태. 실화면에서는 넘기지 않는다 */
	demo?: DemoState
	/** 상단 스텝바를 러너가 직접 그린다 (프로토타입 전용 — 실화면은 기존 student_title 헤더를 쓴다) */
	stepBar?: { remain: string }
	/** 이미 푼 퍼즐의 정답값 (퍼즐 id 기준) — 재진입 시 다음 퍼즐부터 시작한다 */
	solvedAnswers?: Record<string, string>
	/** 퍼즐을 맞힐 때마다 호출 — 실화면에서 제출할 답안을 모은다 */
	onPuzzleSolved?: (puzzle: MissionPuzzle, answerValue: string) => void
	onZoneComplete: () => void
}

export const PuzzleRunner = ({ zone, quizBank, loadQuiz, checkQuizAnswer, demo, stepBar, solvedAnswers, onPuzzleSolved, onZoneComplete }: PuzzleRunnerProps) => {
	// 재진입 시 이미 푼 퍼즐은 건너뛴다. 답이 없는 INFO는 기록이 남지 않아 다시 보여준다
	const firstUnsolved = zone.puzzles.findIndex((item) => !solvedAnswers?.[item.id])
	const [puzzleIndex, setPuzzleIndex] = useState(firstUnsolved < 0 ? zone.puzzles.length - 1 : firstUnsolved)
	const [flow, setFlow] = useState<Flow>(null)
	const [quizBusy, setQuizBusy] = useState(false)
	const puzzle = zone.puzzles[puzzleIndex]
	const isLast = puzzleIndex === zone.puzzles.length - 1
	const hintState = usePuzzleHints(puzzle.id, puzzle.hints, demo)

	const pickQuiz = () => (quizBank.length > 0 ? quizBank[Math.floor(Math.random() * quizBank.length)] : null)

	// 오답 확인 후 — 은행에 문항이 있으면 퀴즈로, 비어 있으면 바로 퍼즐 재도전
	const afterWrong = async (excludeQuestionId?: number) => {
		if (quizBusy) return
		setQuizBusy(true)
		setFlow({ kind: 'quizLoading' })
		try {
			const question = loadQuiz ? await loadQuiz(excludeQuestionId) : pickQuiz()
			setFlow(question
				? { kind: 'quiz', question }
				: { kind: 'quizUnavailable', message: '등록된 사용 문제를 찾을 수 없습니다.', excludeQuestionId })
		} catch (error) {
			setFlow({
				kind: 'quizUnavailable',
				message: error instanceof Error ? error.message : '문제를 불러오지 못했습니다.',
				excludeQuestionId
			})
		} finally {
			setQuizBusy(false)
		}
	}

	const answerQuiz = async (question: QuizQuestion, answerIndex: number) => {
		if (quizBusy) return
		if (!checkQuizAnswer) {
			setFlow(answerIndex === question.answerIndex
				? { kind: 'quizRight', question }
				: { kind: 'quizWrong', question })
			return
		}
		if (!question.id) {
			setFlow({ kind: 'quizUnavailable', message: '문항 정보가 올바르지 않습니다.' })
			return
		}
		setQuizBusy(true)
		try {
			const result = await checkQuizAnswer(question.id, answerIndex)
			setFlow(result.correct
				? { kind: 'quizRight', question: { ...question, explanation: result.explanation } }
				: { kind: 'quizWrong', question })
		} catch (error) {
			setFlow({
				kind: 'quizUnavailable',
				message: error instanceof Error ? error.message : '정답을 확인하지 못했습니다.',
				excludeQuestionId: question.id
			})
		} finally {
			setQuizBusy(false)
		}
	}

	const handleSubmit = (ok: boolean) => {
		if (!ok) {
			setFlow({ kind: 'wrong' })
			return
		}
		const answerValue = puzzleAnswerValue(puzzle)
		if (answerValue) onPuzzleSolved?.(puzzle, answerValue)
		if (puzzle.correctMessage) {
			setFlow({ kind: 'correct' })
			return
		}
		advance()
	}

	const advance = () => {
		setFlow(null)
		// 존 내부 퍼즐 전환은 원본 프로토타입처럼 모달 없이 바로 이어진다
		if (isLast) onZoneComplete()
		else setPuzzleIndex((index) => index + 1)
	}

	return (
		<>
			{stepBar && <ProtoStepBar label={puzzle.stepLabel || zone.name} remain={stepBar.remain} />}
			<div className="mproto_stage">
				<div className="mproto_quest">
					<ProtoQuestText text={puzzle.quest} />
					{puzzle.type === 'E2_BOARD' && puzzle.blanksLabel && <div className="mproto_blanks">{puzzle.blanksLabel}</div>}
				</div>
				<PuzzlePanel
					key={puzzle.id}
					puzzle={puzzle}
					demo={demo}
					onSubmit={handleSubmit}
					onRequestQuiz={() => void afterWrong()}
				/>
				<HintBar hints={puzzle.hints} openCount={hintState.openCount} nextWait={hintState.nextWait} />
			</div>

			{flow?.kind === 'wrong' && (
				<ProtoModal title="미션 판정">
					<div><span className="mproto_badge n">오답</span></div>
					<div className="mproto_qz">틀렸습니다. 다시 한번 생각해 보세요.</div>
					<div className="mproto_mrow">
						<button type="button" className="btn btn_wbb" disabled={quizBusy} onClick={() => void afterWrong()}>확인</button>
					</div>
				</ProtoModal>
			)}

			{flow?.kind === 'quizLoading' && (
				<ProtoModal title="지속가능발전교육 문제">
					<div className="mproto_qz">문제은행에서 문제를 불러오고 있습니다.</div>
				</ProtoModal>
			)}

			{flow?.kind === 'quiz' && (
				<ProtoModal title="지속가능발전교육 문제">
					<p className="muted">오답 시 문제은행에서 1문항이 무작위로 출제됩니다.</p>
					<div className="mproto_qz">{flow.question.question}</div>
					{flow.question.imageUrl && <div className="mproto_map"><img src={flow.question.imageUrl} alt="" /></div>}
					<div className="mproto_opts">
						{flow.question.options.map((option, index) => (
							<button
								type="button"
								className="mproto_opt"
								key={index}
								disabled={quizBusy}
								onClick={() => void answerQuiz(flow.question, index)}
							>{option}</button>
						))}
					</div>
				</ProtoModal>
			)}

			{flow?.kind === 'quizRight' && (
				<ProtoModal title="지속가능발전교육 문제">
					<div><span className="mproto_badge o">정답</span></div>
					<div className="mproto_qz">잘했어요! 다시 퍼즐에 도전해 보세요.</div>
					{flow.question.explanation && <p className="muted">{flow.question.explanation}</p>}
					<div className="mproto_mrow">
						<button type="button" className="btn btn_wbb" onClick={() => setFlow(null)}>퍼즐 재도전</button>
					</div>
				</ProtoModal>
			)}

			{flow?.kind === 'quizWrong' && (
				<ProtoModal title="지속가능발전교육 문제">
					<div><span className="mproto_badge n">오답</span></div>
					<div className="mproto_qz">아쉬워요. 한 문제 더 풀어볼까요?</div>
					<div className="mproto_mrow">
						<button type="button" className="btn btn_wbb" disabled={quizBusy} onClick={() => void afterWrong(flow.question.id)}>다음 문제</button>
					</div>
				</ProtoModal>
			)}

			{flow?.kind === 'quizUnavailable' && (
				<ProtoModal title="지속가능발전교육 문제">
					<div className="mproto_qz">{flow.message}</div>
					<div className="mproto_mrow">
						<button type="button" className="btn btn_wbb" disabled={quizBusy} onClick={() => void afterWrong(flow.excludeQuestionId)}>다시 불러오기</button>
						<button type="button" className="btn btn_wbb" disabled={quizBusy} onClick={() => setFlow(null)}>퍼즐 재도전</button>
					</div>
				</ProtoModal>
			)}

			{flow?.kind === 'correct' && (
				<ProtoModal title="미션 판정">
					<div><span className="mproto_badge o">정답</span></div>
					<div className="mproto_qz"><ProtoQuestText text={puzzle.correctMessage || '정답입니다.'} /></div>
					{puzzle.nextZone?.mapImageUrl && (
						<div className="mproto_map">
							<img src={puzzle.nextZone.mapImageUrl} alt={`${puzzle.nextZone.name} 위치 안내`} />
							{puzzle.nextZone.pingX != null && puzzle.nextZone.pingY != null && (
								<span className="mproto_ping" style={{ left: `${puzzle.nextZone.pingX}%`, top: `${puzzle.nextZone.pingY}%` }}></span>
							)}
						</div>
					)}
					<div className="mproto_mrow">
						<button type="button" className="btn btn_wbb" onClick={advance}>
							{puzzle.nextZone ? `${puzzle.nextZone.name} 도착 · 탐색 시작` : '다음'}
						</button>
					</div>
				</ProtoModal>
			)}
		</>
	)
}

// 존 단위 퍼즐 순차 실행 허브 — 지문·힌트·오답퀴즈·정답 모달을 소유하고 판정은 엔진 패널 콜백으로 받는다 (실화면·프로토타입 공용)
import { useState } from 'react'
import type { MissionPuzzle, QuizQuestion } from '../../../../state/missionPuzzleTypes'
import type { MissionZonePuzzles } from '../../../../state/missionPuzzleData'
import { puzzleAnswerValue } from '../../../../state/missionPuzzleData'
import { BoardFlipPuzzlePanel } from './BoardFlipPuzzlePanel'
import { CodeAnswerNote, CodeInputActions, CodeInputBoard, CodePuzzlePanel, useCodeInput } from './CodePuzzlePanel'
import { DiffPuzzlePanel } from './DiffPuzzlePanel'
import { CipherBoard, CipherPuzzlePanel } from './CipherPuzzlePanel'
import { InfoPuzzlePanel } from './InfoPuzzlePanel'
import { JamoCodePuzzlePanel } from './JamoCodePuzzlePanel'
import { ChoiceSetPuzzlePanel } from './ChoiceSetPuzzlePanel'
import { MemoryPuzzlePanel } from './MemoryPuzzlePanel'
import { QrPuzzlePanel } from './QrPuzzlePanel'
import { SelectPuzzlePanel } from './SelectPuzzlePanel'
import { SlotActions, SlotAnswerNote, SlotPuzzlePanel, SlotReels, useSlotInput } from './SlotPuzzlePanel'
import { SortPuzzlePanel } from './SortPuzzlePanel'
import { DemoState, HintBar, INTRO_IMGBOX_CLASS, ProtoModal, ProtoQuestText, ProtoStepBar, usePuzzleHints } from './puzzleShared'
import { EmphasisText } from '../../../../utils/emphasisText'

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
	onBack?: () => void
	onRequestQuiz: () => void
	openCount: number
	nextWait: number
}

const PuzzlePanel = ({ puzzle, demo, onSubmit, onBack, onRequestQuiz, openCount, nextWait }: PanelProps) => {
	switch (puzzle.type) {
		case 'INFO': return <InfoPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} onBack={onBack} />
		case 'E1_CODE': return <CodePuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E1_JAMO': return <JamoCodePuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E1_SLOT': return <SlotPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E2_BOARD': return <BoardFlipPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} openCount={openCount} nextWait={nextWait} />
		case 'E2_CIPHER': return <CipherPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} openCount={openCount} nextWait={nextWait} />
		case 'E3_SORT': return <SortPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} onBack={onBack} />
		case 'E3_SELECT': return <SelectPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} />
		case 'E3_CHOICE_SET': return <ChoiceSetPuzzlePanel puzzle={puzzle} demo={demo} onSubmit={onSubmit} onBack={onBack} openCount={openCount} nextWait={nextWait} />
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
	/** step: 활동 순번(1~5) — 헤더 칩에 「Mission{step}」으로 찍힌다. title: .subtitle에 들어가는 프로그램명 */
	stepBar?: { remain: string; step?: number; title?: string }
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
	const isSdgsPuzzle = puzzle.id === 'm1-future-sdgs'
	const isFutureDiff1 = puzzle.id === 'm1-future-diff'
	const isSocialMatch = puzzle.id === 'm1-social-match'
	const isSocialLock = puzzle.id === 'm1-social-lock'
	// 입력판을 지문 카드 안쪽 아래에 두는 퍼즐 — 팬데믹의 역사(정렬판), 착한 소비 입력(방향키판)
	const isFutureSort = puzzle.id === 'm2-future-sort'
	const isEarthArrow = puzzle.id === 'm3-earth-arrow'
	const isFutureSlot = puzzle.id === 'm3-future-slot'
	const isSocialCode = puzzle.id === 'm3-social-code'
	const panelInCard = isFutureSort || isEarthArrow || isFutureSlot || isSocialCode
	// 힌트바까지 카드 안에 넣는 퍼즐 — 카드 밖에서는 그리지 않는다
	const hintBarInCard = isFutureSlot || isSocialCode
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
		// 정답이 임시인 퍼즐은 진행만 시키고 답안을 넘기지 않는다 — 지어낸 값이 학습 결과에 저장되면 안 된다
		if (answerValue && !puzzle.dummy) onPuzzleSolved?.(puzzle, answerValue)
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

	const goBack = () => {
		if (puzzleIndex === 0) return
		setFlow(null)
		setPuzzleIndex((index) => index - 1)
	}

	// 입력판은 지문 카드 안, 조작 버튼은 카드 밖에 그린다 — 두 곳이 같은 입력 상태를 써야 해서 여기서 들고 있는다
	const codeInput = useCodeInput((isEarthArrow || isSocialCode) && puzzle.type === 'E1_CODE' ? puzzle : null, handleSubmit)
	const slotInput = useSlotInput(isFutureSlot && puzzle.type === 'E1_SLOT' ? puzzle : null, handleSubmit)

	return (
		<>
			{stepBar && <ProtoStepBar label={puzzle.stepLabel || zone.name} remain={stepBar.remain} step={stepBar.step} title={stepBar.title} />}
			<div className="mproto_stage page_quest">
				<div className="wbox a_card_box greenbox pdbox">
					<div className="card_top">문항풀이 #{puzzleIndex + 1}</div>
					{puzzle.cardTitle && <div className="tt">{puzzle.cardTitle}</div>}
					{isEarthArrow
						? <p className="quest_arrow"><ProtoQuestText text={puzzle.quest} /></p>
						: <ProtoQuestText text={puzzle.quest} />}
					{puzzle.type === 'INFO' && puzzle.imagePlaceholder && INTRO_IMGBOX_CLASS[puzzle.id] && <div className={`imgbox ${INTRO_IMGBOX_CLASS[puzzle.id]}`}>{puzzle.imagePlaceholder}</div>}
					{puzzle.type === 'E2_BOARD' && puzzle.blanksLabel && <div className="mproto_blanks">{puzzle.blanksLabel}</div>}
					{isSocialMatch && puzzle.type === 'E3_CHOICE_SET' && (
						<div className="mproto_clues">
							{puzzle.clues.map((clue, index) => <span key={index}><EmphasisText text={clue} /></span>)}
						</div>
					)}
					{/* 지구의 온도 변화(미션2 지구존 E-09)에만 카드 맨 아래 녹색 보드를 둔다 */}
					{puzzle.id === 'm2-earth-jamo' && <div className="green_board">
						{/* 지구온도상승막자 */}
						{/* <p>지구의 온도 변화</p>
						<p>겨울이 춥지 않고, 여름이 너무 길어 지구가 더워진 것처럼 날씨가 이상하다고 느낀 적 있나요?</p>
						<p>이 전시에서는 지구의 온도가 올라가면서 기후와 생태계에 어떤 영향을 미쳤는지 알아봅니다.</p>
						<p className="pb">또한 지금의 지구 온도 변화와 사람들이 지구에 남기는 흔적들이 지구의 미래에 어떤 영향을 미칠지 이야기합니다.</p> */}
						
						<p><span><i></i><i></i></span>구의 온도 변화</p>
						<p>겨울이 춥지 않고, 여름이 너무 길어 지<span><i></i><i></i></span>가 더워진 것처럼 날씨가 이상하다고 느낀 <span><i></i><i></i><i></i></span>나요?</p>
						<p>이 전시에서는 지구의 온<span><i></i><i></i></span>가 올라가면서 기후와 <span><i></i>ㅏㅇ</span>태계에 어떤 영향을 미쳤는지 <span>ㅅ<i></i>ㅇ</span>아봅니다.</p>
						<p>또한 지금의 지구 온도 변화와 사람들이 지구에 남기는 흔<span>ㅁ<i></i>ㄱ</span>들이 지구의 미래에 어떤 영향을 미칠지 <span>ㅈ<i></i></span>기합니다.</p>
					</div>}
					{/* 암호 해독(미션2 사회존 S-07)의 암호표는 카드 안쪽 아래에 둔다 — 입력판·키패드는 카드 밖에 남는다 */}
					{puzzle.type === 'E2_CIPHER' && <CipherBoard puzzle={puzzle} />}
					{/* 팬데믹의 역사(미션2 미래존 F-06)는 정렬판(.mproto_mcol)을 카드 안쪽 아래에 붙인다 */}
					{isFutureSort && (
						<PuzzlePanel
							key={puzzle.id}
							puzzle={puzzle}
							demo={demo}
							onSubmit={handleSubmit}
							onBack={goBack}
							onRequestQuiz={() => void afterWrong()}
							openCount={hintState.openCount}
							nextWait={hintState.nextWait}
						/>
					)}
					{/* 착한 소비 입력(미션3 지구존 E-16)은 방향키판(.mproto_slots + .mproto_pad)만 카드 안에 둔다 — 지우기·확인은 카드 밖 */}
					{isEarthArrow && <CodeInputBoard input={codeInput} />}
					{/* 평화로운 사회와 나(미션3 사회존 S-01)는 일기(.letter_area)와 입력판부터 힌트바까지 카드 안에 둔다 — 확인 키는 키패드에 있다 */}
					{isSocialCode && (
						<>
							<div className="letter_area">
								<p>2050년 10월 15일의 일기</p>
								<p>오늘은 정말 특별한 연결을 경험한 하루였다. 모든 대중교통이 AI 자율주행으로 바뀐 2050년이지만,</p>
								<p>오늘 나는 우연히 은퇴하신 옛날 버스기사님을 뵙게 되었다.</p>
								<p>기사님은 예전에 직접 운전대를 잡으시던 시절의 이야기를 아주 재미있게 들려주셨다.</p>
								<p>오늘 내가 외출할 때 이용한 이동 수단은 낡았지만 여전히 빠른 친환경 오토바이였다.</p>
								<p>바람을 가르며 도착한 곳은 현실 공간이 아니라, 캡슐형 기기를 통해 접속하는 메타버스 온라인 게임 서버였다.</p>
								<p>우리는 게임 속에서 몬스터를 사냥하거나 전투를 하는 대신, 다른 유저들과 함께 가상의 거대한 평화의 탑을</p>
								<p>디자인하고 색칠하는 뜻깊은 예술활동을 하며 시간을 보냈다.</p>
								<p>서로 다른 시대를 산 우리가 이렇게 만나 무언가를 함께 만들 수 있다는 것이 참 신기한 하루다.</p>
							</div>
							<CodeInputBoard input={codeInput} />
							{puzzle.type === 'E1_CODE' && <CodeAnswerNote puzzle={puzzle} demo={demo} />}
							<HintBar hints={puzzle.hints} openCount={hintState.openCount} nextWait={hintState.nextWait} />
						</>
					)}
					{/* 나의 미래직업과 AI(미션3 미래존 F-08)는 칸판부터 힌트바까지 카드 안에 둔다 — 완료·이전은 카드 밖 */}
					{isFutureSlot && (
						<>
							<SlotReels input={slotInput} />
							<SlotAnswerNote input={slotInput} demo={demo} />
							<HintBar hints={puzzle.hints} openCount={hintState.openCount} nextWait={hintState.nextWait} />
						</>
					)}
				</div>
				{/* 더미 문제 경고 — 요청에 따라 가려 둔다. 되살리려면 주석을 풀면 된다
				{puzzle.dummy && (
					<div className="mproto_caution">⚠ 전시 콘텐츠가 도착하기 전의 임시 문제입니다. 정답과 항목이 확정되지 않아 <strong>이 문제의 답안은 학습 결과로 저장되지 않습니다</strong>.</div>
				)} */}
				{panelInCard ? (
					// 입력판은 카드 안에서 이미 그렸다 — 조작 버튼과 힌트바만 카드 밖에 남긴다 (hints가 비면 힌트바는 렌더되지 않는다)
					<>
						{isEarthArrow && <CodeInputActions input={codeInput} />}
						{isEarthArrow && puzzle.type === 'E1_CODE' && <CodeAnswerNote puzzle={puzzle} demo={demo} />}
						{isFutureSlot && <SlotActions input={slotInput} onBack={goBack} />}
						{/* 힌트바를 카드 안에 넣은 퍼즐은 여기서 또 그리지 않는다 */}
						{!hintBarInCard && <HintBar hints={puzzle.hints} openCount={hintState.openCount} nextWait={hintState.nextWait} />}
					</>
				) : puzzle.type === 'E2_BOARD' || puzzle.type === 'E2_CIPHER' ? (
					// 두 엔진은 힌트바를 패널 안에서 직접 그린다
					<PuzzlePanel
						key={puzzle.id}
						puzzle={puzzle}
						demo={demo}
						onSubmit={handleSubmit}
						onBack={goBack}
						onRequestQuiz={() => void afterWrong()}
						openCount={hintState.openCount}
						nextWait={hintState.nextWait}
					/>
				) : isSocialMatch ? (
					<PuzzlePanel
						key={puzzle.id}
						puzzle={puzzle}
						demo={demo}
						onSubmit={handleSubmit}
						onBack={goBack}
						onRequestQuiz={() => void afterWrong()}
						openCount={hintState.openCount}
						nextWait={hintState.nextWait}
					/>
				) : isSdgsPuzzle || isFutureDiff1 || isSocialLock ? (
					<div className="wbox mproto_slots_wrap mt">
						<PuzzlePanel
							key={puzzle.id}
							puzzle={puzzle}
							demo={demo}
							onSubmit={handleSubmit}
							onBack={goBack}
							onRequestQuiz={() => void afterWrong()}
							openCount={hintState.openCount}
							nextWait={hintState.nextWait}
						/>
						<HintBar hints={puzzle.hints} openCount={hintState.openCount} nextWait={hintState.nextWait} />
					</div>
				) : (
					<>
						<PuzzlePanel
							key={puzzle.id}
							puzzle={puzzle}
							demo={demo}
							onSubmit={handleSubmit}
							onBack={goBack}
							onRequestQuiz={() => void afterWrong()}
							openCount={hintState.openCount}
							nextWait={hintState.nextWait}
						/>
						<HintBar hints={puzzle.hints} openCount={hintState.openCount} nextWait={hintState.nextWait} />
					</>
				)}
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

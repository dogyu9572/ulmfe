import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { fetchTabletSession, submitTabletMissionFinal, TabletQuestionnaireAnswer, TabletQuestionnaireQuestion } from '../../api/tabletApi'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { saveTabletStudentFlowSession, studentFlowDisplayName, studentFlowExploreStepByCode } from '../../state/tabletStudentFlowSession'

type PopupName = 'evaluation' | 'questionnaire' | 'completed' | null
type AnswerMap = Record<string, string>

const agreement = ['매우 그렇다', '그렇다', '보통이다', '아니다', '매우 아니다']
const questionKey = (question: TabletQuestionnaireQuestion) => String(question.qstnSn)
const savedQuestionValues = (flowSession: ReturnType<typeof useRequiredTabletStudentFlowSession>, ansTypeCd: string) => {
	const selectedStudentIds = new Set((flowSession?.selectedStudents ?? []).map((student) => student.stdntSn))
	return (flowSession?.savedAnswers ?? [])
		.filter((answer) => selectedStudentIds.has(answer.stdntSn) && answer.ansTypeCd === ansTypeCd)
		.reduce<AnswerMap>((acc, answer) => {
			if (answer.qstnSn) acc[String(answer.qstnSn)] = answer.ansCn || ''
			return acc
		}, {})
}

const buildAnswers = (questions: TabletQuestionnaireQuestion[], values: AnswerMap): TabletQuestionnaireAnswer[] => questions
	.map((question) => ({ qstnrSn: question.qstnrSn, qstnSn: question.qstnSn, qstnCn: question.qstnCn, ansCn: (values[questionKey(question)] || '').trim() }))
	.filter((answer) => answer.ansCn)

const isComplete = (questions: TabletQuestionnaireQuestion[], values: AnswerMap) => questions.length === 0 || questions.every((question) => Boolean((values[questionKey(question)] || '').trim()))

const QuestionnairePopup = ({ id, title, questions, values, onChange, open, onClose, onSave }: {
	id: string
	title: string
	questions: TabletQuestionnaireQuestion[]
	values: AnswerMap
	onChange: (values: AnswerMap) => void
	open: boolean
	onClose: () => void
	onSave: () => void
}) => {
	const setValue = (question: TabletQuestionnaireQuestion, value: string) => onChange({ ...values, [questionKey(question)]: value })
	return (
		<div className={`popup pop_questionnaire${open ? ' is-active' : ''}`} id={id}>
			<div className="dm" onClick={onClose}></div>
			<div className="inbox">
				<button type="button" className="btn_close" onClick={onClose}>닫기</button>
				<div className="tit">{title}</div>
				<div className="con scroll_wrap">
					<div className="scroll">
						{questions.length > 0 ? <ul className="list">
							{questions.map((question) => {
								const key = questionKey(question)
								const currentValue = values[key] || ''
								const isText = question.ansTypeCd === 'TEXT'
								return <li key={key}><div className="tt">{question.qstnCn}</div>{isText ? <textarea cols={30} rows={10} className="text w100p" value={currentValue} onChange={(event) => setValue(question, event.target.value)} placeholder="내용을 입력해주세요."></textarea> : <ul className="checkradio_select set5">{agreement.map((label, index) => {
									const idForLabel = `${id}_${key}_${index + 1}`
									return <li className="box" key={idForLabel}><input type="radio" name={`${id}_${key}`} id={idForLabel} checked={currentValue === label} onChange={() => setValue(question, label)} /><label htmlFor={idForLabel}><span><i></i>{label}</span></label></li>
								})}</ul>}</li>
							})}
						</ul> : <div className="wbox">관리자에 등록된 문항이 없습니다.</div>}
						<div className="btns_btm"><button type="button" className="btn btn_kwg btn_clo" onClick={onClose}>이전</button><button type="button" className="btn btn_wbb btn_end" onClick={onSave}>저장</button></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export const QuestEndPage = () => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	const [popup, setPopup] = useState<PopupName>(null)
	const [saving, setSaving] = useState(false)
	const [evaluationValues, setEvaluationValues] = useState<AnswerMap>(() => savedQuestionValues(flowSession, 'EVALUATION'))
	const [surveyValues, setSurveyValues] = useState<AnswerMap>(() => savedQuestionValues(flowSession, 'SURVEY'))
	const [evaluationSaved, setEvaluationSaved] = useState(() => isComplete(flowSession?.evaluationQuestions ?? [], savedQuestionValues(flowSession, 'EVALUATION')))
	const [surveySaved, setSurveySaved] = useState(() => isComplete(flowSession?.surveyQuestions ?? [], savedQuestionValues(flowSession, 'SURVEY')))

	const step4 = flowSession ? studentFlowExploreStepByCode(flowSession, 'STEP4') : null
	const title = step4?.title || '정리·일반화'
	const location = step4?.place || ''
	const evaluationQuestions = useMemo(() => flowSession?.evaluationQuestions ?? [], [flowSession])
	const surveyQuestions = useMemo(() => flowSession?.surveyQuestions ?? [], [flowSession])

	useEffect(() => {
		const nextEvaluationValues = savedQuestionValues(flowSession, 'EVALUATION')
		const nextSurveyValues = savedQuestionValues(flowSession, 'SURVEY')
		setEvaluationValues(nextEvaluationValues)
		setSurveyValues(nextSurveyValues)
		setEvaluationSaved(isComplete(evaluationQuestions, nextEvaluationValues))
		setSurveySaved(isComplete(surveyQuestions, nextSurveyValues))
	}, [evaluationQuestions, flowSession, surveyQuestions])

	if (!flowSession) return null

	const submitFinal = async () => {
		if (!isComplete(evaluationQuestions, evaluationValues)) {
			alert('평가지를 작성해주세요.')
			return
		}
		if (!isComplete(surveyQuestions, surveyValues)) {
			alert('설문지를 작성해주세요.')
			return
		}
		try {
			setSaving(true)
			await submitTabletMissionFinal(flowSession.rsvtSn, {
				studentSns: flowSession.selectedStudents.map((student) => student.stdntSn),
				heroName: '',
				updateHero: false,
				updateEvaluation: true,
				updateSurvey: true,
				complete: true,
				evaluationAnswers: buildAnswers(evaluationQuestions, evaluationValues),
				surveyAnswers: buildAnswers(surveyQuestions, surveyValues)
			})
			const nextSession = await fetchTabletSession()
			saveTabletStudentFlowSession(nextSession, flowSession.selectedStudents.map((student) => student.stdntSn))
			setPopup('completed')
		} catch (error) {
			alert(error instanceof Error ? error.message : '최종 저장 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{title}</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<div className="student_title"><div className="step">STEP 4 정리·일반화</div><div className="subtitle"><strong>{title}</strong></div><div className="location">{location}</div></div>
				<div className="page_quest">
					<h2 className="stit icon_think">오늘 활동 돌아보기</h2>
					<div className="script_tabs_wrap"><div className="cont_area wbox"><div className="star_box"><h3 className="titbox">{studentFlowDisplayName(flowSession)} 학생의 활동을 마무리합니다.</h3><ul className="conbox flex_center end_area"><li><button type="button" className="btn btn01 btn_open" data-target="pop_evaluation" onClick={() => setPopup('evaluation')}>평가지 작성하기<span className="state">{evaluationSaved ? '완료' : evaluationQuestions.length > 0 ? '미완료' : '데이터 없음'}</span></button></li><li><button type="button" className="btn btn02 btn_open" data-target="pop_questionnaire" onClick={() => setPopup('questionnaire')}>설문지 작성하기<span className="state">{surveySaved ? '완료' : surveyQuestions.length > 0 ? '미완료' : '데이터 없음'}</span></button></li></ul></div></div></div>
					<div className="btns_btm"><button type="button" className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button type="button" className="btn btn_wbb btn_open" data-target="pop_completed" onClick={submitFinal} disabled={saving}>{saving ? '저장 중' : '모든 팀원이 작성했어요!'}</button></div>
				</div>
			</section>
			<QuestionnairePopup id="pop_evaluation" title="평가지 작성하기" questions={evaluationQuestions} values={evaluationValues} onChange={(values) => { setEvaluationValues(values); setEvaluationSaved(false) }} open={popup === 'evaluation'} onClose={() => setPopup(null)} onSave={() => { setEvaluationSaved(isComplete(evaluationQuestions, evaluationValues)); setPopup(null) }} />
			<QuestionnairePopup id="pop_questionnaire" title="설문지 작성하기" questions={surveyQuestions} values={surveyValues} onChange={(values) => { setSurveyValues(values); setSurveySaved(false) }} open={popup === 'questionnaire'} onClose={() => setPopup(null)} onSave={() => { setSurveySaved(isComplete(surveyQuestions, surveyValues)); setPopup(null) }} />
			<div className={`popup pop_completed${popup === 'completed' ? ' is-active' : ''}`} id="pop_completed">
				<div className="dm" onClick={() => setPopup(null)}></div>
				<div className="inbox"><button type="button" className="btn_close" onClick={() => setPopup(null)}>닫기</button><div className="tit">사건탐구 완료!</div><div className="con scroll_wrap"><div className="scroll"><div className="txt"><div className="tt">{studentFlowDisplayName(flowSession)} 학생, 사건탐구를 완료했습니다!</div><p>세션을 종료하고 태블릿을 반납해주세요.</p></div><div className="btns_btm"><button type="button" className="btn btn_wbb" onClick={() => navigate('/student/resource_center')}>교육 완료 하기</button></div><p className="tac p_end">세션 종료 시, 자료실 화면으로 이동합니다.</p></div></div></div>
			</div>
		</main>
	)
}

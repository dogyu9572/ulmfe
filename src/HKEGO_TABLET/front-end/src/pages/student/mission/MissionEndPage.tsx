import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTabletSession, submitTabletMissionFinal, TabletQuestionnaireAnswer, TabletQuestionnaireQuestion } from '../../../api/tabletApi'
import { StudentMissionHeader } from '../../../components/tablet/StudentMissionHeader'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { saveTabletStudentFlowSession, studentFlowDisplayName, studentFlowRouteItems } from '../../../state/tabletStudentFlowSession'
import { MissionTitle } from './missionShared'

type MissionPopup = 'evaluation' | 'questionnaire' | 'completed' | null
type AnswerMap = Record<string, string>

const agreement = ['매우 그렇다', '그렇다', '보통이다', '아니다', '매우 아니다']

const questionKey = (question: TabletQuestionnaireQuestion) => String(question.qstnSn)

const savedAnswerMap = (flowSession: ReturnType<typeof useRequiredTabletStudentFlowSession>, ansTypeCd: string) => {
	const selectedStudentIds = new Set((flowSession?.selectedStudents ?? []).map((student) => student.stdntSn))
	return (flowSession?.savedAnswers ?? [])
		.filter((answer) => selectedStudentIds.has(answer.stdntSn) && answer.ansTypeCd === ansTypeCd)
		.reduce<AnswerMap>((acc, answer) => {
			if (answer.qstnSn) acc[String(answer.qstnSn)] = answer.ansCn || ''
			else if (answer.qstnCn) acc[answer.qstnCn] = answer.ansCn || ''
			return acc
		}, {})
}

const savedHeroName = (flowSession: ReturnType<typeof useRequiredTabletStudentFlowSession>) => {
	const selectedStudentIds = new Set((flowSession?.selectedStudents ?? []).map((student) => student.stdntSn))
	return (flowSession?.savedAnswers ?? []).find((answer) => selectedStudentIds.has(answer.stdntSn) && answer.ansTypeCd === 'HERO')?.ansCn || ''
}

const buildAnswers = (questions: TabletQuestionnaireQuestion[], values: AnswerMap): TabletQuestionnaireAnswer[] => questions
	.map((question) => ({
		qstnrSn: question.qstnrSn,
		qstnSn: question.qstnSn,
		qstnCn: question.qstnCn,
		ansCn: (values[questionKey(question)] || '').trim()
	}))
	.filter((answer) => answer.ansCn)

const isComplete = (questions: TabletQuestionnaireQuestion[], values: AnswerMap) => questions.length > 0 && questions.every((question) => Boolean((values[questionKey(question)] || '').trim()))

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
							{questions.map((question, index) => {
								const key = questionKey(question)
								const currentValue = values[key] || ''
								const isText = question.ansTypeCd === 'TEXT'
								return <li key={key}>
									<div className="tt">{question.qstnCn}</div>
									{isText ? <textarea cols={30} rows={10} className="text w100p" value={currentValue} onChange={(event) => setValue(question, event.target.value)} placeholder="내용을 입력해주세요."></textarea> : <ul className="checkradio_select set5">
										{agreement.map((label) => {
											const inputId = `${id}_${index + 1}_${label}`
											return <li className="box" key={inputId}><input type="radio" name={`${id}_${key}`} id={inputId} checked={currentValue === label} onChange={() => setValue(question, label)} /><label htmlFor={inputId}><span><i></i>{label}</span></label></li>
										})}
									</ul>}
								</li>
							})}
						</ul> : <div className="wbox"><h3 className="tit">관리자에 연결된 문항이 없습니다.</h3></div>}
						<div className="btns_btm"><button type="button" className="btn btn_kwg btn_clo" onClick={onClose}>이전</button><button type="button" className="btn btn_wbb btn_end" onClick={onSave}>저장</button></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export const MissionEndPage = () => {
	const navigate = useNavigate()
	const [popup, setPopup] = useState<MissionPopup>(null)
	const [heroName, setHeroName] = useState('')
	const [evaluationValues, setEvaluationValues] = useState<AnswerMap>({})
	const [surveyValues, setSurveyValues] = useState<AnswerMap>({})
	const [evaluationSaved, setEvaluationSaved] = useState(false)
	const [surveySaved, setSurveySaved] = useState(false)
	const [saving, setSaving] = useState(false)
	const flowSession = useRequiredTabletStudentFlowSession()
	useEffect(() => {
		if (!flowSession) return
		const nextHeroName = savedHeroName(flowSession)
		const nextEvaluationValues = savedAnswerMap(flowSession, 'EVALUATION')
		const nextSurveyValues = savedAnswerMap(flowSession, 'SURVEY')
		setHeroName(nextHeroName)
		setEvaluationValues(nextEvaluationValues)
		setSurveyValues(nextSurveyValues)
		setEvaluationSaved(isComplete(flowSession.evaluationQuestions ?? [], nextEvaluationValues))
		setSurveySaved(isComplete(flowSession.surveyQuestions ?? [], nextSurveyValues))
	}, [flowSession])

	const evaluationQuestions = flowSession?.evaluationQuestions ?? []
	const surveyQuestions = flowSession?.surveyQuestions ?? []
	const evaluationComplete = useMemo(() => isComplete(evaluationQuestions, evaluationValues), [evaluationQuestions, evaluationValues])
	const surveyComplete = useMemo(() => isComplete(surveyQuestions, surveyValues), [surveyQuestions, surveyValues])

	if (!flowSession) return null
	const displayName = studentFlowDisplayName(flowSession)
	const routeCount = studentFlowRouteItems(flowSession).length
	const missionAreaText = routeCount > 0 ? `${routeCount}개 구역` : '모든 구역'
	const completedHeroName = heroName.trim() || '울산 SDGs 히어로즈'

	const refreshFlowSession = async () => {
		const nextSession = await fetchTabletSession()
		saveTabletStudentFlowSession(nextSession, flowSession.selectedStudents.map((student) => student.stdntSn))
	}

	const saveFinalDraft = async (flags: { updateHero?: boolean; updateEvaluation?: boolean; updateSurvey?: boolean }) => {
		await submitTabletMissionFinal(flowSession.rsvtSn, {
			studentSns: flowSession.selectedStudents.map((student) => student.stdntSn),
			heroName: heroName.trim(),
			...flags,
			complete: false,
			evaluationAnswers: buildAnswers(evaluationQuestions, evaluationValues),
			surveyAnswers: buildAnswers(surveyQuestions, surveyValues)
		})
		await refreshFlowSession()
	}

	const saveHeroName = async () => {
		if (!heroName.trim()) {
			alert('SDGs 히어로즈의 이름을 입력해주세요.')
			return
		}
		try {
			setSaving(true)
			await saveFinalDraft({ updateHero: true })
			alert('저장되었습니다.')
		} catch (error) {
			alert(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	const submitFinal = async () => {
		if (saving) return
		if (!heroName.trim()) {
			alert('입력되지 않은 부분을 마저 입력해주세요.')
			document.querySelector<HTMLInputElement>('.hero_name .inputs input[type="text"]')?.focus()
			return
		}
		if (evaluationQuestions.length > 0 && !evaluationComplete) {
			alert('평가지를 작성해주세요.')
			setPopup('evaluation')
			return
		}
		if (surveyQuestions.length > 0 && !surveyComplete) {
			alert('설문지를 작성해주세요.')
			setPopup('questionnaire')
			return
		}
		try {
			setSaving(true)
			await submitTabletMissionFinal(flowSession.rsvtSn, {
				studentSns: flowSession.selectedStudents.map((student) => student.stdntSn),
				heroName: heroName.trim(),
				updateHero: true,
				updateEvaluation: true,
				updateSurvey: true,
				complete: true,
				evaluationAnswers: buildAnswers(evaluationQuestions, evaluationValues),
				surveyAnswers: buildAnswers(surveyQuestions, surveyValues)
			})
			await refreshFlowSession()
			setEvaluationSaved(evaluationComplete)
			setSurveySaved(surveyComplete)
			setPopup('completed')
		} catch (error) {
			alert(error instanceof Error ? error.message : '최종 미션 저장 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">울산 SDGs 히어로즈 완성·평가/설문</h1>
			<StudentMissionHeader />
			<section className="basic_board">
				<MissionTitle step="STEP 4 실천력 부여" subtitle="울산 SDGs 히어로즈 완성·평가/설문" location="별관 (러닝도서관) 1~2층" />
				<div className="page_quest page_mission_end">
					<div className="hero_name">
						<img src="/pub/images/img_mission_end.webp" alt="" aria-hidden="true" />
						<div className="txt"><strong>미션을 모두 완수한 여러분은 일상 속 위기를 이겨내고, <br />미래를 위한 실천까지 완성한 진정한 SDGs 영웅입니다.</strong><div className="inputs"><input type="text" className="text" placeholder="SDGs 히어로즈의 이름을 지어주세요." value={heroName} onChange={(event) => setHeroName(event.target.value)} /><button type="button" className="btn" onClick={saveHeroName}>저장</button></div></div>
					</div>
					<div className="script_tabs_wrap"><div className="cont_area wbox"><div className="star_box"><h2 className="titbox">오늘 활동 돌아보기</h2><ul className="conbox flex_center end_area"><li><button type="button" className="btn btn01 btn_open" data-target="pop_evaluation" onClick={() => setPopup('evaluation')}>평가지 작성하기<span className="state">{evaluationSaved || evaluationComplete ? '완료' : evaluationQuestions.length > 0 ? '미완료' : '데이터 없음'}</span></button></li><li><button type="button" className="btn btn02 btn_open" data-target="pop_questionnaire" onClick={() => setPopup('questionnaire')}>설문지 작성하기<span className="state">{surveySaved || surveyComplete ? '완료' : surveyQuestions.length > 0 ? '미완료' : '데이터 없음'}</span></button></li></ul></div></div></div>
					<div className="btns_btm"><button type="button" className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button type="button" className="btn btn_wbb btn_open" data-target="pop_completed" onClick={submitFinal} disabled={saving}>{saving ? '저장 중' : '제출'}</button></div>
				</div>
			</section>
			<QuestionnairePopup id="pop_evaluation" title="평가지 작성하기" questions={evaluationQuestions} values={evaluationValues} onChange={(values) => { setEvaluationValues(values); setEvaluationSaved(false) }} open={popup === 'evaluation'} onClose={() => setPopup(null)} onSave={() => {
				void (async () => {
					try {
						setSaving(true)
						await saveFinalDraft({ updateEvaluation: true })
						setEvaluationSaved(evaluationComplete)
						setPopup(null)
					} catch (error) {
						alert(error instanceof Error ? error.message : '평가지 저장 중 오류가 발생했습니다.')
					} finally {
						setSaving(false)
					}
				})()
			}} />
			<QuestionnairePopup id="pop_questionnaire" title="설문지 작성하기" questions={surveyQuestions} values={surveyValues} onChange={(values) => { setSurveyValues(values); setSurveySaved(false) }} open={popup === 'questionnaire'} onClose={() => setPopup(null)} onSave={() => {
				void (async () => {
					try {
						setSaving(true)
						await saveFinalDraft({ updateSurvey: true })
						setSurveySaved(surveyComplete)
						setPopup(null)
					} catch (error) {
						alert(error instanceof Error ? error.message : '설문지 저장 중 오류가 발생했습니다.')
					} finally {
						setSaving(false)
					}
				})()
			}} />
			<div className={`popup pop_completed${popup === 'completed' ? ' is-active' : ''}`} id="pop_completed">
				<div className="dm" onClick={() => setPopup(null)}></div>
				<div className="inbox">
					<button type="button" className="btn_close" onClick={() => setPopup(null)}>닫기</button>
					<div className="tit">미션 수행 완료!</div>
					<div className="con scroll_wrap"><div className="scroll"><div className="flex_center"><div className="imgbox"><img src="/pub/images/img_hero_completed.webp" alt="" /><p>{completedHeroName}</p></div></div><div className="txt"><div className="tt">{displayName}님은 이제 <strong>'울산 SDGs 히어로즈'</strong>입니다!</div><p>{missionAreaText}을 모두 돌며 지속가능한 소비의 의미를 탐구했어요.<br />세션을 종료하고 태블릿을 반납해주세요.</p></div><div className="btns_btm"><button type="button" className="btn btn_wbb" onClick={() => navigate('/student/mission_resource_center')}>미션 완료 하기</button></div><p className="tac p_end">세션 종료 시, 키오스크 화면으로 이동합니다.</p></div></div>
				</div>
			</div>
		</main>
	)
}

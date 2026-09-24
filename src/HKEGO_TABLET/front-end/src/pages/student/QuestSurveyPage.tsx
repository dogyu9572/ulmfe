import { pubUrl } from '../../config'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPublicQuestionnaire, submitPublicQuestionnaire, submitTabletMissionFinal, TabletQuestionnaire, TabletQuestionnaireQuestion } from '../../api/tabletApi'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { useTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { finishTabletStudentFlow, studentFlowDisplayName } from '../../state/tabletStudentFlowSession'
import { stripEmphasisMarkers } from '../../utils/emphasisText'
import { questionnaireAnswerLabels } from '../../utils/questionnaireLabels'

type QuestSurveyPageProps = {
	linkCode?: string
}

export const QuestSurveyPage = ({ linkCode }: QuestSurveyPageProps) => {
	const navigate = useNavigate()
	const flowSession = useTabletStudentFlowSession()
	const alertedRef = useRef(false)
	// 링크·QR 접속 = 익명 응답 모드. 예약·학생 세션 없이 제출한다.
	const linkMode = Boolean(linkCode)
	const [questionnaire, setQuestionnaire] = useState<TabletQuestionnaire | null>(null)
	const [loadingPreview, setLoadingPreview] = useState(linkMode)
	const [loadError, setLoadError] = useState('')
	const [answers, setAnswers] = useState<Record<number, string>>({})
	const [saving, setSaving] = useState(false)
	const [completedOpen, setCompletedOpen] = useState(false)

	useEffect(() => {
		if (!linkCode) return
		let alive = true
		setLoadingPreview(true)
		setLoadError('')
		void fetchPublicQuestionnaire(linkCode)
			.then((data) => {
				if (alive) setQuestionnaire(data)
			})
			.catch((error) => {
				if (alive) setLoadError(error instanceof Error ? error.message : '평가지 또는 설문지를 불러오지 못했습니다.')
			})
			.finally(() => {
				if (alive) setLoadingPreview(false)
			})
		return () => {
			alive = false
		}
	}, [linkCode])

	useEffect(() => {
		if (linkMode || flowSession !== null || alertedRef.current) return
		alertedRef.current = true
		window.alert('출석 학생을 선택해주세요.')
		navigate('/student/attendance', { replace: true })
	}, [flowSession, navigate, linkMode])

	useEffect(() => {
		if (linkMode || !flowSession) return
		const saved = Object.fromEntries(flowSession.savedAnswers
			.filter((answer) => answer.ansTypeCd === 'SURVEY' && answer.qstnSn != null)
			.map((answer) => [answer.qstnSn as number, answer.ansCn]))
		setAnswers(saved)
	}, [flowSession, linkMode])

	const questions = useMemo<TabletQuestionnaireQuestion[]>(
		() => linkMode ? questionnaire?.questions ?? [] : flowSession?.surveyQuestions ?? [],
		[flowSession?.surveyQuestions, linkMode, questionnaire?.questions]
	)
	const pageTitle = questionnaire?.qstnrNm
		|| questions[0]?.qstnrNm
		|| (flowSession ? `${stripEmphasisMarkers(flowSession.prgrmNm)} 설문지` : '')
		|| '평가지·설문지'

	const updateAnswer = (qstnSn: number, value: string) => {
		setAnswers((previous) => ({ ...previous, [qstnSn]: value }))
	}

	const submitSurvey = async () => {
		if (saving) return
		if (!linkMode && !flowSession) return
		if (questions.length === 0) {
			window.alert('연결된 설문 문항이 없습니다.')
			return
		}
		const unansweredIndex = questions.findIndex((question) => !(answers[question.qstnSn] || '').trim())
		if (unansweredIndex >= 0) {
			window.alert(`${questions[unansweredIndex].qstnNo || unansweredIndex + 1}번 문항에 답변해 주세요.`)
			return
		}

		setSaving(true)
		try {
			if (linkMode) {
				// 익명 제출. 문항 지문은 서버가 자기 값으로 채우므로 번호와 답변만 보낸다.
				await submitPublicQuestionnaire(linkCode as string, questions.map((question) => ({
					qstnSn: question.qstnSn,
					ansCn: answers[question.qstnSn]
				})))
			} else {
				await submitTabletMissionFinal(flowSession!.rsvtSn, {
					studentSns: flowSession!.selectedStudents.map((student) => student.stdntSn),
					heroName: '',
					updateSurvey: true,
					evaluationAnswers: [],
					surveyAnswers: questions.map((question) => ({
						qstnrSn: question.qstnrSn,
						qstnSn: question.qstnSn,
						qstnCn: question.qstnCn,
						ansCn: answers[question.qstnSn]
					}))
				})
			}
			setCompletedOpen(true)
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '설문 답변을 저장하지 못했습니다.')
		} finally {
			setSaving(false)
		}
	}

	if (!linkMode && flowSession === undefined) return null

	return (
		<main className={`container${linkMode ? ' off' : ''}`} id="mainContent">
			<h1 className="sound_only">{pageTitle}</h1>
			{!linkMode && <StudentCaseHeader />}

			<section className="basic_board">
				<div className="student_title">
					<div className="subtitle"><strong>{pageTitle}</strong></div>
				</div>

				<div className="page_quest">
					<h2 className="stit icon_think">오늘 활동 돌아보기</h2>
					<div className="script_tabs_wrap shadow">
						<div className="cont_area wbox">
							<div className="inbox">
								{loadingPreview && <div className="star_box"><p className="tac">문항을 불러오는 중입니다.</p></div>}
								{loadError && <div className="star_box"><p className="tac">{loadError}</p></div>}

								{linkMode && completedOpen && (
									<div className="star_box"><p className="tac">응답이 제출되었습니다. 참여해 주셔서 감사합니다.</p></div>
								)}

								{!(linkMode && completedOpen) && !loadingPreview && !loadError && questions.length > 0 && (
									<div className="star_box">
										<h3 className="titbox">오늘 하루의 활동을 평가해 봅시다.</h3>
										<ul className="conbox limt">
											{questions.map((question) => {
												const textInputId = `question_${question.qstnSn}`
												return <li key={question.qstnSn}>
													{question.ansTypeCd === 'TEXT' ? (
														<>
															<label htmlFor={textInputId} className="tit">{question.qstnCn}</label>
															<input
																type="text"
																id={textInputId}
																className="text w100p"
																value={answers[question.qstnSn] || ''}
																onChange={(event) => updateAnswer(question.qstnSn, event.target.value)}
																placeholder="답변을 입력해 주세요."
															/>
														</>
													) : (
														<>
															<div className="tit">{question.qstnCn}</div>
													<ul className="checkradio_select set5">
														{questionnaireAnswerLabels(question.ansTypeCd).map((label, labelIndex) => {
															const id = `question_${question.qstnSn}_${labelIndex}`
															return <li className="box" key={id}>
																<input
																	type="radio"
																	name={`question_${question.qstnSn}`}
																	id={id}
																	value={label}
																	checked={answers[question.qstnSn] === label}
																	onChange={() => updateAnswer(question.qstnSn, label)}
																/>
																<label htmlFor={id}><span><i></i>{label}</span></label>
															</li>
														})}
													</ul>
														</>
													)}
												</li>
											})}
										</ul>
									</div>
								)}

								{!loadingPreview && !loadError && questions.length === 0 && (
									<div className="star_box"><p className="tac">등록된 문항이 없습니다.</p></div>
								)}
							</div>
						</div>
					</div>

					{!(linkMode && completedOpen) && (
						<div className="btns_btm">
							<button type="button" className="btn btn_wbb" onClick={() => void submitSurvey()} disabled={saving || questions.length === 0}>
								{saving ? '제출 중' : '제출'}
							</button>
						</div>
					)}
				</div>
			</section>

			{!linkMode && flowSession && (
				<div className={`popup pop_completed${completedOpen ? ' is-active' : ''}`} id="pop_completed">
					<div className="dm" onClick={() => setCompletedOpen(false)}></div>
					<div className="inbox">
						<button type="button" className="btn_close" onClick={() => setCompletedOpen(false)}>닫기</button>
						<div className="tit">사건탐구 완료!</div>
						<div className="con scroll_wrap">
							<div className="scroll">
								<div className="flex_center">
									<div className="imgbox"><img src={pubUrl("/pub/images/img_sample_completed.webp")} alt="" /></div>
								</div>
								<div className="txt">
									<div className="tt">{studentFlowDisplayName(flowSession)} 학생, <strong>{flowSession.prgrmNm?.trim() || '오늘의 활동'}</strong> 활동을 모두 마쳤어요!</div>
									<p>모든 구역을 돌며 사건의 단서를 찾아 해결했어요.<br />세션을 종료하고 태블릿을 반납해주세요.</p>
								</div>
								<div className="btns_btm">
									<button type="button" className="btn btn_wbb" onClick={() => finishTabletStudentFlow(navigate)}>교육 완료 하기</button>
								</div>
								<p className="tac p_end">세션 종료 시, 키오스크 화면으로 이동합니다.</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	)
}

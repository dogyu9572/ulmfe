import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { studentFlowDisplayName } from '../../state/tabletStudentFlowSession'

const textQuestions = [
	{ id: 'question_a01', label: '오늘 가장 재미있었던 것은?', placeholder: '오늘 가장 재미있었던 것에 대해 알려주세요.' },
	{ id: 'question_a02', label: '더 알고 싶은 것이 있나요?', placeholder: '더 알고 싶은 것에 대해 알려주세요.' },
	{ id: 'question_a03', label: '내가 오늘 잘한 것은?', placeholder: '내가 오늘 잘한 것에 대해 알려주세요.' }
]

const ratingQuestions = [
	'울산의 다양한 자원에 관심을 가졌나요?',
	'나만의 아이디어를 적극적으로 표현했나요?',
	'울산이 살기 좋은 도시가 될 수 있다고 느꼈나요?',
	'이 활동 후 울산에 더 애정이 생겼나요?',
	'친구들과 잘 협력하며 참여했나요?'
]

const ratingLabels = ['상', '중상', '중', '중하', '하']

export const QuestSurveyPage = () => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	const [completedOpen, setCompletedOpen] = useState(false)

	if (!flowSession) return null

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">작은 아이디어가 도시를 바꾼다</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="subtitle"><strong>작은 아이디어가 도시를 바꾼다</strong></div>
				</div>

				<div className="page_quest">
					<h2 className="stit icon_think">오늘 활동 돌아보기</h2>
					<div className="script_tabs_wrap shadow">
						<div className="cont_area wbox">
							<div className="inbox">
								<div className="star_box">
									<h3 className="titbox">오늘 하루의 활동에 대해 정리해 봅시다.</h3>
									<ul className="conbox limt input_area">
										{textQuestions.map((question) => (
											<li key={question.id}>
												<label htmlFor={question.id} className="tit">{question.label}</label>
												<input
													type="text"
													id={question.id}
													className="text w100p"
													placeholder={question.placeholder}
												/>
											</li>
										))}
									</ul>
								</div>

								<div className="star_box">
									<h3 className="titbox">오늘 하루의 활동을 평가해 봅시다.</h3>
									<ul className="conbox limt select_area">
										{ratingQuestions.map((question, questionIndex) => (
											<li key={question}>
												<div className="tit">{question}</div>
												<ul className="checkradio_select set5">
													{ratingLabels.map((label, labelIndex) => {
														const id = `question_b${questionIndex + 1}${labelIndex + 1}`
														const name = `question_b${questionIndex + 1}`
														return (
															<li className="box" key={id}>
																<input
																	type="radio"
																	name={name}
																	id={id}
																/>
																<label htmlFor={id}><span><i></i>{label}</span></label>
															</li>
														)
													})}
												</ul>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					</div>

					<div className="btns_btm">
						<button type="button" className="btn btn_wbb btn_open" data-target="pop_completed" onClick={() => setCompletedOpen(true)}>작성</button>
					</div>
				</div>
			</section>

			<div className={`popup pop_completed${completedOpen ? ' is-active' : ''}`} id="pop_completed">
				<div className="dm" onClick={() => setCompletedOpen(false)}></div>
				<div className="inbox">
					<button type="button" className="btn_close" onClick={() => setCompletedOpen(false)}>닫기</button>
					<div className="tit">사건탐구 완료!</div>
					<div className="con scroll_wrap">
						<div className="scroll">
							<div className="flex_center">
								<div className="imgbox"><img src="/pub/images/img_sample_completed.webp" alt="" /></div>
							</div>
							<div className="txt">
								<div className="tt">{studentFlowDisplayName(flowSession)} 학생은 이제 멋진 <strong>'미래 마을 디자이너'</strong>입니다!</div>
								<p>4개 구역을 모두 돌며 살기 좋은 도시의 조건을 탐색하고,<br />우리가 꿈꾸는 미래 울산의 모습을 멋지게 완성했어요.<br />세션을 종료하고 태블릿을 반납해주세요.</p>
							</div>
							<div className="btns_btm">
								<button type="button" className="btn btn_wbb" onClick={() => navigate('/select-user')}>교육 완료 하기</button>
							</div>
							<p className="tac p_end">세션 종료 시, 키오스크 화면으로 이동합니다.</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

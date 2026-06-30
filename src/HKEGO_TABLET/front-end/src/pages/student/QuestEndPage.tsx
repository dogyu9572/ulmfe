import { KeyboardEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

const students = ['김민준', '나서윤', '박하윤', '이서준', '최하준', '한서연']
const scale = ['상', '중상', '중', '중하', '하']
const agreement = ['매우 그렇다', '그렇다', '보통이다', '아니다', '매우 아니다']
const reflectionQuestions = [
	{ id: 'question_a01', title: '오늘 가장 재미있었던 것은?', placeholder: '오늘 가장 재미있었던 것에 대해 알려주세요.' },
	{ id: 'question_a02', title: '더 알고 싶은 것이 있나요?', placeholder: '더 알고 싶은 것에 대해 알려주세요.' },
	{ id: 'question_a03', title: '내가 오늘 잘한 것은?', placeholder: '내가 오늘 잘한 것에 대해 알려주세요.' }
]
const selfCheckQuestions = [
	'울산의 다양한 자원에 관심을 가졌나요?',
	'나만의 아이디어를 적극적으로 표현했나요?',
	'울산이 살기 좋은 도시가 될 수 있다고 느꼈나요?',
	'이 활동 후 울산에 더 애정이 생겼나요?',
	'친구들과 잘 협력하며 참여했나요?'
]
const evaluationQuestions = [
	'1-1. 지속가능발전교육(ESD)이 무엇인지 이해했나요?',
	'1-2. ESD에서 다루는 주제들은 서로 연결되어 있음을 이해했나요?',
	'2-1. 도시 재생 사례를 설명할 수 있나요?',
	'2-2. 울산의 자원들에 대해 설명할 수 있나요?',
	'2-3. 행복한 도시의 조건들을 제시할 수 있나요?',
	'2-4. 학습 내용이 학교 교육에 도움이 되는 내용을 담고 있나요?',
	'2-5. 학습 내용이 실제 생활에 도움이 되는 내용을 담고 있나요?',
	'3-1. 학습한 내용을 실제 생활에 실천하시겠습니까?',
	'3-2. 학습한 내용을 주변에 알리고 실천에 동참하도록 하시겠습니까?'
]
const questionnaireQuestions = [
	'1-1. 교육 프로그램이 지속가능발전교육에 부합하는 내용입니까?',
	'1-2. 주제와 내용이 학교 교육에 도움이 되는 내용을 담고 있습니까?',
	'1-3. 주제와 내용이 실제 생활에 도움이 되는 내용을 담고 있습니까?',
	'1-4. 교육 프로그램 운영시간은 적절하게 배정되었습니까?',
	'2-1. 교육 프로그램은 매끄럽게 운영되었습니까?',
	'2-2. 교육관의 교육 프로그램 운영 장소는 사용이 편리하셨습니까?',
	'2-3. 교육관의 편의시설은 사용이 편리하셨습니까?',
	'3-1. 본 교육 프로그램을 다른 분에게 추천하실 의향이 있으십니까?',
	'3-2. 본 교육 프로그램 전반에 대해 만족하셨습니까?',
	'3-3. 본 교육 프로그램의 발전을 위해 유익했던 점과 보완점을 적어주시기 바랍니다.'
]

const RatingGroup = ({ name, labels = scale }: { name: string; labels?: string[] }) => (
	<ul className="checkradio_select set5">
		{labels.map((label, index) => {
			const id = `${name}${index + 1}`
			return <li className="box" key={id}><input type="radio" name={name} id={id} /><label htmlFor={id}><span><i></i>{label}</span></label></li>
		})}
	</ul>
)

type PopupName = 'evaluation' | 'questionnaire' | 'completed' | null

export const QuestEndPage = () => {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState(0)
	const [popup, setPopup] = useState<PopupName>(null)

	const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		let targetIndex: number | null = null
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') targetIndex = index + 1 >= students.length ? 0 : index + 1
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') targetIndex = index - 1 < 0 ? students.length - 1 : index - 1
		if (event.key === 'Home') targetIndex = 0
		if (event.key === 'End') targetIndex = students.length - 1
		if (targetIndex === null) return
		event.preventDefault()
		setActiveTab(targetIndex)
	}

	const openCompleted = () => {
		const allInputs = Array.from(document.querySelectorAll<HTMLInputElement>('.page_quest .input_area input[type="text"]'))
		const emptyInput = allInputs.find((input) => !input.value.trim())
		if (emptyInput) {
			alert('입력되지 않은 부분을 마저 입력해주세요.')
			emptyInput.focus()
			return
		}
		setPopup('completed')
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">작은 아이디어가 도시를 바꾼다</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 4 정리·일반화</div>
					<div className="subtitle"><strong>작은 아이디어가 도시를 바꾼다</strong></div>
					<div className="location">ESD배움터 아이디어실1</div>
				</div>

				<div className="page_quest">
					<h2 className="stit icon_think">오늘 활동 돌아보기</h2>
					<div className="script_tabs_wrap shadow">
						<ul className="tabs_area" role="tablist">
							{students.map((student, index) => (
								<li key={student} className={activeTab === index ? 'on' : undefined}>
									<button type="button" id={`tab_btn_${index + 1}`} role="tab" aria-controls={`tab_panel_${index + 1}`} aria-selected={activeTab === index} tabIndex={activeTab === index ? 0 : -1} onClick={() => setActiveTab(index)} onKeyDown={(event) => handleTabKeyDown(event, index)}>{student}</button>
								</li>
							))}
						</ul>
						<div className="cont_area wbox">
							{students.map((student, index) => (
								<div className={activeTab === index ? 'cont on' : 'cont'} id={`tab_panel_${index + 1}`} role="tabpanel" aria-labelledby={`tab_btn_${index + 1}`} key={student}>
									{index === 0 && (
										<div className="inbox">
											<div className="star_box">
												<h3 className="titbox">오늘 하루의 활동에 대해 정리해 봅시다.</h3>
												<ul className="conbox limt input_area">
													{reflectionQuestions.map((question) => <li key={question.id}><label htmlFor={question.id} className="tit">{question.title}</label><input type="text" id={question.id} className="text w100p" placeholder={question.placeholder} /></li>)}
												</ul>
											</div>

											<div className="star_box">
												<h3 className="titbox">오늘 하루의 활동을 평가해 봅시다.</h3>
												<ul className="conbox limt select_area">
													{selfCheckQuestions.map((question, questionIndex) => <li key={question}><div className="tit">{question}</div><RatingGroup name={`question_b${questionIndex + 1}`} /></li>)}
												</ul>
											</div>

											<div className="star_box">
												<h3 className="titbox">평가지 · 설문지 작성</h3>
												<ul className="conbox flex_center end_area">
													<li><button type="button" className="btn btn01 btn_open" data-target="pop_evaluation" onClick={() => setPopup('evaluation')}>평가지 작성하기<span className="state">미완료</span></button></li>
													<li><button type="button" className="btn btn02 btn_open" data-target="pop_questionnaire" onClick={() => setPopup('questionnaire')}>설문지 작성하기<span className="state">미완료</span></button></li>
												</ul>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					<div className="btns_btm">
						<button type="button" className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button type="button" className="btn btn_wbb btn_open" data-target="pop_completed" onClick={openCompleted}>모든 팀원이 작성했어요!</button>
					</div>
				</div>
			</section>

			<QuestionnairePopup id="pop_evaluation" title="평가지 작성하기" questions={evaluationQuestions} open={popup === 'evaluation'} onClose={() => setPopup(null)} />
			<QuestionnairePopup id="pop_questionnaire" title="설문지 작성하기" questions={questionnaireQuestions} open={popup === 'questionnaire'} onClose={() => setPopup(null)} />
			<div className={`popup pop_completed${popup === 'completed' ? ' is-active' : ''}`} id="pop_completed">
				<div className="dm" onClick={() => setPopup(null)}></div>
				<div className="inbox">
					<button type="button" className="btn_close" onClick={() => setPopup(null)}>닫기</button>
					<div className="tit">사건탐구 완료!</div>
					<div className="con scroll_wrap">
						<div className="scroll">
							<div className="flex_center">
								<div className="imgbox"><img src="/pub/images/img_sample_completed.webp" alt="" /></div>
							</div>
							<div className="txt">
								<div className="tt">김민준님은 이제 멋진 <strong>'미래 마을 디자이너'</strong>입니다!</div>
								<p>4개 구역을 모두 돌며 살기 좋은 도시의 조건을 탐색하고, <br />
									우리가 꿈꾸는 미래 울산의 모습을 멋지게 완성했어요.<br />
									세션을 종료하고 태블릿을 반납해주세요.</p>
							</div>
							<div className="btns_btm">
								<button type="button" className="btn btn_wbb" onClick={() => navigate('/student/resource_center')}>교육 완료 하기</button>
							</div>
							<p className="tac p_end">세션 종료 시, 키오스크 화면으로 이동합니다.</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

const QuestionnairePopup = ({ id, title, questions, open, onClose }: { id: string; title: string; questions: string[]; open: boolean; onClose: () => void }) => (
	<div className={`popup pop_questionnaire${open ? ' is-active' : ''}`} id={id}>
		<div className="dm" onClick={onClose}></div>
		<div className="inbox">
			<button type="button" className="btn_close" onClick={onClose}>닫기</button>
			<div className="tit">{title}</div>
			<div className="con scroll_wrap">
				<div className="scroll">
					<ul className="list">
						{questions.map((question, index) => (
							<li key={question}>
								<div className="tt">{question}</div>
								<RatingGroup name={`${id}_${index + 1}`} labels={agreement} />
								{(question.startsWith('3-1.') || question.startsWith('3-2.')) && <textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="‘아니다’, ‘매우 아니다’를 선택하셨다면 그 이유를 적어주시기 바랍니다."></textarea>}
								{question.startsWith('3-3.') && (
									<>
										<textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="유익했던 점을 입력해주세요."></textarea>
										<textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="보완점을 입력해주세요."></textarea>
									</>
								)}
							</li>
						))}
					</ul>
					<div className="btns_btm">
						<button type="button" className="btn btn_kwg btn_clo" onClick={onClose}>이전</button>
						<button type="button" className="btn btn_wbb btn_end" onClick={onClose}>저장</button>
					</div>
				</div>
			</div>
		</div>
	</div>
)

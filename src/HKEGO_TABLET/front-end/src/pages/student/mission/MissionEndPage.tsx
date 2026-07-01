import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentMissionHeader } from '../../../components/tablet/StudentMissionHeader'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { evaluationQuestions, MissionQuestionnairePopup, MissionTitle, questionnaireQuestions } from './missionShared'

type MissionPopup = 'evaluation' | 'questionnaire' | 'completed' | null

export const MissionEndPage = () => {
	const navigate = useNavigate()
	const [popup, setPopup] = useState<MissionPopup>(null)
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	const openCompleted = () => {
		const input = document.querySelector<HTMLInputElement>('.hero_name .inputs input[type="text"]')
		if (input && !input.value.trim()) {
			alert('입력되지 않은 부분을 마저 입력해주세요.')
			input.focus()
			return
		}
		setPopup('completed')
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
						<div className="txt"><strong>미션을 모두 완수한 여러분은 일상 속 위기를 이겨내고, <br />미래를 위한 실천까지 완성한 진정한 SDGs 영웅입니다.</strong><div className="inputs"><input type="text" className="text" placeholder="SDGs 히어로즈의 이름을 지어주세요." /><button type="button" className="btn">저장</button></div></div>
					</div>
					<div className="script_tabs_wrap"><div className="cont_area wbox"><div className="star_box"><h2 className="titbox">오늘 활동 돌아보기</h2><ul className="conbox flex_center end_area"><li><button type="button" className="btn btn01 btn_open" data-target="pop_evaluation" onClick={() => setPopup('evaluation')}>평가지 작성하기<span className="state">미완료</span></button></li><li><button type="button" className="btn btn02 btn_open" data-target="pop_questionnaire" onClick={() => setPopup('questionnaire')}>설문지 작성하기<span className="state">미완료</span></button></li></ul></div></div></div>
					<div className="btns_btm"><button type="button" className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button type="button" className="btn btn_wbb btn_open" data-target="pop_completed" onClick={openCompleted}>제출</button></div>
				</div>
			</section>
			<MissionQuestionnairePopup id="pop_evaluation" title="평가지 작성하기" questions={evaluationQuestions} open={popup === 'evaluation'} onClose={() => setPopup(null)} />
			<MissionQuestionnairePopup id="pop_questionnaire" title="설문지 작성하기" questions={questionnaireQuestions} open={popup === 'questionnaire'} onClose={() => setPopup(null)} />
			<div className={`popup pop_completed${popup === 'completed' ? ' is-active' : ''}`} id="pop_completed">
				<div className="dm" onClick={() => setPopup(null)}></div>
				<div className="inbox">
					<button type="button" className="btn_close" onClick={() => setPopup(null)}>닫기</button>
					<div className="tit">미션 수행 완료!</div>
					<div className="con scroll_wrap"><div className="scroll"><div className="flex_center"><div className="imgbox"><img src="/pub/images/img_hero_completed.webp" alt="" /><p>울산 SDGs 히어로 민준</p></div></div><div className="txt"><div className="tt">김민준님은 이제 <strong>'울산 SDGs 히어로즈'</strong>입니다!</div><p>4개 구역을 모두 돌며 지속가능한 소비의 의미를 탐구했어요.<br />세션을 종료하고 태블릿을 반납해주세요.</p></div><div className="btns_btm"><button type="button" className="btn btn_wbb" onClick={() => navigate('/student/mission_resource_center')}>미션 완료 하기</button></div><p className="tac p_end">세션 종료 시, 키오스크 화면으로 이동합니다.</p></div></div>
				</div>
			</div>
		</main>
	)
}

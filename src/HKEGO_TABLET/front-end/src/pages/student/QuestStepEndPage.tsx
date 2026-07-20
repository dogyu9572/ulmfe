import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitTabletMissionFinal } from '../../api/tabletApi'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { StudentProgramCompletionPopup } from '../../components/tablet/StudentProgramCompletionPopup'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import {
	studentFlowCompletedExploreStepCodes,
	studentFlowDisplayName,
	studentFlowExploreQuestByRouteIndex,
	studentFlowRouteItems
} from '../../state/tabletStudentFlowSession'

const stampImage = (routeIndex: number) => `/pub/images/icon_stamp${String(routeIndex + 1).padStart(2, '0')}_large.svg`

export const QuestStepEndPage = ({ routeIndex }: { routeIndex: number }) => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	const [completedOpen, setCompletedOpen] = useState(false)
	const [saving, setSaving] = useState(false)
	if (!flowSession) return null

	const quest = studentFlowExploreQuestByRouteIndex(flowSession, routeIndex)
	const routeItems = studentFlowRouteItems(flowSession)
	const questLabel = quest?.name || routeItems[routeIndex] || `퀘스트${routeIndex + 1}`
	const currentTitle = `${questLabel} 수행 완료!`
	const nextRouteName = routeItems[routeIndex + 1] || ''
	const nextPath = nextRouteName ? `/student/quest${String(routeIndex + 2).padStart(2, '0')}` : ''
	const nextQuest = nextRouteName ? studentFlowExploreQuestByRouteIndex(flowSession, routeIndex + 1) : null
	const nextTitle = nextQuest?.place || nextQuest?.title || nextRouteName || '사건해결'
	const completedStepCodes = studentFlowCompletedExploreStepCodes(flowSession)
	const earnedStampCount = routeItems.filter((_item, index) => completedStepCodes.has(`QUEST${String(index + 1).padStart(2, '0')}`)).length

	const moveNext = async () => {
		if (nextPath) {
			navigate(nextPath)
			return
		}
		if (saving) return
		try {
			setSaving(true)
			await submitTabletMissionFinal(flowSession.rsvtSn, {
				studentSns: flowSession.selectedStudents.map((student) => student.stdntSn),
				heroName: '',
				updateHero: false,
				updateEvaluation: false,
				updateSurvey: false,
				complete: true,
				evaluationAnswers: [],
				surveyAnswers: []
			})
			setCompletedOpen(true)
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '교육 완료 처리 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">{currentTitle}</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className={`page_end quest_end0${Math.min(routeIndex + 1, 4)}`}>
					<div className="tit_area flex_center colm">
						<h2 className="end_tit">{currentTitle}</h2>
						<p>퀘스트를 완료했어요.<br /><strong>다음 활동으로 이동해 주세요.</strong></p>
					</div>
					<div className="stamp_box">
						<h3 className="tit">도장 획득!</h3>
						<div className="large" aria-hidden="true"><img src={stampImage(routeIndex)} alt="" /></div>
						<ul className="stamp_area">
							{routeItems.map((item, index) => (
								<li key={`${item}-${index}`} className={`i${index + 1}${earnedStampCount >= index + 1 ? ' on' : ''}`}>{item} 도장</li>
							))}
						</ul>
					</div>
					<div className="next_page_qr">
						<h3 className="tit">{nextTitle}</h3>
						<p>다음 이동 장소로 이동하세요.</p>
						<button className="btn_qr flex_center" onClick={() => void moveNext()} disabled={saving}>{saving ? '처리 중' : '이동하기'}</button>
					</div>
				</div>
			</section>
			<StudentProgramCompletionPopup open={completedOpen} variant="explore" displayName={studentFlowDisplayName(flowSession)} onClose={() => setCompletedOpen(false)} onComplete={() => navigate('/select-user')} />
		</main>
	)
}

import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import {
	studentFlowExploreQuestByRouteIndex,
	studentFlowRouteItems
} from '../../state/tabletStudentFlowSession'

const stampImage = (routeIndex: number) => `/pub/images/icon_stamp${String(routeIndex + 1).padStart(2, '0')}_large.svg`

export const QuestStepEndPage = ({ routeIndex }: { routeIndex: number }) => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	const quest = studentFlowExploreQuestByRouteIndex(flowSession, routeIndex)
	const routeItems = studentFlowRouteItems(flowSession)
	const questLabel = quest?.name || routeItems[routeIndex] || `퀘스트${routeIndex + 1}`
	const currentTitle = `${questLabel} 수행 완료!`
	const nextRouteName = routeItems[routeIndex + 1] || ''
	const nextPath = nextRouteName ? `/student/quest${String(routeIndex + 2).padStart(2, '0')}` : '/student/quest05'
	const nextQuest = nextRouteName ? studentFlowExploreQuestByRouteIndex(flowSession, routeIndex + 1) : null
	const nextTitle = nextQuest?.place || nextQuest?.title || nextRouteName || '사건해결'

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
								<li key={`${item}-${index}`} className={`i${index + 1}${index <= routeIndex ? ' on' : ''}`}>{item} 도장</li>
							))}
						</ul>
					</div>
					<div className="next_page_qr">
						<h3 className="tit">{nextTitle}</h3>
						<p>다음 이동 장소로 이동하세요.</p>
						<button className="btn_qr flex_center" onClick={() => navigate(nextPath)}>이동하기</button>
					</div>
				</div>
			</section>
		</main>
	)
}

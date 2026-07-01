import { useNavigate } from 'react-router-dom'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { studentFlowCourseName, studentFlowMissionStartExpln, studentFlowRouteItems } from '../../../state/tabletStudentFlowSession'
import { missionRouteIconSrc, MissionShell } from './missionShared'

export const Mission02Page = () => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	const courseName = studentFlowCourseName(flowSession)
	const routeItems = studentFlowRouteItems(flowSession)
	const startExpln = studentFlowMissionStartExpln(flowSession)
	const missionText = startExpln || '방에 쌓인 쓰레기들이 모여 괴물이 되었어요. 무심코 사고, 버린 물건들이 모여 괴물이 된 거예요.\n과소비와 낭비, 한 번 쓰고 버리는 습관이 이 괴물을 키우고 있습니다.\n괴물을 잠재우려면, 이 미션에서 우리 모두가 함께 힘을 합쳐야 해요!'

	return (
		<MissionShell title="미션 열어보기 · 동선안내" step="STEP 2 미션탐색" subtitle="미션 열어보기 · 동선안내" location="별관 (러닝도서관) 1층 무대 열람석">
			<div className="page_mission">
				<div className="wbox mission_step">
					<h2 className="stit">나와 울산, 그리고 지구의 미래를 지키는 미션</h2>
					<p>{missionText.split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}{index < missionText.split('\n').length - 1 && <br />}</span>)}</p>
					<ul className="mission_area"><li className="i1"><strong>미션1</strong><p>내가 어떤 물건을 <br />사고 쓰는지 확인하세요.</p></li><li className="i2"><strong>미션2</strong><p>더 나은 소비 습관을 찾아 <br />슬기로운 소비생활을 시작하세요.</p></li></ul>
				</div>
				<h2 className="stit icon_think">내 동선 <span className="arrow"></span>{courseName}</h2>
				<div className="wbox">
					<ul className="activity_order_step_area course_area">
						{routeItems.map((item, index) => <li key={`${item}-${index}`} className={`i${index + 1}`}><div className="icon" aria-hidden="true"><img src={missionRouteIconSrc(item)} alt="" /></div>{item}</li>)}
					</ul>
					<p className="excl">각 구역 체험 후 태블릿에서 미션 활동지를 수행하세요. 완료하면 디지털 스티커를 획득하고 다음 구역으로 이동합니다!</p>
				</div>
				<div className="btns_btm"><button type="button" className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button type="button" className="btn btn_wbb" onClick={() => navigate('/student/mission03')}>다음</button></div>
			</div>
		</MissionShell>
	)
}

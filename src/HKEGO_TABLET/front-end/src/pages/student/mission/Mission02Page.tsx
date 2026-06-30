import { useNavigate } from 'react-router-dom'
import { MissionShell } from './missionShared'

export const Mission02Page = () => {
	const navigate = useNavigate()
	return (
		<MissionShell title="미션 열어보기 · 동선안내" step="STEP 2 미션탐색" subtitle="미션 열어보기 · 동선안내" location="별관 (러닝도서관) 1층 무대 열람석">
			<div className="page_mission">
				<div className="wbox mission_step">
					<h2 className="stit">나와 울산, 그리고 지구의 미래를 지키는 미션</h2>
					<p>방에 쌓인 쓰레기들이 모여 괴물이 되었어요. 무심코 사고, 버린 물건들이 모여 괴물이 된 거예요.<br />과소비와 낭비, 한 번 쓰고 버리는 습관이 이 괴물을 키우고 있습니다.<br />괴물을 잠재우려면, 이 미션에서 우리 모두가 함께 힘을 합쳐야 해요!</p>
					<ul className="mission_area"><li className="i1"><strong>미션1</strong><p>내가 어떤 물건을 <br />사고 쓰는지 확인하세요.</p></li><li className="i2"><strong>미션2</strong><p>더 나은 소비 습관을 찾아 <br />슬기로운 소비생활을 시작하세요.</p></li></ul>
				</div>
				<h2 className="stit icon_think">내 동선<span className="arrow"></span>A코스</h2>
				<div className="wbox">
					<ul className="activity_order_step_area course_area">
						<li className="i1"><div className="icon" aria-hidden="true"><img src="/pub/images/icon_activity_mission03.webp" alt="" /></div>지구존</li>
						<li className="i2"><div className="icon" aria-hidden="true"><img src="/pub/images/icon_activity_mission04.webp" alt="" /></div>미래존</li>
						<li className="i3"><div className="icon" aria-hidden="true"><img src="/pub/images/icon_activity_mission05.webp" alt="" /></div>사회존</li>
						<li className="i4"><div className="icon" aria-hidden="true"><img src="/pub/images/icon_activity_mission_book.webp" alt="" /></div>도서관</li>
					</ul>
					<p className="excl">각 구역 체험 후 태블릿에서 미션 활동지를 수행하세요. 완료하면 디지털 스티커를 획득하고 다음 구역으로 이동합니다!</p>
				</div>
				<div className="btns_btm"><button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button className="btn btn_wbb" onClick={() => navigate('/student/mission03')}>다음</button></div>
			</div>
		</MissionShell>
	)
}

import { useNavigate } from 'react-router-dom'
import { AttendanceHeader } from '../../../components/tablet/AttendanceHeader'

export const MissionWelcomePage = () => {
	const navigate = useNavigate()
	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">번호를 선택해주세요</h1>
			<AttendanceHeader />
			<section className="basic_board welcome_wrap">
				<div className="subtitle flex_center">홍길동 학생, 참석을 환영합니다!</div>
				<div className="tb tac">오늘 함께할 팀과 활동 순서를 확인해보세요.</div>
				<div className="welcome_top">
					<div className="box program"><span>참여 프로그램</span><strong>사건탐구 프로그램<br />(살고 싶은 곳, 울산)</strong></div>
					<div className="box team"><span className="icon team_a" aria-hidden="true"><i>A팀</i></span><span>나의 팀</span><strong>A팀</strong></div>
				</div>
				<div className="stit itit">오늘의 활동 순서</div>
				<ol className="activity_order_step_area">
					<li><i aria-hidden="true"><img src="/pub/images/icon_activity_order01.webp" alt="" /></i><strong>사건제시</strong><p>2층 ESD 배움터 아이디어실 1</p></li>
					<li><i aria-hidden="true"><img src="/pub/images/icon_activity_mission02.webp" alt="" /></i><strong>미션 탐색</strong><p>2층 ESD 배움터 아이디어실 1</p></li>
					<li><i aria-hidden="true"><img src="/pub/images/icon_activity_mission03.webp" alt="" /></i><strong>지구존</strong><p>1층 ESD 체험터 사회존</p></li>
					<li><i aria-hidden="true"><img src="/pub/images/icon_activity_mission04.webp" alt="" /></i><strong>미래존</strong><p>1층 ESD 체험터 사회존</p></li>
					<li><i aria-hidden="true"><img src="/pub/images/icon_activity_mission05.webp" alt="" /></i><strong>사회존</strong><p>1층 미디어실</p></li>
					<li><i aria-hidden="true"><img src="/pub/images/icon_activity_order06.webp" alt="" /></i><strong>정리 및 일반화</strong><p>1층 ESD 배움터 아이디어실 1</p></li>
				</ol>
				<div className="btns_btm"><button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button className="btn btn_wbb" onClick={() => navigate('/student/mission_about')}>다음</button></div>
			</section>
		</main>
	)
}

import { TeacherShell } from './teacherShared'

export const TeacherRealTimeLocationPage = () => (
	<TeacherShell title="실시간 위치" info="QR 스캔 기반 공간별 학생 위치 현황">
		<div className="page_scroll">
			<div className="current_location_map">
				<h2 className="sound_only">실시간 위치 지도</h2>
				<div className="box f2"><div className="mapbox"><img src="/pub/images/img_current_location_map01.webp" alt="" aria-hidden="true" /><ul className="map_point"><li className="p1">디지털창작실</li><li className="p2">미디어실</li><li className="p3">아이디어실 3, 4, 5</li><li className="p4">조리체험실</li><li className="p5">목공실</li><li className="p6">공작실 1, 2</li><li className="p7">아이디어실 1, 2</li></ul><ul className="team_point"><li className="team_a p7"><span><h3>A팀</h3><strong>6명</strong></span></li><li className="team_c p5"><span><h3>C팀</h3><strong>5명</strong></span></li><li className="team_d p2"><span><h3>D팀</h3><strong>5명</strong></span></li></ul></div><p>본관 2층 : ESD배움터</p></div>
				<div className="box f1"><div className="mapbox"><img src="/pub/images/img_current_location_map02.webp" alt="" aria-hidden="true" /><ul className="map_point"><li className="p1">사회존</li><li className="p2">미래존</li><li className="p3">도입존</li><li className="p4">지구존</li><li className="p5">ESD놀이터</li></ul><ul className="team_point"><li className="team_b p1"><span><h3>B팀</h3><strong>6명</strong></span></li></ul></div><p>본관 1층 : ESD체험터</p></div>
			</div>
			<div className="flex_half">
				<div className="box"><h2 className="stit mt0">최근 QR 인증</h2><ul className="qr_list">{[['team_a', 'A팀', 'ESD배움터 아이디어실'], ['team_b', 'B팀', 'ESD체험터 사회존'], ['team_c', 'C팀', '미디어실'], ['team_d', 'D팀', '목공실']].map(([cls, team, place]) => <li className={cls} key={team}><h3>{team}</h3><span><strong>{place}</strong><p>6명</p></span><div className="time">최근 입장 시간<time>10:20:11</time></div></li>)}</ul></div>
				<div className="box"><h2 className="stit mt0">장소별 활동 참고</h2><ul className="location_info"><li><div className="tit">ESD배움터 아이디어실</div><ul className="dots_list"><li>OT</li><li>퀘1 수행 장소</li><li>정리 및 일반화 수행 장소</li></ul></li><li><div className="tit">ESD체험터 사회존</div><ul className="dots_list"><li>퀘2 수행 장소</li><li>퀘3 수행 장소</li></ul></li><li><div className="tit">미디어실</div><ul className="dots_list"><li>퀘4 수행 장소</li></ul></li><li><div className="tit">ESD배움터 아이디어실</div><ul className="dots_list"><li>설계 및 메이커 활동 수행 장소</li></ul></li></ul></div>
			</div>
		</div>
	</TeacherShell>
)

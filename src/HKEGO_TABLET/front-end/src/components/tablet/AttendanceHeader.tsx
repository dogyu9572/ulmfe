export const AttendanceHeader = () => (
	<header className="header header_attendance">
		<h2 className="sound_only">메인메뉴 영역</h2>
		<a href="/" className="logo"><img src="/pub/images/logo.svg" alt="logo" /></a>
		<ul className="user_info">
			<li className="school"><span>학교</span><strong>울산초등학교</strong></li>
			<li className="class"><span>학년/반</span><strong>5학년 2반</strong></li>
			<li className="people"><span>인원</span><strong>22명</strong></li>
			<li className="time"><span>예약일시</span><strong>2026.05.18 10:00</strong></li>
			<li className="program"><span>교육 프로그램</span><strong>사건탐구 프로그램<br />(살고 싶은 곳, 울산)</strong></li>
		</ul>
		<button type="button" className="btn_menu">메뉴 닫기</button>
	</header>
)

import { TabletReservation } from '../../api/tabletApi'

const formatReservationDateTime = (reservation?: TabletReservation | null) => {
	if (!reservation?.rsvtYmd) return '2026.05.18 10:00'
	return `${reservation.rsvtYmd.replace(/-/g, '.')} ${reservation.vstHm || ''}`.trim()
}

const formatProgram = (reservation?: TabletReservation | null) => {
	if (!reservation) return <>사건탐구 프로그램<br />(살고 싶은 곳, 울산)</>
	return <>{reservation.prgrmTypeNm} 프로그램<br />({reservation.prgrmNm})</>
}

export const AttendanceHeader = ({ reservation }: { reservation?: TabletReservation | null }) => (
	<header className="header header_attendance">
		<h2 className="sound_only">메인메뉴 영역</h2>
		<a href="/" className="logo"><img src="/pub/images/logo.svg" alt="logo" /></a>
		<ul className="user_info">
			<li className="school"><span>학교</span><strong>{reservation?.schlNm || '울산초등학교'}</strong></li>
			<li className="class"><span>학년/반</span><strong>{reservation?.scyrNm || '5학년 2반'}</strong></li>
			<li className="people"><span>인원</span><strong>{reservation?.stdntCnt ?? reservation?.actlNope ?? 22}명</strong></li>
			<li className="time"><span>예약일시</span><strong>{formatReservationDateTime(reservation)}</strong></li>
			<li className="program"><span>교육 프로그램</span><strong>{formatProgram(reservation)}</strong></li>
		</ul>
		<button type="button" className="btn_menu">메뉴 닫기</button>
	</header>
)

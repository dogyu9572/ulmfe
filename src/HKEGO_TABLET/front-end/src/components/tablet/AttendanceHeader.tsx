import { TabletReservation } from '../../api/tabletApi'
import { useTabletSidebarToggle } from '../../hooks/useTabletSidebarToggle'

const formatReservationDateTime = (reservation?: TabletReservation | null) => {
	if (!reservation?.rsvtYmd) return '-'
	return `${reservation.rsvtYmd.replace(/-/g, '.')} ${reservation.vstHm || ''}`.trim()
}

const formatProgram = (reservation?: TabletReservation | null) => {
	if (!reservation) return <>-<br />-</>
	return <>{reservation.prgrmTypeNm || '-'} 프로그램<br />({reservation.prgrmNm || '-'})</>
}

export const AttendanceHeader = ({ reservation }: { reservation?: TabletReservation | null }) => {
	const { collapsed, toggleSidebar } = useTabletSidebarToggle()

	return (
		<header className={`header header_attendance${collapsed ? ' off' : ''}`}>
			<h2 className="sound_only">메인메뉴 영역</h2>
			<a href="/" className="logo"><img src="/pub/images/logo.svg" alt="logo" /></a>
			<ul className="user_info">
				<li className="school"><span>학교</span><strong>{reservation?.schlNm || '-'}</strong></li>
				<li className="class"><span>학년/반</span><strong>{reservation?.scyrNm || '-'}</strong></li>
				<li className="people"><span>인원</span><strong>{reservation?.stdntCnt ?? reservation?.actlNope ?? 0}명</strong></li>
				<li className="time"><span>예약일시</span><strong>{formatReservationDateTime(reservation)}</strong></li>
				<li className="program"><span>교육 프로그램</span><strong>{formatProgram(reservation)}</strong></li>
			</ul>
			<button type="button" className="btn_menu" onClick={toggleSidebar}>{collapsed ? '메뉴 열기' : '메뉴 닫기'}</button>
		</header>
	)
}

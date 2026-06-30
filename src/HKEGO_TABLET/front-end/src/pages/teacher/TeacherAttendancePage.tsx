import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AttendanceHeader } from '../../components/tablet/AttendanceHeader'
import { fetchTabletSession, TabletSession } from '../../api/tabletApi'

export const TeacherAttendancePage = () => {
	const navigate = useNavigate()
	const [session, setSession] = useState<TabletSession | null>(null)
	const loadedRef = useRef(false)
	const students = session?.students ?? []
	const attendedCount = students.filter((student) => student.atndYn === 'Y').length

	useEffect(() => {
		if (loadedRef.current) return
		loadedRef.current = true
		void fetchTabletSession()
			.then(setSession)
			.catch((error) => window.alert(error instanceof Error ? error.message : '예약 정보를 조회하지 못했습니다.'))
	}, [])

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">출석부</h1>
			<AttendanceHeader reservation={session?.reservation} />
			<section className="basic_board">
				<div className="subtitle"><strong>출석부</strong><ul className="info"><li>현재 출석인원<span>{attendedCount}명</span></li><li>총 인원<span>{students.length || session?.reservation?.stdntCnt || 0}명</span></li></ul></div>
				<ul className="attendance_list">
					{students.map((student) => {
						const attended = student.atndYn === 'Y'
						return <li key={student.stdntSn}><div className="num">{student.stdntNo}</div><div className="name">{student.stdntNm}</div><div className={`state ${attended ? 'yes' : 'no'}`}>{attended ? '참석완료' : '미참석'}</div></li>
					})}
				</ul>
				<div className="btns_btm"><button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button className="btn btn_wbb" onClick={() => navigate('/teacher/monitoring')}>다음</button></div>
			</section>
		</main>
	)
}

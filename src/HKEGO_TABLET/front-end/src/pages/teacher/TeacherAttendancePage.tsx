import { useNavigate } from 'react-router-dom'
import { AttendanceHeader } from '../../components/tablet/AttendanceHeader'

const students = Array.from({ length: 24 }, (_, index) => ({
	num: String(index + 1).padStart(2, '0'),
	attended: (index + 1) % 3 === 0
}))

export const TeacherAttendancePage = () => {
	const navigate = useNavigate()
	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">출석부</h1>
			<AttendanceHeader />
			<section className="basic_board">
				<div className="subtitle"><strong>출석부</strong><ul className="info"><li>현재 출석인원<span>10명</span></li><li>총 인원<span>26명</span></li></ul></div>
				<ul className="attendance_list">
					{students.map((student) => <li key={student.num}><div className="num">{student.num}</div><div className="name">홍길동</div><div className={`state ${student.attended ? 'yes' : 'no'}`}>{student.attended ? '참석완료' : '미참석'}</div></li>)}
				</ul>
				<div className="btns_btm"><button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button className="btn btn_wbb" onClick={() => navigate('/teacher/monitoring')}>다음</button></div>
			</section>
		</main>
	)
}

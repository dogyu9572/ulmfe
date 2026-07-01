import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AttendanceHeader } from '../../components/tablet/AttendanceHeader'
import { fetchTabletSession, markTabletAttendance, TabletSession } from '../../api/tabletApi'
import { saveTabletStudentFlowSession } from '../../state/tabletStudentFlowSession'

export const StudentAttendancePage = () => {
	const navigate = useNavigate()
	const [checkedIds, setCheckedIds] = useState<string[]>([])
	const [session, setSession] = useState<TabletSession | null>(null)
	const [loaded, setLoaded] = useState(false)
	const loadedRef = useRef(false)

	useEffect(() => {
		if (loadedRef.current) return
		loadedRef.current = true
		void fetchTabletSession()
				.then((nextSession) => {
					setSession(nextSession)
					setCheckedIds(nextSession.students
						.filter((student) => student.atndYn === 'Y')
						.map((student) => String(student.stdntSn)))
				})
				.catch((error) => window.alert(error instanceof Error ? error.message : '예약 정보를 조회하지 못했습니다.'))
				.finally(() => setLoaded(true))
	}, [])

	const students = useMemo(() => session?.students ?? [], [session])

	const handleCheck = (id: string, checked: boolean) => {
		setCheckedIds((current) => checked ? [...current, id] : current.filter((currentId) => currentId !== id))
	}

	const handleNext = async () => {
		if (checkedIds.length === 0) {
			window.alert('선택해주세요.')
			return
		}

		const rsvtSn = session?.reservation?.rsvtSn
		const selectedStudentSns = checkedIds.map(Number).filter((value) => Number.isFinite(value))
		try {
			if (rsvtSn) {
				await markTabletAttendance(rsvtSn, selectedStudentSns)
			}
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '출석 처리에 실패했습니다.')
			return
		}
		if (session) saveTabletStudentFlowSession(session, selectedStudentSns)

		if (session?.reservation?.prgrmTypeCd === 'MISSION') navigate('/student/mission_welcome')
		else if (session?.reservation?.prgrmTypeCd === 'EXPLORE') navigate('/student/welcome')
		else if (checkedIds.length === 1) navigate('/student/mission_welcome')
		else navigate('/student/welcome')
	}

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">번호를 선택해주세요</h1>
			<AttendanceHeader reservation={session?.reservation} />

			<section className="basic_board student_select_number_wrap">
				<div className="subtitle flex_center">번호를 선택해주세요</div>
				<div className="tb tac">아래에서 본인의 번호를 선택하고 다음단계를 눌러주세요.</div>

					<div className="wbox num_select_list">
						<h2 className="sound_only">번호 선택</h2>
						<ul className="list">
							{loaded && !session?.reservation && (
								<li><label><span><strong>오늘 예약된 방문 정보가 없습니다.</strong></span></label></li>
							)}
							{loaded && session?.reservation && students.length === 0 && (
								<li><label><span><strong>등록된 학생 명단이 없습니다.</strong></span></label></li>
							)}
							{students.map((student) => {
								const id = String(student.stdntSn)
								return (
									<li key={id}>
										<input
											type="checkbox"
											id={id}
											checked={checkedIds.includes(id)}
											onChange={(event) => handleCheck(id, event.currentTarget.checked)}
										/>
										<label htmlFor={id}><span><em>{student.stdntNo}</em><strong>{student.stdntNm}</strong><i aria-hidden="true"></i></span></label>
									</li>
								)
							})}
						</ul>
					</div>

				<div className="btns_btm">
					<button type="button" className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
					<button type="button" className="btn btn_wbb" onClick={handleNext}>다음</button>
				</div>
			</section>
		</main>
	)
}

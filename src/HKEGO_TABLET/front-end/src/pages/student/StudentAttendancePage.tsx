import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AttendanceHeader } from '../../components/tablet/AttendanceHeader'

const attendanceNumbers = Array.from({ length: 10 }, (_, index) => ({
	id: `number${String(index + 1).padStart(2, '0')}`,
	disabled: index === 2
}))

export const StudentAttendancePage = () => {
	const navigate = useNavigate()
	const [checkedIds, setCheckedIds] = useState<string[]>([])

	const handleCheck = (id: string, checked: boolean) => {
		setCheckedIds((current) => checked ? [...current, id] : current.filter((currentId) => currentId !== id))
	}

	const handleNext = () => {
		if (checkedIds.length === 0) {
			window.alert('선택해주세요.')
			return
		}

		if (checkedIds.length === 1) navigate('/student/mission_welcome')
		else navigate('/student/welcome')
	}

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">번호를 선택해주세요</h1>
			<AttendanceHeader />

			<section className="basic_board student_select_number_wrap">
				<div className="subtitle flex_center">번호를 선택해주세요</div>
				<div className="tb tac">아래에서 본인의 번호를 선택하고 다음단계를 눌러주세요.</div>

				<div className="wbox num_select_list">
					<h2 className="sound_only">번호 선택</h2>
					<ul className="list">
						{attendanceNumbers.map((item) => (
							<li key={item.id} className={item.disabled ? 'disabled' : undefined}>
								<input
									type="checkbox"
									id={item.id}
									disabled={item.disabled}
									checked={checkedIds.includes(item.id)}
									onChange={(event) => handleCheck(item.id, event.currentTarget.checked)}
								/>
								<label htmlFor={item.id}><span><em>01</em><strong>홍길동</strong><i aria-hidden="true"></i></span></label>
							</li>
						))}
					</ul>
				</div>

				<div className="btns_btm">
					<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
					<button className="btn btn_wbb" onClick={handleNext}>다음</button>
				</div>
			</section>
		</main>
	)
}

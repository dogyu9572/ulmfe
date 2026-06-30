import { MouseEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type UserMode = 'student' | 'teacher'

export const SelectUserPage = () => {
	const navigate = useNavigate()
	const [selectedMode, setSelectedMode] = useState<UserMode | null>(null)

	const handleSelect = (event: MouseEvent<HTMLAnchorElement>, mode: UserMode, targetUrl: string) => {
		event.preventDefault()
		setSelectedMode(mode)
		window.setTimeout(() => navigate(targetUrl), 500)
	}

	return (
		<main className="container flex_center" id="mainContent">
			<section className="member_wrap user_select_wrap flex_center colm">
				<div className="logo" aria-hidden="true"><img src="/pub/images/logo.svg" alt="" /></div>
				<div className="wbox">
					<h1 className="ctit">누가 사용하시나요?</h1>
					<p className="tb tac">해당하는 항목을 터치해 주세요.</p>
					<ul className="selects">
						<li className={selectedMode === 'student' ? 'on' : undefined}>
							<a href="/student/attendance.html" onClick={(event) => handleSelect(event, 'student', '/student/attendance')}>
								<i aria-hidden="true"><img src="/pub/images/img_user_select_01.svg" alt="" /></i><p>학생용</p>
							</a>
						</li>
						<li className={selectedMode === 'teacher' ? 'on' : undefined}>
							<a href="/teacher/attendance.html" onClick={(event) => handleSelect(event, 'teacher', '/teacher/attendance')}>
								<i aria-hidden="true"><img src="/pub/images/img_user_select_02.svg" alt="" /></i><p>선생님용</p>
							</a>
						</li>
					</ul>
					<div className="flex_center"><p className="excl">모드를 선택하면 해당 화면으로 이동합니다.</p></div>
				</div>				
				{/* <div className="management_number">태블릿 관리번호 : 005</div> */}
			</section>
		</main>
	)
}

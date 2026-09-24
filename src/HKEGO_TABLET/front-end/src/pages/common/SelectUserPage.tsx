import { pubUrl } from '../../config'
import { MouseEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTabletSession } from '../../api/tabletApi'
import { registerAndroidPushContext } from '../../push/androidPush'
import { clearTabletStudentFlowSession } from '../../state/tabletStudentFlowSession'

type UserMode = 'student' | 'teacher'

export const SelectUserPage = () => {
	const navigate = useNavigate()
	const [selectedMode, setSelectedMode] = useState<UserMode | null>(null)

	// 한 대의 태블릿을 학생들이 돌려 쓴다. 이 화면이 새 사용자가 시작하는 지점이므로
	// 앞 사람의 학습 세션을 여기서 지운다. 완료 버튼마다 지우면 빠뜨리는 경로가 생긴다.
	useEffect(() => { clearTabletStudentFlowSession() }, [])

	const handleSelect = (event: MouseEvent<HTMLAnchorElement>, mode: UserMode, targetUrl: string) => {
		event.preventDefault()
		setSelectedMode(mode)
		if (mode === 'teacher') {
			void fetchTabletSession().then((session) => {
				if (session.reservation) registerAndroidPushContext('TEACHER', session.reservation.rsvtSn)
			}).catch(() => undefined)
		}
		window.setTimeout(() => navigate(targetUrl), 500)
	}

	return (
		<main className="container flex_center" id="mainContent">
			<section className="member_wrap user_select_wrap flex_center colm">
				<div className="logo" aria-hidden="true"><img src={pubUrl("/pub/images/logo.svg")} alt="" /></div>
				<div className="wbox">
					<h1 className="ctit">누가 사용하시나요?</h1>
					<p className="tb tac">해당하는 항목을 터치해 주세요.</p>
					<ul className="selects">
						<li className={selectedMode === 'student' ? 'on' : undefined}>
							<a href="/student/attendance.html" onClick={(event) => handleSelect(event, 'student', '/student/attendance')}>
								<i aria-hidden="true"><img src={pubUrl("/pub/images/img_user_select_01.svg")} alt="" /></i><p>학생용</p>
							</a>
						</li>
						<li className={selectedMode === 'teacher' ? 'on' : undefined}>
							<a href="/teacher/attendance.html" onClick={(event) => handleSelect(event, 'teacher', '/teacher/attendance')}>
								<i aria-hidden="true"><img src={pubUrl("/pub/images/img_user_select_02.svg")} alt="" /></i><p>선생님용</p>
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

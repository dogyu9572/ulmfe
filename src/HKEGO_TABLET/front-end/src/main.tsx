import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './style.css'

const managementNumber = '005'

const LoginPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container flex_center" id="mainContent">
			<section className="member_wrap login_wrap flex_center colm">
				<div className="logo" aria-hidden="true">
					<img src="/pub/images/logo.svg" alt="" />
				</div>
				<div className="wbox">
					<h1 className="ctit">
						<span className="sound_only">울산광역시미래교육관 </span>학습지원시스템 로그인
					</h1>
					<ul className="inputs">
						<li>
							<label htmlFor="input_id">아이디</label>
							<input type="text" id="input_id" placeholder="아이디를 입력해주세요." />
						</li>
						<li>
							<label htmlFor="input_pw">비밀번호</label>
							<input type="password" id="input_pw" placeholder="비밀번호를 입력해주세요." />
						</li>
					</ul>
					<button type="button" className="btn" onClick={() => navigate('/select-user')}>
						로그인
					</button>
				</div>
				<div className="management_number">태블릿 관리번호 : {managementNumber}</div>
			</section>
		</main>
	)
}

const SelectUserPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container flex_center" id="mainContent">
			<section className="member_wrap user_select_wrap flex_center colm">
				<div className="logo" aria-hidden="true">
					<img src="/pub/images/logo.svg" alt="" />
				</div>
				<div className="wbox">
					<h1 className="ctit">누가 사용하시나요?</h1>
					<p className="tb tac">해당하는 항목을 터치해 주세요.</p>
					<ul className="selects">
						<li>
							<button type="button" onClick={() => navigate('/student/attendance')}>
								<i aria-hidden="true">
									<img src="/pub/images/img_user_select_01.svg" alt="" />
								</i>
								<p>학생용</p>
							</button>
						</li>
						<li>
							<button type="button" onClick={() => navigate('/teacher/attendance')}>
								<i aria-hidden="true">
									<img src="/pub/images/img_user_select_02.svg" alt="" />
								</i>
								<p>선생님용</p>
							</button>
						</li>
					</ul>
					<div className="flex_center">
						<p className="excl">모드를 선택하면 해당 화면으로 이동합니다.</p>
					</div>
				</div>
				<div className="management_number">태블릿 관리번호 : {managementNumber}</div>
			</section>
		</main>
	)
}

const students = Array.from({ length: 24 }, (_, index) => ({
	no: String(index + 1).padStart(2, '0'),
	name: '홍길동',
	attended: (index + 1) % 3 === 0
}))

const AttendanceHeader = () => (
	<header className="header header_attendance">
		<h2 className="sound_only">세션 정보 영역</h2>
		<a href="/select-user" className="logo">
			<img src="/pub/images/logo.svg" alt="울산광역시미래교육관" />
		</a>
		<ul className="user_info">
			<li className="school">
				<span>학교</span>
				<strong>울산초등학교</strong>
			</li>
			<li className="class">
				<span>학년/반</span>
				<strong>5학년 2반</strong>
			</li>
			<li className="purple">
				<span>인원</span>
				<strong>22명</strong>
			</li>
			<li className="time">
				<span>예약일시</span>
				<strong>2026.05.18 10:00</strong>
			</li>
			<li className="program">
				<span>교육 프로그램</span>
				<strong>
					사건탐구 프로그램
					<br />
					(살고 싶은 곳, 울산)
				</strong>
			</li>
		</ul>
	</header>
)

const AttendancePage = () => {
	const navigate = useNavigate()
	const attendedCount = students.filter((student) => student.attended).length

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">출석부</h1>
			<AttendanceHeader />
			<section className="basic_board">
				<div className="subtitle">
					<strong>출석부</strong>
					<ul className="info">
						<li>
							현재 출석인원<span>{attendedCount}명</span>
						</li>
						<li>
							총 인원<span>{students.length}명</span>
						</li>
					</ul>
				</div>
				<ul className="attendance_list">
					{students.map((student) => (
						<li key={student.no}>
							<div className="num">{student.no}</div>
							<div className="name">{student.name}</div>
							<div className={`state ${student.attended ? 'yes' : 'no'}`}>
								{student.attended ? '참석완료' : '미참석'}
							</div>
						</li>
					))}
				</ul>
				<div className="btns_btm">
					<button className="btn btn_kwg" onClick={() => navigate(-1)}>
						이전
					</button>
					<button className="btn btn_wbb">다음</button>
				</div>
			</section>
		</main>
	)
}

const App = () => (
	<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
		<Routes>
			<Route path="/" element={<LoginPage />} />
			<Route path="/select-user" element={<SelectUserPage />} />
			<Route path="/teacher/attendance" element={<AttendancePage />} />
			<Route path="/student/attendance" element={<AttendancePage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	</BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

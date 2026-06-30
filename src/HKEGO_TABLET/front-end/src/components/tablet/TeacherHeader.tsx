import { Link, useLocation } from 'react-router-dom'

const teacherMenus = [
	{ className: 'menu i1', path: '/teacher/attendance', label: '출석부' },
	{ className: 'menu i2', path: '/teacher/monitoring', label: '모니터링' },
	{ className: 'menu i3', path: '/teacher/real_time_location', label: '실시간 위치' },
	{ className: 'menu i4', path: '/teacher/message_sending', label: '메시지 발송' },
	{ className: 'menu i5 count', path: '/teacher/call_history', label: '호출 내역', count: '3' },
	{ className: 'menu i7', path: '/teacher/resource_center', label: '자료실' }
]

export const TeacherHeader = () => {
	const location = useLocation()
	const currentPath = location.pathname.replace(/\.html$/, '')

	return (
		<header className="header">
			<h2 className="sound_only">메인메뉴 영역</h2>
			<Link to="/" className="logo"><img src="/pub/images/logo.svg" alt="logo" /></Link>
			<div className="head_info">
				<h3 className="tit">현재 프로그램</h3>
				<div className="program">
					<div className="tt">사건탐구</div>
					<div className="cn">살고 싶은 곳, 울산</div>
					<ul className="count"><li className="human">22명</li><li className="time">190분</li></ul>
				</div>
			</div>
			<div className="gnb">
				<h3 className="tit">메뉴</h3>
				<ul className="list">
					{teacherMenus.map((menu) => <li className={`${menu.className}${currentPath === menu.path ? ' on' : ''}`} key={menu.path}><Link to={menu.path}>{menu.label}{menu.count && <span>{menu.count}</span>}</Link></li>)}
				</ul>
			</div>
			<button type="button" className="btn_menu">메뉴 닫기</button>
		</header>
	)
}

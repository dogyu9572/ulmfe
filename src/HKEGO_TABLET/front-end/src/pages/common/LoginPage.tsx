import { useNavigate } from 'react-router-dom'

export const LoginPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container flex_center" id="mainContent">
			<section className="member_wrap login_wrap flex_center colm">
				<div className="logo" aria-hidden="true"><img src="/pub/images/logo.svg" alt="" /></div>
				<div className="wbox">
					<h1 className="ctit"><span className="sound_only">울산광역시미래교육관 </span>관리자 로그인</h1>
					<ul className="inputs">
						<li><label htmlFor="input_id">아이디</label><input type="text" id="input_id" placeholder="아이디를 입력해주세요." /></li>
						<li><label htmlFor="input_pw">비밀번호</label><input type="password" id="input_pw" placeholder="비밀번호를 입력해주세요." /></li>
					</ul>
					<button type="button" className="btn" onClick={() => navigate('/select-user')}>로그인</button>
				</div>
				<div className="management_number">태블릿 관리번호 : 005</div>
			</section>
		</main>
	)
}

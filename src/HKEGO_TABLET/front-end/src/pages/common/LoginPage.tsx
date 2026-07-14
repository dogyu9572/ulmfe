import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginTablet } from '../../api/tabletApi'

export const LoginPage = () => {
	const navigate = useNavigate()
	const [userId, setUserId] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		if (loading) return
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const nextUserId = String(formData.get('userId') ?? '').trim()
		const nextPassword = String(formData.get('password') ?? '')
		setLoading(true)
		try {
			const loginSession = await loginTablet(nextUserId, nextPassword)
			window.sessionStorage.setItem('hkegoTabletAdminId', loginSession.adminId || nextUserId)
			navigate('/select-user')
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '로그인에 실패했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className="container flex_center" id="mainContent">
			<form className="member_wrap login_wrap flex_center colm" onSubmit={handleSubmit}>
				<div className="logo" aria-hidden="true"><img src="/pub/images/logo.svg" alt="" /></div>
					<div className="wbox">
						<h1 className="ctit"><span className="sound_only">울산광역시미래교육관 </span>관리자 로그인</h1>
						<ul className="inputs">
							<li><label htmlFor="input_id">아이디</label><input type="text" id="input_id" name="userId" placeholder="아이디를 입력해주세요." value={userId} onChange={(event) => setUserId(event.currentTarget.value)} /></li>
							<li><label htmlFor="input_pw">비밀번호</label><input type="password" id="input_pw" name="password" placeholder="비밀번호를 입력해주세요." value={password} onChange={(event) => setPassword(event.currentTarget.value)} /></li>
						</ul>
					<button type="submit" className="btn" disabled={loading}>로그인</button>
				</div>
				{/* 태블릿 관리번호 미사용 */}
			</form>
		</main>
	)
}

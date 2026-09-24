import { pubUrl } from '../../config'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginTablet } from '../../api/tabletApi'

export const LoginPage = () => {
	const navigate = useNavigate()
	const [userId, setUserId] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault()
		if (loading) return
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const nextUserId = String(formData.get('userId') ?? '').trim()
		const nextPassword = String(formData.get('password') ?? '')
		setError(null)
		setLoading(true)
		try {
			const loginSession = await loginTablet(nextUserId, nextPassword)
			window.sessionStorage.setItem('hkegoTabletAdminId', loginSession.adminId || nextUserId)
			navigate('/select-user')
		} catch (error) {
			setError(error instanceof Error ? error.message : '로그인에 실패했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className="container flex_center" id="mainContent">
			<form className="member_wrap login_wrap flex_center colm" onSubmit={handleSubmit}>
				<div className="logo" aria-hidden="true"><img src={pubUrl("/pub/images/logo.svg")} alt="" /></div>
					<div className="wbox">
						<h1 className="ctit"><span className="sound_only">울산광역시미래교육관 </span>관리자 로그인</h1>
						<ul className="inputs">
							<li><label htmlFor="input_id">아이디</label><input type="text" id="input_id" name="userId" autoComplete="username" placeholder="아이디를 입력해주세요." value={userId} onChange={(event) => setUserId(event.currentTarget.value)} /></li>
							<li><label htmlFor="input_pw">비밀번호</label><input type="password" id="input_pw" name="password" autoComplete="current-password" placeholder="비밀번호를 입력해주세요." value={password} onChange={(event) => setPassword(event.currentTarget.value)} /></li>
						</ul>
					{error && <p role="alert" style={{ margin: '0 0 16px', padding: '12px 16px', borderRadius: 10, background: '#FFF2F2', border: '1px solid #FFCFCF', color: '#E74C3C', fontSize: 17 }}>{error}</p>}
					<button type="submit" className="btn" disabled={loading}>로그인</button>
				</div>
				{/* 태블릿 관리번호 미사용 */}
			</form>
		</main>
	)
}

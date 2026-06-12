import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

export const LoginPage: React.FC = () => {
	const navigate = useNavigate()
	const [userId, setUserId] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	type SessionInfo = {
		valid: boolean
	}

	type ApiResponse<T> = {
		success: boolean
		message: string
		data: T
	}

	useEffect(() => {
		fetch(`${API_BASE_URL}/api/admin/auth/session`, { credentials: 'include' }).catch(() => {
			/* CSRF 토큰 쿠키·헤더 선취득 */
		})
	}, [])

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					userId,
					password
				}),
				credentials: 'include'
			})

			const result = await response.json()

			if (!response.ok || !result.success) {
				setError(result.message ?? '로그인에 실패했습니다.')
				return
			}

			const sessionResponse = await fetch(`${API_BASE_URL}/api/admin/auth/session`, {
				credentials: 'include'
			})
			const sessionResult: ApiResponse<SessionInfo> = await sessionResponse.json()
			if (!sessionResponse.ok || !sessionResult.success || !sessionResult.data?.valid) {
				setError('세션 확인에 실패했습니다. 브라우저 쿠키 설정을 확인해주세요.')
				return
			}

			navigate('/admin/dashboard')
		} catch (e) {
			setError('로그인 요청 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="login-page">
			<div className="login-card">
				<h1>HKSTS 관리자 로그인</h1>
				<form onSubmit={handleSubmit} className="login-form">
					<label className="form-field">
						<span>아이디</span>
						<div className="input-wrapper">
							<svg
								className="input-icon"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<circle
									cx="12"
									cy="7"
									r="4"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<input
								type="text"
								value={userId}
								onChange={(e) => setUserId(e.target.value)}
								placeholder="관리자 아이디"
								required
							/>
						</div>
					</label>
					<label className="form-field">
						<span>비밀번호</span>
						<div className="input-wrapper">
							<svg
								className="input-icon"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<rect
									x="3"
									y="11"
									width="18"
									height="11"
									rx="2"
									ry="2"
									stroke="currentColor"
									strokeWidth="2"
								/>
								<circle cx="12" cy="16" r="1" fill="currentColor" />
								<path
									d="M7 11V7A5 5 0 0 1 17 7V11"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="비밀번호"
								required
							/>
						</div>
					</label>
					{error && <p className="form-error">{error}</p>}
					<button type="submit" className="primary-button" disabled={loading}>
						{loading ? '로그인 중...' : '로그인'}
					</button>
				</form>
			</div>
		</div>
	)
}


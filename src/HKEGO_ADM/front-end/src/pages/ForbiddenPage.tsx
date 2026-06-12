import React from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'

export const ForbiddenPage: React.FC = () => {
	return (
		<AdminLayout title="접근 거부">
			<section className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
				<div style={{ padding: 32, textAlign: 'center' }}>
					<h3 style={{ marginBottom: 12 }}>해당 메뉴에 접근할 권한이 없습니다.</h3>
					<p style={{ marginBottom: 24, color: '#64748b' }}>
						현재 계정에 할당된 권한으로는 이 페이지를 볼 수 없습니다.
					</p>
					<div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
						<Link to="/admin/dashboard" className="primary-button">
							대시보드로 이동
						</Link>
						<button type="button" className="session-extend-btn" onClick={() => window.history.back()}>
							이전 페이지로
						</button>
					</div>
				</div>
			</section>
		</AdminLayout>
	)
}

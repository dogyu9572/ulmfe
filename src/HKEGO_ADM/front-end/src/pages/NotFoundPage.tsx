// 등록되지 않은 관리자 경로로 접근했을 때 보여주는 404 안내 화면
import React from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'

export const NotFoundPage: React.FC = () => {
	return (
		<AdminLayout title="페이지를 찾을 수 없음">
			<section className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
				<div style={{ padding: 32, textAlign: 'center' }}>
					<h3 style={{ marginBottom: 12 }}>요청하신 페이지를 찾을 수 없습니다.</h3>
					<p style={{ marginBottom: 24, color: '#64748b' }}>
						주소가 변경되었거나 삭제된 화면일 수 있습니다.
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

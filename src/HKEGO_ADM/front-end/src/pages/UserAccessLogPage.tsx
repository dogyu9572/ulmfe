import React, { useEffect, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = { success: boolean; message: string; data: T }
type PagedResult<T> = { list: T[]; count: number; page: number; size: number }
type UserAccessLog = {
	cntnLogSn: number
	userId: string
	userNm: string
	ipAddr: string
	requestUri: string
	requestMethod: string
	responseStatus: number
	cntnTypeCd: string
	regDt: string
}

export const UserAccessLogPage: React.FC = () => {
	const [list, setList] = useState<UserAccessLog[]>([])
	const [userId, setUsrId] = useState('')
	const [userNm, setUserNm] = useState('')
	const [ipAddr, setClientIp] = useState('')
	const [cntnTypeCd, setAccessType] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [page, setPage] = useState(1)
	const [size] = useState(20)
	const [count, setCount] = useState(0)
	const [error, setError] = useState<string | null>(null)

	const fetchList = async (targetPage = page) => {
		setError(null)
		try {
			const qs = new URLSearchParams()
			qs.set('page', String(targetPage))
			qs.set('size', String(size))
			if (userId.trim()) qs.set('userId', userId.trim())
			if (userNm.trim()) qs.set('userNm', userNm.trim())
			if (ipAddr.trim()) qs.set('ipAddr', ipAddr.trim())
			if (cntnTypeCd) qs.set('cntnTypeCd', cntnTypeCd)
			if (startDate) qs.set('startDate', startDate)
			if (endDate) qs.set('endDate', endDate)
			const res = await fetch(`${API_BASE_URL}/api/admin/user-access-log?${qs.toString()}`, { credentials: 'include' })
			const result: ApiResponse<PagedResult<UserAccessLog>> = await res.json()
			if (!result.success) {
				setError(result.message || '목록 조회 실패')
				return
			}
			setList(result.data?.list ?? [])
			setCount(result.data?.count ?? 0)
			setPage(targetPage)
		} catch {
			setError('목록 조회 중 오류가 발생했습니다.')
		}
	}

	useEffect(() => {
		void fetchList(1)
	}, [])

	const totalPages = Math.max(1, Math.ceil(count / size))

	return (
		<AdminLayout title="사용자접속로그">
			<CrudPageCard title="사용자 접속 로그" error={error}>
				<div className="code-filters search-section" style={{ flexWrap: 'wrap', gap: '8px' }}>
					<label>아이디<input type="text" value={userId} onChange={(e) => setUsrId(e.target.value)} /></label>
					<label>이름<input type="text" value={userNm} onChange={(e) => setUserNm(e.target.value)} /></label>
					<label>IP<input type="text" value={ipAddr} onChange={(e) => setClientIp(e.target.value)} /></label>
					<label>
						접속유형
						<select value={cntnTypeCd} onChange={(e) => setAccessType(e.target.value)}>
							<option value="">전체</option>
							<option value="MAIN">MAIN</option>
							<option value="LOGIN">LOGIN</option>
							<option value="LOGIN_FAIL">LOGIN_FAIL</option>
							<option value="LOGOUT">LOGOUT</option>
							<option value="API">API</option>
						</select>
					</label>
					<label>시작일<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
					<label>종료일<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
					<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList(1)}>조회</button>
				</div>

				<div className="list-toolbar">
					<span className="list-toolbar-info">{formatListToolbarInfo(count, page, totalPages)}</span>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: '80px' }}>번호</th>
							<th style={{ width: '140px' }}>아이디</th>
							<th style={{ width: '120px' }}>이름</th>
							<th style={{ width: '130px' }}>IP</th>
							<th style={{ width: '360px' }}>요청 URI</th>
							<th style={{ width: '90px' }}>메서드</th>
							<th style={{ width: '90px' }}>상태</th>
							<th style={{ width: '110px' }}>유형</th>
							<th style={{ width: '170px' }}>접속일시</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr key={row.cntnLogSn}>
								<td>{row.cntnLogSn}</td>
								<td>{row.userId ?? '-'}</td>
								<td>{row.userNm ?? '-'}</td>
								<td>{row.ipAddr ?? '-'}</td>
								<td title={row.requestUri ?? '-'}>
									<span className="request-uri-ellipsis">{row.requestUri ?? '-'}</span>
								</td>
								<td>{row.requestMethod ?? '-'}</td>
								<td>{row.responseStatus ?? '-'}</td>
								<td>{row.cntnTypeCd ?? '-'}</td>
								<td>{row.regDt ? String(row.regDt).replace('T', ' ').slice(0, 19) : '-'}</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr><td colSpan={9} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
						)}
					</tbody>
				</table>
				{totalPages > 1 && (
					<div className="pagination-wrap">
						<nav className="pagination" aria-label="페이지 네비게이션">
							<button
								type="button"
								className="pagination-btn pagination-prev"
								disabled={page <= 1}
								onClick={() => void fetchList(1)}
								aria-label="처음"
							>
								‹‹
							</button>
							<button
								type="button"
								className="pagination-btn pagination-prev"
								disabled={page <= 1}
								onClick={() => void fetchList(page - 1)}
								aria-label="이전"
							>
								‹
							</button>
							<ul className="pagination-list">
								{((): number[] => {
									const delta = 2
									const left = Math.max(1, page - delta)
									const right = Math.min(totalPages, page + delta)
									const pages: number[] = []
									for (let i = left; i <= right; i++) pages.push(i)
									if (left > 2) pages.unshift(1)
									if (right < totalPages - 1) pages.push(totalPages)
									return [...new Set(pages)].sort((a, b) => a - b)
								})().map((p, i, arr) => (
									<React.Fragment key={p}>
										{i > 0 && arr[i - 1] !== p - 1 && (
											<li className="pagination-ellipsis">…</li>
										)}
										<li>
											<button
												type="button"
												className={`pagination-btn pagination-num ${page === p ? 'active' : ''}`}
												onClick={() => void fetchList(p)}
												aria-current={page === p ? 'page' : undefined}
											>
												{p}
											</button>
										</li>
									</React.Fragment>
								))}
							</ul>
							<button
								type="button"
								className="pagination-btn pagination-next"
								disabled={page >= totalPages}
								onClick={() => void fetchList(page + 1)}
								aria-label="다음"
							>
								›
							</button>
							<button
								type="button"
								className="pagination-btn pagination-next"
								disabled={page >= totalPages}
								onClick={() => void fetchList(totalPages)}
								aria-label="마지막"
							>
								››
							</button>
						</nav>
					</div>
				)}
			</CrudPageCard>
		</AdminLayout>
	)
}

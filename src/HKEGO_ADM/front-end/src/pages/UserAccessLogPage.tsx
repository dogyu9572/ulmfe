import React, { useEffect, useRef, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL } from '../config'
import { timestampedExcelFileName } from '../utils/downloadFileName'

type ApiResponse<T> = { success: boolean; message: string; data: T }
type PagedResult<T> = { list: T[]; count: number; page: number; size: number }
type UserAccessLog = {
	cntnLogSn: number
	ipAddr: string
	requestUri: string
	regDt: string
}

function todayIso(): string {
	return new Date().toISOString().slice(0, 10)
}

function firstDayOfMonthIso(): string {
	const d = new Date()
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export const UserAccessLogPage: React.FC = () => {
	const [list, setList] = useState<UserAccessLog[]>([])
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(todayIso)
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(20)
	const [count, setCount] = useState(0)
	const [error, setError] = useState<string | null>(null)
	const isFirstSizeEffect = useRef(true)

	const buildSearchParams = (targetPage?: number) => {
		const qs = new URLSearchParams()
		if (targetPage) {
			qs.set('page', String(targetPage))
			qs.set('size', String(size))
		}
		if (startDate) qs.set('startDate', startDate)
		if (endDate) qs.set('endDate', endDate)
		return qs
	}

	const fetchList = async (targetPage = page) => {
		setError(null)
		if (startDate && endDate && startDate > endDate) {
			setError('시작일이 종료일보다 늦을 수 없습니다.')
			return
		}
		try {
			const qs = buildSearchParams(targetPage)
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

	const downloadExcel = async () => {
		setError(null)
		if (startDate && endDate && startDate > endDate) {
			setError('시작일이 종료일보다 늦을 수 없습니다.')
			return
		}
		try {
			const qs = buildSearchParams()
			const res = await fetch(`${API_BASE_URL}/api/admin/user-access-log/excel?${qs.toString()}`, {
				credentials: 'include'
			})
			if (!res.ok) {
				setError('엑셀 파일 다운로드에 실패했습니다.')
				return
			}
			const blob = await res.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = timestampedExcelFileName('사용자 접속로그', `${startDate}_${endDate}`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)
		} catch {
			setError('엑셀 파일 다운로드 중 오류가 발생했습니다.')
		}
	}

	useEffect(() => {
		void fetchList(1)
	}, [])

	useEffect(() => {
		if (isFirstSizeEffect.current) {
			isFirstSizeEffect.current = false
			return
		}
		void fetchList(1)
	}, [size])

	const totalPages = Math.max(1, Math.ceil(count / size))

	return (
		<AdminLayout title="사용자 접속로그">
			<CrudPageCard title="사용자 접속 로그" error={error}>
				<div className="code-filters search-section" style={{ flexWrap: 'wrap', gap: '8px' }}>
					<label>접속일<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
					<span className="visitor-stats-range-sep">~</span>
					<label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
					<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList(1)}>조회</button>
				</div>

				<div className="list-toolbar">
					<span className="list-toolbar-info">{formatListToolbarInfo(count, page, totalPages)}</span>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<select
							className="list-page-size-select"
							value={size}
							onChange={(e) => {
								setSize(Number(e.target.value))
								setPage(1)
							}}
						>
							<option value={20}>20개씩 보기</option>
							<option value={50}>50개씩 보기</option>
							<option value={100}>100개씩 보기</option>
						</select>
						<button type="button" className="admin-list-btn-sky" onClick={() => void downloadExcel()}>
							엑셀파일 다운로드
						</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: '80px' }}>번호</th>
							<th style={{ width: '170px' }}>접속일시</th>
							<th style={{ width: '150px' }}>접속 IP</th>
							<th>접속 페이지 URL</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row, index) => (
							<tr key={row.cntnLogSn}>
								<td>{count - (page - 1) * size - index}</td>
								<td>{row.regDt ? String(row.regDt).replace('T', ' ').slice(0, 19) : '-'}</td>
								<td>{row.ipAddr ?? '-'}</td>
								<td title={row.requestUri ?? '-'}>
									<span className="request-uri-ellipsis">{row.requestUri ?? '-'}</span>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr><td colSpan={4} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
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

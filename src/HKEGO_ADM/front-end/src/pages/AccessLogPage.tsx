import React, { useEffect, useRef, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL } from '../config'
import { codeDetailId } from '../utils/codeDetail'
import { timestampedExcelFileName } from '../utils/downloadFileName'

type ApiResponse<T> = { success: boolean; message: string; data: T }
type PagedResult<T> = { list: T[]; count: number; page: number; size: number }
type CodeDetail = {
	cdDtlId?: string
	code?: string
	cdDtlNm: string
	seq: number | null
}
type AccessLog = {
	cntnLogSn: number
	menu1Cd: string
	menu1Nm: string
	menu2Cd: string
	menu2Nm: string
	actionNm: string
	actionCn: string
	ipAddr: string
	userNm: string
	regDt: string
}

function formatLocalDate(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0')
	].join('-')
}

function firstDayOfMonthIso(): string {
	const now = new Date()
	return formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

function lastDayOfMonthIso(): string {
	const now = new Date()
	return formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}

export const AccessLogPage: React.FC = () => {
	const [list, setList] = useState<AccessLog[]>([])
	const [topMenus, setTopMenus] = useState<CodeDetail[]>([])
	const [subMenus, setSubMenus] = useState<CodeDetail[]>([])
	const [menu1Cd, setMenu1Cd] = useState('')
	const [menu2Cd, setMenu2Cd] = useState('')
	const [userNm, setUserNm] = useState('')
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(lastDayOfMonthIso)
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(20)
	const [count, setCount] = useState(0)
	const [error, setError] = useState<string | null>(null)
	const isFirstSizeEffect = useRef(true)

	const visibleSubMenus = subMenus.filter((menu) => !menu1Cd || codeDetailId(menu).startsWith(menu1Cd))

	const buildSearchParams = (targetPage?: number) => {
		const qs = new URLSearchParams()
		if (targetPage) {
			qs.set('page', String(targetPage))
			qs.set('size', String(size))
		}
		if (menu1Cd) qs.set('menu1Cd', menu1Cd)
		if (menu2Cd) qs.set('menu2Cd', menu2Cd)
		if (userNm.trim()) qs.set('userNm', userNm.trim())
		if (startDate) qs.set('startDate', startDate)
		if (endDate) qs.set('endDate', endDate)
		return qs
	}

	const fetchMenus = async () => {
		try {
			const [topRes, subRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/admin/codes/detail?cdId=COM001&useYn=Y`, { credentials: 'include' }),
				fetch(`${API_BASE_URL}/api/admin/codes/detail?cdId=COM002&useYn=Y`, { credentials: 'include' })
			])
			const topResult: ApiResponse<CodeDetail[]> = await topRes.json()
			const subResult: ApiResponse<CodeDetail[]> = await subRes.json()
			if (topResult.success) setTopMenus([...(topResult.data ?? [])].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0)))
			if (subResult.success) setSubMenus([...(subResult.data ?? [])].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0)))
		} catch {
			setError('관리자 메뉴 목록을 불러오지 못했습니다.')
		}
	}

	const fetchList = async (targetPage = page) => {
		setError(null)
		if (startDate && endDate && startDate > endDate) {
			setError('시작일이 종료일보다 늦을 수 없습니다.')
			return
		}
		try {
			const qs = buildSearchParams(targetPage)
			const res = await fetch(`${API_BASE_URL}/api/admin/access-log?${qs.toString()}`, { credentials: 'include' })
			const result: ApiResponse<PagedResult<AccessLog>> = await res.json()
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
			const res = await fetch(`${API_BASE_URL}/api/admin/access-log/excel?${qs.toString()}`, {
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
			link.download = timestampedExcelFileName('관리자 접속로그', `${startDate}_${endDate}`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)
		} catch {
			setError('엑셀 파일 다운로드 중 오류가 발생했습니다.')
		}
	}

	useEffect(() => {
		void fetchMenus()
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
		<AdminLayout title="관리자 접속로그">
			<CrudPageCard title="관리자 접속로그" error={error}>
				<div className="code-filters search-section" style={{ flexWrap: 'wrap', gap: '8px' }}>
					<label>
						관리자 메뉴
						<select
							value={menu1Cd}
							onChange={(e) => {
								setMenu1Cd(e.target.value)
								setMenu2Cd('')
							}}
						>
							<option value="">1depth 전체</option>
							{topMenus.map((menu) => (
								<option key={codeDetailId(menu)} value={codeDetailId(menu)}>{menu.cdDtlNm}</option>
							))}
						</select>
					</label>
					<label>
						<select value={menu2Cd} onChange={(e) => setMenu2Cd(e.target.value)}>
							<option value="">2depth 전체</option>
							{visibleSubMenus.map((menu) => (
								<option key={codeDetailId(menu)} value={codeDetailId(menu)}>{menu.cdDtlNm}</option>
							))}
						</select>
					</label>
					<label>관리자 이름<input type="text" value={userNm} onChange={(e) => setUserNm(e.target.value)} /></label>
					<label>등록일<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
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
							<th style={{ width: '70px' }}>번호</th>
							<th style={{ width: '140px' }}>1depth</th>
							<th style={{ width: '160px' }}>2depth</th>
							<th style={{ width: '100px' }}>버튼 액션</th>
							<th>내용</th>
							<th style={{ width: '140px' }}>접속 IP</th>
							<th style={{ width: '120px' }}>관리자</th>
							<th style={{ width: '170px' }}>등록일시</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row, index) => (
							<tr key={row.cntnLogSn}>
								<td>{count - (page - 1) * size - index}</td>
								<td>{row.menu1Nm || '-'}</td>
								<td>{row.menu2Nm || '-'}</td>
								<td>{row.actionNm || '-'}</td>
								<td title={row.actionCn || '-'}>{row.actionCn || '-'}</td>
								<td>{row.ipAddr || '-'}</td>
								<td>{row.userNm || '-'}</td>
								<td>{row.regDt ? String(row.regDt).replace('T', ' ').slice(0, 19) : '-'}</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr><td colSpan={8} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
						)}
					</tbody>
				</table>
				{totalPages > 1 && (
					<div className="pagination-wrap">
						<nav className="pagination" aria-label="페이지 네비게이션">
							<button type="button" className="pagination-btn pagination-prev" disabled={page <= 1} onClick={() => void fetchList(1)} aria-label="처음">‹‹</button>
							<button type="button" className="pagination-btn pagination-prev" disabled={page <= 1} onClick={() => void fetchList(page - 1)} aria-label="이전">‹</button>
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
										{i > 0 && arr[i - 1] !== p - 1 && <li className="pagination-ellipsis">…</li>}
										<li>
											<button type="button" className={`pagination-btn pagination-num ${page === p ? 'active' : ''}`} onClick={() => void fetchList(p)} aria-current={page === p ? 'page' : undefined}>{p}</button>
										</li>
									</React.Fragment>
								))}
							</ul>
							<button type="button" className="pagination-btn pagination-next" disabled={page >= totalPages} onClick={() => void fetchList(page + 1)} aria-label="다음">›</button>
							<button type="button" className="pagination-btn pagination-next" disabled={page >= totalPages} onClick={() => void fetchList(totalPages)} aria-label="마지막">››</button>
						</nav>
					</div>
				)}
			</CrudPageCard>
		</AdminLayout>
	)
}

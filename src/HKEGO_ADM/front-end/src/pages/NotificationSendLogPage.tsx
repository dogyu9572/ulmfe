import React, { useEffect, useRef, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { ListPagination } from '../components/ListPagination'
import { API_BASE_URL } from '../config'
import { timestampedExcelFileName } from '../utils/downloadFileName'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'

type ApiResponse<T> = { success: boolean; message: string; data: T }
type PagedResult<T> = { list: T[]; count: number; page: number; size: number }
type NotificationSendLog = {
	logKey: string
	sendDt: string
	schlNm: string
	targetCd: string
	targetNm: string
	content: string
	successYn: string
	successNm: string
}

function formatLocalDate(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0')
	].join('-')
}

function todayIso(): string {
	return formatLocalDate(new Date())
}

function firstDayOfMonthIso(): string {
	const now = new Date()
	return formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

export const NotificationSendLogPage: React.FC = () => {
	const [list, setList] = useState<NotificationSendLog[]>([])
	const [targetCd, setTargetCd] = useState('')
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(todayIso)
	const [searchType, setSearchType] = useState('all')
	const [keyword, setKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [size, setSize] = useState(20)
	const [count, setCount] = useState(0)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const firstSizeEffect = useRef(true)

	const buildSearchParams = (targetPage?: number) => {
		const params = new URLSearchParams()
		if (targetPage) {
			params.set('page', String(targetPage))
			params.set('size', String(size))
		}
		if (targetCd) params.set('targetCd', targetCd)
		if (startDate) params.set('startDate', startDate)
		if (endDate) params.set('endDate', endDate)
		params.set('searchType', searchType)
		if (keyword.trim()) params.set('keyword', keyword.trim())
		return params
	}

	const validateDates = () => {
		if (startDate && endDate && startDate > endDate) {
			setError('시작일이 종료일보다 늦을 수 없습니다.')
			return false
		}
		return true
	}

	const fetchList = async (targetPage = page) => {
		setError(null)
		if (!validateDates()) return
		try {
			setLoading(true)
			const params = buildSearchParams(targetPage)
			const response = await fetch(`${API_BASE_URL}/api/admin/notification-log?${params.toString()}`, {
				credentials: 'include'
			})
			const result: ApiResponse<PagedResult<NotificationSendLog>> = await response.json()
			if (!response.ok || !result.success) {
				setError(result.message || '알림 발송 로그 조회에 실패했습니다.')
				return
			}
			setList(result.data?.list ?? [])
			setCount(result.data?.count ?? 0)
			setPage(targetPage)
		} catch {
			setError('알림 발송 로그 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const downloadExcel = async () => {
		setError(null)
		if (!validateDates()) return
		try {
			const params = buildSearchParams()
			const response = await fetch(`${API_BASE_URL}/api/admin/notification-log/excel?${params.toString()}`, {
				credentials: 'include'
			})
			if (!response.ok) {
				setError('엑셀 파일 다운로드에 실패했습니다.')
				return
			}
			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = timestampedExcelFileName('알림 발송 로그', `${startDate}_${endDate}`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)
		} catch {
			setError('엑셀 파일 다운로드 중 오류가 발생했습니다.')
		}
	}

	const reset = () => {
		setTargetCd('')
		setStartDate(firstDayOfMonthIso())
		setEndDate(todayIso())
		setSearchType('all')
		setKeyword('')
	}

	useEffect(() => {
		void fetchList(1)
	}, [])

	useEffect(() => {
		if (firstSizeEffect.current) {
			firstSizeEffect.current = false
			return
		}
		void fetchList(1)
	}, [size])

	const totalPages = Math.max(1, Math.ceil(count / size))

	return (
		<AdminLayout title="알림 발송 로그">
			<CrudPageCard title="알림 발송 로그" error={error}>
				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">발송 대상</label>
						<select className="bbs-post-filter-select" value={targetCd} onChange={(e) => setTargetCd(e.target.value)}>
							<option value="">전체</option>
							<option value="TEACHER_TO_STUDENT">선생님 -&gt; 학생</option>
							<option value="STUDENT_TO_TEACHER">학생 -&gt; 선생님</option>
						</select>
						<label className="bbs-post-filter-label">발송일</label>
						<input type="date" className="bbs-post-filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						<span className="bbs-post-filter-sep">~</span>
						<input type="date" className="bbs-post-filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<select className="bbs-post-filter-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
							<option value="all">전체</option>
							<option value="school">발송 학교</option>
							<option value="content">내용</option>
						</select>
						<input
							type="text"
							className="bbs-post-filter-input"
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') void fetchList(1) }}
							placeholder="검색어"
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList(1)}>검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={reset}>초기화</button>
					</div>
				</div>

				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<span className="list-toolbar-info">{formatListToolbarInfo(count, page, totalPages)}</span>
						<select
							value={size}
							onChange={(e) => setSize(Number(e.target.value))}
							className="list-page-size-select"
							aria-label="페이지당 목록 개수"
						>
							<option value={20}>20개씩 보기</option>
							<option value={50}>50개씩 보기</option>
							<option value={100}>100개씩 보기</option>
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void downloadExcel()}>
							엑셀파일 다운로드
						</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 80 }}>번호</th>
							<th style={{ width: 170 }}>발송일시</th>
							<th style={{ width: 180 }}>발송 학교</th>
							<th style={{ width: 150 }}>발송 대상</th>
							<th>내용</th>
							<th style={{ width: 110 }}>발송 성공</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row, index) => (
							<tr key={row.logKey}>
								<td>{count - (page - 1) * size - index}</td>
								<td>{row.sendDt ? String(row.sendDt).replace('T', ' ').slice(0, 19) : '-'}</td>
								<td>{row.schlNm || '-'}</td>
								<td>{row.targetNm || '-'}</td>
								<td title={row.content || '-'}>{row.content || '-'}</td>
								<td>{row.successNm || '-'}</td>
							</tr>
						))}
						{!loading && list.length === 0 && (
							<tr><td colSpan={6} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
						)}
						{loading && (
							<tr><td colSpan={6} style={{ textAlign: 'center' }}>조회 중입니다.</td></tr>
						)}
					</tbody>
				</table>
				<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={(nextPage) => void fetchList(nextPage)} />
			</CrudPageCard>
		</AdminLayout>
	)
}

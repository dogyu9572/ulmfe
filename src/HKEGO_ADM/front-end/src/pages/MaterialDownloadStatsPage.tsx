import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { ListPagination } from '../components/ListPagination'
import { API_BASE_URL } from '../config'
import { timestampedExcelFileName } from '../utils/downloadFileName'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

type ApiResponse<T> = { success: boolean; message: string; data: T }
type MaterialStats = {
	pstSn: string
	lrnTypeCd: string
	lrnTypeNm: string
	dataTypeCd: string
	dataTypeNm: string
	programNm: string
	postTitle: string
	attachmentFileMngNo?: string
	fileSeq?: number
	originalFileName: string
	downloadCount: number
	fileRegDt: string
}
type StatsPage = { list: MaterialStats[]; count: number; page: number; size: number }

function formatLocalDate(date: Date): string {
	return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function firstDayOfMonthIso(): string {
	const now = new Date()
	return formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

function todayIso(): string {
	return formatLocalDate(new Date())
}

export const MaterialDownloadStatsPage: React.FC = () => {
	const [rows, setRows] = useState<MaterialStats[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(20)
	const [lrnTypeCd, setLrnTypeCd] = useState('')
	const [dataTypeCd, setDataTypeCd] = useState('')
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(todayIso)
	const [searchType, setSearchType] = useState('all')
	const [keyword, setKeyword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	const buildSearchParams = (targetPage?: number, includePaging = true) => {
		const params = new URLSearchParams()
		if (lrnTypeCd) params.set('lrnTypeCd', lrnTypeCd)
		if (dataTypeCd) params.set('dataTypeCd', dataTypeCd)
		if (startDate) params.set('startDate', startDate)
		if (endDate) params.set('endDate', endDate)
		params.set('searchType', searchType)
		if (keyword.trim()) params.set('keyword', keyword.trim())
		if (includePaging) {
			params.set('page', String(targetPage ?? page))
			params.set('size', String(pageSize))
		}
		return params
	}

	const validateDates = () => {
		if (startDate && endDate && startDate > endDate) {
			setError('시작일이 종료일보다 늦을 수 없습니다.')
			return false
		}
		return true
	}

	const fetchStats = async (targetPage = page) => {
		setError(null)
		if (!validateDates()) return
		try {
			setLoading(true)
			const response = await fetch(`${API_BASE_URL}/api/admin/material-download-stats?${buildSearchParams(targetPage).toString()}`, { credentials: 'include' })
			const result: ApiResponse<StatsPage> = await response.json()
			if (!response.ok || !result.success) {
				setError(result.message || '자료실 다운로드 통계 조회에 실패했습니다.')
				return
			}
			setRows(result.data?.list ?? [])
			setTotalCount(result.data?.count ?? 0)
			setPage(result.data?.page ?? targetPage)
		} catch {
			setError('자료실 다운로드 통계 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const downloadExcel = async () => {
		setError(null)
		if (!validateDates()) return
		try {
			const response = await fetch(`${API_BASE_URL}/api/admin/material-download-stats/excel?${buildSearchParams(undefined, false).toString()}`, { credentials: 'include' })
			if (!response.ok) {
				setError('엑셀 파일 다운로드에 실패했습니다.')
				return
			}
			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = timestampedExcelFileName('자료실 다운로드 통계', `${startDate}_${endDate}`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)
		} catch {
			setError('엑셀 파일 다운로드 중 오류가 발생했습니다.')
		}
	}

	const reset = () => {
		setLrnTypeCd('')
		setDataTypeCd('')
		setStartDate(firstDayOfMonthIso())
		setEndDate(todayIso())
		setSearchType('all')
		setKeyword('')
		setPage(1)
	}

	useEffect(() => {
		void fetchStats(1)
	}, [pageSize])

	return (
		<AdminLayout title="자료실 다운로드 통계">
			<CrudPageCard title="자료실 다운로드 통계" error={error}>
				<p className="visitor-stats-desc">학습지원 자료실 첨부파일 다운로드 통계를 확인합니다.</p>
				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
						<select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="list-page-size-select" aria-label="페이지당 목록 개수">
							{PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void downloadExcel()}>엑셀파일 다운로드</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">학습유형</label>
						<select className="bbs-post-filter-select" value={lrnTypeCd} onChange={(e) => setLrnTypeCd(e.target.value)}>
							<option value="">전체</option><option value="PRE">사전학습</option><option value="MAIN">본학습</option><option value="POST">사후학습</option>
						</select>
						<label className="bbs-post-filter-label">자료구분</label>
						<select className="bbs-post-filter-select" value={dataTypeCd} onChange={(e) => setDataTypeCd(e.target.value)}>
							<option value="">전체</option><option value="LINK">링크</option><option value="DOC">문서</option><option value="VIDEO">영상</option>
						</select>
						<label className="bbs-post-filter-label">기간</label>
						<input type="date" className="bbs-post-filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						<span className="bbs-post-filter-sep">~</span>
						<input type="date" className="bbs-post-filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<select className="bbs-post-filter-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
							<option value="all">전체</option><option value="program">프로그램명</option><option value="title">제목</option><option value="file">첨부파일명</option>
						</select>
						<input type="text" className="bbs-post-filter-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void fetchStats(1) }} placeholder="검색어" />
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchStats(1)}>검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={reset}>초기화</button>
					</div>
				</div>

				<table className="table">
					<thead><tr><th style={{ width: 80 }}>번호</th><th style={{ width: 120 }}>학습유형</th><th style={{ width: 180 }}>프로그램명</th><th>게시글 제목</th><th style={{ width: 220 }}>첨부파일명</th><th style={{ width: 120 }}>다운로드 수</th><th style={{ width: 140 }}>파일등록일</th></tr></thead>
					<tbody>
						{rows.map((row, index) => (
							<tr key={`${row.pstSn}_${row.attachmentFileMngNo ?? 'link'}_${row.fileSeq ?? 'none'}`}>
								<td>{totalCount - ((page - 1) * pageSize) - index}</td><td>{row.lrnTypeNm || '-'}</td><td>{row.programNm || '-'}</td><td>{row.postTitle || '-'}</td><td>{row.originalFileName || '-'}</td><td>{(row.downloadCount ?? 0).toLocaleString()}</td><td>{row.fileRegDt?.slice(0, 10) || '-'}</td>
							</tr>
						))}
						{!loading && rows.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>}
						{loading && <tr><td colSpan={7} style={{ textAlign: 'center' }}>조회 중입니다.</td></tr>}
					</tbody>
				</table>
				<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={(nextPage) => void fetchStats(nextPage)} />
			</CrudPageCard>
		</AdminLayout>
	)
}

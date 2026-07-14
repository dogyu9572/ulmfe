import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL } from '../config'
import { timestampedExcelFileName } from '../utils/downloadFileName'

type ApiResponse<T> = { success: boolean; message: string; data: T }
type ProgramStats = {
	programTypeCd: string
	programTypeNm: string
	programSn: number
	programNm: string
	step1CompletionRate: number
	step2CompletionRate: number
	step3CompletionRate: number
	step4CompletionRate: number
}

function formatLocalDate(date: Date): string {
	return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

function firstDayOfMonthIso(): string {
	const now = new Date()
	return formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

function lastDayOfMonthIso(): string {
	const now = new Date()
	return formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}

function rate(value?: number | null): string {
	const number = value ?? 0
	return `${Number.isInteger(number) ? number.toFixed(0) : number.toFixed(1)}%`
}

export const EducationProgramStatsPage: React.FC = () => {
	const [rows, setRows] = useState<ProgramStats[]>([])
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(lastDayOfMonthIso)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const buildSearchParams = () => {
		const params = new URLSearchParams()
		if (startDate) params.set('startDate', startDate)
		if (endDate) params.set('endDate', endDate)
		return params
	}

	const validateDates = () => {
		if (startDate && endDate && startDate > endDate) {
			setError('시작일이 종료일보다 늦을 수 없습니다.')
			return false
		}
		return true
	}

	const fetchStats = async () => {
		setError(null)
		if (!validateDates()) return
		try {
			setLoading(true)
			const response = await fetch(`${API_BASE_URL}/api/admin/education-program-stats?${buildSearchParams().toString()}`, { credentials: 'include' })
			const result: ApiResponse<ProgramStats[]> = await response.json()
			if (!response.ok || !result.success) {
				setError(result.message || '교육프로그램 통계 조회에 실패했습니다.')
				return
			}
			setRows(result.data ?? [])
		} catch {
			setError('교육프로그램 통계 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const downloadExcel = async () => {
		setError(null)
		if (!validateDates()) return
		try {
			const response = await fetch(`${API_BASE_URL}/api/admin/education-program-stats/excel?${buildSearchParams().toString()}`, { credentials: 'include' })
			if (!response.ok) {
				setError('엑셀 파일 다운로드에 실패했습니다.')
				return
			}
			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = timestampedExcelFileName('교육프로그램 통계', `${startDate}_${endDate}`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)
		} catch {
			setError('엑셀 파일 다운로드 중 오류가 발생했습니다.')
		}
	}

	const reset = () => {
		setStartDate(firstDayOfMonthIso())
		setEndDate(lastDayOfMonthIso())
	}

	useEffect(() => {
		void fetchStats()
	}, [])

	return (
		<AdminLayout title="교육프로그램 통계">
			<CrudPageCard title="교육프로그램 통계" error={error}>
				<p className="visitor-stats-desc">학습지원시스템의 진척률 통계를 확인할 수 있습니다.</p>
				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">학습 기간</label>
						<input type="date" className="bbs-post-filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						<span className="bbs-post-filter-sep">~</span>
						<input type="date" className="bbs-post-filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchStats()}>검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={reset}>초기화</button>
					</div>
				</div>

				<div className="list-toolbar">
					<div className="list-toolbar-left" />
					<div className="list-toolbar-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void downloadExcel()}>엑셀파일 다운로드</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 140 }}>프로그램 구분</th>
							<th>프로그램명</th>
							<th style={{ width: 120 }}>STEP1 완료율</th>
							<th style={{ width: 120 }}>STEP2 완료율</th>
							<th style={{ width: 120 }}>STEP3 완료율</th>
							<th style={{ width: 120 }}>STEP4 완료율</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={`${row.programTypeCd}_${row.programSn}`}>
								<td>{row.programTypeNm || '-'}</td>
								<td>{row.programNm || '-'}</td>
								<td>{rate(row.step1CompletionRate)}</td>
								<td>{rate(row.step2CompletionRate)}</td>
								<td>{rate(row.step3CompletionRate)}</td>
								<td>{rate(row.step4CompletionRate)}</td>
							</tr>
						))}
						{!loading && rows.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>}
						{loading && <tr><td colSpan={6} style={{ textAlign: 'center' }}>조회 중입니다.</td></tr>}
					</tbody>
				</table>
			</CrudPageCard>
		</AdminLayout>
	)
}

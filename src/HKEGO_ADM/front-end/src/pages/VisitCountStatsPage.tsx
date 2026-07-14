import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL } from '../config'
import { timestampedExcelFileName } from '../utils/downloadFileName'

type ApiResponse<T> = { success: boolean; message: string; data: T }
type VisitSummary = {
	programTypeCd: string
	programTypeNm: string
	reservedSchoolCount: number
	visitedSchoolCount: number
	reservedStudentCount: number
	attendedStudentCount: number
}
type SchoolStats = {
	schlNm: string
	gradeClassNm: string
	visitCount: number
	totalStudentCount: number
	attendedStudentCount: number
	lastVisitDate: string
}
type VisitCountStats = {
	summary: VisitSummary[]
	schools: SchoolStats[]
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

function count(value?: number | null): number {
	return value ?? 0
}

export const VisitCountStatsPage: React.FC = () => {
	const [summary, setSummary] = useState<VisitSummary[]>([])
	const [schools, setSchools] = useState<SchoolStats[]>([])
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
			const response = await fetch(`${API_BASE_URL}/api/admin/visitor-stats?${buildSearchParams().toString()}`, {
				credentials: 'include'
			})
			const result: ApiResponse<VisitCountStats> = await response.json()
			if (!response.ok || !result.success) {
				setError(result.message || '방문 인원 통계 조회에 실패했습니다.')
				return
			}
			setSummary(result.data?.summary ?? [])
			setSchools(result.data?.schools ?? [])
		} catch {
			setError('방문 인원 통계 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const downloadExcel = async () => {
		setError(null)
		if (!validateDates()) return
		try {
			const response = await fetch(`${API_BASE_URL}/api/admin/visitor-stats/excel?${buildSearchParams().toString()}`, {
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
			link.download = timestampedExcelFileName('방문 인원 통계', `${startDate}_${endDate}`)
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
		<AdminLayout title="방문 인원 통계">
			<CrudPageCard title="방문 인원 통계" error={error}>
				<p className="visitor-stats-desc">예약관리 데이터를 토대로 방문인원 통계를 확인할 수 있습니다.</p>
				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">기간조회</label>
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
						<button type="button" className="admin-list-btn-sky" onClick={() => void downloadExcel()}>
							엑셀파일 다운로드
						</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th>프로그램 구분</th>
							<th>예약 학교 수(명)</th>
							<th>방문 학교 수(명)</th>
							<th>예약 학생 수(명)</th>
							<th>출석완료 학생 수(명)</th>
						</tr>
					</thead>
					<tbody>
						{summary.map((row) => (
							<tr key={row.programTypeCd}>
								<td>{row.programTypeNm}</td>
								<td>{count(row.reservedSchoolCount).toLocaleString()}</td>
								<td>{count(row.visitedSchoolCount).toLocaleString()}</td>
								<td>{count(row.reservedStudentCount).toLocaleString()}</td>
								<td>{count(row.attendedStudentCount).toLocaleString()}</td>
							</tr>
						))}
						{!loading && summary.length === 0 && (
							<tr><td colSpan={5} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
						)}
						{loading && (
							<tr><td colSpan={5} style={{ textAlign: 'center' }}>조회 중입니다.</td></tr>
						)}
					</tbody>
				</table>

				<h3 className="visitor-stats-panel-title" style={{ marginTop: 24 }}>학교별 집계</h3>
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 80 }}>순위</th>
							<th>학교명</th>
							<th style={{ width: 220 }}>학년/반</th>
							<th style={{ width: 120 }}>방문횟수</th>
							<th style={{ width: 160 }}>총 방문 학생 수</th>
							<th style={{ width: 160 }}>출석완료 학생 수</th>
							<th style={{ width: 140 }}>마지막 방문</th>
						</tr>
					</thead>
					<tbody>
						{schools.map((row, index) => (
							<tr key={row.schlNm}>
								<td>{index + 1}</td>
								<td>{row.schlNm || '-'}</td>
								<td>{row.gradeClassNm || '-'}</td>
								<td>{count(row.visitCount).toLocaleString()}회</td>
								<td>{count(row.totalStudentCount).toLocaleString()}</td>
								<td>{count(row.attendedStudentCount).toLocaleString()}</td>
								<td>{row.lastVisitDate || '-'}</td>
							</tr>
						))}
						{!loading && schools.length === 0 && (
							<tr><td colSpan={7} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
						)}
						{loading && (
							<tr><td colSpan={7} style={{ textAlign: 'center' }}>조회 중입니다.</td></tr>
						)}
					</tbody>
				</table>
			</CrudPageCard>
		</AdminLayout>
	)
}

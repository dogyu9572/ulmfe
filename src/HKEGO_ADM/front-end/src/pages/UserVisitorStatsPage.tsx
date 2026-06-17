import React, { useCallback, useEffect, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type SummaryData = {
	baseDate: string
	totalVisitCount: number
	yesterdayDate: string
	yesterdayVisitCount: number
	todayDate: string
	todayVisitCount: number
	peakDate: string | null
	peakVisitCount: number
}

type StatRow = {
	label: string
	visitCount: number
	visitDate?: string
	year?: number
	month?: number
	hour?: number
}

const BACKEND = API_BASE_URL

function todayIso(): string {
	return new Date().toISOString().slice(0, 10)
}

function formatNum(n: number): string {
	return Number(n || 0).toLocaleString('ko-KR')
}

function defaultYearRange(): { startYear: number; endYear: number } {
	const y = new Date().getFullYear()
	return { startYear: y - 4, endYear: y }
}

function daysAgoIso(days: number): string {
	const d = new Date()
	d.setDate(d.getDate() - days)
	return d.toISOString().slice(0, 10)
}

type StatPanelProps = {
	title: string
	hint?: string
	filter: React.ReactNode
	rows: StatRow[]
	loading: boolean
	valueHeader?: string
}

const StatPanel: React.FC<StatPanelProps> = ({
	title,
	hint,
	filter,
	rows,
	loading,
	valueHeader = '방문자 수'
}) => (
	<section className="visitor-stats-panel">
		<h3 className="visitor-stats-panel-title">{title}</h3>
		<div className="code-filters search-section visitor-stats-panel-filter">{filter}</div>
		{hint ? <p className="visitor-stats-panel-hint">{hint}</p> : null}
		<div className="table-wrap visitor-stats-panel-table-wrap">
			<table className="table visitor-stats-panel-table">
				<thead>
					<tr>
						<th>구분</th>
						<th style={{ width: 140, textAlign: 'right' }}>{valueHeader}</th>
					</tr>
				</thead>
				<tbody>
					{loading ? (
						<tr>
							<td colSpan={2} style={{ textAlign: 'center' }}>
								조회 중…
							</td>
						</tr>
					) : rows.length === 0 ? (
						<tr>
							<td colSpan={2} style={{ textAlign: 'center' }}>
								데이터가 없습니다.
							</td>
						</tr>
					) : (
						rows.map((row) => (
							<tr key={row.label}>
								<td>{row.label}</td>
								<td style={{ textAlign: 'right' }}>{formatNum(row.visitCount)}</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	</section>
)

export const UserVisitorStatsPage: React.FC = () => {
	const [error, setError] = useState<string | null>(null)
	const [baseDate, setBaseDate] = useState(todayIso)
	const [summary, setSummary] = useState<SummaryData | null>(null)
	const [summaryLoading, setSummaryLoading] = useState(false)

	const [yearStart, setYearStart] = useState(() => String(defaultYearRange().startYear))
	const [yearEnd, setYearEnd] = useState(() => String(defaultYearRange().endYear))
	const [yearlyRows, setYearlyRows] = useState<StatRow[]>([])
	const [yearlyLoading, setYearlyLoading] = useState(false)

	const [monthStartYear, setMonthStartYear] = useState(() => String(defaultYearRange().startYear))
	const [monthEndYear, setMonthEndYear] = useState(() => String(defaultYearRange().endYear))
	const [monthlyRows, setMonthlyRows] = useState<StatRow[]>([])
	const [monthlyLoading, setMonthlyLoading] = useState(false)

	const [dailyStart, setDailyStart] = useState(() => daysAgoIso(29))
	const [dailyEnd, setDailyEnd] = useState(todayIso)
	const [dailyRows, setDailyRows] = useState<StatRow[]>([])
	const [dailyLoading, setDailyLoading] = useState(false)

	const [hourlyStart, setHourlyStart] = useState(() => daysAgoIso(6))
	const [hourlyEnd, setHourlyEnd] = useState(todayIso)
	const [hourlyRows, setHourlyRows] = useState<StatRow[]>([])
	const [hourlyLoading, setHourlyLoading] = useState(false)

	const fetchSummary = useCallback(async () => {
		setSummaryLoading(true)
		setError(null)
		try {
			const res = await fetch(
				`${BACKEND}/api/admin/user-visitor-stats/summary?baseDate=${encodeURIComponent(baseDate)}`,
				{ credentials: 'include' }
			)
			const result: ApiResponse<SummaryData> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '요약 조회에 실패했습니다.')
				return
			}
			setSummary(result.data)
		} catch {
			setError('요약 조회 중 오류가 발생했습니다.')
		} finally {
			setSummaryLoading(false)
		}
	}, [baseDate])

	const fetchYearly = useCallback(async () => {
		const s = Number(yearStart)
		const e = Number(yearEnd)
		if (!s || !e) {
			setError('연도를 입력하세요.')
			return
		}
		setYearlyLoading(true)
		setError(null)
		try {
			const qs = `startYear=${s}&endYear=${e}`
			const res = await fetch(`${BACKEND}/api/admin/user-visitor-stats/yearly?${qs}`, {
				credentials: 'include'
			})
			const result: ApiResponse<Array<{ label: string; visitCount: number }>> = await res.json()
			if (!result.success) {
				setError(result.message || '연별 조회에 실패했습니다.')
				return
			}
			setYearlyRows(
				(result.data ?? []).map((r) => ({
					label: r.label,
					visitCount: Number(r.visitCount) || 0
				}))
			)
		} catch {
			setError('연별 조회 중 오류가 발생했습니다.')
		} finally {
			setYearlyLoading(false)
		}
	}, [yearStart, yearEnd])

	const fetchMonthly = useCallback(async () => {
		const s = Number(monthStartYear)
		const e = Number(monthEndYear)
		if (!s || !e) {
			setError('연도를 입력하세요.')
			return
		}
		setMonthlyLoading(true)
		setError(null)
		try {
			const qs = `startYear=${s}&endYear=${e}`
			const res = await fetch(`${BACKEND}/api/admin/user-visitor-stats/monthly?${qs}`, {
				credentials: 'include'
			})
			const result: ApiResponse<Array<{ label: string; visitCount: number }>> = await res.json()
			if (!result.success) {
				setError(result.message || '월별 조회에 실패했습니다.')
				return
			}
			setMonthlyRows(
				(result.data ?? []).map((r) => ({
					label: r.label,
					visitCount: Number(r.visitCount) || 0
				}))
			)
		} catch {
			setError('월별 조회 중 오류가 발생했습니다.')
		} finally {
			setMonthlyLoading(false)
		}
	}, [monthStartYear, monthEndYear])

	const downloadStatsExcel = useCallback(async (startYearValue: string, endYearValue: string) => {
		const s = Number(startYearValue)
		const e = Number(endYearValue)
		if (!s || !e) {
			setError('연도를 입력하세요.')
			return
		}
		setError(null)
		try {
			const qs = `startYear=${s}&endYear=${e}`
			const res = await fetch(`${BACKEND}/api/admin/user-visitor-stats/excel?${qs}`, {
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
			link.download = 'user-visitor-stats.xlsx'
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(url)
		} catch {
			setError('엑셀 파일 다운로드 중 오류가 발생했습니다.')
		}
	}, [])

	const fetchDaily = useCallback(async () => {
		if (dailyStart && dailyEnd && dailyStart > dailyEnd) {
			setError('시작일이 종료일보다 늦을 수 없습니다.')
			return
		}
		setDailyLoading(true)
		setError(null)
		try {
			const qs = `startDate=${encodeURIComponent(dailyStart)}&endDate=${encodeURIComponent(dailyEnd)}`
			const res = await fetch(`${BACKEND}/api/admin/user-visitor-stats/daily?${qs}`, {
				credentials: 'include'
			})
			const result: ApiResponse<Array<{ label: string; visitCount: number }>> = await res.json()
			if (!result.success) {
				setError(result.message || '일별 조회에 실패했습니다.')
				return
			}
			setDailyRows(
				(result.data ?? []).map((r) => ({
					label: r.label,
					visitCount: Number(r.visitCount) || 0
				}))
			)
		} catch {
			setError('일별 조회 중 오류가 발생했습니다.')
		} finally {
			setDailyLoading(false)
		}
	}, [dailyStart, dailyEnd])

	const fetchHourly = useCallback(async () => {
		if (hourlyStart && hourlyEnd && hourlyStart > hourlyEnd) {
			setError('시작일이 종료일보다 늦을 수 없습니다.')
			return
		}
		setHourlyLoading(true)
		setError(null)
		try {
			const qs = `startDate=${encodeURIComponent(hourlyStart)}&endDate=${encodeURIComponent(hourlyEnd)}`
			const res = await fetch(`${BACKEND}/api/admin/user-visitor-stats/hourly?${qs}`, {
				credentials: 'include'
			})
			const result: ApiResponse<Array<{ label: string; visitCount: number }>> = await res.json()
			if (!result.success) {
				setError(result.message || '시간별 조회에 실패했습니다.')
				return
			}
			setHourlyRows(
				(result.data ?? []).map((r) => ({
					label: r.label,
					visitCount: Number(r.visitCount) || 0
				}))
			)
		} catch {
			setError('시간별 조회 중 오류가 발생했습니다.')
		} finally {
			setHourlyLoading(false)
		}
	}, [hourlyStart, hourlyEnd])

	useEffect(() => {
		void fetchSummary()
	}, [fetchSummary])

	useEffect(() => {
		void fetchYearly()
		void fetchMonthly()
		void fetchDaily()
		void fetchHourly()
		// eslint-disable-next-line react-hooks/exhaustive-deps -- 초기 기본 기간만 로드
	}, [])

	return (
		<AdminLayout title="접속 통계">
			<CrudPageCard title="접속 통계" error={error}>
				<p className="visitor-stats-desc">
					사용자 사이트 메인 페이지 접속(<code>MAIN</code>) 기준 방문 수입니다. 조회일을 변경하면 요약의
					어제·오늘·최고 방문 일자가 함께 갱신됩니다.
				</p>

				<div className="code-filters search-section visitor-stats-ref-row">
					<label>
						조회일
						<input
							type="date"
							className="visitor-stats-range-input"
							value={baseDate}
							onChange={(e) => setBaseDate(e.target.value)}
						/>
					</label>
					<button type="button" className="admin-list-btn-sky" onClick={() => void fetchSummary()}>
						요약 갱신
					</button>
				</div>

				<table className="table visitor-stats-summary-table">
					<thead>
						<tr>
							<th>전체 방문자 수</th>
							<th>어제 방문자 수</th>
							<th>오늘 방문자 수</th>
							<th>최고 방문자 수</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="visitor-stats-summary-cell">
								<strong className="visitor-stats-summary-num">
									{summaryLoading ? '…' : formatNum(summary?.totalVisitCount ?? 0)}
								</strong>
								<span className="visitor-stats-summary-sub">누적 (전체 기간)</span>
							</td>
							<td className="visitor-stats-summary-cell">
								<strong className="visitor-stats-summary-num">
									{summaryLoading ? '…' : formatNum(summary?.yesterdayVisitCount ?? 0)}
								</strong>
								<span className="visitor-stats-summary-sub">
									{summary?.yesterdayDate ?? '-'}
								</span>
							</td>
							<td className="visitor-stats-summary-cell">
								<strong className="visitor-stats-summary-num">
									{summaryLoading ? '…' : formatNum(summary?.todayVisitCount ?? 0)}
								</strong>
								<span className="visitor-stats-summary-sub">{summary?.todayDate ?? baseDate}</span>
							</td>
							<td className="visitor-stats-summary-cell">
								<strong className="visitor-stats-summary-num">
									{summaryLoading ? '…' : formatNum(summary?.peakVisitCount ?? 0)}
								</strong>
								<span className="visitor-stats-summary-sub">
									{summary?.peakDate ? `${summary.peakDate} (조회일 이전)` : '-'}
								</span>
							</td>
						</tr>
					</tbody>
				</table>

				<div className="visitor-stats-grid">
					<StatPanel
						title="연별 방문자"
						filter={
							<>
								<label>
									시작 연도
									<input
										type="number"
										min={2000}
										max={2100}
										value={yearStart}
										onChange={(e) => setYearStart(e.target.value)}
										className="visitor-stats-range-input visitor-stats-year-input"
									/>
								</label>
								<span className="visitor-stats-range-sep">~</span>
								<label>
									종료 연도
									<input
										type="number"
										min={2000}
										max={2100}
										value={yearEnd}
										onChange={(e) => setYearEnd(e.target.value)}
										className="visitor-stats-range-input visitor-stats-year-input"
									/>
								</label>
								<button type="button" className="admin-list-btn-sky" onClick={() => void fetchYearly()}>
									조회
								</button>
								<button
									type="button"
									className="admin-list-btn-sky"
									onClick={() => void downloadStatsExcel(yearStart, yearEnd)}
								>
									엑셀파일 다운로드
								</button>
							</>
						}
						rows={yearlyRows}
						loading={yearlyLoading}
					/>

					<StatPanel
						title="월별 방문자"
						filter={
							<>
								<label>
									시작 연도
									<input
										type="number"
										min={2000}
										max={2100}
										value={monthStartYear}
										onChange={(e) => setMonthStartYear(e.target.value)}
										className="visitor-stats-range-input visitor-stats-year-input"
									/>
								</label>
								<span className="visitor-stats-range-sep">~</span>
								<label>
									종료 연도
									<input
										type="number"
										min={2000}
										max={2100}
										value={monthEndYear}
										onChange={(e) => setMonthEndYear(e.target.value)}
										className="visitor-stats-range-input visitor-stats-year-input"
									/>
								</label>
								<button type="button" className="admin-list-btn-sky" onClick={() => void fetchMonthly()}>
									조회
								</button>
								<button
									type="button"
									className="admin-list-btn-sky"
									onClick={() => void downloadStatsExcel(monthStartYear, monthEndYear)}
								>
									엑셀파일 다운로드
								</button>
							</>
						}
						rows={monthlyRows}
						loading={monthlyLoading}
					/>

					<StatPanel
						title="날짜별 방문자"
						filter={
							<>
								<label>
									시작일
									<input
										type="date"
										className="visitor-stats-range-input"
										value={dailyStart}
										onChange={(e) => setDailyStart(e.target.value)}
									/>
								</label>
								<span className="visitor-stats-range-sep">~</span>
								<label>
									종료일
									<input
										type="date"
										className="visitor-stats-range-input"
										value={dailyEnd}
										onChange={(e) => setDailyEnd(e.target.value)}
									/>
								</label>
								<button type="button" className="admin-list-btn-sky" onClick={() => void fetchDaily()}>
									조회
								</button>
							</>
						}
						rows={dailyRows}
						loading={dailyLoading}
					/>

					<StatPanel
						title="시간별 방문자"
						filter={
							<>
								<label>
									시작일
									<input
										type="date"
										className="visitor-stats-range-input"
										value={hourlyStart}
										onChange={(e) => setHourlyStart(e.target.value)}
									/>
								</label>
								<span className="visitor-stats-range-sep">~</span>
								<label>
									종료일
									<input
										type="date"
										className="visitor-stats-range-input"
										value={hourlyEnd}
										onChange={(e) => setHourlyEnd(e.target.value)}
									/>
								</label>
								<button type="button" className="admin-list-btn-sky" onClick={() => void fetchHourly()}>
									조회
								</button>
							</>
						}
						rows={hourlyRows}
						loading={hourlyLoading}
						hint="선택 기간 내 시(0~23시)별 합계입니다."
					/>
				</div>
			</CrudPageCard>
		</AdminLayout>
	)
}

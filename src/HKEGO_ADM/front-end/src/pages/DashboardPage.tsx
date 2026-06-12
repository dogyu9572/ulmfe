import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
	ResponsiveContainer,
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	Cell,
} from 'recharts'
import { AdminLayout } from '../components/AdminLayout'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type DashboardSummary = {
	adminCount: number
	activeAdminCount: number
	boardCount: number
	memberTotalCount: number
	memberTypeCounts: {
		usrGb: string
		codeName: string
		memberCount: number
	}[]
}

type VisitorDaily = {
	visitDate: string
	visitCount: number
	uniqueVisitorCount: number
}

type VisitorStats = {
	days: number
	todayVisitCount: number
	todayUniqueVisitorCount: number
	dailyStats: VisitorDaily[]
}

type VisitorMonthlyPoint = {
	month: number
	label: string
	uniqueVisitorCount: number
}

type VisitorSummaryCharts = {
	prevYear: number
	prevYearMonthly: VisitorMonthlyPoint[]
	currentYear: number
	currentYearMonthly: VisitorMonthlyPoint[]
}

const BACKEND = API_BASE_URL
const PREV_YEAR_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#7c3aed', '#8b5cf6']
const CURRENT_YEAR_COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#0369a1', '#0891b2']
const LAST_WEEK_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#15803d', '#84cc16', '#65a30d']
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function formatAmPmTime(date: Date): { period: 'AM' | 'PM'; time: string } {
	const h = date.getHours()
	const m = date.getMinutes()
	const s = date.getSeconds()
	const period: 'AM' | 'PM' = h < 12 ? 'AM' : 'PM'
	const hour12 = h % 12 === 0 ? 12 : h % 12
	return {
		period,
		time: `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
	}
}

export const DashboardPage: React.FC = () => {
	const [summary, setSummary] = useState<DashboardSummary | null>(null)
	const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null)
	const [visitorSummaryCharts, setVisitorSummaryCharts] = useState<VisitorSummaryCharts | null>(null)
	const [now, setNow] = useState(() => new Date())
	const [error, setError] = useState<string | null>(null)
	const [rechartsLayoutReady, setRechartsLayoutReady] = useState(false)

	useEffect(() => {
		const t = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(t)
	}, [])

	const loadDashboard = useCallback(async () => {
		setRechartsLayoutReady(false)
		setError(null)
		try {
			const [sRes, vRes, cRes] = await Promise.all([
				fetch(`${BACKEND}/api/admin/dashboard`, { credentials: 'include' }),
				fetch(`${BACKEND}/api/admin/dashboard/visitor-stats?days=20`, { credentials: 'include' }),
				fetch(`${BACKEND}/api/admin/dashboard/visitor-summary-charts`, { credentials: 'include' })
			])
			const [sJson, vJson, cJson]: [
				ApiResponse<DashboardSummary>,
				ApiResponse<VisitorStats>,
				ApiResponse<VisitorSummaryCharts>
			] = await Promise.all([sRes.json(), vRes.json(), cRes.json()])
			if (sJson.success && sJson.data) setSummary(sJson.data)
			if (vJson.success && vJson.data) setVisitorStats(vJson.data)
			if (cJson.success && cJson.data) setVisitorSummaryCharts(cJson.data)
			if (!sJson.success || !vJson.success || !cJson.success) {
				setError('일부 대시보드 데이터를 불러오지 못했습니다.')
			}
		} catch {
			setError('대시보드 조회 중 오류가 발생했습니다.')
		}
	}, [])

	useEffect(() => {
		loadDashboard()
	}, [loadDashboard])

	useEffect(() => {
		if (!visitorStats && !visitorSummaryCharts) {
			setRechartsLayoutReady(false)
			return
		}
		let cancelled = false
		const t = window.setTimeout(() => {
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(() => {
					if (!cancelled) setRechartsLayoutReady(true)
				})
			})
		}, 0)
		return () => {
			cancelled = true
			window.clearTimeout(t)
		}
	}, [visitorStats, visitorSummaryCharts])

	const chartData = useMemo(() => {
		if (!visitorStats?.dailyStats?.length) return []
		return visitorStats.dailyStats.map((d) => ({
			label: d.visitDate.slice(5).replace('-', '/'),
			visitCount: Number(d.visitCount) || 0,
			uniqueVisitorCount: Number(d.uniqueVisitorCount) || 0
		}))
	}, [visitorStats])

	const visitPeriodTotals = useMemo(() => {
		if (!visitorStats?.dailyStats?.length) return { total: 0, avg: 0 }
		const total = visitorStats.dailyStats.reduce((s, d) => s + (Number(d.visitCount) || 0), 0)
		const n = visitorStats.dailyStats.length
		const avg = n > 0 ? Math.round((total / n) * 10) / 10 : 0
		return { total, avg }
	}, [visitorStats])

	const prevYearPieData = useMemo(
		() =>
			visitorSummaryCharts?.prevYearMonthly?.map((m) => ({
				name: m.label,
				value: m.uniqueVisitorCount
			})) ?? [],
		[visitorSummaryCharts]
	)

	const currentYearPieData = useMemo(
		() =>
			visitorSummaryCharts?.currentYearMonthly?.map((m) => ({
				name: m.label,
				value: m.uniqueVisitorCount
			})) ?? [],
		[visitorSummaryCharts]
	)

	const lastWeekPieData = useMemo(() => {
		if (!visitorStats?.dailyStats?.length) return []

		const byDate = new Map<string, VisitorDaily>()
		for (const d of visitorStats.dailyStats) {
			byDate.set(d.visitDate, d)
		}

		const today = new Date()
		const dow = today.getDay()
		const thisWeekSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dow)
		const lastWeekSunday = new Date(
			thisWeekSunday.getFullYear(),
			thisWeekSunday.getMonth(),
			thisWeekSunday.getDate() - 7
		)

		const out: { name: string; value: number }[] = []
		for (let i = 0; i < 7; i++) {
			const d = new Date(
				lastWeekSunday.getFullYear(),
				lastWeekSunday.getMonth(),
				lastWeekSunday.getDate() + i
			)
			const key = d.toISOString().slice(0, 10)
			const found = byDate.get(key)
			const v = found ? Number(found.uniqueVisitorCount) || 0 : 0
			out.push({ name: WEEKDAY_LABELS[i], value: v })
		}
		return out
	}, [visitorStats])

	return (
		<AdminLayout title="대시보드">
			{error && <p className="form-error">{error}</p>}

			<section className="card dashboard-hero" style={{ marginBottom: 16 }}>
				<div className="dashboard-hero-inner">
					<div className="dashboard-hero-stats">
						<div className="dashboard-hero-stats-head">
							<div className="dashboard-hero-stats-title">
								<span className="dashboard-hero-icon" aria-hidden>
									<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
										<path
											d="M4 19V5M4 19H20M8 15V11M12 15V7M16 15V13"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
										/>
									</svg>
								</span>
								<h2>사용자 페이지 방문자 통계</h2>
							</div>
							<Link to="/admin/user-visitor-stats" className="dashboard-hero-detail-btn">
								상세보기
							</Link>
						</div>
						<div className="dashboard-hero-stats-main">
							<div className="dashboard-hero-stat-block">
								<p className="dashboard-hero-stat-label">오늘 방문자</p>
								<strong className="dashboard-hero-stat-num">
									{visitorStats?.todayVisitCount ?? 0}
								</strong>
							</div>
							<div className="dashboard-hero-stat-divider" aria-hidden />
							<div className="dashboard-hero-stat-block">
								<p className="dashboard-hero-stat-label">고유 방문자</p>
								<strong className="dashboard-hero-stat-num">
									{visitorStats?.todayUniqueVisitorCount ?? 0}
								</strong>
							</div>
						</div>
						<p className="dashboard-hero-stats-sub">
							총: {visitPeriodTotals.total.toLocaleString('ko-KR')}명 · 평균:{' '}
							{visitPeriodTotals.avg.toLocaleString('ko-KR')}명/일
						</p>
						<div className="dashboard-hero-clock">
							<span className="dashboard-hero-clock-line">
								{(() => {
									const t = formatAmPmTime(now)
									return (
										<>
											<span className="dashboard-hero-clock-period">{t.period}</span> {t.time}
										</>
									)
								})()}
							</span>
							<span className="dashboard-hero-clock-date">
								{now.toLocaleDateString('ko-KR', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									weekday: 'long'
								})}
							</span>
						</div>
					</div>
					<div className="dashboard-hero-chart">
						<h3 className="dashboard-hero-chart-title">
							최근 {visitorStats?.days ?? 0}일 방문자 추이
						</h3>
						<div className="dashboard-hero-chart-body">
							{chartData.length > 0 ? (
								rechartsLayoutReady ? (
									<ResponsiveContainer width="100%" height={200}>
										<LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
											<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.18)" />
											<XAxis
												dataKey="label"
												tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.85)' }}
												stroke="rgba(255,255,255,0.35)"
											/>
											<YAxis
												tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.85)' }}
												stroke="rgba(255,255,255,0.35)"
												allowDecimals={false}
											/>
											<Tooltip
												contentStyle={{
													fontSize: 12,
													background: 'rgba(15,23,42,0.92)',
													border: '1px solid rgba(255,255,255,0.2)',
													borderRadius: 8,
													color: '#f8fafc'
												}}
												formatter={(value: number, name: string) => [
													value,
													name === '총 방문자' ? '총 방문자' : '고유 방문자'
												]}
											/>
											<Legend wrapperStyle={{ fontSize: 12, color: '#fff' }} formatter={(value) => value} />
											<Line
												type="monotone"
												dataKey="visitCount"
												name="총 방문자"
												stroke="#93c5fd"
												strokeWidth={2}
												dot={{ r: 2, fill: '#93c5fd' }}
												activeDot={{ r: 4 }}
												isAnimationActive
												animationDuration={1400}
												animationEasing="ease-out"
											/>
											<Line
												type="monotone"
												dataKey="uniqueVisitorCount"
												name="고유 방문자"
												stroke="#fb923c"
												strokeWidth={2}
												dot={{ r: 2, fill: '#fb923c' }}
												activeDot={{ r: 4 }}
												isAnimationActive
												animationDuration={1400}
												animationEasing="ease-out"
												animationBegin={150}
											/>
										</LineChart>
									</ResponsiveContainer>
								) : (
									<div className="dashboard-chart-skeleton dashboard-chart-skeleton--hero" aria-hidden />
								)
							) : (
								<p className="dashboard-hero-chart-empty">방문 통계 데이터가 없습니다.</p>
							)}
						</div>
					</div>
				</div>
			</section>

			<section className="dashboard-grid dashboard-grid--summary-only" style={{ marginBottom: 16 }}>
				<div className="card dashboard-summary-card">
					<div className="dashboard-section-box dashboard-section-box--summary">
						<h3>시스템 요약</h3>
						<div className="dashboard-summary-list">
							<div>
								<span>관리자 수</span>
								<strong>{summary?.adminCount ?? 0}</strong>
							</div>
							<div>
								<span>활성 관리자</span>
								<strong>{summary?.activeAdminCount ?? 0}</strong>
							</div>
							<div>
								<span>게시물 수</span>
								<strong>{summary?.boardCount ?? 0}</strong>
							</div>
							<div>
								<span>회원 수 (전체)</span>
								<strong>{summary?.memberTotalCount ?? 0}</strong>
							</div>
							<div className="dashboard-summary-member-breakdown">
								<span>회원구분별</span>
								<strong>
									{summary?.memberTypeCounts?.length
										? summary.memberTypeCounts
												.map((item) => `${item.codeName} ${item.memberCount}`)
												.join(' / ')
										: '-'}
								</strong>
							</div>
						</div>
					</div>
				</div>

				<div className="card dashboard-summary-chart-card">
					<div className="dashboard-summary-chart-grid">
						<div className="dashboard-summary-chart-item">
							<p className="dashboard-summary-chart-label">
								이전년도 월별 순방문자 ({visitorSummaryCharts?.prevYear ?? '-'}년)
							</p>
							<div className="dashboard-donut-cell">
								<div className="dashboard-summary-bar-wrap">
									{prevYearPieData.length ? (
										rechartsLayoutReady ? (
											<ResponsiveContainer width="100%" height="100%" key={`prev-year-pie-${visitorSummaryCharts?.prevYear}`}>
												<BarChart data={prevYearPieData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
													<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
													<XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
													<YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
													<Tooltip
														formatter={(v: number, _name: string, p: { payload?: { name?: string } }) => [
															v,
															p?.payload?.name ?? '월'
														]}
														contentStyle={{ fontSize: 12 }}
													/>
													<Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900}>
														{prevYearPieData.map((entry, index) => (
															<Cell key={`prev-year-bar-${entry.name}`} fill={PREV_YEAR_COLORS[index % PREV_YEAR_COLORS.length]} />
														))}
													</Bar>
												</BarChart>
											</ResponsiveContainer>
										) : (
											<div className="dashboard-pie-skeleton" aria-hidden />
										)
									) : (
										<p className="dashboard-summary-chart-empty">데이터가 없습니다.</p>
									)}
								</div>
							</div>
						</div>

						<div className="dashboard-summary-chart-item">
							<p className="dashboard-summary-chart-label">
								금년도 월별 순방문자 ({visitorSummaryCharts?.currentYear ?? '-'}년)
							</p>
							<div className="dashboard-donut-cell">
								<div className="dashboard-summary-bar-wrap">
									{currentYearPieData.length ? (
										rechartsLayoutReady ? (
											<ResponsiveContainer width="100%" height="100%" key={`current-year-pie-${visitorSummaryCharts?.currentYear}`}>
												<BarChart data={currentYearPieData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
													<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
													<XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
													<YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
													<Tooltip
														formatter={(v: number, _name: string, p: { payload?: { name?: string } }) => [
															v,
															p?.payload?.name ?? '월'
														]}
														contentStyle={{ fontSize: 12 }}
													/>
													<Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900}>
														{currentYearPieData.map((entry, index) => (
															<Cell key={`current-year-bar-${entry.name}`} fill={CURRENT_YEAR_COLORS[index % CURRENT_YEAR_COLORS.length]} />
														))}
													</Bar>
												</BarChart>
											</ResponsiveContainer>
										) : (
											<div className="dashboard-pie-skeleton" aria-hidden />
										)
									) : (
										<p className="dashboard-summary-chart-empty">데이터가 없습니다.</p>
									)}
								</div>
							</div>
						</div>

						<div className="dashboard-summary-chart-item">
							<p className="dashboard-summary-chart-label">지난주(일~토) 순방문자</p>
							<div className="dashboard-donut-cell">
								<div className="dashboard-summary-bar-wrap">
									{lastWeekPieData.length ? (
										rechartsLayoutReady ? (
											<ResponsiveContainer width="100%" height="100%" key="last-week-pie">
												<BarChart data={lastWeekPieData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
													<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
													<XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
													<YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
													<Tooltip
														formatter={(v: number, _name: string, p: { payload?: { name?: string } }) => [
															v,
															p?.payload?.name ?? '요일'
														]}
														contentStyle={{ fontSize: 12 }}
													/>
													<Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900}>
														{lastWeekPieData.map((entry, index) => (
															<Cell key={`last-week-bar-${entry.name}`} fill={LAST_WEEK_COLORS[index % LAST_WEEK_COLORS.length]} />
														))}
													</Bar>
												</BarChart>
											</ResponsiveContainer>
										) : (
											<div className="dashboard-pie-skeleton" aria-hidden />
										)
									) : (
										<p className="dashboard-summary-chart-empty">데이터가 없습니다.</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</AdminLayout>
	)
}

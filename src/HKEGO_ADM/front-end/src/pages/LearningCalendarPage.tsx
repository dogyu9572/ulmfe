import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type Reservation = {
	rsvtSn: number | null
	rsvtNo?: string
	schlNm: string
	scyrNm: string
	picNm: string
	picTelno: string
	rsvtYmd: string
	vstHm: string
	rsvtNope: number
	actlNope?: number | null
	prgrmTypeCd: 'MISSION' | 'EXPLORE' | string
	prgrmTypeNm?: string
	prgrmNm?: string
	lrnSttsCd: string
	lrnSttsNm?: string
	stdntCnt?: number
}

const BACKEND = API_BASE_URL
const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function pad(value: number): string {
	return String(value).padStart(2, '0')
}

function toYmd(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function monthStart(month: string): string {
	return `${month}-01`
}

function monthEnd(month: string): string {
	const [year, mm] = month.split('-').map(Number)
	return toYmd(new Date(year, mm, 0))
}

function todayYmd(): string {
	return toYmd(new Date())
}

function formatMonthLabel(month: string): string {
	const [year, mm] = month.split('-')
	return `${year}.${mm}`
}

function formatDate(value: string | null | undefined): string {
	if (!value) return '-'
	return String(value).slice(0, 10)
}

function numericText(value: string | null | undefined): string {
	return String(value ?? '').replace(/\D/g, '')
}

function addMonths(month: string, delta: number): string {
	const [year, mm] = month.split('-').map(Number)
	const date = new Date(year, mm - 1 + delta, 1)
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

function calendarDays(month: string): Array<{ ymd: string; day: number; currentMonth: boolean }> {
	const [year, mm] = month.split('-').map(Number)
	const first = new Date(year, mm - 1, 1)
	const start = new Date(first)
	start.setDate(first.getDate() - first.getDay())
	return Array.from({ length: 42 }, (_, index) => {
		const date = new Date(start)
		date.setDate(start.getDate() + index)
		return {
			ymd: toYmd(date),
			day: date.getDate(),
			currentMonth: date.getMonth() === mm - 1
		}
	})
}

function rate(numerator: number, denominator: number): number {
	if (denominator <= 0) return 0
	return Math.round((numerator / denominator) * 100)
}

export const LearningCalendarPage: React.FC = () => {
	const navigate = useNavigate()
	const [month, setMonth] = useState(todayYmd().slice(0, 7))
	const [selectedDate, setSelectedDate] = useState(todayYmd())
	const [rows, setRows] = useState<Reservation[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchCalendar = useCallback(async (targetMonth = month) => {
		setLoading(true)
		setError(null)
		const qs = new URLSearchParams()
		qs.set('startRsvtYmd', monthStart(targetMonth))
		qs.set('endRsvtYmd', monthEnd(targetMonth))
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-calendar?${qs.toString()}`, { credentials: 'include' })
			const result: ApiResponse<Reservation[]> = await res.json()
			if (!result.success) {
				setError(result.message || '예약 캘린더 조회에 실패했습니다.')
				return
			}
			setRows(result.data ?? [])
		} catch {
			setError('예약 캘린더 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}, [month])

	useEffect(() => {
		void fetchCalendar(month)
	}, [fetchCalendar, month])

	const rowsByDate = useMemo(() => rows.reduce<Record<string, Reservation[]>>((acc, row) => {
		const key = formatDate(row.rsvtYmd)
		if (!acc[key]) acc[key] = []
		acc[key].push(row)
		return acc
	}, {}), [rows])

	const selectedRows = rowsByDate[selectedDate] ?? []
	const todayRows = rowsByDate[todayYmd()] ?? []
	const monthSummary = useMemo(() => {
		const schoolCount = new Set(rows.map((row) => row.schlNm)).size
		const totalPeople = rows.reduce((sum, row) => sum + (row.rsvtNope ?? 0), 0)
		const missionSchools = new Set(rows.filter((row) => row.prgrmTypeCd === 'MISSION').map((row) => row.schlNm)).size
		const exploreSchools = new Set(rows.filter((row) => row.prgrmTypeCd === 'EXPLORE').map((row) => row.schlNm)).size
		return { schoolCount, totalPeople, missionSchools, exploreSchools }
	}, [rows])

	const days = calendarDays(month)
	const openReservationDetail = (rsvtSn?: number | null) => {
		const qs = new URLSearchParams()
		if (rsvtSn) qs.set('rsvtSn', String(rsvtSn))
		navigate(`/admin/learning-reservations${qs.toString() ? `?${qs.toString()}` : ''}`)
	}
	const openFieldStatus = (targetDate = selectedDate, rsvtSn?: number | null) => {
		const qs = new URLSearchParams()
		qs.set('date', targetDate)
		if (rsvtSn) qs.set('rsvtSn', String(rsvtSn))
		navigate(`/admin/field-operation-status?${qs.toString()}`)
	}

	return (
		<AdminLayout title="예약 캘린더">
			<CrudPageCard title="예약 캘린더" error={error}>
				<div className="learning-calendar-toolbar">
					<div className="learning-calendar-month-control">
						<button type="button" className="admin-filter-btn-reset" onClick={() => setMonth(addMonths(month, -1))} disabled={loading}>이전</button>
						<strong>{formatMonthLabel(month)}</strong>
						<button type="button" className="admin-filter-btn-reset" onClick={() => setMonth(addMonths(month, 1))} disabled={loading}>다음</button>
						<button type="button" className="admin-list-btn-sky" onClick={() => { const now = todayYmd(); setMonth(now.slice(0, 7)); setSelectedDate(now) }} disabled={loading}>오늘</button>
					</div>
				</div>

				<div className="learning-calendar-summary">
					<div><span>이번 달 방문</span><strong>{monthSummary.schoolCount}</strong><em>개학교</em></div>
					<div><span>이번 달 총 인원</span><strong>{monthSummary.totalPeople}</strong><em>명</em></div>
					<div><span>이번 달 미션 참여학교</span><strong>{monthSummary.missionSchools}</strong><em>개학교</em></div>
					<div><span>이번 달 사건탐구 참여학교</span><strong>{monthSummary.exploreSchools}</strong><em>개학교</em></div>
				</div>

				<div className="learning-calendar-today">
					<h4>금일 운영 현황 ({todayYmd()})</h4>
					<table className="table">
						<thead>
							<tr>
								<th>구분</th>
								<th>학교</th>
								<th>학년</th>
								<th>인원</th>
								<th>프로그램명</th>
								<th>태블릿 접속</th>
								<th>전체 참석률</th>
								<th>학습 진행상태</th>
								<th>현황</th>
							</tr>
						</thead>
						<tbody>
							{todayRows.map((row) => {
								const connected = row.stdntCnt ?? row.actlNope ?? 0
								return (
									<tr key={row.rsvtSn ?? row.rsvtNo}>
										<td>{row.prgrmTypeNm || row.prgrmTypeCd}</td>
										<td>{row.schlNm}</td>
										<td>{numericText(row.scyrNm) || row.scyrNm}</td>
										<td>{row.rsvtNope ?? 0}명</td>
										<td>{row.prgrmNm || '-'}</td>
										<td>{connected}/{row.rsvtNope ?? 0}</td>
										<td>{rate(connected, row.rsvtNope ?? 0)}%</td>
										<td>{row.lrnSttsNm || '-'}</td>
										<td><button type="button" className="admin-list-btn-sky" onClick={() => openFieldStatus(todayYmd(), row.rsvtSn)}>현황보기</button></td>
									</tr>
								)
							})}
							{todayRows.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center' }}>오늘 예약된 방문이 없습니다.</td></tr>}
						</tbody>
					</table>
				</div>

				<div className="learning-calendar-layout">
					<section className="learning-calendar-panel">
						<div className="learning-calendar-grid learning-calendar-grid--week">
							{WEEK_LABELS.map((label) => <div key={label}>{label}</div>)}
						</div>
						<div className="learning-calendar-grid">
							{days.map((day) => {
								const dayRows = rowsByDate[day.ymd] ?? []
								const isSelected = selectedDate === day.ymd
								const isToday = todayYmd() === day.ymd
								return (
									<button
										key={day.ymd}
										type="button"
										className={`learning-calendar-day ${day.currentMonth ? '' : 'is-muted'} ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
										onClick={() => setSelectedDate(day.ymd)}
									>
										<span>{day.day}</span>
										{dayRows.slice(0, 3).map((row) => <em key={row.rsvtSn ?? row.rsvtNo}>{row.schlNm}</em>)}
										{dayRows.length > 3 && <small>+{dayRows.length - 3}</small>}
									</button>
								)
							})}
						</div>
					</section>

					<aside className="learning-calendar-side">
						<h4>{selectedDate} 예약</h4>
						{selectedRows.length === 0 ? (
							<p className="learning-calendar-empty">오늘 예약된 방문이 없습니다.</p>
						) : (
							selectedRows.map((row) => {
								const connected = row.stdntCnt ?? row.actlNope ?? 0
								const attendance = rate(connected, row.rsvtNope ?? 0)
								return (
									<div key={row.rsvtSn ?? row.rsvtNo} className="learning-calendar-reservation">
										<strong>{row.schlNm} {numericText(row.scyrNm) || row.scyrNm}학년 · {row.rsvtNope ?? 0}명</strong>
										<span>{row.prgrmNm || '-'} / {row.prgrmTypeNm || row.prgrmTypeCd}</span>
										<span>인솔자: {row.picNm || '-'} · {row.picTelno || '-'}</span>
										<span>태블릿 접속: {connected}/{row.rsvtNope ?? 0} · 전체 참석률 {attendance}%</span>
										<span>진행상태: {row.lrnSttsNm || '-'}</span>
										<div className="learning-calendar-actions">
											<button type="button" className="admin-filter-btn-reset" onClick={() => openReservationDetail(row.rsvtSn)}>예약 상세</button>
										</div>
									</div>
								)
							})
						)}
					</aside>
				</div>

			</CrudPageCard>
		</AdminLayout>
	)
}

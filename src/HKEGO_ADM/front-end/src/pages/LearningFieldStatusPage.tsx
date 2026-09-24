import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListPagination } from '../components/ListPagination'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL } from '../config'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type Student = {
	stdntSn: number
	stdntNo?: string
	clasNm?: string
	clasNo?: string
	stdntNm?: string
	atndYn?: string
	teamNm?: string
	asgnNm?: string
	routeCn?: string
	lrnSttsCd?: string
	prgrsRt?: number | null
}

type Reservation = {
	rsvtSn: number
	rsvtNo?: string
	schlNm: string
	scyrNm?: string
	rsvtYmd?: string
	vstHm?: string
	prgrmTypeCd?: string
	prgrmTypeNm?: string
	prgrmNm?: string
	lrnSttsCd?: string
	lrnSttsNm?: string
	students?: Student[]
}

type FlatStudent = Student & {
	rsvtSn: number
	schlNm: string
	scyrNm?: string
	prgrmNm?: string
	prgrmTypeNm?: string
	prgrmTypeCd?: string
	rsvtYmd?: string
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]

function todayYmd(): string {
	const date = new Date()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${date.getFullYear()}-${month}-${day}`
}

function progressRate(student: FlatStudent): number {
	if (typeof student.prgrsRt === 'number') return Math.round(student.prgrsRt)
	if (student.lrnSttsCd === 'DONE') return 100
	if (student.lrnSttsCd === 'ING') return 30
	return 0
}

function statusClass(label: string | undefined): string {
	if (label === '완료') return 'is-done'
	if (label === '진행 중') return 'is-ing'
	return 'is-ready'
}

function formatTeam(value: string | null | undefined): string {
	const normalized = String(value ?? '').trim()
	if (!normalized) return '-'
	return normalized.endsWith('팀') ? normalized : `${normalized}팀`
}

function step2Lines(student: FlatStudent): Array<{ label: string; status: string }> {
	if (student.lrnSttsCd === 'DONE') {
		return [1, 2, 3, 4].map((n) => ({ label: `퀘스트 ${n}`, status: '완료' }))
	}
	if (student.lrnSttsCd === 'ING') {
		const rateValue = progressRate(student)
		return [1, 2, 3, 4].map((n) => {
			if (n === 1) return { label: `퀘스트 ${n}`, status: '완료' }
			if (n === 2 || (rateValue >= 50 && n === 3)) return { label: `퀘스트 ${n}`, status: '진행 중' }
			return { label: `퀘스트 ${n}`, status: '진행 전' }
		})
	}
	return [1, 2, 3, 4].map((n) => ({ label: `퀘스트 ${n}`, status: '진행 전' }))
}

/** 학생 한 명의 종합 학습상태. STEP 별 상태는 이 값에서 파생되므로 필터 기준은 이 값이어야 한다. */
function learningStatusLabel(student: FlatStudent): string {
	if (student.lrnSttsCd === 'DONE') return '완료'
	if (student.lrnSttsCd === 'ING') return '진행 중'
	return '진행 전'
}

function stepLabels(student: FlatStudent): { step1: string; step2: Array<{ label: string; status: string }>; step3: string; step4: string } {
	const progress = progressRate(student)
	if (student.lrnSttsCd === 'DONE') {
		return { step1: '완료', step2: step2Lines(student), step3: '완료', step4: '완료' }
	}
	if (student.lrnSttsCd === 'ING') {
		return {
			step1: '완료',
			step2: step2Lines(student),
			step3: progress >= 50 ? '진행 중' : '진행 전',
			step4: progress >= 80 ? '진행 중' : '진행 전'
		}
	}
	return { step1: '진행 전', step2: step2Lines(student), step3: '진행 전', step4: '진행 전' }
}

type BonusClassRow = {
	rsvtSn: number
	schlNm: string
	clasNm: string
	total: number
	done: number
	opened: boolean
}

export const LearningFieldStatusPage: React.FC = () => {
	const [searchParams] = useSearchParams()
	const initialDate = searchParams.get('date') || todayYmd()
	/** 캘린더의 '현황보기' 가 넘기는 예약 번호. 목록이 로드되면 그 예약의 학교로 필터를 맞춘다. */
	const initialRsvtSn = searchParams.get('rsvtSn')
	const [rsvtYmd, setRsvtYmd] = useState(initialDate)
	const [school, setSchool] = useState('all')
	const [team, setTeam] = useState('all')
	const [stepStatus, setStepStatus] = useState('all')
	const [studentName, setStudentName] = useState('')
	const [rows, setRows] = useState<Reservation[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(20)

	// 예약별로 열려 있는 반 이름 목록. 행의 존재가 곧 개방이라 목록만 받아 대조한다
	const [openedClasses, setOpenedClasses] = useState<Record<number, string[]>>({})
	const [bonusBusy, setBonusBusy] = useState<string | null>(null)

	const fetchStatus = useCallback(async () => {
		setLoading(true)
		setError(null)
		const qs = new URLSearchParams()
		qs.set('rsvtYmd', rsvtYmd)
		try {
			const res = await fetch(`${BACKEND}/api/admin/field-operation-status?${qs.toString()}`, { credentials: 'include' })
			const result: ApiResponse<Reservation[]> = await res.json()
			if (!result.success) {
				setError(result.message || '현장 운영 현황 조회에 실패했습니다.')
				return
			}
			setRows(result.data ?? [])
		} catch {
			setError('현장 운영 현황 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}, [rsvtYmd])

	useEffect(() => {
		void fetchStatus()
	}, [fetchStatus])

	const fetchOpenedClasses = useCallback(async (reservations: Reservation[]) => {
		const entries = await Promise.all(reservations.map(async (row) => {
			try {
				const res = await fetch(`${BACKEND}/api/admin/field-operation-status/${row.rsvtSn}/bonus`, { credentials: 'include' })
				const result: ApiResponse<string[]> = await res.json()
				return [row.rsvtSn, result.success ? (result.data ?? []) : []] as const
			} catch {
				return [row.rsvtSn, []] as const
			}
		}))
		setOpenedClasses(Object.fromEntries(entries))
	}, [])

	useEffect(() => {
		if (rows.length === 0) {
			setOpenedClasses({})
			return
		}
		void fetchOpenedClasses(rows)
	}, [rows, fetchOpenedClasses])

	const bonusRows = useMemo<BonusClassRow[]>(() => {
		const grouped = new Map<string, BonusClassRow>()
		rows.forEach((row) => {
			(row.students ?? []).forEach((student) => {
				const clasNm = String(student.clasNm ?? '').trim()
				if (!clasNm) return
				const key = `${row.rsvtSn}::${clasNm}`
				const found = grouped.get(key) ?? {
					rsvtSn: row.rsvtSn,
					schlNm: row.schlNm,
					clasNm,
					total: 0,
					done: 0,
					opened: (openedClasses[row.rsvtSn] ?? []).includes(clasNm)
				}
				found.total += 1
				if (student.lrnSttsCd === 'DONE') found.done += 1
				grouped.set(key, found)
			})
		})
		return Array.from(grouped.values()).sort((a, b) => a.schlNm.localeCompare(b.schlNm) || a.clasNm.localeCompare(b.clasNm))
	}, [rows, openedClasses])

	const toggleBonus = async (row: BonusClassRow) => {
		if (row.opened && !window.confirm(`${row.schlNm} ${row.clasNm}의 보너스 스테이지를 닫습니다. 이미 참여 중인 학생도 진행할 수 없게 됩니다.`)) return
		const key = `${row.rsvtSn}::${row.clasNm}`
		setBonusBusy(key)
		setError(null)
		try {
			const url = row.opened
				? `${BACKEND}/api/admin/field-operation-status/${row.rsvtSn}/bonus/${encodeURIComponent(row.clasNm)}`
				: `${BACKEND}/api/admin/field-operation-status/${row.rsvtSn}/bonus`
			const res = await fetch(url, {
				method: row.opened ? 'DELETE' : 'POST',
				credentials: 'include',
				headers: row.opened ? undefined : { 'Content-Type': 'application/json' },
				body: row.opened ? undefined : JSON.stringify({ clasNm: row.clasNm })
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '보너스 스테이지 처리에 실패했습니다.')
				return
			}
			await fetchOpenedClasses(rows)
		} catch {
			setError('보너스 스테이지 처리 중 오류가 발생했습니다.')
		} finally {
			setBonusBusy(null)
		}
	}

	const schools = useMemo(() => Array.from(new Set(rows.map((row) => row.schlNm).filter(Boolean))), [rows])

	const rsvtPresetDone = useRef(false)
	useEffect(() => {
		if (rsvtPresetDone.current || !initialRsvtSn || rows.length === 0) return
		const target = rows.find((row) => String(row.rsvtSn) === initialRsvtSn)
		if (target?.schlNm) setSchool(target.schlNm)
		rsvtPresetDone.current = true
	}, [initialRsvtSn, rows])
	const teams = useMemo(() => {
		const fromData = rows.flatMap((row) => row.students ?? []).map((student) => student.teamNm).filter(Boolean) as string[]
		// 하드코딩된 A~D 는 실데이터 형식('1팀')과 달라 어떤 옵션을 골라도 0건이었다. 데이터에서만 만든다.
		return Array.from(new Set(fromData)).sort()
	}, [rows])
	const students = useMemo<FlatStudent[]>(() => rows.flatMap((row) => (row.students ?? []).map((student) => ({
		...student,
		rsvtSn: row.rsvtSn,
		schlNm: row.schlNm,
		scyrNm: row.scyrNm,
		prgrmNm: row.prgrmNm,
		prgrmTypeNm: row.prgrmTypeNm,
		prgrmTypeCd: row.prgrmTypeCd,
		rsvtYmd: row.rsvtYmd
	}))), [rows])

	const filteredStudents = useMemo(() => students.filter((student) => {
		const matchesSchool = school === 'all' || student.schlNm === school
		const matchesTeam = team === 'all' || student.teamNm === team
		const matchesStep = stepStatus === 'all' || learningStatusLabel(student) === stepStatus
		const matchesName = !studentName.trim() || String(student.stdntNm ?? '').includes(studentName.trim())
		return matchesSchool && matchesTeam && matchesStep && matchesName
	}), [school, stepStatus, studentName, students, team])

	const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
	const pagedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize)

	useEffect(() => {
		setPage(1)
	}, [rsvtYmd, school, team, stepStatus, studentName, pageSize])

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	const resetFilters = () => {
		setRsvtYmd(todayYmd())
		setSchool('all')
		setTeam('all')
		setStepStatus('all')
		setStudentName('')
	}

	return (
		<AdminLayout title="현장 운영 현황">
			<CrudPageCard title="현장 운영 현황" error={error}>
				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<span className="list-toolbar-info">{formatListToolbarInfo(filteredStudents.length, page, totalPages)}</span>
						<select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value))
								setPage(1)
							}}
							className="list-page-size-select"
							aria-label="페이지당 목록 개수"
						>
							{PAGE_SIZE_OPTIONS.map((n) => (
								<option key={n} value={n}>{n}</option>
							))}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchStatus()} disabled={loading}>
							새로고침
						</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">날짜</label>
						<input
							type="date"
							value={rsvtYmd}
							onChange={(e) => setRsvtYmd(e.target.value)}
							className="bbs-post-filter-date"
						/>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">참여 학교</label>
						<select value={school} onChange={(e) => setSchool(e.target.value)} className="bbs-post-filter-select">
							<option value="all">전체</option>
							{schools.map((name) => <option key={name} value={name}>{name}</option>)}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">팀</label>
						<select value={team} onChange={(e) => setTeam(e.target.value)} className="bbs-post-filter-select">
							<option value="all">전체</option>
							{teams.map((name) => <option key={name} value={name}>{formatTeam(name)}</option>)}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">학습 상태</label>
						<select value={stepStatus} onChange={(e) => setStepStatus(e.target.value)} className="bbs-post-filter-select">
							<option value="all">전체</option>
							<option value="진행 전">진행 전</option>
							<option value="진행 중">진행 중</option>
							<option value="완료">완료</option>
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">학생 이름</label>
						<input
							type="text"
							value={studentName}
							onChange={(e) => setStudentName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') void fetchStatus()
							}}
							placeholder="학생 이름"
							className="bbs-post-filter-input"
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchStatus()} disabled={loading}>검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={resetFilters} disabled={loading}>초기화</button>
					</div>
				</div>

				<h3 className="bbs-post-filter-label">보너스 스테이지 개방</h3>
				<table className="table">
					<thead>
						<tr>
							<th>참여 학교</th>
							<th>반</th>
							<th>완료 / 전체</th>
							<th>상태</th>
							<th>처리</th>
						</tr>
					</thead>
					<tbody>
						{bonusRows.map((row) => {
							const key = `${row.rsvtSn}::${row.clasNm}`
							return (
								<tr key={key}>
									<td>{row.schlNm}</td>
									<td>{row.clasNm}</td>
									<td>{row.done} / {row.total}</td>
									<td><span className={`field-status-badge ${row.opened ? 'is-done' : 'is-ready'}`}>{row.opened ? '개방' : '미개방'}</span></td>
									<td>
										<button
											type="button"
											className={row.opened ? 'admin-filter-btn-reset' : 'admin-list-btn-sky'}
											onClick={() => void toggleBonus(row)}
											disabled={bonusBusy === key || loading}
										>
											{row.opened ? '개방 취소' : '개방'}
										</button>
									</td>
								</tr>
							)
						})}
						{bonusRows.length === 0 && (
							<tr>
								<td colSpan={5} style={{ textAlign: 'center' }}>반이 배정된 학생이 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>

				<table className="table">
					<thead>
						<tr>
							<th>번호</th>
							<th>이름</th>
							<th>팀</th>
							<th>STEP 01</th>
							<th>STEP 02</th>
							<th>STEP 03</th>
							<th>STEP 04</th>
							<th>진척률</th>
						</tr>
					</thead>
					<tbody>
						{pagedStudents.map((student, index) => {
							const labels = stepLabels(student)
							return (
								<tr key={student.stdntSn ?? `${student.rsvtSn}-${index}`}>
									<td>{(page - 1) * pageSize + index + 1}</td>
									<td>{student.stdntNm || '-'}</td>
									<td>{formatTeam(student.teamNm)}</td>
									<td><span className={`field-status-badge ${statusClass(labels.step1)}`}>{labels.step1}</span></td>
									<td>
										<div className="field-status-step-lines">
											{labels.step2.map((line) => (
												<span key={line.label}>
													{line.label}: <em className={statusClass(line.status)}>{line.status}</em>
												</span>
											))}
										</div>
									</td>
									<td><span className={`field-status-badge ${statusClass(labels.step3)}`}>{labels.step3}</span></td>
									<td><span className={`field-status-badge ${statusClass(labels.step4)}`}>{labels.step4}</span></td>
									<td>{progressRate(student)}%</td>
								</tr>
							)
						})}
						{filteredStudents.length === 0 && (
							<tr>
								<td colSpan={8} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>
				<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={setPage} />
			</CrudPageCard>
		</AdminLayout>
	)
}

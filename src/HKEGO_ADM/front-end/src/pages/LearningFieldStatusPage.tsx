import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

export const LearningFieldStatusPage: React.FC = () => {
	const [searchParams] = useSearchParams()
	const initialDate = searchParams.get('date') || todayYmd()
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

	const schools = useMemo(() => Array.from(new Set(rows.map((row) => row.schlNm).filter(Boolean))), [rows])
	const teams = useMemo(() => {
		const fromData = rows.flatMap((row) => row.students ?? []).map((student) => student.teamNm).filter(Boolean) as string[]
		return Array.from(new Set([...fromData, 'A', 'B', 'C', 'D']))
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
		const labels = stepLabels(student)
		const flatStatuses = [labels.step1, ...labels.step2.map((line) => line.status), labels.step3, labels.step4]
		const matchesStep = stepStatus === 'all' || flatStatuses.includes(stepStatus)
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
						<label className="bbs-post-filter-label">STEP 활동 상태</label>
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

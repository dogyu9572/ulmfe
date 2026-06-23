import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { ListPagination } from '../components/ListPagination'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL } from '../config'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type ProgramType = 'MISSION' | 'EXPLORE'

type ProgramOption = {
	prgrmSn: number
	prgrmTypeCd: ProgramType
	prgrmTypeNm: string
	prgrmNm: string
}

type ReservationStudent = {
	stdntSn?: number | null
	stdntNo?: string
	clasNm?: string
	clasNo?: string
	stdntNm?: string
	atndYn: string
	teamNm?: string
	asgnNm?: string
	routeCn?: string
	lrnSttsCd?: string
	prgrsRt?: number
}

type Reservation = {
	rsvtSn: number | null
	rsvtNo?: string
	schlNm: string
	scyrNm: string
	picNm: string
	picTelno: string
	picEmlAddr?: string
	rsvtYmd: string
	vstHm: string
	rsvtNope: number
	actlNope?: number | null
	prgrmTypeCd: ProgramType | ''
	prgrmTypeNm?: string
	prgrmSn: number | null
	prgrmNm?: string
	lrnSttsCd: string
	lrnSttsNm?: string
	stdntListYn?: string
	stdntCnt?: number
	regDt?: string
	rgtr?: string
	students?: ReservationStudent[]
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const LEARNING_STATUS_OPTIONS = [
	{ value: '', label: '전체' },
	{ value: 'READY', label: '진행 전' },
	{ value: 'ING', label: '진행 중' },
	{ value: 'DONE', label: '완료' }
]

const PROGRAM_TYPE_OPTIONS = [
	{ value: '', label: '전체' },
	{ value: 'MISSION', label: '미션' },
	{ value: 'EXPLORE', label: '사건탐구' }
]

const defaultReservation = (): Reservation => ({
	rsvtSn: null,
	rsvtNo: '',
	schlNm: '',
	scyrNm: '',
	picNm: '',
	picTelno: '',
	picEmlAddr: '',
	rsvtYmd: '',
	vstHm: '',
	rsvtNope: 0,
	actlNope: null,
	prgrmTypeCd: '',
	prgrmSn: null,
	lrnSttsCd: 'READY',
	students: []
})

const defaultStudent = (): ReservationStudent => ({
	stdntSn: null,
	stdntNo: '',
	clasNm: '',
	clasNo: '',
	stdntNm: '',
	atndYn: 'N',
	teamNm: '',
	asgnNm: '',
	routeCn: '',
	lrnSttsCd: 'READY',
	prgrsRt: 0
})

function formatDate(value: string | null | undefined): string {
	if (!value) return '-'
	return String(value).slice(0, 10)
}

function formatVisitDateTime(row: Reservation): string {
	const ymd = formatDate(row.rsvtYmd)
	return row.vstHm ? `${ymd} ${row.vstHm}` : ymd
}

function numericText(value: string | null | undefined): string {
	return String(value ?? '').replace(/\D/g, '')
}

function reservationToForm(data: Reservation): Reservation {
	return {
		...defaultReservation(),
		...data,
		scyrNm: numericText(data.scyrNm),
		rsvtYmd: formatDate(data.rsvtYmd),
		students: data.students ?? []
	}
}

export const LearningReservationPage: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [list, setList] = useState<Reservation[]>([])
	const [form, setForm] = useState<Reservation>(defaultReservation())
	const [popupOpen, setPopupOpen] = useState(false)
	const [studentPopupOpen, setStudentPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [popupError, setPopupError] = useState<string | null>(null)
	const [programOptions, setProgramOptions] = useState<ProgramOption[]>([])
	const [lrnSttsCd, setLrnSttsCd] = useState('')
	const [prgrmTypeCd, setPrgrmTypeCd] = useState('')
	const [startRsvtYmd, setStartRsvtYmd] = useState('')
	const [endRsvtYmd, setEndRsvtYmd] = useState('')
	const [searchType, setSearchType] = useState('all')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [reservationImportFile, setReservationImportFile] = useState<File | null>(null)
	const [studentImportFile, setStudentImportFile] = useState<File | null>(null)
	const reservationFileInputRef = useRef<HTMLInputElement | null>(null)
	const studentFileInputRef = useRef<HTMLInputElement | null>(null)
	const openedQueryRsvtSnRef = useRef('')

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [pageSize, totalCount])
	const allSelected = list.length > 0 && list.every((row) => row.rsvtSn != null && selectedIds.has(row.rsvtSn))
	const filteredProgramOptions = programOptions.filter((program) => !form.prgrmTypeCd || program.prgrmTypeCd === form.prgrmTypeCd)

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize, filters?: Partial<{
		lrnSttsCd: string
		prgrmTypeCd: string
		startRsvtYmd: string
		endRsvtYmd: string
		searchType: string
		searchKeyword: string
	}>) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		const next = {
			lrnSttsCd,
			prgrmTypeCd,
			startRsvtYmd,
			endRsvtYmd,
			searchType,
			searchKeyword,
			...filters
		}
		if (next.lrnSttsCd) qs.set('lrnSttsCd', next.lrnSttsCd)
		if (next.prgrmTypeCd) qs.set('prgrmTypeCd', next.prgrmTypeCd)
		if (next.startRsvtYmd) qs.set('startRsvtYmd', next.startRsvtYmd)
		if (next.endRsvtYmd) qs.set('endRsvtYmd', next.endRsvtYmd)
		if (next.searchType) qs.set('searchType', next.searchType)
		if (next.searchKeyword.trim()) qs.set('searchKeyword', next.searchKeyword.trim())
		return qs.toString()
	}, [endRsvtYmd, lrnSttsCd, pageSize, prgrmTypeCd, searchKeyword, searchType, startRsvtYmd])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize, filters?: Parameters<typeof buildSearchParams>[2]) => {
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-reservations?${buildSearchParams(targetPage, targetSize, filters)}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<Reservation>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '예약 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('예약 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	const fetchPrograms = useCallback(async () => {
		const allPrograms: ProgramOption[] = []
		for (const type of ['MISSION', 'EXPLORE'] as ProgramType[]) {
			const qs = new URLSearchParams()
			qs.set('prgrmTypeCd', type)
			qs.set('useYn', 'Y')
			qs.set('page', '1')
			qs.set('size', '100')
			const res = await fetch(`${BACKEND}/api/admin/education-programs?${qs.toString()}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<ProgramOption>> = await res.json()
			if (result.success && result.data?.list) {
				allPrograms.push(...result.data.list)
			}
		}
		setProgramOptions(allPrograms)
	}, [])

	useEffect(() => {
		void fetchPrograms()
		void fetchList(1, DEFAULT_LIST_PAGE_SIZE)
	}, [])

	const showPopupError = (value: string) => {
		setPopupError(value)
		window.setTimeout(() => document.querySelector('.layer-popup-body')?.scrollTo({ top: 0, behavior: 'smooth' }), 0)
	}

	const downloadFile = async (url: string, filename: string) => {
		const res = await fetch(url, { credentials: 'include' })
		if (!res.ok) throw new Error('파일 다운로드에 실패했습니다.')
		const blob = await res.blob()
		const objectUrl = window.URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = objectUrl
		link.download = filename
		document.body.appendChild(link)
		link.click()
		link.remove()
		window.URL.revokeObjectURL(objectUrl)
	}

	const downloadReservationExcel = async () => {
		setError(null)
		try {
			await downloadFile(`${BACKEND}/api/admin/learning-reservations/excel?${buildSearchParams(1, 10000)}`, 'learning-reservations.xlsx')
		} catch (e) {
			setError(e instanceof Error ? e.message : '예약 목록 엑셀 다운로드 중 오류가 발생했습니다.')
		}
	}

	const downloadStudentTemplate = async () => {
		setPopupError(null)
		try {
			await downloadFile(`${BACKEND}/api/admin/learning-reservations/students/template`, 'learning-reservation-students-template.xlsx')
		} catch (e) {
			showPopupError(e instanceof Error ? e.message : '학생명단 양식 다운로드 중 오류가 발생했습니다.')
		}
	}

	const downloadReservationImportTemplate = async () => {
		setError(null)
		try {
			await downloadFile(`${BACKEND}/api/admin/learning-reservations/import-template`, 'learning-reservation-import-template.xlsx')
		} catch (e) {
			setError(e instanceof Error ? e.message : '예약 일괄등록 양식 다운로드 중 오류가 발생했습니다.')
		}
	}

	const openNewPopup = () => {
		setPopupMode('new')
		setForm(defaultReservation())
		setPopupError(null)
		setStudentImportFile(null)
		setPopupOpen(true)
	}

	const openEditPopup = async (rsvtSn: number | null) => {
		if (!rsvtSn) return
		setPopupMode('edit')
		setLoading(true)
		setPopupError(null)
		setStudentImportFile(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-reservations/${rsvtSn}`, { credentials: 'include' })
			const result: ApiResponse<Reservation> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '예약 상세 조회에 실패했습니다.')
				return
			}
			setForm(reservationToForm(result.data))
			setPopupOpen(true)
		} catch {
			setError('예약 상세 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const queryRsvtSn = searchParams.get('rsvtSn') || ''
		if (!queryRsvtSn || openedQueryRsvtSnRef.current === queryRsvtSn) return
		const parsedRsvtSn = Number(queryRsvtSn)
		if (!Number.isFinite(parsedRsvtSn) || parsedRsvtSn <= 0) return
		openedQueryRsvtSnRef.current = queryRsvtSn
		void openEditPopup(parsedRsvtSn)
	}, [searchParams])

	const openStudentPopup = async (row: Reservation) => {
		if (!row.rsvtSn) {
			setError('예약 저장 후 학생 명단을 등록할 수 있습니다.')
			return
		}
		await openEditPopup(row.rsvtSn)
		setPopupOpen(false)
		setStudentPopupOpen(true)
	}

	const closePopup = () => {
		setPopupOpen(false)
		setStudentPopupOpen(false)
		setPopupError(null)
		setStudentImportFile(null)
		setForm(defaultReservation())
		if (searchParams.has('rsvtSn')) {
			const next = new URLSearchParams(searchParams)
			next.delete('rsvtSn')
			setSearchParams(next, { replace: true })
		}
	}

	const saveReservation = async (closeAfterSave = true) => {
		setPopupError(null)
		if (!form.schlNm.trim()) return showPopupError('학교명을 입력하세요.')
		if (!form.scyrNm.trim()) return showPopupError('학년을 입력하세요.')
		if (!/^\d+$/.test(form.scyrNm.trim())) return showPopupError('학년은 숫자만 입력하세요.')
		if (!form.picNm.trim()) return showPopupError('인솔자 이름을 입력하세요.')
		if (!form.picTelno.trim()) return showPopupError('인솔자 연락처를 입력하세요.')
		if (!form.rsvtYmd) return showPopupError('예약 날짜를 선택하세요.')
		if (!form.vstHm) return showPopupError('방문 예정 시간을 입력하세요.')
		if (!form.prgrmTypeCd) return showPopupError('프로그램 구분을 선택하세요.')
		if (!form.prgrmSn) return showPopupError('프로그램을 선택하세요.')
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const isEdit = popupMode === 'edit' && form.rsvtSn != null
			const body = { ...form, rsvtSn: undefined }
			const res = await fetch(
				isEdit ? `${BACKEND}/api/admin/learning-reservations/${form.rsvtSn}` : `${BACKEND}/api/admin/learning-reservations`,
				{
					method: isEdit ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				}
			)
			const result: ApiResponse<Reservation> = await res.json()
			if (!result.success) {
				showPopupError(result.message || '저장에 실패했습니다.')
				return
			}
			setMessage(isEdit ? '예약이 수정되었습니다.' : '예약이 등록되었습니다.')
			if (closeAfterSave) closePopup()
			else setForm(reservationToForm(result.data))
			await fetchList(page, pageSize)
		} catch (e) {
			showPopupError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteReservation = async (row: Reservation, skipConfirm = false) => {
		if (!row.rsvtSn) return
		if (!skipConfirm && !window.confirm(`"${row.schlNm}" 예약을 삭제하시겠습니까?`)) return
		setLoading(true)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-reservations/${row.rsvtSn}`, { method: 'DELETE', credentials: 'include' })
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('예약이 삭제되었습니다.')
			await fetchList(page, pageSize)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const bulkDeleteReservations = async () => {
		const targets = Array.from(selectedIds)
		if (targets.length === 0) return setError('삭제할 예약을 선택하세요.')
		if (!window.confirm('선택한 예약을 삭제하시겠습니까?')) return
		for (const rsvtSn of targets) {
			const row = list.find((item) => item.rsvtSn === rsvtSn)
			if (row) await deleteReservation(row, true)
		}
	}

	const toggleSelectAll = () => {
		setSelectedIds(allSelected ? new Set() : new Set(list.map((row) => row.rsvtSn).filter((v): v is number => v != null)))
	}

	const toggleSelectRow = (rsvtSn: number | null) => {
		if (!rsvtSn) return
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(rsvtSn)) next.delete(rsvtSn)
			else next.add(rsvtSn)
			return next
		})
	}

	const updateStudent = (index: number, patch: Partial<ReservationStudent>) => {
		const students = form.students ?? []
		setForm({ ...form, students: students.map((student, i) => i === index ? { ...student, ...patch } : student) })
	}

	const importStudents = async () => {
		setPopupError(null)
		if (!form.rsvtSn) return showPopupError('예약 저장 후 학생 명단을 일괄등록할 수 있습니다.')
		if (!studentImportFile) return showPopupError('일괄등록할 학생명단 파일을 선택하세요.')
		const formData = new FormData()
		formData.append('file', studentImportFile)
		setLoading(true)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-reservations/${form.rsvtSn}/students/import`, {
				method: 'POST',
				body: formData,
				credentials: 'include'
			})
			const result: ApiResponse<Reservation> = await res.json()
			if (!result.success || !result.data) {
				showPopupError(result.message || '학생명단 일괄등록에 실패했습니다.')
				return
			}
			setForm(reservationToForm(result.data))
			setStudentImportFile(null)
			if (studentFileInputRef.current) studentFileInputRef.current.value = ''
			setMessage('학생명단이 일괄등록되었습니다.')
			await fetchList(page, pageSize)
		} catch (e) {
			showPopupError(e instanceof Error ? e.message : '학생명단 일괄등록 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const importReservations = async () => {
		setError(null)
		setMessage(null)
		if (!reservationImportFile) {
			setError('업로드할 예약 엑셀 파일을 선택하세요.')
			return
		}
		const formData = new FormData()
		formData.append('file', reservationImportFile)
		setLoading(true)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-reservations/import`, {
				method: 'POST',
				body: formData,
				credentials: 'include'
			})
			const result: ApiResponse<number> = await res.json()
			if (!result.success) {
				setError(result.message || '일괄등록에 실패했습니다.')
				return
			}
			setReservationImportFile(null)
			if (reservationFileInputRef.current) reservationFileInputRef.current.value = ''
			setMessage(`예약 ${result.data ?? 0}건이 일괄등록되었습니다.`)
			await fetchList(1, pageSize)
		} catch (e) {
			setError(e instanceof Error ? e.message : '일괄등록 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const selectedProgram = programOptions.find((program) => program.prgrmSn === form.prgrmSn && program.prgrmTypeCd === form.prgrmTypeCd)

	return (
		<AdminLayout title="예약 관리">
			<CrudPageCard title="예약 관리" error={popupOpen || studentPopupOpen ? null : error} message={message}>
				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
						<select
							value={pageSize}
							onChange={(e) => {
								const nextSize = Number(e.target.value)
								setPageSize(nextSize)
								setPage(1)
								void fetchList(1, nextSize)
							}}
							className="list-page-size-select"
							aria-label="페이지당 목록 개수"
						>
							{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button type="button" className="admin-filter-btn-reset" onClick={() => void downloadReservationExcel()} disabled={loading}>엑셀 다운로드</button>
						<button type="button" className="admin-footer-btn-delete" disabled={selectedIds.size === 0 || loading} onClick={() => void bulkDeleteReservations()}>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openNewPopup} disabled={loading}>등록</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">학습 진행상태</label>
						<select className="bbs-post-filter-select" value={lrnSttsCd} onChange={(e) => setLrnSttsCd(e.target.value)}>
							{LEARNING_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
						</select>
						<label className="bbs-post-filter-label">프로그램 구분</label>
						<select className="bbs-post-filter-select" value={prgrmTypeCd} onChange={(e) => setPrgrmTypeCd(e.target.value)}>
							{PROGRAM_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">예약일</label>
						<input type="date" value={startRsvtYmd} onChange={(e) => setStartRsvtYmd(e.target.value)} className="bbs-post-filter-input" />
						<span>~</span>
						<input type="date" value={endRsvtYmd} onChange={(e) => setEndRsvtYmd(e.target.value)} className="bbs-post-filter-input" />
					</div>
					<div className="bbs-post-filter-row">
						<select className="bbs-post-filter-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
							<option value="all">전체</option>
							<option value="rsvtNo">예약번호</option>
							<option value="schlNm">학교명</option>
							<option value="picNm">인솔자</option>
							<option value="picTelno">연락처</option>
						</select>
						<input
							type="text"
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') void fetchList(1, pageSize) }}
							placeholder="검색어"
							className="bbs-post-filter-input"
						/>
					</div>
					<div className="bbs-post-filter-row" style={{ flexBasis: '100%' }}>
						<label className="bbs-post-filter-label">예약 일괄 등록</label>
						<input
							ref={reservationFileInputRef}
							type="file"
							accept=".xlsx"
							style={{ display: 'none' }}
							onChange={(e) => setReservationImportFile(e.target.files?.[0] ?? null)}
						/>
						<span className="muted" style={{ minWidth: 160 }}>{reservationImportFile ? reservationImportFile.name : '선택된 파일 없음'}</span>
						<button type="button" className="admin-filter-btn-reset" onClick={() => void downloadReservationImportTemplate()} disabled={loading}>샘플 다운로드</button>
						<button type="button" className="admin-filter-btn-reset" onClick={() => reservationFileInputRef.current?.click()} disabled={loading}>파일첨부</button>
						<button type="button" className="admin-list-btn-sky" onClick={() => void importReservations()} disabled={loading}>업로드</button>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList(1, pageSize)} disabled={loading}>검색</button>
						<button
							type="button"
							className="admin-filter-btn-reset"
							onClick={() => {
								setLrnSttsCd('')
								setPrgrmTypeCd('')
								setStartRsvtYmd('')
								setEndRsvtYmd('')
								setSearchType('all')
								setSearchKeyword('')
								void fetchList(1, pageSize, { lrnSttsCd: '', prgrmTypeCd: '', startRsvtYmd: '', endRsvtYmd: '', searchType: 'all', searchKeyword: '' })
							}}
							disabled={loading}
						>
							초기화
						</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 44 }}><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="전체 선택" /></th>
							<th style={{ width: 70 }}>번호</th>
							<th style={{ width: 120 }}>예약번호</th>
							<th>학교명</th>
							<th style={{ width: 80 }}>학년</th>
							<th style={{ width: 100 }}>인솔자</th>
							<th style={{ width: 120 }}>연락처</th>
							<th style={{ width: 130 }}>예약 일시</th>
							<th style={{ width: 90 }}>구분</th>
							<th>프로그램명</th>
							<th style={{ width: 80 }}>인원</th>
							<th style={{ width: 90 }}>학생 명단</th>
							<th style={{ width: 90 }}>학습상태</th>
							<th style={{ width: 110 }}>등록일</th>
							<th style={{ width: 110 }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr key={row.rsvtSn ?? row.rsvtNo} onClick={() => void openEditPopup(row.rsvtSn)}>
								<td onClick={(e) => e.stopPropagation()}>
									<input type="checkbox" checked={row.rsvtSn != null && selectedIds.has(row.rsvtSn)} onChange={() => toggleSelectRow(row.rsvtSn)} aria-label={`${row.schlNm} 선택`} />
								</td>
								<td>{row.rsvtSn}</td>
								<td>{row.rsvtNo}</td>
								<td style={{ textAlign: 'left' }}>{row.schlNm}</td>
							<td>{numericText(row.scyrNm) || row.scyrNm}</td>
								<td>{row.picNm}</td>
								<td>{row.picTelno}</td>
								<td>{formatVisitDateTime(row)}</td>
								<td>{row.prgrmTypeNm || row.prgrmTypeCd}</td>
								<td style={{ textAlign: 'left' }}>{row.prgrmNm || '-'}</td>
								<td>{row.actlNope ?? row.stdntCnt ?? row.rsvtNope}명</td>
								<td onClick={(e) => e.stopPropagation()}>
									<button type="button" className="admin-list-btn-sky" onClick={() => void openStudentPopup(row)}>{row.stdntListYn === 'Y' ? '보기' : '등록'}</button>
								</td>
								<td>{row.lrnSttsNm || '-'}</td>
								<td>{formatDate(row.regDt)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons onEdit={() => void openEditPopup(row.rsvtSn)} onDelete={() => void deleteReservation(row)} disabled={loading} />
								</td>
							</tr>
						))}
						{list.length === 0 && <tr><td colSpan={15} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>}
					</tbody>
				</table>
				<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={(nextPage) => { setPage(nextPage); void fetchList(nextPage, pageSize) }} />
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={popupMode === 'new' ? '예약 등록' : '예약 수정'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveReservation()} disabled={loading}>{popupMode === 'new' ? '등록' : '수정'}</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup} disabled={loading}>닫기</button>
					</>
				}
			>
				{popupError && <p className="form-error" style={{ position: 'sticky', top: 0, zIndex: 2, marginTop: 0 }}>{popupError}</p>}
				<table className="form-table form-table-cols4">
					<tbody>
						<tr>
							<th>예약번호</th>
							<td><input type="text" value={form.rsvtNo || '자동생성'} disabled /></td>
							<th>학습 진행상태</th>
							<td>
								<select value={form.lrnSttsCd} onChange={(e) => setForm({ ...form, lrnSttsCd: e.target.value })}>
									{LEARNING_STATUS_OPTIONS.filter((option) => option.value).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
								</select>
							</td>
						</tr>
						<tr>
							<th>학교명 <span className="required">*</span></th>
							<td><input type="text" value={form.schlNm} onChange={(e) => setForm({ ...form, schlNm: e.target.value })} /></td>
							<th>학년 <span className="required">*</span></th>
							<td><input type="text" inputMode="numeric" value={form.scyrNm} onChange={(e) => setForm({ ...form, scyrNm: numericText(e.target.value) })} /></td>
						</tr>
						<tr>
							<th>인솔자 이름 <span className="required">*</span></th>
							<td><input type="text" value={form.picNm} onChange={(e) => setForm({ ...form, picNm: e.target.value })} /></td>
							<th>인솔자 연락처 <span className="required">*</span></th>
							<td><input type="text" value={form.picTelno} onChange={(e) => setForm({ ...form, picTelno: e.target.value })} /></td>
						</tr>
						<tr>
							<th>인솔자 이메일</th>
							<td colSpan={3}><input type="text" value={form.picEmlAddr || ''} onChange={(e) => setForm({ ...form, picEmlAddr: e.target.value })} /></td>
						</tr>
						<tr>
							<th>예약 날짜 <span className="required">*</span></th>
							<td><input type="date" value={form.rsvtYmd} onChange={(e) => setForm({ ...form, rsvtYmd: e.target.value })} /></td>
							<th>방문 예정 시간 <span className="required">*</span></th>
							<td><input type="time" value={form.vstHm} onChange={(e) => setForm({ ...form, vstHm: e.target.value })} /></td>
						</tr>
						<tr>
							<th>예약 인원</th>
							<td><input type="number" value={form.rsvtNope} onChange={(e) => setForm({ ...form, rsvtNope: e.target.value ? Number(e.target.value) : 0 })} /></td>
							<th>실제 인원</th>
							<td><input type="text" value={form.actlNope == null ? '학생 명단 기준 자동' : `${form.actlNope}명`} disabled /></td>
						</tr>
						<tr>
							<th>프로그램 구분 <span className="required">*</span></th>
							<td>
								<select value={form.prgrmTypeCd} onChange={(e) => setForm({ ...form, prgrmTypeCd: e.target.value as ProgramType | '', prgrmSn: null })}>
									<option value="">선택</option>
									<option value="MISSION">미션</option>
									<option value="EXPLORE">사건탐구</option>
								</select>
							</td>
							<th>프로그램명 <span className="required">*</span></th>
							<td>
								<select value={form.prgrmSn ?? ''} onChange={(e) => setForm({ ...form, prgrmSn: e.target.value ? Number(e.target.value) : null })}>
									<option value="">선택</option>
									{filteredProgramOptions.map((program) => (
										<option key={`${program.prgrmTypeCd}-${program.prgrmSn}`} value={program.prgrmSn}>{program.prgrmNm}</option>
									))}
								</select>
							</td>
						</tr>
						<tr>
							<th>선택 프로그램</th>
							<td colSpan={3}>{selectedProgram ? `${selectedProgram.prgrmTypeNm || selectedProgram.prgrmTypeCd} / ${selectedProgram.prgrmNm}` : '-'}</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>

			<LayerPopup
				open={studentPopupOpen}
				title="학생명단 등록/보기"
				onClose={closePopup}
				wideDouble
				footer={
					<>
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveReservation(false)} disabled={loading}>저장</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup} disabled={loading}>닫기</button>
					</>
				}
			>
				{popupError && <p className="form-error" style={{ position: 'sticky', top: 0, zIndex: 2, marginTop: 0 }}>{popupError}</p>}
				<div className="list-toolbar" style={{ marginBottom: 10 }}>
					<div className="list-toolbar-left">
						<strong>{form.schlNm || '-'} {form.scyrNm || ''}</strong>
						<span className="muted">예약번호: {form.rsvtNo || '-'}</span>
						{studentImportFile && <span className="muted">선택파일: {studentImportFile.name}</span>}
					</div>
					<div className="list-toolbar-actions">
						<input
							ref={studentFileInputRef}
							type="file"
							accept=".xlsx"
							style={{ display: 'none' }}
							onChange={(e) => setStudentImportFile(e.target.files?.[0] ?? null)}
						/>
						<button type="button" className="admin-filter-btn-reset" onClick={() => void downloadStudentTemplate()} disabled={loading}>양식 다운로드</button>
						<button type="button" className="admin-filter-btn-reset" onClick={() => studentFileInputRef.current?.click()} disabled={loading}>파일첨부</button>
						<button type="button" className="admin-filter-btn-reset" onClick={() => void importStudents()} disabled={loading}>일괄등록</button>
						<button type="button" className="admin-list-btn-sky" onClick={() => setForm({ ...form, students: [...(form.students ?? []), defaultStudent()] })} disabled={loading}>추가</button>
					</div>
				</div>
				<table className="table learning-student-table">
					<thead>
						<tr>
							<th style={{ width: 70 }}>번호</th>
							<th style={{ width: 90 }}>반</th>
							<th style={{ width: 90 }}>반번호</th>
							<th style={{ width: 120 }}>이름</th>
							<th style={{ width: 70 }}>출석</th>
							<th style={{ width: 90 }}>팀</th>
							<th style={{ width: 180 }}>배정(미션/코스)</th>
							<th>동선</th>
							<th style={{ width: 76 }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{(form.students ?? []).map((student, index) => (
							<tr key={index}>
								<td><input type="text" value={student.stdntNo || String(index + 1)} onChange={(e) => updateStudent(index, { stdntNo: e.target.value })} /></td>
								<td><input type="text" value={student.clasNm || ''} onChange={(e) => updateStudent(index, { clasNm: e.target.value })} /></td>
								<td><input type="text" value={student.clasNo || ''} onChange={(e) => updateStudent(index, { clasNo: e.target.value })} /></td>
								<td><input type="text" value={student.stdntNm || ''} onChange={(e) => updateStudent(index, { stdntNm: e.target.value })} /></td>
								<td>
									<select value={student.atndYn || 'N'} onChange={(e) => updateStudent(index, { atndYn: e.target.value })}>
										<option value="Y">Y</option>
										<option value="N">N</option>
									</select>
								</td>
								<td><input type="text" value={student.teamNm || ''} onChange={(e) => updateStudent(index, { teamNm: e.target.value })} placeholder="A" /></td>
								<td><input type="text" value={student.asgnNm || ''} onChange={(e) => updateStudent(index, { asgnNm: e.target.value })} /></td>
								<td><input type="text" value={student.routeCn || ''} onChange={(e) => updateStudent(index, { routeCn: e.target.value })} /></td>
								<td><button type="button" className="admin-footer-btn-delete" onClick={() => setForm({ ...form, students: (form.students ?? []).filter((_, i) => i !== index) })}>삭제</button></td>
							</tr>
						))}
						{(form.students ?? []).length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center' }}>등록된 학생 명단이 없습니다.</td></tr>}
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

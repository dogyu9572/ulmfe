import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { ListPagination } from '../components/ListPagination'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type LearningResult = {
	rsvtSn: number
	rsvtNo?: string
	schlNm: string
	scyrNm?: string
	prgrmTypeCd?: string
	prgrmTypeNm?: string
	prgrmNm?: string
	lrnYmd?: string
	picNm?: string
	rsvtNope?: number
	actlNope?: number
	atndCnt?: number
	studentCnt?: number
	attendanceRate?: number
	students?: LearningResultStudent[]
}

type LearningResultStudent = {
	stdntSn: number
	rsvtSn: number
	stdntNo?: string
	clasNm?: string
	clasNo?: string
	stdntNm?: string
	atndYn?: string
	teamNm?: string
	asgnNm?: string
	routeCn?: string
	doneStepCnt?: number
	totalStepCnt?: number
}

type LearningResultAnswer = {
	lrnAnsSn: number
	ansTypeCd?: string
	ansTypeNm?: string
	stepCd?: string
	stepNm?: string
	cardClsfCd?: string
	cardClsfNm?: string
	qstnCn?: string
	ansCn?: string
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]

function formatDate(value: string | null | undefined): string {
	if (!value) return '-'
	return String(value).slice(0, 10)
}

function formatAttendance(row: LearningResult): string {
	const rate = row.attendanceRate ?? 0
	const atndCnt = row.atndCnt ?? 0
	const total = Math.max(row.rsvtNope ?? 0, row.studentCnt ?? 0)
	return `${rate}% (${atndCnt}/${total})`
}

function displayName(value: string | null | undefined): string {
	return value && value.trim() ? value : '-'
}

function formatGrade(value: string | null | undefined): string {
	const normalized = value && value.trim() ? value.trim() : ''
	if (!normalized) return '-'
	return normalized.endsWith('학년') ? normalized : `${normalized}학년`
}

function formatSchoolInfo(row: LearningResult): string {
	const people = Math.max(row.rsvtNope ?? 0, row.studentCnt ?? 0)
	return `${row.schlNm || '-'} ${formatGrade(row.scyrNm)} - ${people}명`
}

export const LearningResultPage: React.FC = () => {
	const [list, setList] = useState<LearningResult[]>([])
	const [detail, setDetail] = useState<LearningResult | null>(null)
	const [answers, setAnswers] = useState<LearningResultAnswer[]>([])
	const [answerPopupOpen, setAnswerPopupOpen] = useState(false)
	const [answerPopupTitle, setAnswerPopupTitle] = useState('결과 보기')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)

	const [prgrmTypeCd, setPrgrmTypeCd] = useState('')
	const [startLrnYmd, setStartLrnYmd] = useState('')
	const [endLrnYmd, setEndLrnYmd] = useState('')
	const [searchType, setSearchType] = useState('all')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [pageSize, totalCount])

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		if (prgrmTypeCd) qs.set('prgrmTypeCd', prgrmTypeCd)
		if (startLrnYmd) qs.set('startLrnYmd', startLrnYmd)
		if (endLrnYmd) qs.set('endLrnYmd', endLrnYmd)
		if (searchType) qs.set('searchType', searchType)
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		return qs.toString()
	}, [endLrnYmd, pageSize, prgrmTypeCd, searchKeyword, searchType, startLrnYmd])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize) => {
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-results?${buildSearchParams(targetPage, targetSize)}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<LearningResult>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '학습결과 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
		} catch {
			setError('학습결과 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	useEffect(() => {
		void fetchList(page, pageSize)
	}, [fetchList, page, pageSize])

	const handleSearch = () => {
		setPage(1)
		void fetchList(1, pageSize)
	}

	const resetFilters = () => {
		setPrgrmTypeCd('')
		setStartLrnYmd('')
		setEndLrnYmd('')
		setSearchType('all')
		setSearchKeyword('')
		setPage(1)
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

	const downloadDetailExcel = async () => {
		if (!detail?.rsvtSn) return
		setError(null)
		try {
			await downloadFile(`${BACKEND}/api/admin/learning-results/${detail.rsvtSn}/excel`, 'learning-result-detail.xlsx')
		} catch (e) {
			setError(e instanceof Error ? e.message : '전체 엑셀 다운로드 중 오류가 발생했습니다.')
		}
	}

	const openDetail = async (rsvtSn: number) => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-results/${rsvtSn}`, { credentials: 'include' })
			const result: ApiResponse<LearningResult> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '학습결과 상세 조회에 실패했습니다.')
				return
			}
			setDetail(result.data)
			setMessage(null)
		} catch {
			setError('학습결과 상세 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const openAnswers = async (student: LearningResultStudent, ansTypeCd: string, label: string) => {
		if (!detail?.rsvtSn || !student.stdntSn) return
		setLoading(true)
		setError(null)
		try {
			const qs = new URLSearchParams()
			qs.set('ansTypeCd', ansTypeCd)
			const res = await fetch(`${BACKEND}/api/admin/learning-results/${detail.rsvtSn}/students/${student.stdntSn}/answers?${qs.toString()}`, { credentials: 'include' })
			const result: ApiResponse<LearningResultAnswer[]> = await res.json()
			if (!result.success) {
				setError(result.message || '개별 결과 조회에 실패했습니다.')
				return
			}
			setAnswers(result.data ?? [])
			setAnswerPopupTitle(`${displayName(student.stdntNm)} ${label}`)
			setAnswerPopupOpen(true)
		} catch {
			setError('개별 결과 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const renderList = () => (
		<>
			<div className="list-toolbar">
				<div className="list-toolbar-left">
					<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
					<select
						value={pageSize}
						onChange={(e) => {
							setPageSize(Number(e.target.value))
							setPage(1)
						}}
						className="list-page-size-select"
						aria-label="페이지당 목록 개수"
					>
						{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
					</select>
				</div>
				<div className="list-toolbar-actions" />
			</div>

			<div className="bbs-post-filters search-section">
				<div className="bbs-post-filter-row">
					<label className="bbs-post-filter-label">프로그램 구분</label>
					<select value={prgrmTypeCd} onChange={(e) => setPrgrmTypeCd(e.target.value)} className="bbs-post-filter-select">
						<option value="">전체</option>
						<option value="MISSION">미션</option>
						<option value="EXPLORE">사건탐구</option>
					</select>
				</div>
				<div className="bbs-post-filter-row">
					<label className="bbs-post-filter-label">학습일 조회</label>
					<input type="date" value={startLrnYmd} onChange={(e) => setStartLrnYmd(e.target.value)} className="bbs-post-filter-date" />
					<span className="date-range-separator">~</span>
					<input type="date" value={endLrnYmd} onChange={(e) => setEndLrnYmd(e.target.value)} className="bbs-post-filter-date" />
				</div>
				<div className="bbs-post-filter-row">
					<label className="bbs-post-filter-label">검색어</label>
					<select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="bbs-post-filter-select">
						<option value="all">전체</option>
						<option value="schlNm">학교명</option>
						<option value="prgrmNm">프로그램명</option>
					</select>
					<input
						type="text"
						value={searchKeyword}
						onChange={(e) => setSearchKeyword(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleSearch()
						}}
						placeholder="검색어"
						className="bbs-post-filter-input"
					/>
				</div>
				<div className="bbs-post-filter-actions">
					<button type="button" className="admin-list-btn-sky" onClick={handleSearch} disabled={loading}>검색</button>
					<button type="button" className="admin-filter-btn-reset" onClick={resetFilters} disabled={loading}>초기화</button>
				</div>
			</div>

			<p className="admin-help-text">
				학생 학습 결과 데이터는 교육 종료 후 1개월 보관 후 자동 삭제됩니다. 삭제 후에는 결과 조회·다운로드가 불가하므로 필요 시 기간 내 다운로드하시기 바랍니다.
			</p>

			<table className="table">
				<thead>
					<tr>
						<th style={{ width: 44 }}><input type="checkbox" disabled aria-label="전체 선택" /></th>
						<th style={{ width: 70 }}>번호</th>
						<th>학교(학교명)</th>
						<th style={{ width: 90 }}>학년</th>
						<th style={{ width: 100 }}>구분</th>
						<th>프로그램명</th>
						<th style={{ width: 120 }}>학습일</th>
						<th style={{ width: 140 }}>출석률(참석/신청)</th>
						<th style={{ width: 100 }}>인솔자</th>
						<th style={{ width: 100 }}>결과 보기</th>
					</tr>
				</thead>
				<tbody>
					{list.map((row) => (
						<tr key={row.rsvtSn}>
							<td><input type="checkbox" disabled aria-label={`${row.schlNm} 선택`} /></td>
							<td>{row.rsvtSn}</td>
							<td>{row.schlNm}</td>
							<td>{row.scyrNm || '-'}</td>
							<td>{row.prgrmTypeNm || '-'}</td>
							<td>{row.prgrmNm || '-'}</td>
							<td>{formatDate(row.lrnYmd)}</td>
							<td>{formatAttendance(row)}</td>
							<td>{row.picNm || '-'}</td>
							<td>
								<button type="button" className="admin-list-btn-edit" onClick={() => void openDetail(row.rsvtSn)} disabled={loading}>
									결과 보기
								</button>
							</td>
						</tr>
					))}
					{list.length === 0 && (
						<tr>
							<td colSpan={10} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
						</tr>
					)}
				</tbody>
			</table>
			<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={(nextPage) => setPage(nextPage)} />
		</>
	)

	const renderDetail = () => {
		if (!detail) return null
		return (
			<>
				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<strong>학교 정보</strong>
					</div>
					<div className="list-toolbar-actions">
						<button type="button" className="admin-filter-btn-reset" onClick={() => setDetail(null)} disabled={loading}>목록</button>
					</div>
				</div>

				<table className="form-table">
					<tbody>
						<tr>
							<th>학교번호</th>
							<td colSpan={3}>{detail.rsvtNo || '자동생성'}</td>
						</tr>
						<tr>
							<th>학교명</th>
							<td colSpan={3}>{formatSchoolInfo(detail)}</td>
						</tr>
						<tr>
							<th>프로그램/미션</th>
							<td colSpan={3}>{detail.prgrmTypeNm || '-'} - {detail.prgrmNm || '-'}</td>
						</tr>
						<tr>
							<th>학습일</th>
							<td colSpan={3}>{formatDate(detail.lrnYmd)}</td>
						</tr>
						<tr>
							<th>출석률</th>
							<td colSpan={3}>{formatAttendance(detail)}</td>
						</tr>
						<tr>
							<th>전체 엑셀 다운로드</th>
							<td colSpan={3}>
								<div className="admin-inline-actions learning-result-actions learning-result-download-actions">
									<button type="button" className="admin-filter-btn-reset" onClick={() => void downloadDetailExcel()} disabled={loading}>활동지</button>
									<button type="button" className="admin-filter-btn-reset" onClick={() => void downloadDetailExcel()} disabled={loading}>학생 평가지</button>
									<button type="button" className="admin-filter-btn-reset" onClick={() => void downloadDetailExcel()} disabled={loading}>학생 설문지</button>
									<button type="button" className="admin-filter-btn-reset" onClick={() => void downloadDetailExcel()} disabled={loading}>선생님 운영 평가지</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<table className="table" style={{ marginTop: 16 }}>
					<thead>
						<tr>
							<th style={{ width: 70 }}>번호</th>
							<th style={{ width: 90 }}>반</th>
							<th style={{ width: 90 }}>반번호</th>
							<th style={{ width: 120 }}>이름</th>
							<th style={{ width: 90 }}>팀</th>
							<th>미션</th>
							<th style={{ width: 90 }}>완료</th>
							<th style={{ width: 360 }}>개별 결과 보기</th>
						</tr>
					</thead>
					<tbody>
						{(detail.students ?? []).map((student) => (
							<tr key={student.stdntSn}>
								<td>{student.stdntNo || student.stdntSn}</td>
								<td>{student.clasNm || '-'}</td>
								<td>{student.clasNo || '-'}</td>
								<td>{displayName(student.stdntNm)}</td>
								<td>{student.teamNm || '-'}</td>
								<td>{student.asgnNm || '-'}</td>
								<td>{student.doneStepCnt ?? 0}/{student.totalStepCnt ?? 4}존</td>
								<td>
									<div className="admin-inline-actions learning-result-actions">
										<button type="button" className="admin-list-btn-edit" onClick={() => void openAnswers(student, 'WORKSHEET', '활동지')} disabled={loading}>활동지</button>
										<button type="button" className="admin-list-btn-edit" onClick={() => void openAnswers(student, 'EVALUATION', '학생 평가지')} disabled={loading}>학생 평가지</button>
										<button type="button" className="admin-list-btn-edit" onClick={() => void openAnswers(student, 'SURVEY', '학생 설문지')} disabled={loading}>학생 설문지</button>
									</div>
								</td>
							</tr>
						))}
						{(detail.students ?? []).length === 0 && (
							<tr>
								<td colSpan={8} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>
			</>
		)
	}

	return (
		<AdminLayout title="학습결과 관리">
			<CrudPageCard title="학습결과 관리" error={error} message={message}>
				{detail ? renderDetail() : renderList()}
			</CrudPageCard>

			<LayerPopup
				open={answerPopupOpen}
				title={answerPopupTitle}
				onClose={() => setAnswerPopupOpen(false)}
				wideDouble
				footer={<button type="button" className="admin-footer-btn-close" onClick={() => setAnswerPopupOpen(false)}>닫기</button>}
			>
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 90 }}>STEP</th>
							<th style={{ width: 120 }}>카드/분류</th>
							<th>문항</th>
							<th>답변</th>
						</tr>
					</thead>
					<tbody>
						{answers.map((answer) => (
							<tr key={answer.lrnAnsSn}>
								<td>{answer.stepNm || '-'}</td>
								<td>{answer.cardClsfNm || answer.ansTypeNm || '-'}</td>
								<td style={{ textAlign: 'left' }}>{answer.qstnCn || '-'}</td>
								<td style={{ textAlign: 'left' }}>{answer.ansCn || '-'}</td>
							</tr>
						))}
						{answers.length === 0 && (
							<tr>
								<td colSpan={4} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

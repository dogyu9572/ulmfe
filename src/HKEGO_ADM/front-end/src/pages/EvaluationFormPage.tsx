import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { ListPagination } from '../components/ListPagination'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type EvaluationQuestion = {
	qstnSn?: number | null
	qstnrSn?: number | null
	qstnNo: string
	ansTypeCd: string
	ansTypeNm?: string
	qstnCn: string
	sortSeq: number
}

type EvaluationForm = {
	qstnrSn: number | null
	qstnrTypeCd?: string
	evlSeCd: string
	evlSeNm?: string
	qstnrNm: string
	regDt?: string
	rgtr?: string
	questions: EvaluationQuestion[]
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const EVALUATION_TYPE_OPTIONS = [
	{ value: 'STUDENT', label: '학생' },
	{ value: 'TEACHER', label: '선생님 운영' }
]

const ANSWER_TYPE_OPTIONS = [
	{ value: 'LIKERT5', label: '리커트 5점' },
	{ value: 'LEVEL5', label: '상중하 5단계' },
	{ value: 'TEXT', label: '주관식' }
]

const defaultForm = (): EvaluationForm => ({
	qstnrSn: null,
	evlSeCd: 'STUDENT',
	qstnrNm: '',
	questions: []
})

function formatDate(value: string | null | undefined): string {
	if (!value) return '-'
	return String(value).slice(0, 10)
}

function evaluationTypeLabel(value: string | undefined): string {
	return EVALUATION_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || '-'
}

function answerTypeLabel(value: string | undefined): string {
	return ANSWER_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || '-'
}

export const EvaluationFormPage: React.FC = () => {
	const [list, setList] = useState<EvaluationForm[]>([])
	const [form, setForm] = useState<EvaluationForm>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [popupError, setPopupError] = useState<string | null>(null)

	const [evlSeFilter, setEvlSeFilter] = useState('')
	const [startRegYmd, setStartRegYmd] = useState('')
	const [endRegYmd, setEndRegYmd] = useState('')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [selectedQuestionIndexes, setSelectedQuestionIndexes] = useState<Set<number>>(new Set())

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])
	const allSelected = list.length > 0 && list.every((row) => row.qstnrSn != null && selectedIds.has(row.qstnrSn))

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		if (evlSeFilter) qs.set('evlSeCd', evlSeFilter)
		if (startRegYmd) qs.set('startRegYmd', startRegYmd)
		if (endRegYmd) qs.set('endRegYmd', endRegYmd)
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		return qs.toString()
	}, [endRegYmd, evlSeFilter, pageSize, searchKeyword, startRegYmd])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage, targetSize)
			const res = await fetch(`${BACKEND}/api/admin/evaluation-forms?${qs}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<EvaluationForm>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '평가지 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('평가지 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	useEffect(() => {
		void fetchList(1, DEFAULT_LIST_PAGE_SIZE)
	}, [])

	const handleSearch = () => {
		setPage(1)
		void fetchList(1, pageSize)
	}

	const clearSearch = () => {
		setEvlSeFilter('')
		setStartRegYmd('')
		setEndRegYmd('')
		setSearchKeyword('')
		setPage(1)
		void fetchList(1, pageSize)
	}

	const openNewPopup = () => {
		setPopupMode('new')
		setForm(defaultForm())
		setSelectedQuestionIndexes(new Set())
		setPopupError(null)
		setError(null)
		setPopupOpen(true)
	}

	const openEditPopup = async (qstnrSn: number | null) => {
		if (!qstnrSn) return
		setPopupMode('edit')
		setLoading(true)
		setPopupError(null)
		setError(null)
		setSelectedQuestionIndexes(new Set())
		try {
			const res = await fetch(`${BACKEND}/api/admin/evaluation-forms/${qstnrSn}`, { credentials: 'include' })
			const result: ApiResponse<EvaluationForm> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '평가지 상세 조회에 실패했습니다.')
				return
			}
			setForm({
				...defaultForm(),
				...result.data,
				questions: (result.data.questions ?? []).map((question, index) => ({
					...question,
					sortSeq: question.sortSeq || index + 1
				}))
			})
			setPopupOpen(true)
		} catch {
			setError('평가지 상세 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const closePopup = () => {
		setPopupOpen(false)
		setPopupError(null)
		setSelectedQuestionIndexes(new Set())
		setForm(defaultForm())
	}

	const showPopupError = (message: string) => {
		setPopupError(message)
		window.setTimeout(() => {
			document.querySelector('.layer-popup-body')?.scrollTo({ top: 0, behavior: 'smooth' })
		}, 0)
	}

	const addQuestion = () => {
		setForm((prev) => ({
			...prev,
			questions: [
				...prev.questions,
				{
					qstnNo: String(prev.questions.length + 1),
					ansTypeCd: 'LIKERT5',
					qstnCn: '',
					sortSeq: prev.questions.length + 1
				}
			]
		}))
	}

	const updateQuestion = (index: number, patch: Partial<EvaluationQuestion>) => {
		setForm((prev) => ({
			...prev,
			questions: prev.questions.map((question, i) => (i === index ? { ...question, ...patch } : question))
		}))
	}

	const moveQuestion = (index: number, direction: -1 | 1) => {
		const nextIndex = index + direction
		if (nextIndex < 0 || nextIndex >= form.questions.length) return
		const nextQuestions = [...form.questions]
		const current = nextQuestions[index]
		nextQuestions[index] = nextQuestions[nextIndex]
		nextQuestions[nextIndex] = current
		setForm({
			...form,
			questions: nextQuestions.map((question, i) => ({ ...question, sortSeq: i + 1 }))
		})
		setSelectedQuestionIndexes(new Set())
	}

	const toggleQuestionSelect = (index: number) => {
		setSelectedQuestionIndexes((prev) => {
			const next = new Set(prev)
			if (next.has(index)) next.delete(index)
			else next.add(index)
			return next
		})
	}

	const deleteSelectedQuestions = () => {
		if (selectedQuestionIndexes.size === 0) {
			showPopupError('삭제할 문항을 선택하세요.')
			return
		}
		setForm((prev) => ({
			...prev,
			questions: prev.questions
				.filter((_, index) => !selectedQuestionIndexes.has(index))
				.map((question, index) => ({ ...question, sortSeq: index + 1 }))
		}))
		setSelectedQuestionIndexes(new Set())
		setPopupError(null)
	}

	const saveForm = async () => {
		setPopupError(null)
		if (!form.evlSeCd) {
			showPopupError('구분을 선택하세요.')
			return
		}
		if (!form.qstnrNm.trim()) {
			showPopupError('평가지 이름을 입력하세요.')
			return
		}
		for (const question of form.questions) {
			if (!question.qstnNo.trim()) {
				showPopupError('문항 번호를 입력하세요.')
				return
			}
			if (!question.ansTypeCd) {
				showPopupError('답변유형을 선택하세요.')
				return
			}
			if (!question.qstnCn.trim()) {
				showPopupError('질문을 입력하세요.')
				return
			}
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const isEdit = popupMode === 'edit' && form.qstnrSn != null
			const body = {
				evlSeCd: form.evlSeCd,
				qstnrNm: form.qstnrNm,
				questions: form.questions.map((question, index) => ({
					qstnNo: question.qstnNo,
					ansTypeCd: question.ansTypeCd,
					qstnCn: question.qstnCn,
					sortSeq: index + 1
				}))
			}
			const res = await fetch(
				isEdit
					? `${BACKEND}/api/admin/evaluation-forms/${form.qstnrSn}`
					: `${BACKEND}/api/admin/evaluation-forms`,
				{
					method: isEdit ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				}
			)
			const result: ApiResponse<EvaluationForm> = await res.json()
			if (!result.success) {
				showPopupError(result.message || '저장에 실패했습니다.')
				return
			}
			setMessage(isEdit ? '평가지가 수정되었습니다.' : '평가지가 등록되었습니다.')
			closePopup()
			await fetchList(page, pageSize)
		} catch (e) {
			showPopupError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteForm = async (row: EvaluationForm) => {
		if (!row.qstnrSn) return
		if (!window.confirm(`"${row.qstnrNm}" 평가지를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/evaluation-forms/${row.qstnrSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('평가지가 삭제되었습니다.')
			await fetchList(page, pageSize)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const bulkDeleteForms = async () => {
		const targets = Array.from(selectedIds)
		if (targets.length === 0) {
			setError('삭제할 평가지를 선택하세요.')
			return
		}
		if (!window.confirm('선택한 평가지를 삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			for (const qstnrSn of targets) {
				const res = await fetch(`${BACKEND}/api/admin/evaluation-forms/${qstnrSn}`, {
					method: 'DELETE',
					credentials: 'include'
				})
				const result: ApiResponse<unknown> = await res.json()
				if (!result.success) {
					setError(result.message || '선택삭제 중 오류가 발생했습니다.')
					return
				}
			}
			setSelectedIds(new Set())
			setMessage('선택한 평가지를 삭제했습니다.')
			await fetchList(page, pageSize)
		} catch {
			setError('선택삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const toggleSelectAll = () => {
		if (allSelected) {
			setSelectedIds(new Set())
			return
		}
		setSelectedIds(new Set(list.map((row) => row.qstnrSn).filter((v): v is number => v != null)))
	}

	const toggleSelectRow = (qstnrSn: number | null) => {
		if (!qstnrSn) return
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(qstnrSn)) next.delete(qstnrSn)
			else next.add(qstnrSn)
			return next
		})
	}

	return (
		<AdminLayout title="평가지 관리">
			<CrudPageCard title="평가지 관리" error={popupOpen ? null : error} message={message}>
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
							{PAGE_SIZE_OPTIONS.map((size) => (
								<option key={size} value={size}>{size}</option>
							))}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button
							type="button"
							className="admin-footer-btn-delete"
							disabled={selectedIds.size === 0 || loading}
							onClick={() => void bulkDeleteForms()}
						>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openNewPopup} disabled={loading}>
							등록
						</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<select className="bbs-post-filter-select" value="qstnrNm" aria-label="검색 조건" disabled>
							<option value="qstnrNm">평가지 이름</option>
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
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">등록일</label>
						<input
							type="date"
							value={startRegYmd}
							onChange={(e) => setStartRegYmd(e.target.value)}
							className="bbs-post-filter-date"
						/>
						<span className="bbs-post-filter-sep">~</span>
						<input
							type="date"
							value={endRegYmd}
							onChange={(e) => setEndRegYmd(e.target.value)}
							className="bbs-post-filter-date"
						/>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">구분</label>
						<select
							value={evlSeFilter}
							onChange={(e) => setEvlSeFilter(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="">전체</option>
							{EVALUATION_TYPE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={handleSearch} disabled={loading}>검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={clearSearch} disabled={loading}>초기화</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 44 }}>
								<input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="전체 선택" />
							</th>
							<th style={{ width: 80 }}>번호</th>
							<th style={{ width: 150 }}>구분</th>
							<th>평가지 이름</th>
							<th style={{ width: 120 }}>작성자</th>
							<th style={{ width: 120 }}>등록일</th>
							<th style={{ width: 120 }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr key={row.qstnrSn ?? row.qstnrNm} onClick={() => void openEditPopup(row.qstnrSn)}>
								<td onClick={(e) => e.stopPropagation()}>
									<input
										type="checkbox"
										checked={row.qstnrSn != null && selectedIds.has(row.qstnrSn)}
										onChange={() => toggleSelectRow(row.qstnrSn)}
										aria-label={`${row.qstnrNm} 선택`}
									/>
								</td>
								<td>{row.qstnrSn}</td>
								<td>{row.evlSeNm || evaluationTypeLabel(row.evlSeCd)}</td>
								<td style={{ textAlign: 'left' }}>{row.qstnrNm}</td>
								<td>{row.rgtr || '-'}</td>
								<td>{formatDate(row.regDt)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => void openEditPopup(row.qstnrSn)}
										onDelete={() => void deleteForm(row)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={7} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>

				<ListPagination
					page={page}
					totalPages={totalPages}
					disabled={loading}
					onPageChange={(nextPage) => {
						setPage(nextPage)
						void fetchList(nextPage, pageSize)
					}}
				/>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={popupMode === 'new' ? '평가지 등록' : '평가지 수정'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveForm()} disabled={loading}>
							{popupMode === 'new' ? '등록' : '수정'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup} disabled={loading}>
							닫기
						</button>
					</>
				}
			>
				{popupError && (
					<p className="form-error" style={{ position: 'sticky', top: 0, zIndex: 2, marginTop: 0 }}>
						{popupError}
					</p>
				)}
				<table className="form-table">
					<tbody>
						<tr>
							<th>구분 <span className="required">*</span></th>
							<td>
								{EVALUATION_TYPE_OPTIONS.map((option) => (
									<label key={option.value} style={{ marginRight: 18 }}>
										<input
											type="radio"
											name="evaluationType"
											checked={form.evlSeCd === option.value}
											onChange={() => setForm({ ...form, evlSeCd: option.value })}
										/> {option.label} 평가지
									</label>
								))}
							</td>
							<th>제목 <span className="required">*</span></th>
							<td>
								<input
									type="text"
									value={form.qstnrNm}
									onChange={(e) => setForm({ ...form, qstnrNm: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>문항 구성</th>
							<td colSpan={3}>
								<div className="list-toolbar" style={{ marginBottom: 8 }}>
									<div className="list-toolbar-left">
										<span className="muted">문항 추가 후 순서변경, 선택 삭제가 가능합니다.</span>
									</div>
									<div className="list-toolbar-actions">
										<button
											type="button"
											className="admin-footer-btn-delete"
											onClick={deleteSelectedQuestions}
											disabled={selectedQuestionIndexes.size === 0}
										>
											선택 삭제
										</button>
										<button type="button" className="admin-list-btn-sky" onClick={addQuestion}>
											문항 추가
										</button>
									</div>
								</div>
								<table className="table">
									<thead>
										<tr>
											<th style={{ width: 44 }}>
												<input
													type="checkbox"
													checked={form.questions.length > 0 && selectedQuestionIndexes.size === form.questions.length}
													onChange={() => {
														setSelectedQuestionIndexes(
															selectedQuestionIndexes.size === form.questions.length
																? new Set()
																: new Set(form.questions.map((_, index) => index))
														)
													}}
													aria-label="문항 전체 선택"
												/>
											</th>
											<th style={{ width: 90 }}>순서변경</th>
											<th style={{ width: 120 }}>문항 번호</th>
											<th style={{ width: 170 }}>답변유형</th>
											<th>질문</th>
										</tr>
									</thead>
									<tbody>
										{form.questions.map((question, index) => (
											<tr key={`${question.qstnSn ?? 'new'}-${index}`}>
												<td>
													<input
														type="checkbox"
														checked={selectedQuestionIndexes.has(index)}
														onChange={() => toggleQuestionSelect(index)}
														aria-label={`${index + 1}번 문항 선택`}
													/>
												</td>
												<td>
													<div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
														<button
															type="button"
															className="admin-list-btn-edit"
															onClick={() => moveQuestion(index, -1)}
															disabled={index === 0}
															aria-label="위로 이동"
														>
															↑
														</button>
														<button
															type="button"
															className="admin-list-btn-edit"
															onClick={() => moveQuestion(index, 1)}
															disabled={index === form.questions.length - 1}
															aria-label="아래로 이동"
														>
															↓
														</button>
													</div>
												</td>
												<td>
													<input
														type="text"
														value={question.qstnNo}
														onChange={(e) => updateQuestion(index, { qstnNo: e.target.value })}
													/>
												</td>
												<td>
													<select
														value={question.ansTypeCd}
														onChange={(e) => updateQuestion(index, { ansTypeCd: e.target.value })}
													>
														{ANSWER_TYPE_OPTIONS.map((option) => (
															<option key={option.value} value={option.value}>{option.label}</option>
														))}
													</select>
												</td>
												<td>
													<input
														type="text"
														value={question.qstnCn}
														onChange={(e) => updateQuestion(index, { qstnCn: e.target.value })}
														placeholder={`${answerTypeLabel(question.ansTypeCd)} 질문 입력`}
													/>
												</td>
											</tr>
										))}
										{form.questions.length === 0 && (
											<tr>
												<td colSpan={5} style={{ textAlign: 'center' }}>등록된 문항이 없습니다.</td>
											</tr>
										)}
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

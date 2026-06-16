import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { type PagedListData } from '../utils/listPaginationConstants'
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

type SessionInfo = {
	adminId: string
	adminName: string
}

type Terms = {
	trmsSn: number | null
	trmsTypeCd: string
	trmsTypeNm: string
	trmsTtl: string
	trmsCn: string
	currentYn: string
	regDt?: string
	rgtr?: string
	rgtrNm?: string
	mdtr?: string
}

const BACKEND = API_BASE_URL
const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const TERMS_TYPES = [
	{ code: 'USE', name: '이용약관' },
	{ code: 'PRIVACY', name: '개인정보처리방침' },
	{ code: 'VIDEO', name: '영상정보처리기기 운영방침' },
	{ code: 'EMAIL', name: '이메일무단수집거부' }
]

const defaultForm = (): Terms => ({
	trmsSn: null,
	trmsTypeCd: 'USE',
	trmsTypeNm: '이용약관',
	trmsTtl: '',
	trmsCn: '',
	currentYn: 'N'
})

const getTermsTypeName = (code: string) =>
	TERMS_TYPES.find((item) => item.code === code)?.name || code

const currentBadge = (value: string) =>
	value === 'Y' ? <span className="bbs-master-list-badge is-on use">Y</span> : <span>-</span>

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const renderYnToggle = (
	value: string,
	onChange: (next: string) => void,
	labelOn: string,
	labelOff: string
) => (
	<button
		type="button"
		className={`yn-toggle ${value === 'Y' ? 'is-on' : 'is-off'}`}
		onClick={() => onChange(value === 'Y' ? 'N' : 'Y')}
		aria-pressed={value === 'Y'}
	>
		<span className="yn-toggle-label">{value === 'Y' ? labelOn : labelOff}</span>
		<span className="yn-toggle-knob" aria-hidden="true" />
	</button>
)

export const TermsPage: React.FC = () => {
	const [form, setForm] = useState<Terms>(defaultForm)
	const [list, setList] = useState<Terms[]>([])
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const [termsTypeFilter, setTermsTypeFilter] = useState('')
	const [currentYnFilter, setCurrentYnFilter] = useState('')
	const [startRegDate, setStartRegDate] = useState('')
	const [endRegDate, setEndRegDate] = useState('')
	const [searchType, setSearchType] = useState('title')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
	const [currentAdmin, setCurrentAdmin] = useState<SessionInfo>({ adminId: '', adminName: '' })
	const [popupOpen, setPopupOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])
	const editMode = form.trmsSn != null

	const clearMessageLater = (text: string) => {
		setMessage(text)
		window.setTimeout(() => setMessage(null), 3000)
	}

	const fetchSession = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/auth/session`, { credentials: 'include' })
			const result: ApiResponse<SessionInfo> = await res.json()
			if (result.success && result.data) {
				setCurrentAdmin({
					adminId: result.data.adminId ?? '',
					adminName: result.data.adminName ?? ''
				})
			}
		} catch {
			// global auth flow handles session errors
		}
	}, [])

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		if (termsTypeFilter) qs.set('termsTypeCd', termsTypeFilter)
		if (currentYnFilter) qs.set('currentYn', currentYnFilter)
		if (startRegDate) qs.set('startRegDate', startRegDate)
		if (endRegDate) qs.set('endRegDate', endRegDate)
		if (searchType) qs.set('searchType', searchType)
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		return qs.toString()
	}, [pageSize, termsTypeFilter, currentYnFilter, startRegDate, endRegDate, searchType, searchKeyword])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage, targetSize)
			const res = await fetch(`${BACKEND}/api/admin/terms?${qs}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<Terms>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '약관 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('약관 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	useEffect(() => {
		void fetchSession()
		void fetchList(1, DEFAULT_PAGE_SIZE)
	}, [])

	const openNewPopup = () => {
		setForm(defaultForm())
		setError(null)
		setPopupOpen(true)
	}

	const openEditPopup = (row: Terms) => {
		setForm({
			...row,
			trmsTypeCd: row.trmsTypeCd || 'USE',
			trmsTypeNm: row.trmsTypeNm || getTermsTypeName(row.trmsTypeCd),
			currentYn: row.currentYn || 'N'
		})
		setError(null)
		setPopupOpen(true)
	}

	const closePopup = () => {
		setPopupOpen(false)
		setError(null)
		setForm(defaultForm())
	}

	const saveTerms = async () => {
		if (!form.trmsTtl.trim()) {
			setError('제목을 입력해주세요.')
			return
		}
		if (!form.trmsCn.trim()) {
			setError('내용을 입력해주세요.')
			return
		}
		if (form.currentYn === 'Y') {
			const hasOtherCurrent = list.some((row) =>
				row.trmsSn !== form.trmsSn &&
				row.trmsTypeCd === form.trmsTypeCd &&
				row.currentYn === 'Y'
			)
			if (hasOtherCurrent && !window.confirm('같은 약관의 현재약관이 이미 있습니다. 현재약관을 이 항목으로 변경하시겠습니까?')) {
				return
			}
		}
		setLoading(true)
		setError(null)
		try {
			const body: Terms = {
				...form,
				trmsTypeNm: getTermsTypeName(form.trmsTypeCd),
				trmsTtl: form.trmsTtl.trim(),
				trmsCn: form.trmsCn.trim(),
				rgtr: currentAdmin.adminId,
				rgtrNm: currentAdmin.adminName,
				mdtr: currentAdmin.adminId
			}
			const url = editMode
				? `${BACKEND}/api/admin/terms/${form.trmsSn}`
				: `${BACKEND}/api/admin/terms`
			const res = await fetch(url, {
				method: editMode ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body)
			})
			const result: ApiResponse<Terms> = await res.json()
			if (!result.success) {
				setError(result.message || '약관 저장에 실패했습니다.')
				return
			}
			clearMessageLater(editMode ? '약관이 수정되었습니다.' : '약관이 등록되었습니다.')
			closePopup()
			void fetchList(editMode ? page : 1, pageSize)
		} catch {
			setError('약관 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteTerms = async (row: Terms) => {
		if (row.trmsSn == null) return
		if (!window.confirm('삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const qs = currentAdmin.adminId ? `?deltr=${encodeURIComponent(currentAdmin.adminId)}` : ''
			const res = await fetch(`${BACKEND}/api/admin/terms/${row.trmsSn}${qs}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '약관 삭제에 실패했습니다.')
				return
			}
			clearMessageLater('약관이 삭제되었습니다.')
			if (form.trmsSn === row.trmsSn) closePopup()
			void fetchList(page, pageSize)
		} catch {
			setError('약관 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteSelectedTerms = async () => {
		const ids = Array.from(selectedIds)
		if (ids.length === 0) {
			setError('삭제할 약관을 선택해주세요.')
			return
		}
		if (!window.confirm('삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/terms/delete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					trmsSns: ids,
					deltr: currentAdmin.adminId
				})
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '선택삭제에 실패했습니다.')
				return
			}
			clearMessageLater('선택한 약관이 삭제되었습니다.')
			if (form.trmsSn != null && selectedIds.has(form.trmsSn)) closePopup()
			void fetchList(page, pageSize)
		} catch {
			setError('선택삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const changePageSize = (nextSize: number) => {
		setPageSize(nextSize)
		void fetchList(1, nextSize)
	}

	const clearSearch = () => {
		setTermsTypeFilter('')
		setCurrentYnFilter('')
		setStartRegDate('')
		setEndRegDate('')
		setSearchType('title')
		setSearchKeyword('')
		window.setTimeout(() => void fetchList(1, pageSize), 0)
	}

	const toggleSelected = (id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const allSelected = list.length > 0 && list.every((row) => row.trmsSn != null && selectedIds.has(row.trmsSn))

	const toggleSelectAll = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (allSelected) {
				list.forEach((row) => {
					if (row.trmsSn != null) next.delete(row.trmsSn)
				})
			} else {
				list.forEach((row) => {
					if (row.trmsSn != null) next.add(row.trmsSn)
				})
			}
			return next
		})
	}

	return (
		<AdminLayout title="약관 관리">
			<CrudPageCard title="약관 관리" error={popupOpen ? null : error} message={message}>
				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
						<select
							value={pageSize}
							onChange={(e) => changePageSize(Number(e.target.value))}
							className="list-page-size-select"
							aria-label="페이지당 목록 개수"
						>
							{PAGE_SIZE_OPTIONS.map((n) => (
								<option key={n} value={n}>{n}</option>
							))}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button
							type="button"
							className="admin-footer-btn-delete"
							onClick={() => void deleteSelectedTerms()}
							disabled={selectedIds.size === 0 || loading}
						>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openNewPopup} disabled={loading}>
							등록
						</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section terms-search-row">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">약관</label>
						<select
							value={termsTypeFilter}
							onChange={(e) => setTermsTypeFilter(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="">전체</option>
							{TERMS_TYPES.map((item) => (
								<option key={item.code} value={item.code}>{item.name}</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">등록일</label>
						<input type="date" value={startRegDate} onChange={(e) => setStartRegDate(e.target.value)} className="bbs-post-filter-date" />
						<span>~</span>
						<input type="date" value={endRegDate} onChange={(e) => setEndRegDate(e.target.value)} className="bbs-post-filter-date" />
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">현재약관</label>
						<select
							value={currentYnFilter}
							onChange={(e) => setCurrentYnFilter(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="">전체</option>
							<option value="Y">Y</option>
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="bbs-post-filter-select">
							<option value="title">제목</option>
							<option value="content">내용</option>
							<option value="all">전체</option>
						</select>
						<input
							type="text"
							value={searchKeyword}
							placeholder="검색어"
							onChange={(e) => setSearchKeyword(e.target.value)}
							className="bbs-post-filter-input"
							onKeyDown={(e) => {
								if (e.key === 'Enter') void fetchList(1, pageSize)
							}}
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList(1, pageSize)}>
							검색
						</button>
						<button type="button" className="admin-filter-btn-reset" onClick={clearSearch}>
							초기화
						</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th className="table-col-check">
								<input
									type="checkbox"
									checked={allSelected}
									onChange={toggleSelectAll}
									aria-label="현재 페이지 전체 선택"
								/>
							</th>
							<th style={{ width: '80px' }}>번호</th>
							<th style={{ width: '190px' }}>약관</th>
							<th>제목</th>
							<th style={{ width: '130px' }}>작성자</th>
							<th style={{ width: '120px' }}>등록일</th>
							<th style={{ width: '90px' }}>현재약관</th>
							<th style={{ width: '120px' }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row, idx) => (
							<tr key={row.trmsSn ?? idx} className="clickable" onClick={() => openEditPopup(row)}>
								<td className="table-col-check" onClick={(e) => e.stopPropagation()}>
									{row.trmsSn != null && (
										<input
											type="checkbox"
											checked={selectedIds.has(row.trmsSn)}
											onChange={() => toggleSelected(row.trmsSn!)}
											onClick={(e) => e.stopPropagation()}
											aria-label={`${row.trmsTtl} 선택`}
										/>
									)}
								</td>
								<td>{totalCount - ((page - 1) * pageSize + idx)}</td>
								<td>{row.trmsTypeNm || getTermsTypeName(row.trmsTypeCd)}</td>
								<td className="terms-list-title">
									{row.trmsTtl}
									<span>{stripHtml(row.trmsCn).slice(0, 40)}</span>
								</td>
								<td>{row.rgtrNm || row.rgtr || '-'}</td>
								<td>{row.regDt ? row.regDt.slice(0, 10) : '-'}</td>
								<td>{currentBadge(row.currentYn)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => openEditPopup(row)}
										onDelete={() => void deleteTerms(row)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr><td colSpan={8} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
						)}
					</tbody>
				</table>

				<ListPagination
					page={page}
					totalPages={totalPages}
					disabled={loading}
					onPageChange={(targetPage) => void fetchList(targetPage, pageSize)}
				/>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={editMode ? '약관 관리 (상세)' : '약관 등록'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						{editMode && (
							<button
								type="button"
								className="admin-footer-btn-delete"
								onClick={() => void deleteTerms(form)}
								disabled={loading}
								style={{ marginRight: 'auto' }}
							>
								삭제
							</button>
						)}
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveTerms()} disabled={loading}>
							저장
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup} disabled={loading}>
							목록
						</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table form-table-cols4">
					<tbody>
						<tr>
							<th>약관</th>
							<td>
								<select
									value={form.trmsTypeCd}
									onChange={(e) => setForm({
										...form,
										trmsTypeCd: e.target.value,
										trmsTypeNm: getTermsTypeName(e.target.value)
									})}
								>
									{TERMS_TYPES.map((item) => (
										<option key={item.code} value={item.code}>{item.name}</option>
									))}
								</select>
							</td>
							<th>현재약관</th>
							<td>
								{renderYnToggle(
									form.currentYn,
									(next) => setForm({ ...form, currentYn: next }),
									'Y',
									'N'
								)}
							</td>
						</tr>
						<tr>
							<th>제목</th>
							<td colSpan={3}>
								<input
									type="text"
									value={form.trmsTtl}
									onChange={(e) => setForm({ ...form, trmsTtl: e.target.value })}
									style={{ width: '100%', maxWidth: '100%' }}
								/>
							</td>
						</tr>
						{editMode && (
							<tr>
								<th>등록일</th>
								<td>{form.regDt ? form.regDt.slice(0, 10) : '-'}</td>
								<th>작성자</th>
								<td>{form.rgtrNm || form.rgtr || '-'}</td>
							</tr>
						)}
						<tr>
							<th>내용</th>
							<td colSpan={3}>
								<textarea
									className="terms-content-textarea"
									value={form.trmsCn}
									onChange={(e) => setForm({ ...form, trmsCn: e.target.value })}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

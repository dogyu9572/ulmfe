// 휴관일 등록·수정과 정기휴관 요일 설정을 관리하는 관리자 화면
import React, { useCallback, useEffect, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { ListPagination } from '../components/ListPagination'
import { RowActionButtons } from '../components/RowActionButtons'
import { checkDateRange } from '../utils/dateRangeGuard'
import { API_BASE_URL } from '../config'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type ClosedDay = {
	clsrSn: number
	clsrSeCd: string
	bgngYmd: string
	endYmd: string
	clsrResnCn: string | null
	useYn: string
	rgtrNm: string | null
	regDt: string | null
}

type ClosedDayFilters = {
	clsrSeCd: string
	searchKeyword: string
	startDate: string
	endDate: string
}

type ClosedDayForm = {
	clsrSeCd: string
	bgngYmd: string
	endYmd: string
	clsrResnCn: string
	useYn: string
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
// ISO-8601 기준 1(월) ~ 7(일). 백엔드 RGLR_CLSR_DAY_CD 와 같은 규칙을 쓴다.
const WEEK_DAYS = [
	{ code: '1', label: '월' },
	{ code: '2', label: '화' },
	{ code: '3', label: '수' },
	{ code: '4', label: '목' },
	{ code: '5', label: '금' },
	{ code: '6', label: '토' },
	{ code: '7', label: '일' }
]

const emptyFilters: ClosedDayFilters = {
	clsrSeCd: '',
	searchKeyword: '',
	startDate: '',
	endDate: ''
}

const emptyForm: ClosedDayForm = {
	clsrSeCd: 'C',
	bgngYmd: '',
	endYmd: '',
	clsrResnCn: '',
	useYn: 'Y'
}

function formatDate(value: string | null): string {
	return value ? value.slice(0, 10) : ''
}

function formatPeriod(row: ClosedDay): string {
	const begin = formatDate(row.bgngYmd)
	const end = formatDate(row.endYmd)
	return begin === end ? begin : `${begin} ~ ${end}`
}

export const ClosedDayPage: React.FC = () => {
	const [list, setList] = useState<ClosedDay[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)

	// filters 는 입력 중인 값, appliedFilters 는 검색 버튼을 눌러 실제 조회에 반영한 값이다.
	// 둘을 나눠야 검색어를 타이핑할 때마다 목록을 다시 부르지 않는다.
	const [filters, setFilters] = useState<ClosedDayFilters>(emptyFilters)
	const [appliedFilters, setAppliedFilters] = useState<ClosedDayFilters>(emptyFilters)

	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

	const [regularDays, setRegularDays] = useState<string[]>([])
	const [regularSaving, setRegularSaving] = useState(false)

	const [popupOpen, setPopupOpen] = useState(false)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [form, setForm] = useState<ClosedDayForm>(emptyForm)

	const loadList = useCallback(async () => {
		const rangeWarning = checkDateRange(filters.startDate, filters.endDate, '기간')
		if (rangeWarning) {
			setError(rangeWarning)
			return
		}
		setLoading(true)
		setError(null)
		try {
			const params = new URLSearchParams({ page: String(page), size: String(pageSize) })
			Object.entries(appliedFilters).forEach(([key, value]) => {
				if (value) params.set(key, value)
			})
			const res = await fetch(`${BACKEND}/api/admin/closed-day/list?${params.toString()}`, { credentials: 'include' })
			const json: ApiResponse<PagedListData<ClosedDay>> = await res.json()
			if (!json.success) {
				setError(json.message || '휴관일 목록을 불러오지 못했습니다.')
				return
			}
			setList(json.data.list || [])
			setTotalCount(json.data.totalCount || 0)
			setTotalPages(json.data.totalPages || 1)
			setSelectedIds(new Set())
		} catch {
			setError('휴관일 목록을 불러오는 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}, [appliedFilters, page, pageSize])

	const loadRegularDays = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/closed-day/regular-day`, { credentials: 'include' })
			const json: ApiResponse<string> = await res.json()
			if (json.success) {
				setRegularDays((json.data || '').split(',').map((v) => v.trim()).filter((v) => v !== ''))
			}
		} catch {
			setError('정기휴관 요일을 불러오는 중 오류가 발생했습니다.')
		}
	}, [])

	useEffect(() => {
		loadList()
	}, [loadList])

	useEffect(() => {
		loadRegularDays()
	}, [loadRegularDays])

	const handleSearch = () => {
		setAppliedFilters(filters)
		setPage(1)
	}

	const clearSearch = () => {
		setFilters(emptyFilters)
		setAppliedFilters(emptyFilters)
		setPage(1)
	}

	const toggleRegularDay = (code: string) => {
		setRegularDays((prev) => (prev.includes(code) ? prev.filter((v) => v !== code) : [...prev, code]))
	}

	const saveRegularDays = async () => {
		setRegularSaving(true)
		setError(null)
		setMessage(null)
		try {
			const sorted = [...regularDays].sort((a, b) => Number(a) - Number(b))
			const res = await fetch(`${BACKEND}/api/admin/closed-day/regular-day`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ rglrClsrDayCd: sorted.join(',') })
			})
			const json: ApiResponse<string> = await res.json()
			if (!json.success) {
				setError(json.message || '정기휴관 요일을 저장하지 못했습니다.')
				return
			}
			setRegularDays((json.data || '').split(',').map((v) => v.trim()).filter((v) => v !== ''))
			setMessage('정기휴관 요일을 저장했습니다.')
		} catch {
			setError('정기휴관 요일을 저장하는 중 오류가 발생했습니다.')
		} finally {
			setRegularSaving(false)
		}
	}

	const openNewPopup = () => {
		setEditingId(null)
		setForm(emptyForm)
		setError(null)
		setPopupOpen(true)
	}

	const openEditPopup = (row: ClosedDay) => {
		setEditingId(row.clsrSn)
		setForm({
			clsrSeCd: row.clsrSeCd || 'C',
			bgngYmd: formatDate(row.bgngYmd),
			endYmd: formatDate(row.endYmd),
			clsrResnCn: row.clsrResnCn || '',
			useYn: row.useYn || 'Y'
		})
		setError(null)
		setPopupOpen(true)
	}

	const closePopup = () => {
		setPopupOpen(false)
		setEditingId(null)
	}

	const handleSubmit = async () => {
		if (!form.bgngYmd) {
			setError('시작일자를 입력해 주세요.')
			return
		}
		// 거꾸로 입력해도 서버가 말없이 순서를 바꿔 저장해, 의도와 다른 값이 들어간다.
		const formRangeWarning = checkDateRange(form.bgngYmd, form.endYmd, '휴관 기간')
		if (formRangeWarning) {
			setError(formRangeWarning)
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const payload = {
				clsrSeCd: form.clsrSeCd,
				bgngYmd: form.bgngYmd,
				endYmd: form.endYmd || form.bgngYmd,
				clsrResnCn: form.clsrResnCn.trim(),
				useYn: form.useYn
			}
			const isEdit = editingId != null
			const res = await fetch(
				isEdit ? `${BACKEND}/api/admin/closed-day/${editingId}` : `${BACKEND}/api/admin/closed-day`,
				{
					method: isEdit ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify(payload)
				}
			)
			const json: ApiResponse<ClosedDay> = await res.json()
			if (!json.success) {
				setError(json.message || '휴관일을 저장하지 못했습니다.')
				return
			}
			setMessage(isEdit ? '휴관일을 수정했습니다.' : '휴관일을 등록했습니다.')
			closePopup()
			loadList()
		} catch {
			setError('휴관일을 저장하는 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteRow = async (row: ClosedDay) => {
		if (!window.confirm(`${formatPeriod(row)} 휴관일을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/closed-day/${row.clsrSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const json: ApiResponse<null> = await res.json()
			if (!json.success) {
				setError(json.message || '휴관일을 삭제하지 못했습니다.')
				return
			}
			setMessage('휴관일을 삭제했습니다.')
			loadList()
		} catch {
			setError('휴관일을 삭제하는 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleBulkDelete = async () => {
		if (selectedIds.size === 0) return
		if (!window.confirm(`선택한 ${selectedIds.size}건을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/closed-day/delete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ clsrSnList: Array.from(selectedIds) })
			})
			const json: ApiResponse<number> = await res.json()
			if (!json.success) {
				setError(json.message || '선택 삭제에 실패했습니다.')
				return
			}
			setMessage(`${json.data}건을 삭제했습니다.`)
			loadList()
		} catch {
			setError('선택 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const toggleSelect = (clsrSn: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(clsrSn)) next.delete(clsrSn)
			else next.add(clsrSn)
			return next
		})
	}

	const allSelected = list.length > 0 && list.every((row) => selectedIds.has(row.clsrSn))

	const toggleSelectAll = () => {
		setSelectedIds(allSelected ? new Set() : new Set(list.map((row) => row.clsrSn)))
	}

	return (
		<AdminLayout title="휴관일 관리">
			<CrudPageCard title="휴관일 관리" error={error} message={message}>
				<div className="search-section" style={{ marginBottom: 16 }}>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">정기휴관 요일</label>
						{WEEK_DAYS.map((day) => (
							<label key={day.code} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
								<input
									type="checkbox"
									checked={regularDays.includes(day.code)}
									onChange={() => toggleRegularDay(day.code)}
								/>
								{day.label}
							</label>
						))}
						<button
							type="button"
							className="admin-list-btn-sky"
							onClick={saveRegularDays}
							disabled={regularSaving}
						>
							설정 저장
						</button>
					</div>
					<p className="form-help" style={{ margin: '4px 0 0' }}>
						선택한 요일은 매주 자동으로 휴관 처리되며, 메인 화면 안내 문구도 이 설정을 따릅니다.
					</p>
				</div>

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
							{PAGE_SIZE_OPTIONS.map((n) => (
								<option key={n} value={n}>{n}</option>
							))}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button
							type="button"
							className="admin-footer-btn-delete"
							disabled={selectedIds.size === 0 || loading}
							onClick={handleBulkDelete}
						>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openNewPopup}>신규</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">구분</label>
						<select
							value={filters.clsrSeCd}
							onChange={(e) => setFilters({ ...filters, clsrSeCd: e.target.value })}
							className="bbs-post-filter-select"
						>
							<option value="">전체</option>
							<option value="C">휴관</option>
							<option value="O">임시개관</option>
						</select>
						<input
							type="text"
							value={filters.searchKeyword}
							onChange={(e) => setFilters({ ...filters, searchKeyword: e.target.value })}
							placeholder="사유 검색어"
							className="bbs-post-filter-input"
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						/>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">기간</label>
						<input
							type="date"
							value={filters.startDate}
							onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
							className="bbs-post-filter-date"
						/>
						<span className="bbs-post-filter-sep">~</span>
						<input
							type="date"
							value={filters.endDate}
							onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
							className="bbs-post-filter-date"
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={handleSearch}>검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={clearSearch}>초기화</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 40 }}>
								<input
									type="checkbox"
									checked={allSelected}
									onChange={toggleSelectAll}
									aria-label="전체 선택"
								/>
							</th>
							<th style={{ width: 90 }}>구분</th>
							<th>기간</th>
							<th>사유</th>
							<th style={{ width: 90 }}>사용여부</th>
							<th style={{ width: 110 }}>등록일</th>
							<th style={{ width: 140 }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.length === 0 ? (
							<tr>
								<td colSpan={7}>{loading ? '불러오는 중입니다.' : '등록된 휴관일이 없습니다.'}</td>
							</tr>
						) : (
							list.map((row) => (
								<tr key={row.clsrSn} className="clickable" onClick={() => openEditPopup(row)}>
									<td onClick={(e) => e.stopPropagation()}>
										<input
											type="checkbox"
											checked={selectedIds.has(row.clsrSn)}
											onChange={() => toggleSelect(row.clsrSn)}
											aria-label={`${formatPeriod(row)} 선택`}
										/>
									</td>
									<td>{row.clsrSeCd === 'O' ? '임시개관' : '휴관'}</td>
									<td>{formatPeriod(row)}</td>
									<td>{row.clsrResnCn || '-'}</td>
									<td>{row.useYn === 'Y' ? '사용' : '미사용'}</td>
									<td>{formatDate(row.regDt)}</td>
									<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
										<RowActionButtons
											onEdit={() => openEditPopup(row)}
											onDelete={() => handleDeleteRow(row)}
											disabled={loading}
										/>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>

				<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={setPage} />
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={editingId == null ? '휴관일 등록' : '휴관일 상세 (수정)'}
				onClose={closePopup}
				footer={
					<>
						<button type="button" className="admin-list-btn-sky" onClick={handleSubmit} disabled={loading}>
							{editingId == null ? '등록' : '수정'}
						</button>
						<button type="button" className="form-actions-btn-secondary" onClick={closePopup}>닫기</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table">
					<tbody>
						<tr>
							<th>구분</th>
							<td>
								<select value={form.clsrSeCd} onChange={(e) => setForm({ ...form, clsrSeCd: e.target.value })}>
									<option value="C">휴관</option>
									<option value="O">임시개관</option>
								</select>
								<p className="form-help" style={{ margin: '4px 0 0' }}>
									임시개관은 정기휴관 요일이라도 문을 여는 날에 사용합니다.
								</p>
							</td>
						</tr>
						<tr>
							<th>시작일자</th>
							<td>
								<input
									type="date"
									value={form.bgngYmd}
									onChange={(e) => setForm({ ...form, bgngYmd: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>종료일자</th>
							<td>
								<input
									type="date"
									value={form.endYmd}
									onChange={(e) => setForm({ ...form, endYmd: e.target.value })}
								/>
								<p className="form-help" style={{ margin: '4px 0 0' }}>
									하루만 해당하면 비워 두어도 시작일자와 같게 저장됩니다.
								</p>
							</td>
						</tr>
						<tr>
							<th>사유</th>
							<td>
								<input
									type="text"
									value={form.clsrResnCn}
									maxLength={200}
									placeholder="예: 시설점검"
									onChange={(e) => setForm({ ...form, clsrResnCn: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>사용여부</th>
							<td>
								<select value={form.useYn} onChange={(e) => setForm({ ...form, useYn: e.target.value })}>
									<option value="Y">사용</option>
									<option value="N">미사용</option>
								</select>
							</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

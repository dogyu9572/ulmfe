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

type SessionInfo = {
	adminId: string
	adminName: string
}

type AccessEnvironmentSetting = {
	stngId?: string
	sessionTimeoutMin: number
}

type AllowedIp = {
	prmIpSn: number | null
	prmIpAddr: string
	ipExpln: string
	regDt?: string
	rgtr?: string
	mdfcnDt?: string
	mdtr?: string
}

const BACKEND = API_BASE_URL
const SESSION_TIMEOUT_OPTIONS = [
	{ value: 30, label: '30분' },
	{ value: 60, label: '1시간' },
	{ value: 120, label: '2시간' },
	{ value: 180, label: '3시간' },
	{ value: 240, label: '4시간' }
]

const defaultForm: AllowedIp = {
	prmIpSn: null,
	prmIpAddr: '',
	ipExpln: ''
}

function formatDate(value?: string): string {
	return value ? value.slice(0, 10) : '-'
}

function isValidIpv4(ip: string): boolean {
	const parts = ip.trim().split('.')
	return parts.length === 4 && parts.every((part) => {
		if (!/^\d+$/.test(part)) return false
		const n = Number(part)
		return n >= 0 && n <= 255 && String(n) === part
	})
}

export const AccessEnvironmentPage: React.FC = () => {
	const [setting, setSetting] = useState<AccessEnvironmentSetting>({ sessionTimeoutMin: 30 })
	const [list, setList] = useState<AllowedIp[]>([])
	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const [searchIp, setSearchIp] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [form, setForm] = useState<AllowedIp>(defaultForm)
	const [currentAdmin, setCurrentAdmin] = useState<SessionInfo>({ adminId: '', adminName: '' })
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const pageSize = DEFAULT_LIST_PAGE_SIZE

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])
	const allPageSelected = list.length > 0 && list.every((row) => row.prmIpSn != null && selectedIds.has(row.prmIpSn))

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
			// session fetch failure is handled by the global auth flow
		}
	}, [])

	const fetchSetting = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/access-env/setting`, { credentials: 'include' })
			const result: ApiResponse<AccessEnvironmentSetting> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '접속 환경설정 조회에 실패했습니다.')
				return
			}
			setSetting({
				...result.data,
				sessionTimeoutMin: result.data.sessionTimeoutMin || 30
			})
		} catch {
			setError('접속 환경설정 조회 중 오류가 발생했습니다.')
		}
	}, [])

	const buildSearchParams = useCallback((targetPage: number) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(pageSize))
		if (searchIp.trim()) qs.set('prmIpAddr', searchIp.trim())
		if (startDate) qs.set('startDate', startDate)
		if (endDate) qs.set('endDate', endDate)
		return qs.toString()
	}, [pageSize, searchIp, startDate, endDate])

	const fetchList = useCallback(async (targetPage = page) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage)
			const res = await fetch(`${BACKEND}/api/admin/access-env/allowed-ips?${qs}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<AllowedIp>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '접속 IP 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setSelectedIds(new Set())
		} catch {
			setError('접속 IP 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page])

	useEffect(() => {
		void fetchSession()
		void fetchSetting()
		void fetchList(1)
	}, [])

	const saveSetting = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/access-env/setting`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					sessionTimeoutMin: setting.sessionTimeoutMin,
					rgtr: currentAdmin.adminId,
					mdtr: currentAdmin.adminId
				})
			})
			const result: ApiResponse<AccessEnvironmentSetting> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '접속시간 설정 저장에 실패했습니다.')
				return
			}
			setSetting(result.data)
			clearMessageLater('접속시간 설정이 저장되었습니다.')
		} catch {
			setError('접속시간 설정 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const openCreatePopup = () => {
		setPopupMode('new')
		setForm({
			...defaultForm,
			rgtr: currentAdmin.adminId,
			mdtr: currentAdmin.adminId
		})
		setPopupOpen(true)
	}

	const openEditPopup = (row: AllowedIp) => {
		setPopupMode('edit')
		setForm({
			...row,
			mdtr: currentAdmin.adminId
		})
		setPopupOpen(true)
	}

	const saveAllowedIp = async () => {
		const prmIpAddr = form.prmIpAddr.trim()
		if (!isValidIpv4(prmIpAddr)) {
			setError('접속 IP 형식이 올바르지 않습니다.')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const isEdit = popupMode === 'edit' && form.prmIpSn != null
			const url = isEdit
				? `${BACKEND}/api/admin/access-env/allowed-ips/${form.prmIpSn}`
				: `${BACKEND}/api/admin/access-env/allowed-ips`
			const res = await fetch(url, {
				method: isEdit ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					...form,
					prmIpAddr,
					rgtr: currentAdmin.adminId,
					mdtr: currentAdmin.adminId
				})
			})
			const result: ApiResponse<AllowedIp> = await res.json()
			if (!result.success) {
				setError(result.message || '접속 IP 저장에 실패했습니다.')
				return
			}
			setPopupOpen(false)
			clearMessageLater(isEdit ? '접속 IP가 수정되었습니다.' : '접속 IP가 등록되었습니다.')
			void fetchList(isEdit ? page : 1)
		} catch {
			setError('접속 IP 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteAllowedIp = async (row: AllowedIp) => {
		if (row.prmIpSn == null) return
		if (!window.confirm('삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/access-env/allowed-ips/${row.prmIpSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '접속 IP 삭제에 실패했습니다.')
				return
			}
			clearMessageLater('접속 IP가 삭제되었습니다.')
			void fetchList(page)
		} catch {
			setError('접속 IP 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteSelected = async () => {
		const ids = Array.from(selectedIds)
		if (ids.length === 0) {
			setError('삭제할 IP를 선택해주세요.')
			return
		}
		if (!window.confirm('삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/access-env/allowed-ips/delete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ prmIpSns: ids })
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '선택삭제에 실패했습니다.')
				return
			}
			clearMessageLater('선택한 접속 IP가 삭제되었습니다.')
			void fetchList(page)
		} catch {
			setError('선택삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const toggleSelected = (id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const toggleAllPage = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (allPageSelected) {
				list.forEach((row) => {
					if (row.prmIpSn != null) next.delete(row.prmIpSn)
				})
			} else {
				list.forEach((row) => {
					if (row.prmIpSn != null) next.add(row.prmIpSn)
				})
			}
			return next
		})
	}

	const resetSearch = () => {
		setSearchIp('')
		setStartDate('')
		setEndDate('')
		window.setTimeout(() => void fetchList(1), 0)
	}

	return (
		<AdminLayout title="접속 환경설정">
			<CrudPageCard title="접속 환경설정" error={error} message={message}>
				<table className="form-table access-env-setting-table">
					<tbody>
						<tr>
							<th>접속시간 설정</th>
							<td>
								<div className="access-env-session-row">
									<select
										value={setting.sessionTimeoutMin}
										onChange={(e) => setSetting((prev) => ({
											...prev,
											sessionTimeoutMin: Number(e.target.value)
										}))}
									>
										{SESSION_TIMEOUT_OPTIONS.map((opt) => (
											<option key={opt.value} value={opt.value}>{opt.label}</option>
										))}
									</select>
									<button
										type="button"
										className="admin-list-btn-sky"
										onClick={() => void saveSetting()}
										disabled={loading}
									>
										저장
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<div className="code-filters search-section access-env-search">
					<label>
						IP
						<input
							type="text"
							value={searchIp}
							placeholder="검색어"
							onChange={(e) => setSearchIp(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') void fetchList(1)
							}}
						/>
					</label>
					<label>
						등록일
						<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
					</label>
					<span>~</span>
					<label>
						<span className="sr-only">등록 종료일</span>
						<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
					</label>
					<div className="access-env-search-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList(1)}>검색</button>
						<button type="button" onClick={resetSearch}>초기화</button>
					</div>
				</div>

				<div className="list-toolbar">
					<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
					<div className="list-toolbar-actions">
						<button
							type="button"
							className="admin-footer-btn-delete"
							onClick={() => void deleteSelected()}
							disabled={loading || selectedIds.size === 0}
						>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openCreatePopup}>
							등록
						</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: '48px' }}>
								<input
									type="checkbox"
									checked={allPageSelected}
									onChange={toggleAllPage}
									aria-label="현재 페이지 전체 선택"
								/>
							</th>
							<th style={{ width: '80px' }}>번호</th>
							<th style={{ width: '180px' }}>접속 IP</th>
							<th>IP 설명</th>
							<th style={{ width: '150px' }}>작성자</th>
							<th style={{ width: '140px' }}>등록일</th>
							<th style={{ width: '150px' }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row, idx) => {
							const id = row.prmIpSn ?? 0
							const displayNo = totalCount - ((page - 1) * pageSize + idx)
							return (
								<tr key={id}>
									<td>
										<input
											type="checkbox"
											checked={selectedIds.has(id)}
											onChange={() => toggleSelected(id)}
											aria-label={`${row.prmIpAddr} 선택`}
										/>
									</td>
									<td>{displayNo}</td>
									<td>{row.prmIpAddr}</td>
									<td>{row.ipExpln || '-'}</td>
									<td>{row.rgtr || '-'}</td>
									<td>{formatDate(row.regDt)}</td>
									<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
										<RowActionButtons
											onEdit={() => openEditPopup(row)}
											onDelete={() => void deleteAllowedIp(row)}
											disabled={loading}
										/>
									</td>
								</tr>
							)
						})}
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
					onPageChange={(targetPage) => void fetchList(targetPage)}
				/>

				<LayerPopup
					open={popupOpen}
					title={popupMode === 'new' ? '접속 IP 관리 등록' : '접속 IP 관리 수정'}
					onClose={() => setPopupOpen(false)}
					wide
					footer={(
						<>
							<button type="button" className="admin-list-btn-sky" onClick={() => void saveAllowedIp()} disabled={loading}>
								저장
							</button>
							<button type="button" className="admin-footer-btn-close" onClick={() => setPopupOpen(false)}>
								목록
							</button>
						</>
					)}
				>
					<table className="form-table">
						<tbody>
							<tr>
								<th>접속 IP</th>
								<td>
									<input
										type="text"
										value={form.prmIpAddr}
										placeholder="예: 111.111.111.11"
										onChange={(e) => setForm((prev) => ({ ...prev, prmIpAddr: e.target.value }))}
									/>
								</td>
							</tr>
							<tr>
								<th>IP 설명</th>
								<td>
									<input
										type="text"
										value={form.ipExpln}
										onChange={(e) => setForm((prev) => ({ ...prev, ipExpln: e.target.value }))}
									/>
								</td>
							</tr>
							<tr>
								<th>작성자</th>
								<td>{currentAdmin.adminName || currentAdmin.adminId || '-'}</td>
							</tr>
							<tr>
								<th>등록일</th>
								<td>{popupMode === 'edit' ? formatDate(form.regDt) : '-'}</td>
							</tr>
						</tbody>
					</table>
				</LayerPopup>
			</CrudPageCard>
		</AdminLayout>
	)
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { type PagedListData } from '../utils/listPaginationConstants'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { ListPagination } from '../components/ListPagination'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL, resolveBackendUrl } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type SessionInfo = {
	adminId: string
	adminName: string
}

type UploadInfo = {
	fileUrl?: string
	fileOriginName?: string
}

type HomepageHistory = {
	hstrySn: number | null
	hstryYr: string
	hstryMm: string
	hstryCn: string
	imgFileId: string
	useYn: string
	regDt?: string
	rgtr?: string
	mdfcnDt?: string
	mdtr?: string
}

const BACKEND = API_BASE_URL
const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const defaultForm = (): HomepageHistory => {
	const now = new Date()
	return {
		hstrySn: null,
		hstryYr: String(now.getFullYear()),
		hstryMm: String(now.getMonth() + 1).padStart(2, '0'),
		hstryCn: '',
		imgFileId: '',
		useYn: 'Y'
	}
}

function useYnBadge(useYn: string) {
	const isOn = useYn === 'Y'
	return (
		<span className={`bbs-master-list-badge ${isOn ? 'is-on use' : ''}`}>
			{isOn ? '사용' : '미사용'}
		</span>
	)
}

export const HomepageHistoryPage: React.FC = () => {
	const [form, setForm] = useState<HomepageHistory>(defaultForm)
	const [list, setList] = useState<HomepageHistory[]>([])
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const [searchKeyword, setSearchKeyword] = useState('')
	const [useYnFilter, setUseYnFilter] = useState('')
	const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
	const [currentAdmin, setCurrentAdmin] = useState<SessionInfo>({ adminId: '', adminName: '' })
	const [listImageMap, setListImageMap] = useState<Record<string, string>>({})
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState('')
	const [imageName, setImageName] = useState('')
	const [clearImage, setClearImage] = useState(false)
	const [loading, setLoading] = useState(false)
	const [popupOpen, setPopupOpen] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const imageInputRef = useRef<HTMLInputElement>(null)
	const objectUrlRef = useRef<string | null>(null)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])
	const editMode = form.hstrySn != null

	const clearMessageLater = (text: string) => {
		setMessage(text)
		window.setTimeout(() => setMessage(null), 3000)
	}

	const revokeObjectUrl = () => {
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current)
			objectUrlRef.current = null
		}
	}

	const resetForm = () => {
		revokeObjectUrl()
		setForm(defaultForm())
		setImageFile(null)
		setImagePreview('')
		setImageName('')
		setClearImage(false)
		if (imageInputRef.current) imageInputRef.current.value = ''
	}

	const openNewPopup = () => {
		resetForm()
		setError(null)
		setPopupOpen(true)
	}

	const closePopup = () => {
		setPopupOpen(false)
		setError(null)
		resetForm()
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

	const loadImageInfo = useCallback(async (fiId: string) => {
		if (!fiId) {
			setImagePreview('')
			setImageName('')
			return
		}
		try {
			const res = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, { credentials: 'include' })
			const result: ApiResponse<UploadInfo> = await res.json()
			if (result.success && result.data) {
				setImagePreview(resolveBackendUrl(result.data.fileUrl || ''))
				setImageName(result.data.fileOriginName || '')
			}
		} catch {
			// preview is optional
		}
	}, [])

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		if (useYnFilter) qs.set('useYn', useYnFilter)
		return qs.toString()
	}, [pageSize, searchKeyword, useYnFilter])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage, targetSize)
			const res = await fetch(`${BACKEND}/api/admin/history?${qs}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<HomepageHistory>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '연혁 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('연혁 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	useEffect(() => {
		void fetchSession()
		void fetchList(1, DEFAULT_PAGE_SIZE)
		return () => revokeObjectUrl()
	}, [])

	useEffect(() => {
		const ids = [...new Set(list.map((row) => (row.imgFileId || '').trim()).filter(Boolean))]
		if (ids.length === 0) {
			setListImageMap({})
			return
		}
		let cancelled = false
		void (async () => {
			const entries = await Promise.all(
				ids.map(async (fiId) => {
					try {
						const res = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, {
							credentials: 'include'
						})
						const result: ApiResponse<UploadInfo> = await res.json()
						return [fiId, result.success ? resolveBackendUrl(result.data?.fileUrl || '') : ''] as const
					} catch {
						return [fiId, ''] as const
					}
				})
			)
			if (cancelled) return
			const nextMap: Record<string, string> = {}
			for (const [fiId, fileUrl] of entries) {
				if (fileUrl) nextMap[fiId] = fileUrl
			}
			setListImageMap(nextMap)
		})()
		return () => {
			cancelled = true
		}
	}, [list])

	const uploadImage = async (): Promise<string> => {
		if (clearImage && !imageFile) {
			return ''
		}
		if (!imageFile) {
			return form.imgFileId || ''
		}
		const fd = new FormData()
		fd.append('file', imageFile)
		fd.append('menuType', 'history')
		if (form.imgFileId && !clearImage) {
			fd.append('fiId', form.imgFileId)
		}
		const res = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
			method: 'POST',
			credentials: 'include',
			body: fd
		})
		const result: ApiResponse<{ fiId?: string; fileUrl?: string; fileOriginName?: string }> = await res.json()
		if (!result.success || !result.data?.fiId) {
			throw new Error(result.message || '이미지 업로드에 실패했습니다.')
		}
		return result.data.fiId
	}

	const saveHistory = async () => {
		if (!form.hstryYr.trim() || !form.hstryMm.trim() || !form.hstryCn.trim()) {
			setError('연, 월, 내용을 입력해주세요.')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const imgFileId = await uploadImage()
			const body: HomepageHistory = {
				...form,
				hstryYr: form.hstryYr.trim(),
				hstryMm: form.hstryMm.trim().padStart(2, '0'),
				hstryCn: form.hstryCn.trim(),
				imgFileId,
				rgtr: currentAdmin.adminId,
				mdtr: currentAdmin.adminId
			}
			const url = editMode
				? `${BACKEND}/api/admin/history/${form.hstrySn}`
				: `${BACKEND}/api/admin/history`
			const res = await fetch(url, {
				method: editMode ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body)
			})
			const result: ApiResponse<HomepageHistory> = await res.json()
			if (!result.success) {
				setError(result.message || '연혁 저장에 실패했습니다.')
				return
			}
			clearMessageLater(editMode ? '연혁이 수정되었습니다.' : '연혁이 등록되었습니다.')
			setPopupOpen(false)
			resetForm()
			void fetchList(editMode ? page : 1, pageSize)
		} catch (err) {
			setError(err instanceof Error ? err.message : '연혁 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const editHistory = (row: HomepageHistory) => {
		revokeObjectUrl()
		setForm({ ...row })
		setImageFile(null)
		setClearImage(false)
		if (imageInputRef.current) imageInputRef.current.value = ''
		void loadImageInfo(row.imgFileId)
		setError(null)
		setPopupOpen(true)
	}

	const deleteHistory = async (row: HomepageHistory) => {
		if (row.hstrySn == null) return
		if (!window.confirm('삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const qs = currentAdmin.adminId ? `?deltr=${encodeURIComponent(currentAdmin.adminId)}` : ''
			const res = await fetch(`${BACKEND}/api/admin/history/${row.hstrySn}${qs}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '연혁 삭제에 실패했습니다.')
				return
			}
			clearMessageLater('연혁이 삭제되었습니다.')
			if (form.hstrySn === row.hstrySn) {
				setPopupOpen(false)
				resetForm()
			}
			void fetchList(page, pageSize)
		} catch {
			setError('연혁 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteSelectedHistories = async () => {
		const ids = Array.from(selectedIds)
		if (ids.length === 0) {
			setError('삭제할 연혁을 선택해주세요.')
			return
		}
		if (!window.confirm('삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/history/delete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					hstrySns: ids,
					deltr: currentAdmin.adminId
				})
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '선택삭제에 실패했습니다.')
				return
			}
			clearMessageLater('선택한 연혁이 삭제되었습니다.')
			if (form.hstrySn != null && selectedIds.has(form.hstrySn)) {
				setPopupOpen(false)
				resetForm()
			}
			void fetchList(page, pageSize)
		} catch {
			setError('선택삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const onImageChange = (file: File | null) => {
		revokeObjectUrl()
		setImageFile(file)
		if (!file) return
		const url = URL.createObjectURL(file)
		objectUrlRef.current = url
		setImagePreview(url)
		setImageName(file.name)
		setClearImage(false)
	}

	const removeImage = () => {
		revokeObjectUrl()
		setImageFile(null)
		setImagePreview('')
		setImageName('')
		setClearImage(true)
		if (imageInputRef.current) imageInputRef.current.value = ''
	}

	const changePageSize = (nextSize: number) => {
		setPageSize(nextSize)
		void fetchList(1, nextSize)
	}

	const toggleSelected = (id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const allSelected = list.length > 0 && list.every((row) => row.hstrySn != null && selectedIds.has(row.hstrySn))

	const toggleSelectAll = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (allSelected) {
				list.forEach((row) => {
					if (row.hstrySn != null) next.delete(row.hstrySn)
				})
			} else {
				list.forEach((row) => {
					if (row.hstrySn != null) next.add(row.hstrySn)
				})
			}
			return next
		})
	}

	const clearSearch = () => {
		setSearchKeyword('')
		setUseYnFilter('')
		window.setTimeout(() => void fetchList(1, pageSize), 0)
	}

	return (
		<AdminLayout title="연혁 관리">
			<CrudPageCard title="연혁 관리" error={popupOpen ? null : error} message={message}>
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
							onClick={() => void deleteSelectedHistories()}
							disabled={selectedIds.size === 0 || loading}
						>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openNewPopup} disabled={loading}>
							신규
						</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section history-search-row">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<input
							type="text"
							value={searchKeyword}
							placeholder="내용"
							onChange={(e) => setSearchKeyword(e.target.value)}
							className="bbs-post-filter-input"
							onKeyDown={(e) => {
								if (e.key === 'Enter') void fetchList(1, pageSize)
							}}
						/>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">노출여부</label>
						<select
							value={useYnFilter}
							onChange={(e) => setUseYnFilter(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="">전체</option>
							<option value="Y">Y</option>
							<option value="N">N</option>
						</select>
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
							<th style={{ width: '100px' }}>연</th>
							<th style={{ width: '80px' }}>월</th>
							<th>내용</th>
							<th style={{ width: '110px' }}>이미지</th>
							<th style={{ width: '110px' }}>노출여부</th>
							<th style={{ width: '150px' }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row, idx) => (
							<tr key={row.hstrySn ?? idx} className="clickable" onClick={() => editHistory(row)}>
								<td className="table-col-check" onClick={(e) => e.stopPropagation()}>
									{row.hstrySn != null && (
										<input
											type="checkbox"
											checked={selectedIds.has(row.hstrySn)}
											onChange={() => toggleSelected(row.hstrySn!)}
											onClick={(e) => e.stopPropagation()}
											aria-label={`${row.hstryYr}.${row.hstryMm} 연혁 선택`}
										/>
									)}
								</td>
								<td>{totalCount - ((page - 1) * pageSize + idx)}</td>
								<td>{row.hstryYr}</td>
								<td>{row.hstryMm}</td>
								<td className="history-list-content">{row.hstryCn}</td>
								<td>
									{row.imgFileId ? (
										listImageMap[row.imgFileId] ? (
											<img src={listImageMap[row.imgFileId]} alt="" className="bbs-post-basic-thum" />
										) : (
											<span className="bbs-post-basic-thum-empty" aria-hidden>THUMB</span>
										)
									) : '-'}
								</td>
								<td>{useYnBadge(row.useYn)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => editHistory(row)}
										onDelete={() => void deleteHistory(row)}
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
				title={editMode ? '연혁 상세 (수정)' : '연혁 등록'}
				onClose={closePopup}
				wide
				footer={
					<>
						{editMode && (
							<button
								type="button"
								className="admin-footer-btn-delete"
								onClick={() => void deleteHistory(form)}
								disabled={loading}
								style={{ marginRight: 'auto' }}
							>
								삭제
							</button>
						)}
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveHistory()} disabled={loading}>
							{editMode ? '수정' : '등록'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup} disabled={loading}>
							닫기
						</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table form-table-cols4">
					<tbody>
						{editMode && (
							<tr>
								<th>번호</th>
								<td colSpan={3}>
									<input type="text" value={form.hstrySn ?? ''} readOnly />
								</td>
							</tr>
						)}
						<tr>
							<th>연</th>
							<td>
								<input
									type="number"
									value={form.hstryYr}
									onChange={(e) => setForm({ ...form, hstryYr: e.target.value })}
								/>
							</td>
							<th>월</th>
							<td>
								<select value={form.hstryMm} onChange={(e) => setForm({ ...form, hstryMm: e.target.value })}>
									{Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((month) => (
										<option key={month} value={month}>{month}</option>
									))}
								</select>
							</td>
						</tr>
						<tr>
							<th>내용</th>
							<td colSpan={3}>
								<textarea
									className="history-content-textarea"
									value={form.hstryCn}
									onChange={(e) => setForm({ ...form, hstryCn: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>이미지 첨부</th>
							<td colSpan={3}>
								<div className="history-file-row">
									<input
										ref={imageInputRef}
										type="file"
										accept="image/png,image/jpeg"
										style={{ display: 'none' }}
										onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
									/>
									<button type="button" className="popup-file-btn" onClick={() => imageInputRef.current?.click()}>
										파일 선택
									</button>
									{(imagePreview || imageName) && (
										<button type="button" className="popup-file-btn-secondary" onClick={removeImage}>
											제거
										</button>
									)}
									{imagePreview && <img src={imagePreview} alt="" className="history-image-preview" />}
									{imageName && <span className="popup-img-path">{imageName}</span>}
								</div>
							</td>
						</tr>
						<tr>
							<th>노출여부</th>
							<td colSpan={3}>
								<select value={form.useYn} onChange={(e) => setForm({ ...form, useYn: e.target.value })}>
									<option value="Y">Y</option>
									<option value="N">N</option>
								</select>
							</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

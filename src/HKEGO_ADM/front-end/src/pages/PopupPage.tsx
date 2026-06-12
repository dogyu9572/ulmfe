import React, { useCallback, useEffect, useRef, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'
import { ListPagination } from '../components/ListPagination'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL, resolveBackendUrl } from '../config'
import { summernoteOnEnterKeydown } from '../utils/summernoteCallbacks'

const SUMMERNOTE_ID = 'popup-content'

/** Summernote/jQuery (CDN) */
type JqLike = (sel: string | HTMLElement) => { length: number; summernote: (a: string | object, b?: string, c?: string) => unknown }

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type PopupDto = {
	popupSn: number | null
	popupNm: string
	popupCn: string
	popPosx: number | null
	popPosy: number | null
	popWidth: number | null
	popHeight: number | null
	pstgBgngYmd: string
	pstgEndYmd: string
	useYn: string
	popImg: string
	popupUrlAddr: string
	lnkgSeCd: string
	regDt?: string
	mdfcnDt?: string
}

const BACKEND = API_BASE_URL

const defaultForm: PopupDto = {
	popupSn: null,
	popupNm: '',
	popupCn: '',
	popPosx: null,
	popPosy: null,
	popWidth: null,
	popHeight: null,
	pstgBgngYmd: '',
	pstgEndYmd: '',
	useYn: 'N',
	popImg: '',
	popupUrlAddr: '',
	lnkgSeCd: 'P'
}

function formatDate(d: string | null | undefined): string {
	if (!d) return '-'
	return d.slice(0, 10)
}

function numOrNull(v: number | string | null | undefined): number | null {
	if (v === null || v === undefined || v === '') return null
	const n = typeof v === 'number' ? v : parseInt(String(v), 10)
	return isNaN(n) ? null : n
}

const useYnBadge = (useYn: string) => {
	const isOn = useYn === 'Y'
	return (
		<span className={`bbs-master-list-badge ${isOn ? 'is-on use' : ''}`}>
			{isOn ? '사용' : '미사용'}
		</span>
	)
}

const renderYnToggle = (value: string, onChange: (next: 'Y' | 'N') => void) => (
	<button
		type="button"
		className={`yn-toggle ${value === 'Y' ? 'is-on' : 'is-off'}`}
		onClick={() => onChange(value === 'Y' ? 'N' : 'Y')}
		aria-pressed={value === 'Y'}
	>
		<span className="yn-toggle-label">{value === 'Y' ? '사용' : '미사용'}</span>
		<span className="yn-toggle-knob" aria-hidden="true" />
	</button>
)

export const PopupPage: React.FC = () => {
	const [list, setList] = useState<PopupDto[]>([])
	const [form, setForm] = useState<PopupDto>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [useYnFilter, setUseYnFilter] = useState('')
	const [startPublishDate, setStartPublishDate] = useState('')
	const [endPublishDate, setEndPublishDate] = useState('')
	const [startRegDate, setStartRegDate] = useState('')
	const [endRegDate, setEndRegDate] = useState('')
	const [searchType, setSearchType] = useState('title')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const pageSize = DEFAULT_LIST_PAGE_SIZE
	const initialContentRef = useRef<string>('')
	const [popImgFile, setPopImgFile] = useState<File | null>(null)
	const [popImgDisplayUrl, setPopImgDisplayUrl] = useState<string>('')
	const [popImgDisplayName, setPopImgDisplayName] = useState<string>('')
	const popImgObjectUrlRef = useRef<string | null>(null)
	const popupImageInputRef = useRef<HTMLInputElement>(null)

	// Summernote: 레이어 팝업 열릴 때 생성, 닫을 때 제거
	useEffect(() => {
		const id = '#' + SUMMERNOTE_ID
		const w = typeof window !== 'undefined' ? (window as unknown as { jQuery?: JqLike; $?: JqLike }) : null
		const $: JqLike | undefined = w ? (w.jQuery ?? w.$) : undefined
		if (!popupOpen) {
			if ($ && $(id).length) {
				try {
					$(id).summernote('destroy')
				} catch {
					// ignore
				}
			}
			return
		}
		initialContentRef.current = form.popupCn ?? ''
		const t = setTimeout(() => {
			if (typeof window === 'undefined' || !$) return
			const el = document.getElementById(SUMMERNOTE_ID)
			if (!el) return
			const initial = initialContentRef.current
			const $el = $(el)
			$el.summernote({
				height: 220,
				lang: 'ko-KR',
				placeholder: '팝업 내용을 입력하세요.',
				disableDragAndDrop: true,
				toolbar: [
					['style', ['style']],
					['font', ['bold', 'underline', 'italic', 'strikethrough', 'clear']],
					['fontname', ['fontname']],
					['color', ['forecolor', 'backcolor']],
					['fontsize', ['fontsize']],
					['para', ['ul', 'ol', 'paragraph']],
					['insert', ['link', 'picture', 'table']],
					['view', ['fullscreen', 'codeview']]
				],
				callbacks: {
					onKeydown: summernoteOnEnterKeydown($el),
					onInit: function () {
						if (initial) $el.summernote('code', initial)
					},
					onImageUpload: function (files: FileList | File[]) {
						const fileList = Array.isArray(files) ? files : Array.from(files)
						for (let i = 0; i < fileList.length; i++) {
							const file = fileList[i]
							const formData = new FormData()
							formData.append('file', file)
							formData.append('menuType', 'popup')
							formData.append('menuId', 'popup')
							fetch(`${BACKEND}/api/admin/upload/image`, {
								method: 'POST',
								body: formData,
								credentials: 'include'
							})
								.then((res) => res.json())
								.then((result: { success?: boolean; data?: { url?: string }; message?: string }) => {
									if (result.success && result.data?.url) {
										let imageUrl = (result.data.url || '').trim()
										if (imageUrl.startsWith('http')) {
											const m = imageUrl.match(/(\/uploads\/[^?#]+)/)
											imageUrl = m ? m[1] : imageUrl
										} else if (!imageUrl.startsWith('/')) {
											imageUrl = '/' + imageUrl
										}
										try {
											$el.summernote('insertImage', imageUrl)
										} catch {
											$el.summernote('pasteHTML', '<img src="' + imageUrl.replace(/"/g, '&quot;') + '" alt="" style="max-width:100%;"/>')
										}
									} else {
										alert(result.message || '이미지 업로드에 실패했습니다.')
									}
								})
								.catch(() => alert('이미지 업로드 중 오류가 발생했습니다.'))
						}
					}
				}
			})
		}, 100)
		return () => {
			clearTimeout(t)
			if ($ && $(id).length) {
				try {
					$(id).summernote('destroy')
				} catch {
					// ignore
				}
			}
		}
	}, [popupOpen])

	const buildSearchParams = useCallback((targetPage: number) => {
		const p: string[] = [`page=${targetPage}`, `size=${pageSize}`]
		if (useYnFilter) p.push(`useYn=${encodeURIComponent(useYnFilter)}`)
		if (startPublishDate) p.push(`startPublishDate=${encodeURIComponent(startPublishDate)}`)
		if (endPublishDate) p.push(`endPublishDate=${encodeURIComponent(endPublishDate)}`)
		if (startRegDate) p.push(`startRegDate=${encodeURIComponent(startRegDate)}`)
		if (endRegDate) p.push(`endRegDate=${encodeURIComponent(endRegDate)}`)
		if (searchType) p.push(`searchType=${encodeURIComponent(searchType)}`)
		if (searchKeyword) p.push(`searchKeyword=${encodeURIComponent(searchKeyword)}`)
		return `?${p.join('&')}`
	}, [useYnFilter, startPublishDate, endPublishDate, startRegDate, endRegDate, searchType, searchKeyword, pageSize])

	const fetchList = useCallback(async (targetPage = page) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage)
			const url = `${BACKEND}/api/admin/popup/list${qs}`
			const res = await fetch(url, { credentials: 'include' })
			const result: ApiResponse<PagedListData<PopupDto>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
		} catch {
			setError('팝업 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page])

	useEffect(() => {
		void fetchList(page)
	}, [fetchList, page])

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	const handleSearch = () => {
		setPage(1)
		void fetchList(1)
	}

	const openNewPopup = () => {
		setForm({ ...defaultForm })
		setPopImgFile(null)
		if (popImgObjectUrlRef.current) {
			URL.revokeObjectURL(popImgObjectUrlRef.current)
			popImgObjectUrlRef.current = null
		}
		setPopImgDisplayUrl('')
		setPopImgDisplayName('')
		setPopupMode('new')
		setPopupOpen(true)
	}
	const openEditPopup = (row: PopupDto) => {
		setForm({
			...defaultForm,
			popupSn: row.popupSn ?? null,
			popupNm: row.popupNm ?? '',
			popupCn: row.popupCn ?? '',
			popPosx: numOrNull(row.popPosx),
			popPosy: numOrNull(row.popPosy),
			popWidth: numOrNull(row.popWidth),
			popHeight: numOrNull(row.popHeight),
			pstgBgngYmd: row.pstgBgngYmd ? String(row.pstgBgngYmd).slice(0, 10) : '',
			pstgEndYmd: row.pstgEndYmd ? String(row.pstgEndYmd).slice(0, 10) : '',
			useYn: row.useYn ?? 'N',
			popImg: row.popImg ?? '',
			popupUrlAddr: row.popupUrlAddr ?? '',
			lnkgSeCd: row.lnkgSeCd ?? 'P'
		})
		setPopImgFile(null)
		if (popImgObjectUrlRef.current) {
			URL.revokeObjectURL(popImgObjectUrlRef.current)
			popImgObjectUrlRef.current = null
		}
		setPopImgDisplayUrl(row.popImg?.startsWith('/') ? row.popImg : '')
		setPopImgDisplayName('')
		setPopupMode('edit')
		setPopupOpen(true)
	}
	const closePopup = () => {
		setPopImgFile(null)
		if (popImgObjectUrlRef.current) {
			URL.revokeObjectURL(popImgObjectUrlRef.current)
			popImgObjectUrlRef.current = null
		}
		setPopImgDisplayUrl('')
		setPopImgDisplayName('')
		setPopupOpen(false)
		setError(null)
	}

	const handlePopupImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		if (!file.type.startsWith('image/')) {
			alert('이미지 파일만 업로드 가능합니다.')
			e.target.value = ''
			return
		}
		if (popImgObjectUrlRef.current) {
			URL.revokeObjectURL(popImgObjectUrlRef.current)
			popImgObjectUrlRef.current = null
		}
		setPopImgFile(file)
		popImgObjectUrlRef.current = URL.createObjectURL(file)
		setPopImgDisplayUrl(popImgObjectUrlRef.current)
		setError(null)
		e.target.value = ''
		if (popupImageInputRef.current) popupImageInputRef.current.value = ''
	}

	const clearPopupImage = () => {
		setPopImgFile(null)
		if (popImgObjectUrlRef.current) {
			URL.revokeObjectURL(popImgObjectUrlRef.current)
			popImgObjectUrlRef.current = null
		}
		setForm((prev) => ({ ...prev, popImg: '' }))
		setPopImgDisplayUrl('')
		setPopImgDisplayName('')
		if (popupImageInputRef.current) popupImageInputRef.current.value = ''
	}

	// POP_IMG가 FI_ID일 때 표시용 URL 조회 (새 파일 선택 시에는 조회하지 않음)
	useEffect(() => {
		if (!popupOpen || !form.popImg || form.popImg.startsWith('/') || popImgFile) return
		let cancelled = false
		fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(form.popImg)}`, { credentials: 'include' })
			.then((res) => res.json())
			.then((r: { success?: boolean; data?: { fileUrl?: string; fileOriginName?: string } }) => {
				if (cancelled || !r.success || !r.data?.fileUrl) return
				let url = (r.data.fileUrl || '').trim()
				if (url.startsWith('http')) {
					const m = url.match(/(\/uploads\/[^?#]+)/)
					url = m ? m[1] : url
				} else if (url && !url.startsWith('/')) {
					url = '/' + url
				}
				setPopImgDisplayUrl(resolveBackendUrl(url))
				if (r.data?.fileOriginName) setPopImgDisplayName(r.data.fileOriginName)
			})
			.catch(() => {})
		return () => { cancelled = true }
	}, [popupOpen, form.popImg, popImgFile])

	const clearSearch = () => {
		setUseYnFilter('')
		setStartPublishDate('')
		setEndPublishDate('')
		setStartRegDate('')
		setEndRegDate('')
		setSearchType('title')
		setSearchKeyword('')
		setPage(1)
	}

	const handleSave = async () => {
		if (!form.popupNm?.trim()) {
			setError('팝업창명을 입력하세요.')
			return
		}
		let popupCn = form.popupCn ?? ''
		try {
			const w = typeof window !== 'undefined' ? (window as unknown as { $?: (s: string) => { summernote: (c: string) => string } }) : null
			if (w?.$) {
				const code = w.$('#' + SUMMERNOTE_ID).summernote('code')
				if (typeof code === 'string') popupCn = code
			}
		} catch {
			// keep form.popupCn
		}
		// img src 도메인 제거 → /uploads/... 만 저장
		popupCn = (popupCn || '').replace(/src="(https?:\/\/[^"]*)(\/uploads\/[^"]+)"/gi, 'src="$2"')
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const body = {
				popupNm: form.popupNm,
				popupCn,
				popPosx: numOrNull(form.popPosx),
				popPosy: numOrNull(form.popPosy),
				popWidth: numOrNull(form.popWidth),
				popHeight: numOrNull(form.popHeight),
				pstgBgngYmd: form.pstgBgngYmd || null,
				pstgEndYmd: form.pstgEndYmd || null,
				useYn: form.useYn ?? 'N',
				popImg: popImgFile ? '' : (form.popImg ?? ''),
				popupUrlAddr: form.popupUrlAddr ?? '',
				lnkgSeCd: form.lnkgSeCd ?? 'P'
			}
			let res: Response
			if (popImgFile) {
				const formData = new FormData()
				formData.append('popup', new Blob([JSON.stringify(body)], { type: 'application/json' }))
				formData.append('popImgFile', popImgFile)
				if (popupMode === 'new') {
					res = await fetch(`${BACKEND}/api/admin/popup`, {
						method: 'POST',
						body: formData,
						credentials: 'include'
					})
				} else {
					res = await fetch(`${BACKEND}/api/admin/popup/${form.popupSn!}`, {
						method: 'PUT',
						body: formData,
						credentials: 'include'
					})
				}
			} else {
				if (popupMode === 'new') {
					res = await fetch(`${BACKEND}/api/admin/popup`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(body),
						credentials: 'include'
					})
				} else {
					res = await fetch(`${BACKEND}/api/admin/popup/${form.popupSn!}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(body),
						credentials: 'include'
					})
				}
			}
			const result: ApiResponse<PopupDto> = await res.json()
			if (!result.success) {
				setError(result.message || (popupMode === 'new' ? '등록에 실패했습니다.' : '수정에 실패했습니다.'))
				return
			}
			setMessage(popupMode === 'new' ? '팝업이 등록되었습니다.' : '팝업이 수정되었습니다.')
			setPopImgFile(null)
			if (popImgObjectUrlRef.current) {
				URL.revokeObjectURL(popImgObjectUrlRef.current)
				popImgObjectUrlRef.current = null
			}
			closePopup()
			await fetchList(page)
		} catch {
			setError(popupMode === 'new' ? '등록 중 오류가 발생했습니다.' : '수정 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (form.popupSn == null) return
		if (!window.confirm(`"${form.popupNm}" 팝업을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/popup/${form.popupSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('팝업이 삭제되었습니다.')
			closePopup()
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteRow = async (popupSn: number, popupNm: string) => {
		if (!window.confirm(`"${popupNm}" 팝업을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/popup/${popupSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('팝업이 삭제되었습니다.')
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AdminLayout title="팝업관리">
			<CrudPageCard title="팝업관리" error={error} message={message}>
				<div className="code-filters bbs-post-filters search-section" style={{ flexWrap: 'wrap', gap: '8px' }}>
					<label>
						사용여부
						<select value={useYnFilter} onChange={(e) => setUseYnFilter(e.target.value)}>
							<option value="">전체</option>
							<option value="Y">Y</option>
							<option value="N">N</option>
						</select>
					</label>
					<label>
						게시기간
						<input
							type="date"
							value={startPublishDate}
							onChange={(e) => setStartPublishDate(e.target.value)}
						/>
						~
						<input
							type="date"
							value={endPublishDate}
							onChange={(e) => setEndPublishDate(e.target.value)}
						/>
					</label>
					<label>
						등록일
						<input type="date" value={startRegDate} onChange={(e) => setStartRegDate(e.target.value)} />
						~
						<input type="date" value={endRegDate} onChange={(e) => setEndRegDate(e.target.value)} />
					</label>
					<div className="popup-search-row">
						<label className="popup-search-field">
							검색
							<select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
								<option value="title">제목</option>
								<option value="content">내용</option>
								<option value="all">제목+내용</option>
							</select>
							<input
								type="text"
								placeholder="검색어"
								value={searchKeyword}
								onChange={(e) => setSearchKeyword(e.target.value)}
							/>
						</label>
						<div className="popup-search-actions">
							<button type="button" className="admin-list-btn-sky" onClick={handleSearch}>검색</button>
							<button type="button" className="admin-filter-btn-reset" onClick={clearSearch}>초기화</button>
						</div>
					</div>
				</div>
				<div className="list-toolbar">
					<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
					<button type="button" className="admin-list-btn-sky" onClick={openNewPopup}>신규</button>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: '60px'}}>번호</th>
							<th style={{ width: 'auto'}}>팝업창명</th>
							<th style={{ width: '210px'}}>게시기간</th>
							<th style={{ width: '100px'}}>사용여부</th>
							<th style={{ width: '100px'}}>등록일</th>
							<th style={{ width: '120px'}}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr
								key={row.popupSn!}
								className="clickable"
								onClick={() => openEditPopup(row)}
							>
								<td>{row.popupSn}</td>
								<td>{row.popupNm}</td>
								<td>
									{formatDate(row.pstgBgngYmd)} ~ {formatDate(row.pstgEndYmd)}
								</td>
								<td>{useYnBadge(row.useYn)}</td>
								<td>{formatDate(row.regDt)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => openEditPopup(row)}
										onDelete={() => handleDeleteRow(row.popupSn!, row.popupNm)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={6} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>
				<ListPagination
					page={page}
					totalPages={totalPages}
					disabled={loading}
					onPageChange={(p) => setPage(p)}
				/>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={popupMode === 'new' ? '팝업 등록' : '팝업 상세 (수정)'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						{popupMode === 'edit' && form.popupSn != null && (
							<button
								type="button"
								onClick={handleDelete}
								disabled={loading}
								className="admin-footer-btn-delete"
								style={{ marginRight: 'auto' }}
							>
								삭제
							</button>
						)}
						<button type="button" className="admin-list-btn-edit" onClick={handleSave} disabled={loading}>
							{popupMode === 'new' ? '등록' : '수정'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup}>닫기</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table form-table-cols4">
					<tbody>
						{popupMode === 'edit' && form.popupSn != null && (
							<tr>
								<th>번호</th>
								<td><input type="text" value={form.popupSn} readOnly /></td>
								<th>팝업창명</th>
								<td>
									<input
										type="text"
										value={form.popupNm}
										onChange={(e) => setForm({ ...form, popupNm: e.target.value })}
									/>
								</td>
							</tr>
						)}
						{popupMode === 'new' && (
							<tr>
								<th>팝업창명</th>
								<td colSpan={3}>
									<input
										type="text"
										value={form.popupNm}
										onChange={(e) => setForm({ ...form, popupNm: e.target.value })}
									/>
								</td>
							</tr>
						)}
						<tr>
							<th>가로위치</th>
							<td>
								<input
									type="number"
									value={form.popPosx ?? ''}
									onChange={(e) => setForm({ ...form, popPosx: numOrNull(e.target.value) })}
								/>
							</td>
							<th>세로위치</th>
							<td>
								<input
									type="number"
									value={form.popPosy ?? ''}
									onChange={(e) => setForm({ ...form, popPosy: numOrNull(e.target.value) })}
								/>
							</td>
						</tr>
						<tr>
							<th>넓이</th>
							<td>
								<input
									type="number"
									value={form.popWidth ?? ''}
									onChange={(e) => setForm({ ...form, popWidth: numOrNull(e.target.value) })}
								/>
							</td>
							<th>높이</th>
							<td>
								<input
									type="number"
									value={form.popHeight ?? ''}
									onChange={(e) => setForm({ ...form, popHeight: numOrNull(e.target.value) })}
								/>
							</td>
						</tr>
						<tr>
							<th>게시시작일</th>
							<td>
								<input
									type="date"
									value={form.pstgBgngYmd}
									onChange={(e) => setForm({ ...form, pstgBgngYmd: e.target.value })}
								/>
							</td>
							<th>게시종료일</th>
							<td>
								<input
									type="date"
									value={form.pstgEndYmd}
									onChange={(e) => setForm({ ...form, pstgEndYmd: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>사용여부</th>
							<td>
								{renderYnToggle(form.useYn, (useYn) => setForm({ ...form, useYn }))}
							</td>
							<th>팝업이미지</th>
							<td>
								<input
									ref={popupImageInputRef}
									type="file"
									accept="image/*"
									onChange={handlePopupImageSelect}
									style={{ display: 'none' }}
								/>
								<button
									type="button"
									onClick={() => popupImageInputRef.current?.click()}
									disabled={loading}
									className="popup-file-btn"
								>
									파일 선택
								</button>
								{(popImgFile || form.popImg) && (
									<>
										<button
											type="button"
											onClick={clearPopupImage}
											style={{ marginLeft: 8 }}
											disabled={loading}
											className="popup-file-btn-secondary"
										>
											삭제
										</button>
										<div className="popup-img-preview">
											{(popImgDisplayUrl || (form.popImg?.startsWith('/') ? form.popImg : '')) && (
												<img
													src={popImgDisplayUrl || form.popImg}
													alt="팝업 미리보기"
												/>
											)}
											<span className="popup-img-path">{popImgFile ? popImgFile.name : (popImgDisplayName || form.popImg)}</span>
										</div>
									</>
								)}
							</td>
						</tr>
						<tr>
							<th>링크</th>
							<td colSpan={3}>
								<input
									type="text"
									value={form.popupUrlAddr}
									onChange={(e) => setForm({ ...form, popupUrlAddr: e.target.value })}
									placeholder="https://"
								/>
							</td>
						</tr>
						<tr>
							<th>링크타입</th>
							<td>
								<select
									style={{ width: '160px' }}
									value={form.lnkgSeCd}
									onChange={(e) => setForm({ ...form, lnkgSeCd: e.target.value })}
								>
									<option value="P">부모창(P)</option>
									<option value="B">새창(B)</option>
								</select>
							</td>
							<th colSpan={2}></th>
						</tr>
						<tr>
							<th>팝업내용</th>
							<td colSpan={3} className="bbs-post-content-cell">
								<div className="bbs-post-summernote-wrap">
									<textarea
										id={SUMMERNOTE_ID}
										defaultValue={form.popupCn ?? ''}
										className="board-form-textarea summernote-editor"
										rows={8}
									/>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

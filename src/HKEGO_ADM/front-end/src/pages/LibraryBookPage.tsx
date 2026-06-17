import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'
import { ListPagination } from '../components/ListPagination'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL, resolveBackendUrl } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type CodeDetail = {
	cdDtlId: string
	code?: string
	cdDtlNm: string
	useYn: string
}

type LibraryBook = {
	bookSn: number | null
	bookMngNo: string
	bookNm: string
	bookImgAtchFileId: string
	autNm: string
	pblcoNm: string
	pblcnYr: string
	clno: string
	bookPstnNm: string
	bookCn: string
	rcmdtnYn: string
	rcmdtnClsfCd: string
	rcmdtnClsfNm?: string
	rcmdtnSortSeq: number
	newBookYr: string
	newBookMm: string
	expsrYn: string
	regYmd: string
	wrtrNm: string
	inqCnt: number
	regDt?: string
	relatedBooks?: LibraryBook[]
	relatedBookSns?: number[]
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const defaultForm: LibraryBook = {
	bookSn: null,
	bookMngNo: '',
	bookNm: '',
	bookImgAtchFileId: '',
	autNm: '',
	pblcoNm: '',
	pblcnYr: '',
	clno: '',
	bookPstnNm: '',
	bookCn: '',
	rcmdtnYn: 'N',
	rcmdtnClsfCd: '',
	rcmdtnSortSeq: 0,
	newBookYr: '',
	newBookMm: '',
	expsrYn: 'Y',
	regYmd: new Date().toISOString().slice(0, 10),
	wrtrNm: '',
	inqCnt: 0,
	relatedBooks: [],
	relatedBookSns: []
}

function codeDetailId(item: CodeDetail): string {
	return item.cdDtlId ?? item.code ?? ''
}

function formatDate(value: string | null | undefined): string {
	if (!value) return '-'
	return String(value).slice(0, 10)
}

function formatNewBookPeriod(row: LibraryBook): string {
	if (!row.newBookYr) return '-'
	return row.newBookMm ? `${row.newBookYr}.${row.newBookMm}` : row.newBookYr
}

function renderThumb(url: string) {
	if (!url) {
		return <span className="product-list-thumb product-list-thumb--empty" aria-hidden />
	}
	return <img src={url} alt="" className="product-list-thumb" />
}

const renderYnToggle = (
	value: string,
	onChange: (next: 'Y' | 'N') => void,
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

const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

export const LibraryBookPage: React.FC = () => {
	const [list, setList] = useState<LibraryBook[]>([])
	const [form, setForm] = useState<LibraryBook>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [popupError, setPopupError] = useState<string | null>(null)

	const [expsrYnFilter, setExpsrYnFilter] = useState('')
	const [rcmdtnYnFilter, setRcmdtnYnFilter] = useState(false)
	const [rcmdtnClsfFilter, setRcmdtnClsfFilter] = useState('')
	const [newBookYrFilter, setNewBookYrFilter] = useState('')
	const [newBookMmFilter, setNewBookMmFilter] = useState('')
	const [searchType, setSearchType] = useState('all')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [selectedBookSns, setSelectedBookSns] = useState<Set<number>>(new Set())

	const [categoryOptions, setCategoryOptions] = useState<CodeDetail[]>([])
	const [thumbMap, setThumbMap] = useState<Record<string, string>>({})
	const [bookImageFile, setBookImageFile] = useState<File | null>(null)
	const [bookImagePreviewUrl, setBookImagePreviewUrl] = useState('')
	const [bookImageDisplayName, setBookImageDisplayName] = useState('')
	const objectUrlRef = useRef<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const [relatedPopupOpen, setRelatedPopupOpen] = useState(false)
	const [relatedCandidates, setRelatedCandidates] = useState<LibraryBook[]>([])
	const [relatedSearchType, setRelatedSearchType] = useState('all')
	const [relatedSearchKeyword, setRelatedSearchKeyword] = useState('')

	const selectedRelatedBookSns = useMemo(
		() => new Set((form.relatedBooks ?? []).map((book) => book.bookSn).filter((v): v is number => v != null)),
		[form.relatedBooks]
	)

	const buildSearchParams = useCallback((targetPage: number) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(pageSize))
		if (expsrYnFilter) qs.set('expsrYn', expsrYnFilter)
		if (rcmdtnYnFilter) qs.set('rcmdtnYn', 'Y')
		if (rcmdtnClsfFilter) qs.set('rcmdtnClsfCd', rcmdtnClsfFilter)
		if (newBookYrFilter.trim()) qs.set('newBookYr', newBookYrFilter.trim())
		if (newBookMmFilter) qs.set('newBookMm', newBookMmFilter)
		if (searchType) qs.set('searchType', searchType)
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		return qs.toString()
	}, [
		expsrYnFilter,
		rcmdtnYnFilter,
		rcmdtnClsfFilter,
		newBookYrFilter,
		newBookMmFilter,
		searchType,
		searchKeyword,
		pageSize
	])

	const loadThumbs = useCallback(async (rows: LibraryBook[]) => {
		const fiIds = Array.from(new Set(rows.map((row) => (row.bookImgAtchFileId || '').trim()).filter(Boolean)))
		if (fiIds.length === 0) {
			setThumbMap({})
			return
		}
		const entries = await Promise.all(
			fiIds.map(async (fiId) => {
				try {
					const res = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, {
						credentials: 'include'
					})
					const json: ApiResponse<{ fileUrl?: string; fileOriginName?: string }> = await res.json()
					return [fiId, json.success ? resolveBackendUrl(json.data?.fileUrl || '') : ''] as const
				} catch {
					return [fiId, ''] as const
				}
			})
		)
		const nextMap: Record<string, string> = {}
		for (const [fiId, url] of entries) {
			if (url) nextMap[fiId] = url
		}
		setThumbMap(nextMap)
	}, [])

	const fetchList = useCallback(async (targetPage = page) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage)
			const res = await fetch(`${BACKEND}/api/admin/library-books?${qs}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<LibraryBook>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '도서 목록 조회에 실패했습니다.')
				return
			}
			const rows = result.data.list ?? []
			setList(rows)
			setSelectedBookSns(new Set())
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			await loadThumbs(rows)
		} catch {
			setError('도서 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, loadThumbs, page])

	const fetchCategories = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/codes/detail?cdId=COM046&useYn=Y`, {
				credentials: 'include'
			})
			const result: ApiResponse<CodeDetail[]> = await res.json()
			setCategoryOptions(result.success && result.data ? result.data : [])
		} catch {
			setCategoryOptions([])
		}
	}, [])

	useEffect(() => {
		void fetchCategories()
	}, [fetchCategories])

	useEffect(() => {
		void fetchList(page)
	}, [fetchList, page])

	useEffect(() => {
		return () => {
			if (objectUrlRef.current) window.URL.revokeObjectURL(objectUrlRef.current)
		}
	}, [])

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	const handleSearch = () => {
		setPage(1)
		void fetchList(1)
	}

	const resetImageState = () => {
		setBookImageFile(null)
		setBookImageDisplayName('')
		setBookImagePreviewUrl('')
		if (objectUrlRef.current) {
			window.URL.revokeObjectURL(objectUrlRef.current)
			objectUrlRef.current = null
		}
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const openNewPopup = () => {
		setPopupMode('new')
		setForm({ ...defaultForm, regYmd: new Date().toISOString().slice(0, 10) })
		resetImageState()
		setError(null)
		setPopupError(null)
		setPopupOpen(true)
	}

	const openEditPopup = async (bookSn: number | null) => {
		if (!bookSn) return
		setPopupMode('edit')
		setLoading(true)
		setError(null)
		setPopupError(null)
		resetImageState()
		try {
			const res = await fetch(`${BACKEND}/api/admin/library-books/${bookSn}`, { credentials: 'include' })
			const result: ApiResponse<LibraryBook> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '도서 상세 조회에 실패했습니다.')
				return
			}
			const data = result.data
			setForm({
				...defaultForm,
				...data,
				bookImgAtchFileId: data.bookImgAtchFileId ?? '',
				regYmd: formatDate(data.regYmd),
				relatedBooks: data.relatedBooks ?? [],
				relatedBookSns: data.relatedBookSns ?? []
			})
			if (data.bookImgAtchFileId) {
				const infoRes = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(data.bookImgAtchFileId)}`, {
					credentials: 'include'
				})
				const info: ApiResponse<{ fileUrl?: string; fileOriginName?: string }> = await infoRes.json()
				if (info.success) {
					setBookImagePreviewUrl(resolveBackendUrl(info.data?.fileUrl || ''))
					setBookImageDisplayName(info.data?.fileOriginName || '')
				}
			}
			setPopupOpen(true)
		} catch {
			setError('도서 상세 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleImageChange = (file: File | null) => {
		setBookImageFile(file)
		if (objectUrlRef.current) {
			window.URL.revokeObjectURL(objectUrlRef.current)
			objectUrlRef.current = null
		}
		if (!file) {
			setBookImageDisplayName('')
			setBookImagePreviewUrl('')
			return
		}
		setBookImageDisplayName(file.name)
		const url = window.URL.createObjectURL(file)
		objectUrlRef.current = url
		setBookImagePreviewUrl(url)
	}

	const uploadBookImage = async (): Promise<string> => {
		if (!bookImageFile) return form.bookImgAtchFileId || ''
		const fd = new FormData()
		fd.append('file', bookImageFile)
		fd.append('menuType', 'library_book')
		if (form.bookImgAtchFileId) fd.append('fiId', form.bookImgAtchFileId)
		const res = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
			method: 'POST',
			body: fd,
			credentials: 'include'
		})
		const result: ApiResponse<{ fiId: string; fileOriginName?: string; fileUrl?: string }> = await res.json()
		if (!result.success || !result.data?.fiId) {
			throw new Error(result.message || '도서 이미지 업로드에 실패했습니다.')
		}
		return result.data.fiId
	}

	const saveBook = async () => {
		setPopupError(null)
		if (!form.bookMngNo.trim()) {
			setPopupError('등록번호를 입력하세요.')
			return
		}
		if (!form.bookNm.trim()) {
			setPopupError('도서명을 입력하세요.')
			return
		}
		if ((form.relatedBooks ?? []).length > 4) {
			setPopupError('관련자료는 최대 4개까지 선택할 수 있습니다.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const imageFiId = await uploadBookImage()
			const body = {
				...form,
				bookImgAtchFileId: imageFiId,
				rcmdtnClsfCd: form.rcmdtnYn === 'Y' ? form.rcmdtnClsfCd : '',
				relatedBookSns: (form.relatedBooks ?? []).map((book) => book.bookSn).filter((v): v is number => v != null)
			}
			const isEdit = popupMode === 'edit' && form.bookSn != null
			const res = await fetch(
				isEdit
					? `${BACKEND}/api/admin/library-books/${form.bookSn}`
					: `${BACKEND}/api/admin/library-books`,
				{
					method: isEdit ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				}
			)
			const result: ApiResponse<LibraryBook> = await res.json()
			if (!result.success) {
				setPopupError(result.message || '저장에 실패했습니다.')
				return
			}
			setMessage(isEdit ? '도서가 수정되었습니다.' : '도서가 등록되었습니다.')
			setPopupOpen(false)
			setPopupError(null)
			resetImageState()
			await fetchList(page)
		} catch (e) {
			setPopupError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteBook = async (book: LibraryBook) => {
		if (!book.bookSn) return
		if (!window.confirm(`"${book.bookNm}" 도서를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/library-books/${book.bookSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('도서가 삭제되었습니다.')
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const toggleSelectAll = () => {
		const selectable = list.map((book) => book.bookSn).filter((v): v is number => v != null)
		const allSelected = selectable.length > 0 && selectable.every((bookSn) => selectedBookSns.has(bookSn))
		setSelectedBookSns(allSelected ? new Set() : new Set(selectable))
	}

	const toggleSelectBook = (bookSn: number | null) => {
		if (!bookSn) return
		setSelectedBookSns((prev) => {
			const next = new Set(prev)
			if (next.has(bookSn)) next.delete(bookSn)
			else next.add(bookSn)
			return next
		})
	}

	const bulkDeleteBooks = async () => {
		const targets = Array.from(selectedBookSns)
		if (targets.length === 0) {
			setError('삭제할 도서를 선택하세요.')
			return
		}
		if (!window.confirm('선택한 도서를 삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			for (const bookSn of targets) {
				const res = await fetch(`${BACKEND}/api/admin/library-books/${bookSn}`, {
					method: 'DELETE',
					credentials: 'include'
				})
				const result: ApiResponse<unknown> = await res.json()
				if (!result.success) {
					setError(result.message || '선택삭제 중 오류가 발생했습니다.')
					return
				}
			}
			setSelectedBookSns(new Set())
			setMessage('선택한 도서가 삭제되었습니다.')
			await fetchList(page)
		} catch {
			setError('선택삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const fetchRelatedCandidates = async () => {
		try {
			const qs = new URLSearchParams()
			if (form.bookSn) qs.set('excludeBookSn', String(form.bookSn))
			if (relatedSearchType) qs.set('searchType', relatedSearchType)
			if (relatedSearchKeyword.trim()) qs.set('searchKeyword', relatedSearchKeyword.trim())
			qs.set('limit', '50')
			const res = await fetch(`${BACKEND}/api/admin/library-books/related-candidates?${qs.toString()}`, {
				credentials: 'include'
			})
			const result: ApiResponse<LibraryBook[]> = await res.json()
			setRelatedCandidates(result.success && result.data ? result.data : [])
		} catch {
			setRelatedCandidates([])
		}
	}

	const openRelatedPopup = () => {
		setRelatedPopupOpen(true)
		void fetchRelatedCandidates()
	}

	const selectRelatedBook = (book: LibraryBook) => {
		if (!book.bookSn) return
		if (selectedRelatedBookSns.has(book.bookSn)) return
		const current = form.relatedBooks ?? []
		if (current.length >= 4) {
			setPopupError('관련자료는 최대 4개까지 선택할 수 있습니다.')
			return
		}
		setPopupError(null)
		setForm({
			...form,
			relatedBooks: [...current, book]
		})
	}

	const removeRelatedBook = (bookSn: number | null) => {
		if (!bookSn) return
		setForm({
			...form,
			relatedBooks: (form.relatedBooks ?? []).filter((book) => book.bookSn !== bookSn)
		})
	}

	const selectableBookSns = list.map((book) => book.bookSn).filter((v): v is number => v != null)
	const allSelected = selectableBookSns.length > 0 && selectableBookSns.every((bookSn) => selectedBookSns.has(bookSn))

	return (
		<AdminLayout title="도서 관리">
			<CrudPageCard title="도서 관리" error={popupOpen ? null : error} message={message}>
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
								<option key={n} value={n}>{n}개씩 보기</option>
							))}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button
							type="button"
							className="admin-footer-btn-delete"
							disabled={selectedBookSns.size === 0 || loading}
							onClick={() => void bulkDeleteBooks()}
						>
							선택삭제{selectedBookSns.size > 0 ? ` (${selectedBookSns.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openNewPopup} disabled={loading}>
							등록
						</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">사서 추천도서</label>
						{renderYnToggle(
							rcmdtnYnFilter ? 'Y' : 'N',
							(next) => {
								const enabled = next === 'Y'
								setRcmdtnYnFilter(enabled)
								if (!enabled) setRcmdtnClsfFilter('')
							},
							'추천',
							'전체'
						)}
						<select
							value={rcmdtnClsfFilter}
							onChange={(e) => setRcmdtnClsfFilter(e.target.value)}
							className="bbs-post-filter-select"
							disabled={!rcmdtnYnFilter}
						>
							<option value="">분류전체</option>
							{categoryOptions.map((item) => (
								<option key={codeDetailId(item)} value={codeDetailId(item)}>{item.cdDtlNm}</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">새로 들어온 도서</label>
						<input
							type="number"
							min={1900}
							max={2100}
							value={newBookYrFilter}
							onChange={(e) => {
								setNewBookYrFilter(e.target.value)
								if (!e.target.value.trim()) setNewBookMmFilter('')
							}}
							placeholder="연도전체"
							className="bbs-post-filter-date"
						/>
						<select
							value={newBookMmFilter}
							onChange={(e) => setNewBookMmFilter(e.target.value)}
							className="bbs-post-filter-select"
							disabled={!newBookYrFilter.trim()}
						>
							<option value="">월 전체</option>
							{monthOptions.map((month) => (
								<option key={month} value={month}>{Number(month)}월</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">노출여부</label>
						<select
							value={expsrYnFilter}
							onChange={(e) => setExpsrYnFilter(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="">전체</option>
							<option value="Y">Y</option>
							<option value="N">N</option>
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<select
							value={searchType}
							onChange={(e) => setSearchType(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="all">전체</option>
							<option value="bookMngNo">등록번호</option>
							<option value="bookNm">도서명</option>
							<option value="autNm">지은이</option>
							<option value="pblcoNm">출판사</option>
							<option value="clno">청구기호</option>
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
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 44 }}>
								<input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="전체 선택" />
							</th>
							<th style={{ width: 70 }}>번호</th>
							<th style={{ width: 120 }}>등록번호</th>
							<th style={{ width: 90 }}>도서 이미지</th>
							<th>도서명</th>
							<th style={{ width: 130 }}>지은이</th>
							<th style={{ width: 130 }}>출판사</th>
							<th style={{ width: 90 }}>사서 추천도서</th>
							<th style={{ width: 90 }}>추천도서 정렬</th>
							<th style={{ width: 100 }}>새로 들어온 도서</th>
							<th style={{ width: 80 }}>노출여부</th>
							<th style={{ width: 100 }}>작성자</th>
							<th style={{ width: 110 }}>등록일</th>
							<th style={{ width: 80 }}>조회수</th>
							<th style={{ width: 120 }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr key={row.bookSn ?? row.bookMngNo} onClick={() => void openEditPopup(row.bookSn)}>
								<td onClick={(e) => e.stopPropagation()}>
									<input
										type="checkbox"
										checked={row.bookSn != null && selectedBookSns.has(row.bookSn)}
										onChange={() => toggleSelectBook(row.bookSn)}
										aria-label={`${row.bookNm} 선택`}
									/>
								</td>
								<td>{row.bookSn}</td>
								<td>{row.bookMngNo}</td>
								<td>{renderThumb(row.bookImgAtchFileId ? thumbMap[row.bookImgAtchFileId] : '')}</td>
								<td style={{ textAlign: 'left' }}>{row.bookNm}</td>
								<td>{row.autNm || '-'}</td>
								<td>{row.pblcoNm || '-'}</td>
								<td>{row.rcmdtnYn === 'Y' ? 'Y' : '-'}</td>
								<td>{row.rcmdtnYn === 'Y' ? row.rcmdtnSortSeq : '-'}</td>
								<td>{formatNewBookPeriod(row)}</td>
								<td>{row.expsrYn}</td>
								<td>{row.wrtrNm || '-'}</td>
								<td>{formatDate(row.regYmd)}</td>
								<td>{row.inqCnt ?? 0}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => void openEditPopup(row.bookSn)}
										onDelete={() => void deleteBook(row)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={15} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>

				<ListPagination
					page={page}
					totalPages={totalPages}
					disabled={loading}
					onPageChange={(nextPage) => setPage(nextPage)}
				/>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={popupMode === 'new' ? '도서 등록' : '도서 수정'}
				onClose={() => {
					setPopupOpen(false)
					setPopupError(null)
					resetImageState()
				}}
				wideDouble
				footer={
					<>
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveBook()} disabled={loading}>
							{popupMode === 'new' ? '등록' : '수정'}
						</button>
						<button
							type="button"
							className="admin-footer-btn-close"
							onClick={() => {
								setPopupOpen(false)
								setPopupError(null)
								resetImageState()
							}}
						>
							닫기
						</button>
					</>
				}
			>
				{popupError && <p className="form-error">{popupError}</p>}
				<table className="form-table">
					<tbody>
						<tr>
							<th>등록번호 <span className="required">*</span></th>
							<td>
								<input
									type="text"
									value={form.bookMngNo}
									onChange={(e) => setForm({ ...form, bookMngNo: e.target.value })}
								/>
							</td>
							<th>도서명 <span className="required">*</span></th>
							<td>
								<input
									type="text"
									value={form.bookNm}
									onChange={(e) => setForm({ ...form, bookNm: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>도서 이미지</th>
							<td colSpan={3}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
									{renderThumb(bookImagePreviewUrl)}
									<input
										ref={fileInputRef}
										type="file"
										accept="image/jpeg,image/png"
										style={{ display: 'none' }}
										onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
									/>
									<button type="button" className="admin-list-btn-sky" onClick={() => fileInputRef.current?.click()}>
										파일 선택
									</button>
									<span className="muted">{bookImageDisplayName || 'JPG/PNG 형식 업로드 가능'}</span>
								</div>
							</td>
						</tr>
						<tr>
							<th>지은이</th>
							<td><input type="text" value={form.autNm || ''} onChange={(e) => setForm({ ...form, autNm: e.target.value })} /></td>
							<th>출판사</th>
							<td><input type="text" value={form.pblcoNm || ''} onChange={(e) => setForm({ ...form, pblcoNm: e.target.value })} /></td>
						</tr>
						<tr>
							<th>발행년도</th>
							<td>
								<input
									type="number"
									min={1000}
									max={9999}
									value={form.pblcnYr || ''}
									onChange={(e) => setForm({ ...form, pblcnYr: e.target.value })}
								/>
							</td>
							<th>청구기호</th>
							<td><input type="text" value={form.clno || ''} onChange={(e) => setForm({ ...form, clno: e.target.value })} /></td>
						</tr>
						<tr>
							<th>도서위치</th>
							<td><input type="text" value={form.bookPstnNm || ''} onChange={(e) => setForm({ ...form, bookPstnNm: e.target.value })} /></td>
							<th>노출여부</th>
							<td>
								{renderYnToggle(
									form.expsrYn,
									(next) => setForm({ ...form, expsrYn: next }),
									'노출',
									'미노출'
								)}
							</td>
						</tr>
						<tr>
							<th>책 소개</th>
							<td colSpan={3}>
								<textarea
									value={form.bookCn || ''}
									onChange={(e) => setForm({ ...form, bookCn: e.target.value })}
									rows={5}
								/>
							</td>
						</tr>
						<tr>
							<th>추천도서</th>
							<td>
								{renderYnToggle(
									form.rcmdtnYn,
									(next) => setForm({
										...form,
										rcmdtnYn: next,
										rcmdtnClsfCd: next === 'Y' ? form.rcmdtnClsfCd : ''
									}),
									'추천',
									'미사용'
								)}
							</td>
							<th>분류선택</th>
							<td>
								<select
									value={form.rcmdtnClsfCd || ''}
									disabled={form.rcmdtnYn !== 'Y'}
									onChange={(e) => setForm({ ...form, rcmdtnClsfCd: e.target.value })}
								>
									<option value="">분류 선택</option>
									{categoryOptions.map((item) => (
										<option key={codeDetailId(item)} value={codeDetailId(item)}>{item.cdDtlNm}</option>
									))}
								</select>
							</td>
						</tr>
						<tr>
							<th>추천도서 슬라이드 정렬</th>
							<td>
								<input
									type="number"
									value={form.rcmdtnSortSeq ?? 0}
									onChange={(e) => setForm({ ...form, rcmdtnSortSeq: Number(e.target.value) || 0 })}
								/>
								<p className="muted">숫자가 높을수록 슬라이드 앞쪽에 표시됩니다.</p>
							</td>
							<th>새로 들어온 도서</th>
							<td>
								<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
									<input
										type="number"
										min={1900}
										max={2100}
										placeholder="연도"
										value={form.newBookYr || ''}
										onChange={(e) => {
											const nextYear = e.target.value
											setForm({
												...form,
												newBookYr: nextYear,
												newBookMm: nextYear.trim() ? form.newBookMm : ''
											})
										}}
									/>
									<select
										value={form.newBookMm || ''}
										disabled={!form.newBookYr}
										onChange={(e) => setForm({ ...form, newBookMm: e.target.value })}
									>
										<option value="">월 전체</option>
										{monthOptions.map((month) => (
											<option key={month} value={month}>{Number(month)}월</option>
										))}
									</select>
								</div>
							</td>
						</tr>
						<tr>
							<th>관련자료(도서)</th>
							<td colSpan={3}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
									<button
										type="button"
										className="admin-list-btn-sky"
										onClick={openRelatedPopup}
										disabled={(form.relatedBooks ?? []).length >= 4}
									>
										관련자료 선택
									</button>
									<span className="muted">최대 4개까지 선택 가능</span>
								</div>
								<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
									{(form.relatedBooks ?? []).map((book) => (
										<span key={book.bookSn ?? book.bookMngNo} className="selected-code-chip">
											{book.bookNm}
											<button type="button" onClick={() => removeRelatedBook(book.bookSn)}>×</button>
										</span>
									))}
									{(form.relatedBooks ?? []).length === 0 && <span className="muted">선택된 관련자료가 없습니다.</span>}
								</div>
							</td>
						</tr>
						<tr>
							<th>등록일</th>
							<td><input type="date" value={form.regYmd || ''} onChange={(e) => setForm({ ...form, regYmd: e.target.value })} /></td>
							<th>작성자</th>
							<td><input type="text" value={form.wrtrNm || ''} onChange={(e) => setForm({ ...form, wrtrNm: e.target.value })} /></td>
						</tr>
						<tr>
							<th>조회수</th>
							<td>
								<input
									type="number"
									min={0}
									value={form.inqCnt ?? 0}
									onChange={(e) => setForm({ ...form, inqCnt: Number(e.target.value) || 0 })}
								/>
							</td>
							<th />
							<td />
						</tr>
					</tbody>
				</table>
			</LayerPopup>

			<LayerPopup
				open={relatedPopupOpen}
				title="관련자료 선택"
				onClose={() => setRelatedPopupOpen(false)}
				wide
				footer={<button type="button" onClick={() => setRelatedPopupOpen(false)}>닫기</button>}
			>
				<div className="code-filters search-section" style={{ flexWrap: 'wrap', gap: 8 }}>
					<label>
						도서 검색
						<select value={relatedSearchType} onChange={(e) => setRelatedSearchType(e.target.value)}>
							<option value="all">전체</option>
							<option value="bookMngNo">등록번호</option>
							<option value="bookNm">도서명</option>
							<option value="autNm">지은이</option>
							<option value="pblcoNm">출판사</option>
							<option value="clno">청구기호</option>
						</select>
					</label>
					<input
						type="text"
						value={relatedSearchKeyword}
						onChange={(e) => setRelatedSearchKeyword(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') void fetchRelatedCandidates()
						}}
					/>
					<button type="button" className="admin-list-btn-sky" onClick={() => void fetchRelatedCandidates()}>
						검색
					</button>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 70 }}>번호</th>
							<th style={{ width: 140 }}>등록번호</th>
							<th>도서명</th>
							<th style={{ width: 90 }}>선택</th>
						</tr>
					</thead>
					<tbody>
						{relatedCandidates.map((book) => {
							const selected = book.bookSn != null && selectedRelatedBookSns.has(book.bookSn)
							return (
								<tr key={book.bookSn ?? book.bookMngNo}>
									<td>{book.bookSn}</td>
									<td>{book.bookMngNo}</td>
									<td style={{ textAlign: 'left' }}>{book.bookNm}</td>
									<td>
										<button
											type="button"
											className="admin-list-btn-sky"
											disabled={selected || (!selected && (form.relatedBooks ?? []).length >= 4)}
											onClick={() => selectRelatedBook(book)}
										>
											{selected ? '선택됨' : '선택'}
										</button>
									</td>
								</tr>
							)
						})}
						{relatedCandidates.length === 0 && (
							<tr><td colSpan={4} style={{ textAlign: 'center' }}>검색 결과가 없습니다.</td></tr>
						)}
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

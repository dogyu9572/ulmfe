import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { ListPagination } from '../components/ListPagination'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL, adminFileDownloadUrl } from '../config'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'
import { summernoteOnEnterKeydown } from '../utils/summernoteCallbacks'

const SUMMERNOTE_ID = 'learning-support-material-content'

type JqLike = (sel: string | HTMLElement) => { length: number; summernote: (a: string | object, b?: string, c?: string) => unknown }

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type ProgramOption = {
	prgrmSn: number
	prgrmTypeCd: string
	prgrmTypeNm: string
	prgrmNm: string
}

type FileInfoRow = {
	fiId: string
	fiSn?: string
	fileOriginName?: string
}

type LearningSupportMaterial = {
	pstSn?: string
	pstTtl: string
	pstCn?: string
	lrnTypeCd: string
	lrnTypeNm?: string
	dataTypeCd: string
	dataTypeNm?: string
	prgrmTypeCd?: string
	prgrmTypeNm?: string
	prgrmSn?: number | null
	prgrmNm?: string
	linkUrl?: string
	videoEmbedUrl?: string
	atchFileMngNo?: string
	wrtrNm?: string
	wrtrId?: string
	pstgYmd?: string
	useYn?: string
	inqCnt?: number
	regDt?: string
	rgtr?: string
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const LEARNING_TYPE_OPTIONS = [
	{ value: '', label: '전체' },
	{ value: 'PRE', label: '사전학습' },
	{ value: 'MAIN', label: '본학습' },
	{ value: 'POST', label: '사후학습' }
]

const FORM_LEARNING_TYPE_OPTIONS = LEARNING_TYPE_OPTIONS.filter((option) => option.value)

const DATA_TYPE_OPTIONS = [
	{ value: '', label: '전체' },
	{ value: 'LINK', label: '링크' },
	{ value: 'DOC', label: '문서' },
	{ value: 'VIDEO', label: '동영상' }
]

const FORM_DATA_TYPE_OPTIONS = DATA_TYPE_OPTIONS.filter((option) => option.value)

const defaultForm = (): LearningSupportMaterial => ({
	pstTtl: '',
	pstCn: '',
	lrnTypeCd: 'PRE',
	dataTypeCd: 'DOC',
	prgrmTypeCd: '',
	prgrmSn: null,
	linkUrl: '',
	videoEmbedUrl: '',
	atchFileMngNo: '',
	wrtrNm: '관리자',
	wrtrId: 'admin',
	pstgYmd: '',
	useYn: 'Y',
	inqCnt: 0
})

function formatDate(value: string | null | undefined): string {
	if (!value) return '-'
	return String(value).slice(0, 10)
}

function truncate(value: string | null | undefined, length = 24): string {
	const text = value?.trim() || '-'
	return text.length > length ? `${text.slice(0, length)}...` : text
}

export const LearningSupportMaterialPage: React.FC = () => {
	const [list, setList] = useState<LearningSupportMaterial[]>([])
	const [programOptions, setProgramOptions] = useState<ProgramOption[]>([])
	const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
	const [form, setForm] = useState<LearningSupportMaterial>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [attachFile, setAttachFile] = useState<File | null>(null)
	const [attachFileInfos, setAttachFileInfos] = useState<FileInfoRow[]>([])
	const attachInputRef = useRef<HTMLInputElement>(null)
	const initialContentRef = useRef<string>('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [popupError, setPopupError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)

	const [lrnTypeCd, setLrnTypeCd] = useState('')
	const [dataTypeCd, setDataTypeCd] = useState('')
	const [startRegYmd, setStartRegYmd] = useState('')
	const [endRegYmd, setEndRegYmd] = useState('')
	const [searchType, setSearchType] = useState('all')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [pageSize, totalCount])
	const selectedProgram = programOptions.find((program) => program.prgrmTypeCd === form.prgrmTypeCd && program.prgrmSn === form.prgrmSn)

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		if (lrnTypeCd) qs.set('lrnTypeCd', lrnTypeCd)
		if (dataTypeCd) qs.set('dataTypeCd', dataTypeCd)
		if (startRegYmd) qs.set('startRegYmd', startRegYmd)
		if (endRegYmd) qs.set('endRegYmd', endRegYmd)
		if (searchType) qs.set('searchType', searchType)
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		return qs.toString()
	}, [dataTypeCd, endRegYmd, lrnTypeCd, pageSize, searchKeyword, searchType, startRegYmd])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize) => {
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-support-materials?${buildSearchParams(targetPage, targetSize)}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<LearningSupportMaterial>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '학습지원 자료실 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('학습지원 자료실 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	const fetchProgramOptions = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-support-materials/program-options`, { credentials: 'include' })
			const result: ApiResponse<ProgramOption[]> = await res.json()
			if (result.success) {
				setProgramOptions(result.data ?? [])
			}
		} catch {
			setProgramOptions([])
		}
	}, [])

	useEffect(() => {
		void fetchList(page, pageSize)
	}, [fetchList, page, pageSize])

	useEffect(() => {
		void fetchProgramOptions()
	}, [fetchProgramOptions])

	useEffect(() => {
		if (!message) return
		const timer = window.setTimeout(() => setMessage(null), 3000)
		return () => window.clearTimeout(timer)
	}, [message])

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
		initialContentRef.current = form.pstCn ?? ''
		const timer = window.setTimeout(() => {
			if (!$) return
			const el = document.getElementById(SUMMERNOTE_ID)
			if (!el) return
			const $el = $(el)
			const initial = initialContentRef.current
			$el.summernote({
				height: 280,
				lang: 'ko-KR',
				placeholder: '내용을 입력하세요.',
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
							const fd = new FormData()
							fd.append('file', fileList[i])
							fd.append('menuType', 'learning_support')
							fetch(`${BACKEND}/api/admin/upload/image`, {
								method: 'POST',
								body: fd,
								credentials: 'include'
							})
								.then((res) => res.json())
								.then((result: { success?: boolean; data?: { url?: string }; message?: string }) => {
									if (result.success && result.data?.url) {
										let imageUrl = result.data.url.trim()
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
			window.clearTimeout(timer)
			if ($ && $(id).length) {
				try {
					$(id).summernote('destroy')
				} catch {
					// ignore
				}
			}
		}
	}, [popupOpen])

	const fetchAttachInfos = async (fiId?: string) => {
		if (!fiId) {
			setAttachFileInfos([])
			return
		}
		try {
			const res = await fetch(`${BACKEND}/api/admin/upload/infos/${encodeURIComponent(fiId)}`, { credentials: 'include' })
			const result: ApiResponse<FileInfoRow[]> = await res.json()
			setAttachFileInfos(result.success ? result.data ?? [] : [])
		} catch {
			setAttachFileInfos([])
		}
	}

	const openCreate = () => {
		setPopupMode('new')
		setForm(defaultForm())
		setAttachFile(null)
		setAttachFileInfos([])
		setError(null)
		setPopupError(null)
		setPopupOpen(true)
	}

	const openEdit = async (row: LearningSupportMaterial) => {
		if (!row.pstSn) return
		setLoading(true)
		setError(null)
		setPopupError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-support-materials/${encodeURIComponent(row.pstSn)}`, { credentials: 'include' })
			const result: ApiResponse<LearningSupportMaterial> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '학습지원 자료실 상세 조회에 실패했습니다.')
				return
			}
			setPopupMode('edit')
			setForm({ ...defaultForm(), ...result.data })
			setAttachFile(null)
			setPopupError(null)
			await fetchAttachInfos(result.data.atchFileMngNo)
			setPopupOpen(true)
		} catch {
			setError('학습지원 자료실 상세 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const uploadAttachFile = async (): Promise<string> => {
		if (!attachFile) return form.atchFileMngNo?.trim() || ''
		const fd = new FormData()
		fd.append('file', attachFile)
		fd.append('menuType', 'learning_support')
		if (form.atchFileMngNo?.trim()) fd.append('fiId', form.atchFileMngNo.trim())
		const res = await fetch(`${BACKEND}/api/admin/upload/file-info-attach`, {
			method: 'POST',
			body: fd,
			credentials: 'include'
		})
		const result: ApiResponse<{ fiId?: string }> = await res.json()
		if (!result.success || !result.data?.fiId) {
			throw new Error(result.message || '첨부파일 업로드에 실패했습니다.')
		}
		return result.data.fiId
	}

	const validateForm = () => {
		if (!form.lrnTypeCd) return '학습유형을 선택하세요.'
		if (!form.dataTypeCd) return '자료구분을 선택하세요.'
		if (!form.pstTtl.trim()) return '제목을 입력하세요.'
		if (form.dataTypeCd === 'LINK' && !form.linkUrl?.trim()) return '링크를 입력하세요.'
		if (form.dataTypeCd === 'VIDEO' && !form.videoEmbedUrl?.trim()) return '영상 임베드 링크를 입력하세요.'
		return ''
	}

	const save = async () => {
		const validationMessage = validateForm()
		if (validationMessage) {
			setPopupError(validationMessage)
			return
		}
		setLoading(true)
		setPopupError(null)
		try {
			let pstCn = form.pstCn ?? ''
			try {
				const w = typeof window !== 'undefined' ? (window as unknown as { $?: (s: string) => { summernote: (c: string) => string } }) : null
				if (w?.$) {
					const code = w.$('#' + SUMMERNOTE_ID).summernote('code')
					if (typeof code === 'string') pstCn = code
				}
			} catch {
				// keep form.pstCn
			}
			pstCn = (pstCn || '').replace(/src="(https?:\/\/[^"]*)(\/uploads\/[^"]+)"/gi, 'src="$2"')
			const atchFileMngNo = await uploadAttachFile()
			const payload = {
				...form,
				pstCn,
				atchFileMngNo,
				prgrmTypeCd: selectedProgram?.prgrmTypeCd || form.prgrmTypeCd || '',
				prgrmSn: selectedProgram?.prgrmSn ?? form.prgrmSn ?? null
			}
			const url = popupMode === 'edit' && form.pstSn
				? `${BACKEND}/api/admin/learning-support-materials/${encodeURIComponent(form.pstSn)}`
				: `${BACKEND}/api/admin/learning-support-materials`
			const res = await fetch(url, {
				method: popupMode === 'edit' ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
				credentials: 'include'
			})
			const result: ApiResponse<LearningSupportMaterial> = await res.json()
			if (!result.success) {
				setPopupError(result.message || '학습지원 자료실 저장에 실패했습니다.')
				return
			}
			setMessage(popupMode === 'edit' ? '수정되었습니다.' : '등록되었습니다.')
			setPopupOpen(false)
			await fetchList(page, pageSize)
		} catch (e) {
			setPopupError(e instanceof Error ? e.message : '학습지원 자료실 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteOne = async (row: LearningSupportMaterial) => {
		if (!row.pstSn || !window.confirm('삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/learning-support-materials/${encodeURIComponent(row.pstSn)}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('삭제되었습니다.')
			await fetchList(page, pageSize)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteSelected = async () => {
		if (selectedIds.size === 0) {
			setError('삭제할 자료를 선택하세요.')
			return
		}
		if (!window.confirm('삭제하시겠습니까?')) return
		for (const pstSn of Array.from(selectedIds)) {
			const res = await fetch(`${BACKEND}/api/admin/learning-support-materials/${encodeURIComponent(pstSn)}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '선택삭제 중 오류가 발생했습니다.')
				return
			}
		}
		setMessage('선택한 자료가 삭제되었습니다.')
		await fetchList(page, pageSize)
	}

	const resetFilters = () => {
		setLrnTypeCd('')
		setDataTypeCd('')
		setStartRegYmd('')
		setEndRegYmd('')
		setSearchType('all')
		setSearchKeyword('')
		setPage(1)
	}

	const toggleSelected = (pstSn?: string) => {
		if (!pstSn) return
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(pstSn)) next.delete(pstSn)
			else next.add(pstSn)
			return next
		})
	}

	const toggleAll = (checked: boolean) => {
		setSelectedIds(checked ? new Set(list.map((row) => row.pstSn || '').filter(Boolean)) : new Set())
	}

	const selectProgram = (value: string) => {
		if (!value) {
			setForm((prev) => ({ ...prev, prgrmTypeCd: '', prgrmSn: null }))
			return
		}
		const [prgrmTypeCdValue, prgrmSnValue] = value.split(':')
		setForm((prev) => ({ ...prev, prgrmTypeCd: prgrmTypeCdValue, prgrmSn: Number(prgrmSnValue) }))
	}

	return (
		<AdminLayout title="학습지원 자료실">
			<CrudPageCard title="학습지원 자료실" error={error} message={message}>
				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
						<select
							value={pageSize}
							onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
							className="list-page-size-select"
							aria-label="페이지당 목록 개수"
						>
							{PAGE_SIZE_OPTIONS.map((option) => (
								<option key={option} value={option}>{option}</option>
							))}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button type="button" className="admin-footer-btn-delete" onClick={() => void deleteSelected()} disabled={loading || selectedIds.size === 0}>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openCreate} disabled={loading}>등록</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">학습유형</label>
						<select className="bbs-post-filter-select" value={lrnTypeCd} onChange={(e) => setLrnTypeCd(e.target.value)}>
							{LEARNING_TYPE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
						<label className="bbs-post-filter-label">자료구분</label>
						<select className="bbs-post-filter-select" value={dataTypeCd} onChange={(e) => setDataTypeCd(e.target.value)}>
							{DATA_TYPE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">등록일</label>
						<input type="date" className="bbs-post-filter-date" value={startRegYmd} onChange={(e) => setStartRegYmd(e.target.value)} />
						<span className="bbs-post-filter-sep">~</span>
						<input type="date" className="bbs-post-filter-date" value={endRegYmd} onChange={(e) => setEndRegYmd(e.target.value)} />
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<select className="bbs-post-filter-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
							<option value="all">전체</option>
							<option value="title">제목</option>
							<option value="content">내용</option>
						</select>
						<input
							type="text"
							className="bbs-post-filter-input"
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); void fetchList(1, pageSize) } }}
							placeholder="검색어"
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => { setPage(1); void fetchList(1, pageSize) }} disabled={loading}>검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={resetFilters} disabled={loading}>초기화</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 42 }}>
								<input type="checkbox" checked={list.length > 0 && selectedIds.size === list.length} onChange={(e) => toggleAll(e.target.checked)} />
							</th>
							<th style={{ width: 70 }}>번호</th>
							<th style={{ width: 100 }}>학습유형</th>
							<th style={{ width: 90 }}>자료구분</th>
							<th style={{ width: 110 }}>프로그램 구분</th>
							<th style={{ width: 180 }}>프로그램명</th>
							<th>제목</th>
							<th style={{ width: 80 }}>첨부파일</th>
							<th style={{ width: 110 }}>작성자</th>
							<th style={{ width: 110 }}>등록일</th>
							<th style={{ width: 90 }}>조회수</th>
							<th style={{ width: 120 }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row, index) => (
							<tr key={row.pstSn}>
								<td><input type="checkbox" checked={!!row.pstSn && selectedIds.has(row.pstSn)} onChange={() => toggleSelected(row.pstSn)} /></td>
								<td>{totalCount - ((page - 1) * pageSize + index)}</td>
								<td>{row.lrnTypeNm || '-'}</td>
								<td>{row.dataTypeNm || '-'}</td>
								<td>{row.prgrmTypeNm || '-'}</td>
								<td>{row.prgrmNm || '-'}</td>
								<td style={{ textAlign: 'left' }}>{truncate(row.pstTtl, 44)}</td>
								<td>{row.atchFileMngNo ? '첨부' : '-'}</td>
								<td>{row.wrtrNm || row.rgtr || '-'}</td>
								<td>{formatDate(row.regDt)}</td>
								<td>{row.inqCnt ?? 0}</td>
								<td>
									<RowActionButtons onEdit={() => void openEdit(row)} onDelete={() => void deleteOne(row)} disabled={loading} />
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={12} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>
				<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={(nextPage) => setPage(nextPage)} />
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={popupMode === 'edit' ? '학습지원 자료실 수정' : '학습지원 자료실 등록'}
				onClose={() => setPopupOpen(false)}
				wideDouble
				footer={
					<>
						<button type="button" className="admin-list-btn-edit" onClick={() => void save()} disabled={loading}>
							{popupMode === 'edit' ? '수정' : '등록'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={() => setPopupOpen(false)} disabled={loading}>닫기</button>
					</>
				}
			>
				{popupError && <p className="form-error">{popupError}</p>}
				<table className="form-table form-table-cols4">
					<tbody>
						<tr>
							<th>제목 *</th>
							<td colSpan={3}>
								<input
									type="text"
									value={form.pstTtl}
									onChange={(e) => setForm((prev) => ({ ...prev, pstTtl: e.target.value }))}
									style={{ width: '100%', maxWidth: '100%' }}
								/>
							</td>
						</tr>
						<tr>
							<th>학습유형</th>
							<td>
								<select className="bbs-post-category-input" value={form.lrnTypeCd} onChange={(e) => setForm((prev) => ({ ...prev, lrnTypeCd: e.target.value }))}>
									{FORM_LEARNING_TYPE_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>{option.label}</option>
									))}
								</select>
							</td>
							<th>자료구분</th>
							<td>
								<select className="bbs-post-category-input" value={form.dataTypeCd} onChange={(e) => setForm((prev) => ({ ...prev, dataTypeCd: e.target.value }))}>
									{FORM_DATA_TYPE_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>{option.label}</option>
									))}
								</select>
							</td>
						</tr>
						<tr>
							<th>프로그램 선택</th>
							<td colSpan={3}>
								<select
									className="bbs-post-category-input"
									value={form.prgrmTypeCd && form.prgrmSn ? `${form.prgrmTypeCd}:${form.prgrmSn}` : ''}
									onChange={(e) => selectProgram(e.target.value)}
								>
									<option value="">선택</option>
									{programOptions.map((program) => (
										<option key={`${program.prgrmTypeCd}:${program.prgrmSn}`} value={`${program.prgrmTypeCd}:${program.prgrmSn}`}>
											{program.prgrmTypeNm} / {program.prgrmNm}
										</option>
									))}
								</select>
							</td>
						</tr>
						<tr>
							<th>내용</th>
							<td colSpan={3}>
								<div className="bbs-post-summernote-wrap">
									<textarea
										id={SUMMERNOTE_ID}
										defaultValue={form.pstCn ?? ''}
										className="board-form-textarea summernote-editor"
										rows={10}
									/>
								</div>
							</td>
						</tr>
						<tr>
							<th>첨부파일</th>
							<td colSpan={3}>
									<input
										ref={attachInputRef}
										type="file"
										className="bbs-post-attach-input-hidden"
										onChange={(e) => {
											setAttachFile(e.target.files?.[0] ?? null)
											e.target.value = ''
										}}
									/>
									<div className="bbs-post-attach-wrap">
										<div className="bbs-post-attach-actions">
											<button
												type="button"
												className="admin-list-btn-sky"
												onClick={() => attachInputRef.current?.click()}
												disabled={loading}
											>
												파일 선택
											</button>
											{(attachFile || attachFileInfos.length > 0 || (form.atchFileMngNo || '').trim()) && (
												<button
													type="button"
													className="admin-footer-btn-delete"
													onClick={() => {
														setAttachFile(null)
														setAttachFileInfos([])
														setForm((prev) => ({ ...prev, atchFileMngNo: '' }))
													}}
													disabled={loading}
												>
													전체 삭제
												</button>
											)}
										</div>
										<ul className="bbs-post-attach-list">
											{attachFileInfos.map((fileInfo) => (
												<li key={`saved-${fileInfo.fiId}-${fileInfo.fiSn ?? ''}`}>
													<span>{fileInfo.fileOriginName || `${fileInfo.fiId}#${fileInfo.fiSn ?? ''}`}</span>
													{fileInfo.fiId && fileInfo.fiSn != null ? (
														<a href={adminFileDownloadUrl(fileInfo.fiId, fileInfo.fiSn)} target="_blank" rel="noreferrer">다운로드</a>
													) : null}
													<button
														type="button"
														className="admin-footer-btn-delete bbs-post-attach-del"
														onClick={() => {
															setAttachFileInfos((prev) => prev.filter((it) => it !== fileInfo))
															setForm((prev) => ({ ...prev, atchFileMngNo: '' }))
														}}
														disabled={loading}
													>
														삭제
													</button>
												</li>
											))}
											{attachFile ? (
												<li>
													<span>{attachFile.name}</span>
													<span className="bbs-post-attach-pending">(저장 시 업로드)</span>
													<button
														type="button"
														className="admin-footer-btn-delete bbs-post-attach-del"
														onClick={() => setAttachFile(null)}
														disabled={loading}
													>
														삭제
													</button>
												</li>
											) : null}
											{attachFileInfos.length === 0 && !attachFile ? (
												<li className="bbs-post-attach-empty">선택된 파일 없음</li>
											) : null}
										</ul>
									</div>
									<p className="bbs-post-attach-limit-hint">
										<span className="bbs-post-attach-limit">(10MB 이하)</span>
									</p>
								</td>
							</tr>
						<tr>
							<th>링크</th>
							<td colSpan={3}>
								<input
									type="text"
									value={form.linkUrl || ''}
									onChange={(e) => setForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
									placeholder="자료구분이 링크일 때 입력"
									style={{ width: '100%', maxWidth: '100%' }}
								/>
							</td>
						</tr>
						<tr>
							<th>영상 임베드 링크</th>
							<td colSpan={3}>
								<input
									type="text"
									value={form.videoEmbedUrl || ''}
									onChange={(e) => setForm((prev) => ({ ...prev, videoEmbedUrl: e.target.value }))}
									placeholder="자료구분이 동영상일 때 입력"
									style={{ width: '100%', maxWidth: '100%' }}
								/>
							</td>
						</tr>
						<tr>
							<th>등록일</th>
							<td>{formatDate(form.regDt)}</td>
							<th>작성자</th>
							<td>{form.wrtrNm || '관리자'}</td>
						</tr>
						<tr>
							<th>조회수</th>
							<td colSpan={3}>{form.inqCnt ?? 0}</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

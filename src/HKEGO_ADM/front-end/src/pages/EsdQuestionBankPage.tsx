import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

type EsdQuestion = {
	esdQstnSn: number | null
	qstnTypeCd: 'OX' | 'SELECT'
	qstnTypeNm?: string
	qstnCn: string
	qstnImgAtchFileId: string
	optnCn: string
	cransNo: string
	cransExpln: string
	useYn: 'Y' | 'N'
	sortSeq: number
	regDt?: string
	rgtr?: string
}

type QuestionForm = Omit<EsdQuestion, 'optnCn'> & {
	options: string[]
}

type UploadInfo = {
	fileUrl?: string
	fileOriginName?: string
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const defaultForm = (): QuestionForm => ({
	esdQstnSn: null,
	qstnTypeCd: 'OX',
	qstnCn: '',
	qstnImgAtchFileId: '',
	options: ['O', 'X'],
	cransNo: '1',
	cransExpln: '',
	useYn: 'Y',
	sortSeq: 0
})

const parseOptions = (value: string | undefined, type: 'OX' | 'SELECT') => {
	if (type === 'OX') return ['O', 'X']
	try {
		const parsed = JSON.parse(value || '[]')
		return Array.isArray(parsed) && parsed.length >= 2
			? parsed.map((item) => String(item ?? ''))
			: ['', '']
	} catch {
		return ['', '']
	}
}

const formatDate = (value: string | undefined) => value ? value.slice(0, 10) : '-'

const resolveBackendUrl = (value: string) => {
	if (!value) return ''
	if (/^https?:\/\//i.test(value)) return value
	return `${BACKEND}${value.startsWith('/') ? '' : '/'}${value}`
}

export const EsdQuestionBankPage: React.FC = () => {
	const [list, setList] = useState<EsdQuestion[]>([])
	const [form, setForm] = useState<QuestionForm>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [popupError, setPopupError] = useState<string | null>(null)
	const [typeFilter, setTypeFilter] = useState('')
	const [useFilter, setUseFilter] = useState('')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imageDisplayName, setImageDisplayName] = useState('')
	const [imagePreviewUrl, setImagePreviewUrl] = useState('')
	const imageInputRef = useRef<HTMLInputElement | null>(null)
	const imageObjectUrlRef = useRef<string | null>(null)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])
	const allSelected = list.length > 0 && list.every((row) => row.esdQstnSn != null && selectedIds.has(row.esdQstnSn))

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize) => {
		const qs = new URLSearchParams({ page: String(targetPage), size: String(targetSize) })
		if (typeFilter) qs.set('qstnTypeCd', typeFilter)
		if (useFilter) qs.set('useYn', useFilter)
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		return qs.toString()
	}, [pageSize, searchKeyword, typeFilter, useFilter])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize, searchParams?: string) => {
		setError(null)
		try {
			const query = searchParams ?? buildSearchParams(targetPage, targetSize)
			const res = await fetch(`${BACKEND}/api/admin/esd-questions?${query}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<EsdQuestion>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '문제 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('문제 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	useEffect(() => {
		void fetchList(1, DEFAULT_LIST_PAGE_SIZE)
	}, [])

	useEffect(() => () => {
		if (imageObjectUrlRef.current) URL.revokeObjectURL(imageObjectUrlRef.current)
	}, [])

	const resetImage = () => {
		setImageFile(null)
		setImageDisplayName('')
		setImagePreviewUrl('')
		if (imageObjectUrlRef.current) {
			URL.revokeObjectURL(imageObjectUrlRef.current)
			imageObjectUrlRef.current = null
		}
		if (imageInputRef.current) imageInputRef.current.value = ''
	}

	const closePopup = () => {
		setPopupOpen(false)
		setPopupError(null)
		setForm(defaultForm())
		resetImage()
	}

	const openNewPopup = () => {
		setPopupMode('new')
		setForm(defaultForm())
		setPopupError(null)
		setError(null)
		resetImage()
		setPopupOpen(true)
	}

	const loadImageInfo = async (fiId: string) => {
		if (!fiId) return
		try {
			const res = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, { credentials: 'include' })
			const result: ApiResponse<UploadInfo> = await res.json()
			if (result.success && result.data) {
				setImageDisplayName(result.data.fileOriginName || '')
				setImagePreviewUrl(resolveBackendUrl(result.data.fileUrl || ''))
			}
		} catch {
			// 이미지 미리보기 실패는 문항 수정 동작을 막지 않습니다.
		}
	}

	const openEditPopup = async (esdQstnSn: number | null) => {
		if (!esdQstnSn) return
		setLoading(true)
		setPopupError(null)
		setError(null)
		resetImage()
		try {
			const res = await fetch(`${BACKEND}/api/admin/esd-questions/${esdQstnSn}`, { credentials: 'include' })
			const result: ApiResponse<EsdQuestion> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '문제 상세 조회에 실패했습니다.')
				return
			}
			const data = result.data
			setPopupMode('edit')
			setForm({
				...data,
				qstnImgAtchFileId: data.qstnImgAtchFileId || '',
				cransExpln: data.cransExpln || '',
				options: parseOptions(data.optnCn, data.qstnTypeCd)
			})
			setPopupOpen(true)
			if (data.qstnImgAtchFileId) void loadImageInfo(data.qstnImgAtchFileId)
		} catch {
			setError('문제 상세 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleTypeChange = (qstnTypeCd: 'OX' | 'SELECT') => {
		setForm((prev) => ({
			...prev,
			qstnTypeCd,
			options: qstnTypeCd === 'OX' ? ['O', 'X'] : ['', ''],
			cransNo: '1'
		}))
	}

	const updateOption = (index: number, value: string) => {
		setForm((prev) => ({ ...prev, options: prev.options.map((option, i) => i === index ? value : option) }))
	}

	const addOption = () => {
		if (form.options.length >= 5) return
		setForm((prev) => ({ ...prev, options: [...prev.options, ''] }))
	}

	const deleteOption = (index: number) => {
		if (form.options.length <= 2) return
		setForm((prev) => {
			const options = prev.options.filter((_, i) => i !== index)
			const currentAnswer = Math.max(1, Number(prev.cransNo) || 1)
			const nextAnswer = currentAnswer === index + 1 ? 1 : currentAnswer > index + 1 ? currentAnswer - 1 : currentAnswer
			return { ...prev, options, cransNo: String(Math.min(nextAnswer, options.length)) }
		})
	}

	const handleImageChange = (file: File | null) => {
		setImageFile(file)
		if (imageObjectUrlRef.current) URL.revokeObjectURL(imageObjectUrlRef.current)
		imageObjectUrlRef.current = null
		if (!file) {
			setImageDisplayName('')
			setImagePreviewUrl('')
			return
		}
		setImageDisplayName(file.name)
		imageObjectUrlRef.current = URL.createObjectURL(file)
		setImagePreviewUrl(imageObjectUrlRef.current)
	}

	const uploadImage = async () => {
		if (!imageFile) return form.qstnImgAtchFileId || ''
		const fd = new FormData()
		fd.append('file', imageFile)
		fd.append('menuType', 'esd_question')
		if (form.qstnImgAtchFileId) fd.append('fiId', form.qstnImgAtchFileId)
		const res = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, { method: 'POST', body: fd, credentials: 'include' })
		const result: ApiResponse<{ fiId: string }> = await res.json()
		if (!result.success || !result.data?.fiId) throw new Error(result.message || '이미지 업로드에 실패했습니다.')
		return result.data.fiId
	}

	const showPopupError = (value: string) => {
		setPopupError(value)
		window.setTimeout(() => document.querySelector('.layer-popup-body')?.scrollTo({ top: 0, behavior: 'smooth' }), 0)
	}

	const saveQuestion = async () => {
		setPopupError(null)
		if (!form.qstnCn.trim()) {
			showPopupError('질문 내용을 입력하세요.')
			return
		}
		if (form.qstnTypeCd === 'SELECT' && (form.options.length < 2 || form.options.some((option) => !option.trim()))) {
			showPopupError('객관식 보기를 2개 이상 입력하세요.')
			return
		}
		const correctAnswerNo = Number(form.cransNo)
		if (!Number.isInteger(correctAnswerNo) || correctAnswerNo < 1 || correctAnswerNo > form.options.length) {
			showPopupError('정답을 선택하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const imageFiId = await uploadImage()
			const isEdit = popupMode === 'edit' && form.esdQstnSn != null
			const body = {
				qstnTypeCd: form.qstnTypeCd,
				qstnCn: form.qstnCn,
				qstnImgAtchFileId: imageFiId,
				optnCn: JSON.stringify(form.qstnTypeCd === 'OX' ? ['O', 'X'] : form.options.map((option) => option.trim())),
				cransNo: String(correctAnswerNo),
				cransExpln: form.cransExpln,
				useYn: form.useYn
			}
			const res = await fetch(
				isEdit ? `${BACKEND}/api/admin/esd-questions/${form.esdQstnSn}` : `${BACKEND}/api/admin/esd-questions`,
				{ method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include' }
			)
			const result: ApiResponse<EsdQuestion> = await res.json()
			if (!result.success) {
				showPopupError(result.message || '저장에 실패했습니다.')
				return
			}
			setMessage(isEdit ? '문제가 수정되었습니다.' : '문제가 등록되었습니다.')
			closePopup()
			await fetchList(page, pageSize)
		} catch (e) {
			showPopupError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteQuestion = async (row: EsdQuestion) => {
		if (!row.esdQstnSn || !window.confirm('해당 문제를 삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/esd-questions/${row.esdQstnSn}`, { method: 'DELETE', credentials: 'include' })
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('문제가 삭제되었습니다.')
			await fetchList(page, pageSize)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const bulkDelete = async () => {
		const targets = Array.from(selectedIds)
		if (targets.length === 0) {
			setError('삭제할 문제를 선택하세요.')
			return
		}
		if (!window.confirm('선택한 문제를 삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			for (const id of targets) {
				const res = await fetch(`${BACKEND}/api/admin/esd-questions/${id}`, { method: 'DELETE', credentials: 'include' })
				const result: ApiResponse<unknown> = await res.json()
				if (!result.success) throw new Error(result.message || '선택삭제에 실패했습니다.')
			}
			setMessage('선택한 문제를 삭제했습니다.')
			await fetchList(page, pageSize)
		} catch (e) {
			setError(e instanceof Error ? e.message : '선택삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const toggleSelectAll = () => setSelectedIds(allSelected
		? new Set()
		: new Set(list.map((row) => row.esdQstnSn).filter((id): id is number => id != null)))

	const toggleSelectRow = (id: number | null) => {
		if (!id) return
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const resetSearch = () => {
		setTypeFilter('')
		setUseFilter('')
		setSearchKeyword('')
		setPage(1)
		void fetchList(1, pageSize, new URLSearchParams({ page: '1', size: String(pageSize) }).toString())
	}

	return (
		<AdminLayout title="문제은행">
			<CrudPageCard title="문제은행" error={popupOpen ? null : error} message={message}>
				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
						<select value={pageSize} onChange={(e) => { const size = Number(e.target.value); setPageSize(size); setPage(1); void fetchList(1, size) }} className="list-page-size-select" aria-label="페이지당 목록 개수">
							{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button type="button" className="admin-footer-btn-delete" disabled={selectedIds.size === 0 || loading} onClick={() => void bulkDelete()}>선택삭제{selectedIds.size ? ` (${selectedIds.size})` : ''}</button>
						<button type="button" className="admin-list-btn-sky" disabled={loading} onClick={openNewPopup}>등록</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<select className="bbs-post-filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="문항 유형">
							<option value="">유형 전체</option><option value="OX">OX</option><option value="SELECT">객관식</option>
						</select>
						<select className="bbs-post-filter-select" value={useFilter} onChange={(e) => setUseFilter(e.target.value)} aria-label="사용 여부">
							<option value="">사용 여부 전체</option><option value="Y">사용</option><option value="N">미사용</option>
						</select>
						<input className="bbs-post-filter-input" type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); void fetchList(1, pageSize) } }} placeholder="질문 내용 검색" />
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" disabled={loading} onClick={() => { setPage(1); void fetchList(1, pageSize) }}>검색</button>
						<button type="button" className="admin-filter-btn-reset" disabled={loading} onClick={resetSearch}>초기화</button>
					</div>
				</div>

				<table className="table">
					<thead><tr><th style={{ width: 44 }}><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="전체 선택" /></th><th style={{ width: 80 }}>번호</th><th style={{ width: 100 }}>유형</th><th>질문</th><th style={{ width: 160 }}>정답</th><th style={{ width: 90 }}>사용 여부</th><th style={{ width: 110 }}>등록일</th><th style={{ width: 120 }}>관리</th></tr></thead>
					<tbody>
						{list.map((row) => {
							const options = parseOptions(row.optnCn, row.qstnTypeCd)
							const correctOption = options[Math.max(0, Number(row.cransNo) - 1)] || '-'
							return <tr key={row.esdQstnSn ?? row.qstnCn} onClick={() => void openEditPopup(row.esdQstnSn)}>
								<td onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={row.esdQstnSn != null && selectedIds.has(row.esdQstnSn)} onChange={() => toggleSelectRow(row.esdQstnSn)} aria-label={`${row.qstnCn} 선택`} /></td>
								<td>{row.esdQstnSn}</td><td>{row.qstnTypeNm || (row.qstnTypeCd === 'OX' ? 'OX' : '객관식')}</td><td style={{ textAlign: 'left' }}>{row.qstnCn}</td><td style={{ textAlign: 'left' }}>{correctOption}</td><td>{row.useYn === 'Y' ? '사용' : '미사용'}</td><td>{formatDate(row.regDt)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}><RowActionButtons onEdit={() => void openEditPopup(row.esdQstnSn)} onDelete={() => void deleteQuestion(row)} disabled={loading} /></td>
							</tr>
						})}
						{list.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>}
					</tbody>
				</table>
				<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={(nextPage) => { setPage(nextPage); void fetchList(nextPage, pageSize) }} />
			</CrudPageCard>

			<LayerPopup open={popupOpen} title={popupMode === 'new' ? '지속가능발전교육 문제 등록' : '지속가능발전교육 문제 수정'} onClose={closePopup} widePlus300 footer={<><button type="button" className="admin-list-btn-edit" disabled={loading} onClick={() => void saveQuestion()}>{popupMode === 'new' ? '등록' : '수정'}</button><button type="button" className="admin-footer-btn-close" disabled={loading} onClick={closePopup}>닫기</button></>}>
				{popupError && <p className="form-error" style={{ position: 'sticky', top: 0, zIndex: 2, marginTop: 0 }}>{popupError}</p>}
				<table className="form-table"><tbody>
					<tr><th>문항 유형 <span className="required">*</span></th><td>{(['OX', 'SELECT'] as const).map((type) => <label key={type} style={{ marginRight: 18 }}><input type="radio" name="qstnTypeCd" checked={form.qstnTypeCd === type} onChange={() => handleTypeChange(type)} /> {type === 'OX' ? 'OX' : '객관식'}</label>)}</td><th>사용 여부</th><td><label style={{ marginRight: 18 }}><input type="radio" name="useYn" checked={form.useYn === 'Y'} onChange={() => setForm({ ...form, useYn: 'Y' })} /> 사용</label><label><input type="radio" name="useYn" checked={form.useYn === 'N'} onChange={() => setForm({ ...form, useYn: 'N' })} /> 미사용</label></td></tr>
					<tr><th>질문 내용 <span className="required">*</span></th><td colSpan={3}><textarea rows={4} value={form.qstnCn} onChange={(e) => setForm({ ...form, qstnCn: e.target.value })} placeholder="지속가능발전교육 문제를 입력하세요." /></td></tr>
					<tr><th>문항 이미지</th><td colSpan={3}>
						<div className="history-file-row">
							<input ref={imageInputRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={(e) => handleImageChange(e.target.files?.[0] || null)} />
							<button type="button" className="admin-list-btn-sky" disabled={loading} onClick={() => imageInputRef.current?.click()}>파일 첨부</button>
							{(imageFile || form.qstnImgAtchFileId) && <button type="button" className="popup-file-btn-secondary" disabled={loading} onClick={() => { resetImage(); setForm((prev) => ({ ...prev, qstnImgAtchFileId: '' })) }}>제거</button>}
							<span className="muted">{imageDisplayName || '첨부파일 없음'}</span>
						</div>
						{imagePreviewUrl && <div className="popup-img-preview"><img src={imagePreviewUrl} alt="문항 이미지 미리보기" /></div>}
						<p className="muted" style={{ margin: '8px 0 0' }}>JPG, PNG 형식의 이미지를 첨부할 수 있습니다.</p>
					</td></tr>
					<tr><th>보기 및 정답 <span className="required">*</span></th><td colSpan={3}><div style={{ display: 'grid', gap: 8 }}>{form.options.map((option, index) => <div key={`${form.qstnTypeCd}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="radio" name="correctAnswer" checked={form.cransNo === String(index + 1)} onChange={() => setForm({ ...form, cransNo: String(index + 1) })} aria-label={`${index + 1}번 정답`} />{form.qstnTypeCd === 'OX' ? <strong style={{ minWidth: 30 }}>{option}</strong> : <input type="text" value={option} onChange={(e) => updateOption(index, e.target.value)} placeholder={`보기 ${index + 1}`} />}{form.qstnTypeCd === 'SELECT' && <button type="button" className="admin-footer-btn-delete" disabled={form.options.length <= 2} onClick={() => deleteOption(index)}>삭제</button>}</div>)}</div>{form.qstnTypeCd === 'SELECT' && <button type="button" className="admin-list-btn-sky" style={{ marginTop: 10 }} disabled={form.options.length >= 5} onClick={addOption}>보기 추가</button>}<p className="muted" style={{ marginTop: 8 }}>정답으로 사용할 보기의 원형 선택 버튼을 체크하세요.</p></td></tr>
					<tr><th>정답 설명</th><td colSpan={3}><textarea rows={3} value={form.cransExpln} onChange={(e) => setForm({ ...form, cransExpln: e.target.value })} placeholder="정답 후 표시할 해설을 입력하세요." /></td></tr>
					<tr><th>등록자</th><td colSpan={3}>{form.rgtr || 'admin'}</td></tr>
				</tbody></table>
			</LayerPopup>
		</AdminLayout>
	)
}

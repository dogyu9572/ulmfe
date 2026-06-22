import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'
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

type UploadInfo = {
	fileUrl?: string
	fileOriginName?: string
	fiId?: string
}

type ContentQuestion = {
	cntnQstnSn?: number | null
	cntnSn?: number | null
	qstnTypeCd: string
	qstnTypeNm?: string
	qstnNm: string
	qstnImgAtchFileId: string
	optnCn: string
	sortSeq: number
}

type QuestionTypeCode = 'SELECT' | 'DATA' | 'PHOTO' | 'SENTENCE'

type ContentQuestionOption = {
	select: {
		directInputYn: string
		directInputLabel: string
		choiceMode: string
		items: string[]
	}
	data: {
		questionMode: string
		inputType: string
		placeholder: string
		subItems: { name: string; inputType: string; placeholder: string }[]
	}
	photo: {
		itemCount: number
		labels: string[]
	}
	sentence: {
		inputMode: string
		sentenceText: string
		items: string[]
	}
}

type EducationContent = {
	cntnSn: number | null
	cntnTypeCd: string
	cntnTypeNm?: string
	cardClsfCd: string
	cardClsfNm?: string
	cntnTtl: string
	cntnCn: string
	prvdTypeCd: string
	prvdTypeNm?: string
	imgAtchFileId: string
	videoUrlAddr: string
	videoThmbAtchFileId: string
	videoTtl: string
	useYn: string
	regDt?: string
	rgtr?: string
	questions: ContentQuestion[]
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const CONTENT_TYPE_OPTIONS = [
	{ value: 'INFO', label: '정보안내' },
	{ value: 'VIDEO', label: '애니메이션 영상' },
	{ value: 'SELECT', label: '선택형 활동' },
	{ value: 'DATA', label: '데이터 입력' },
	{ value: 'PHOTO', label: '사진 업로드' },
	{ value: 'SENTENCE', label: '문장완성형' }
]

const CARD_CLASS_OPTIONS = [
	{ value: '', label: '없음' },
	{ value: 'MISSION', label: '미션카드' },
	{ value: 'EXPLORE', label: '탐구카드' },
	{ value: 'EXPERIENCE', label: '체험카드' },
	{ value: 'DESIGN', label: '설계활동' },
	{ value: 'MAKER', label: '메이커활동' }
]

const QUESTION_TYPE_OPTIONS = [
	{ value: 'SELECT', label: '선택형 활동' },
	{ value: 'DATA', label: '데이터 입력' },
	{ value: 'PHOTO', label: '사진 업로드' },
	{ value: 'SENTENCE', label: '문장완성형' }
] as const

const defaultQuestionOption = (): ContentQuestionOption => ({
	select: {
		directInputYn: 'N',
		directInputLabel: '',
		choiceMode: 'SINGLE',
		items: ['', '']
	},
	data: {
		questionMode: 'SINGLE',
		inputType: 'TEXT',
		placeholder: '',
		subItems: [{ name: '', inputType: 'TEXT', placeholder: '' }]
	},
	photo: {
		itemCount: 1,
		labels: ['']
	},
	sentence: {
		inputMode: 'SINGLE',
		sentenceText: '',
		items: ['']
	}
})

const defaultForm = (): EducationContent => ({
	cntnSn: null,
	cntnTypeCd: 'INFO',
	cardClsfCd: '',
	cntnTtl: '',
	cntnCn: '',
	prvdTypeCd: 'IMAGE',
	imgAtchFileId: '',
	videoUrlAddr: '',
	videoThmbAtchFileId: '',
	videoTtl: '',
	useYn: 'Y',
	questions: []
})

function formatDate(value: string | null | undefined): string {
	if (!value) return '-'
	return String(value).slice(0, 10)
}

function optionLabel(options: { value: string; label: string }[], value: string | undefined): string {
	return options.find((item) => item.value === value)?.label || value || '-'
}

function renderUseBadge(useYn: string) {
	const enabled = useYn === 'Y'
	return <span className={`bbs-master-list-badge ${enabled ? 'is-on use' : ''}`}>{enabled ? '사용' : '미사용'}</span>
}

function parseQuestionTypes(value: string | null | undefined): QuestionTypeCode[] {
	const allowed = QUESTION_TYPE_OPTIONS.map((option) => option.value)
	const types = String(value || '')
		.split(',')
		.map((item) => item.trim())
		.filter((item): item is QuestionTypeCode => allowed.includes(item as QuestionTypeCode))
	return Array.from(new Set(types))
}

function stringifyQuestionTypes(types: QuestionTypeCode[]): string {
	return types.join(',')
}

function parseQuestionOption(value: string | null | undefined): ContentQuestionOption {
	const base = defaultQuestionOption()
	if (!value) return base
	try {
		const parsed = JSON.parse(value)
		return {
			select: {
				...base.select,
				...(parsed.select || {}),
				items: Array.isArray(parsed.select?.items) ? parsed.select.items : base.select.items
			},
			data: {
				...base.data,
				...(parsed.data || {}),
				subItems: Array.isArray(parsed.data?.subItems) ? parsed.data.subItems : base.data.subItems
			},
			photo: {
				...base.photo,
				...(parsed.photo || {}),
				labels: Array.isArray(parsed.photo?.labels) ? parsed.photo.labels : base.photo.labels
			},
			sentence: {
				...base.sentence,
				...(parsed.sentence || {}),
				items: Array.isArray(parsed.sentence?.items) ? parsed.sentence.items : base.sentence.items
			}
		}
	} catch {
		return base
	}
}

function stringifyQuestionOption(option: ContentQuestionOption): string {
	return JSON.stringify(option)
}

export const EducationContentPage: React.FC = () => {
	const [list, setList] = useState<EducationContent[]>([])
	const [form, setForm] = useState<EducationContent>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [popupError, setPopupError] = useState<string | null>(null)

	const [cntnTypeFilter, setCntnTypeFilter] = useState('')
	const [cardClsfFilter, setCardClsfFilter] = useState('')
	const [useYnFilter, setUseYnFilter] = useState('')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [selectedQuestionIndexes, setSelectedQuestionIndexes] = useState<Set<number>>(new Set())

	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imagePreviewUrl, setImagePreviewUrl] = useState('')
	const [imageDisplayName, setImageDisplayName] = useState('')
	const [videoThumbFile, setVideoThumbFile] = useState<File | null>(null)
	const [videoThumbPreviewUrl, setVideoThumbPreviewUrl] = useState('')
	const [videoThumbDisplayName, setVideoThumbDisplayName] = useState('')
	const [questionImageFiles, setQuestionImageFiles] = useState<Record<number, File>>({})
	const [questionImageNames, setQuestionImageNames] = useState<Record<number, string>>({})
	const imageInputRef = useRef<HTMLInputElement>(null)
	const videoThumbInputRef = useRef<HTMLInputElement>(null)
	const objectUrlRef = useRef<string | null>(null)
	const videoThumbObjectUrlRef = useRef<string | null>(null)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])
	const allSelected = list.length > 0 && list.every((row) => row.cntnSn != null && selectedIds.has(row.cntnSn))

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		if (cntnTypeFilter) qs.set('cntnTypeCd', cntnTypeFilter)
		if (cardClsfFilter) qs.set('cardClsfCd', cardClsfFilter)
		if (useYnFilter) qs.set('useYn', useYnFilter)
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		return qs.toString()
	}, [cardClsfFilter, cntnTypeFilter, pageSize, searchKeyword, useYnFilter])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage, targetSize)
			const res = await fetch(`${BACKEND}/api/admin/education-contents?${qs}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<EducationContent>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '콘텐츠 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('콘텐츠 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	useEffect(() => {
		void fetchList(1, DEFAULT_LIST_PAGE_SIZE)
		return () => {
			if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
		}
	}, [])

	const resetImage = () => {
		setImageFile(null)
		setImagePreviewUrl('')
		setImageDisplayName('')
		setVideoThumbFile(null)
		setVideoThumbPreviewUrl('')
		setVideoThumbDisplayName('')
		setQuestionImageFiles({})
		setQuestionImageNames({})
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current)
			objectUrlRef.current = null
		}
		if (videoThumbObjectUrlRef.current) {
			URL.revokeObjectURL(videoThumbObjectUrlRef.current)
			videoThumbObjectUrlRef.current = null
		}
		if (imageInputRef.current) imageInputRef.current.value = ''
		if (videoThumbInputRef.current) videoThumbInputRef.current.value = ''
	}

	const fetchUploadInfo = async (fiId: string): Promise<UploadInfo | null> => {
		if (!fiId) return null
		try {
			const res = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, { credentials: 'include' })
			const result: ApiResponse<UploadInfo> = await res.json()
			if (result.success && result.data) {
				return result.data
			}
		} catch {
			// preview is optional
		}
		return null
	}

	const loadImageInfo = async (fiId: string) => {
		const info = await fetchUploadInfo(fiId)
		if (info) {
			setImagePreviewUrl(resolveBackendUrl(info.fileUrl || ''))
			setImageDisplayName(info.fileOriginName || '')
		}
	}

	const loadVideoThumbInfo = async (fiId: string) => {
		const info = await fetchUploadInfo(fiId)
		if (info) {
			setVideoThumbPreviewUrl(resolveBackendUrl(info.fileUrl || ''))
			setVideoThumbDisplayName(info.fileOriginName || '')
		}
	}

	const handleImageChange = (file: File | null) => {
		setImageFile(file)
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current)
			objectUrlRef.current = null
		}
		if (!file) {
			setImagePreviewUrl('')
			setImageDisplayName('')
			return
		}
		setImageDisplayName(file.name)
		const nextUrl = URL.createObjectURL(file)
		objectUrlRef.current = nextUrl
		setImagePreviewUrl(nextUrl)
	}

	const handleVideoThumbChange = (file: File | null) => {
		setVideoThumbFile(file)
		if (videoThumbObjectUrlRef.current) {
			URL.revokeObjectURL(videoThumbObjectUrlRef.current)
			videoThumbObjectUrlRef.current = null
		}
		if (!file) {
			setVideoThumbPreviewUrl('')
			setVideoThumbDisplayName('')
			return
		}
		setVideoThumbDisplayName(file.name)
		const nextUrl = URL.createObjectURL(file)
		videoThumbObjectUrlRef.current = nextUrl
		setVideoThumbPreviewUrl(nextUrl)
	}

	const uploadSingleImage = async (file: File, currentFiId: string): Promise<string> => {
		const fd = new FormData()
		fd.append('file', file)
		fd.append('menuType', 'education_content')
		if (currentFiId) fd.append('fiId', currentFiId)
		const res = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
			method: 'POST',
			body: fd,
			credentials: 'include'
		})
		const result: ApiResponse<{ fiId: string }> = await res.json()
		if (!result.success || !result.data?.fiId) {
			throw new Error(result.message || '이미지 업로드에 실패했습니다.')
		}
		return result.data.fiId
	}

	const uploadImage = async (): Promise<string> => {
		if (!imageFile) return form.imgAtchFileId || ''
		return uploadSingleImage(imageFile, form.imgAtchFileId || '')
	}

	const uploadVideoThumb = async (): Promise<string> => {
		if (!videoThumbFile) return form.videoThmbAtchFileId || ''
		return uploadSingleImage(videoThumbFile, form.videoThmbAtchFileId || '')
	}

	const handleQuestionImageChange = (index: number, file: File | null) => {
		setQuestionImageFiles((prev) => {
			const next = { ...prev }
			if (file) next[index] = file
			else delete next[index]
			return next
		})
		setQuestionImageNames((prev) => {
			const next = { ...prev }
			if (file) next[index] = file.name
			else delete next[index]
			return next
		})
	}

	const handleSearch = () => {
		setPage(1)
		void fetchList(1, pageSize)
	}

	const clearSearch = () => {
		setCntnTypeFilter('')
		setCardClsfFilter('')
		setUseYnFilter('')
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
		resetImage()
		setPopupOpen(true)
	}

	const openEditPopup = async (cntnSn: number | null) => {
		if (!cntnSn) return
		setPopupMode('edit')
		setLoading(true)
		setPopupError(null)
		setError(null)
		setSelectedQuestionIndexes(new Set())
		resetImage()
		try {
			const res = await fetch(`${BACKEND}/api/admin/education-contents/${cntnSn}`, { credentials: 'include' })
			const result: ApiResponse<EducationContent> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '콘텐츠 상세 조회에 실패했습니다.')
				return
			}
			const data = {
				...defaultForm(),
				...result.data,
				imgAtchFileId: result.data.imgAtchFileId ?? '',
				questions: (result.data.questions ?? []).map((question, index) => ({
					...question,
					qstnTypeCd: question.qstnTypeCd || 'SELECT',
					qstnImgAtchFileId: question.qstnImgAtchFileId ?? '',
					optnCn: question.optnCn || stringifyQuestionOption(defaultQuestionOption()),
					sortSeq: question.sortSeq || index + 1
				}))
			}
			setForm(data)
			if (data.imgAtchFileId) await loadImageInfo(data.imgAtchFileId)
			if (data.videoThmbAtchFileId) await loadVideoThumbInfo(data.videoThmbAtchFileId)
			setPopupOpen(true)
		} catch {
			setError('콘텐츠 상세 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const closePopup = () => {
		setPopupOpen(false)
		setPopupError(null)
		setSelectedQuestionIndexes(new Set())
		setForm(defaultForm())
		resetImage()
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
						qstnTypeCd: 'SELECT',
						qstnNm: '',
						qstnImgAtchFileId: '',
						optnCn: stringifyQuestionOption(defaultQuestionOption()),
						sortSeq: prev.questions.length + 1
					}
				]
			}))
	}

	const updateQuestion = (index: number, patch: Partial<ContentQuestion>) => {
		setForm((prev) => ({
			...prev,
			questions: prev.questions.map((question, i) => (i === index ? { ...question, ...patch } : question))
		}))
	}

	const toggleQuestionType = (index: number, type: QuestionTypeCode) => {
		const question = form.questions[index]
		const selected = parseQuestionTypes(question.qstnTypeCd)
		const next = selected.includes(type) ? selected.filter((item) => item !== type) : [...selected, type]
		updateQuestion(index, { qstnTypeCd: stringifyQuestionTypes(next) })
	}

	const updateQuestionOption = (index: number, updater: (option: ContentQuestionOption) => ContentQuestionOption) => {
		const option = parseQuestionOption(form.questions[index]?.optnCn)
		updateQuestion(index, { optnCn: stringifyQuestionOption(updater(option)) })
	}

	const updateQuestionOptionList = (
		index: number,
		section: 'select' | 'sentence',
		itemIndex: number,
		value: string
	) => {
		updateQuestionOption(index, (option) => ({
			...option,
			[section]: {
				...option[section],
				items: option[section].items.map((item, i) => (i === itemIndex ? value : item))
			}
		}))
	}

	const addQuestionOptionListItem = (index: number, section: 'select' | 'sentence') => {
		updateQuestionOption(index, (option) => ({
			...option,
			[section]: {
				...option[section],
				items: [...option[section].items, '']
			}
		}))
	}

	const deleteQuestionOptionListItem = (index: number, section: 'select' | 'sentence', itemIndex: number) => {
		updateQuestionOption(index, (option) => ({
			...option,
			[section]: {
				...option[section],
				items: option[section].items.filter((_, i) => i !== itemIndex)
			}
		}))
	}

	const renderQuestionDetailEditor = (question: ContentQuestion, index: number) => {
		const selectedTypes = parseQuestionTypes(question.qstnTypeCd)
		const option = parseQuestionOption(question.optnCn)
		const renderSectionTypeName = (type: QuestionTypeCode) => (
			<p className="muted" style={{ margin: '0 0 6px' }}>
				{optionLabel(QUESTION_TYPE_OPTIONS as unknown as { value: string; label: string }[], type)}
			</p>
		)
		if (selectedTypes.length === 0) {
			return <p className="muted" style={{ margin: 0 }}>섹션분류를 선택하면 입력 항목이 표시됩니다.</p>
		}

		return (
			<div style={{ display: 'grid', gap: 10 }}>
					{selectedTypes.includes('SELECT') && (
						<>
						{renderSectionTypeName('SELECT')}
						<table className="form-table">
							<tbody>
								<tr>
									<th style={{ width: 140 }}>이미지 추가</th>
									<td colSpan={3}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
											<input
												id={`content-question-image-${index}`}
												type="file"
												accept="image/jpeg,image/png"
												style={{ display: 'none' }}
												onChange={(e) => handleQuestionImageChange(index, e.target.files?.[0] ?? null)}
											/>
											<button
												type="button"
												className="admin-list-btn-sky"
												onClick={() => document.getElementById(`content-question-image-${index}`)?.click()}
											>
												파일 첨부
											</button>
											<span className="muted">{questionImageNames[index] || question.qstnImgAtchFileId || '첨부파일 없음'}</span>
										</div>
									</td>
								</tr>
								<tr>
									<th style={{ width: 140 }}>직접 입력</th>
								<td>
									<label style={{ marginRight: 12 }}>
										<input
											type="radio"
											checked={option.select.directInputYn === 'Y'}
											onChange={() => updateQuestionOption(index, (prev) => ({ ...prev, select: { ...prev.select, directInputYn: 'Y' } }))}
										/> 사용
									</label>
									<label>
										<input
											type="radio"
											checked={option.select.directInputYn !== 'Y'}
											onChange={() => updateQuestionOption(index, (prev) => ({ ...prev, select: { ...prev.select, directInputYn: 'N' } }))}
										/> 미사용
									</label>
								</td>
								<th style={{ width: 140 }}>보기 선택</th>
								<td>
									<select
										value={option.select.choiceMode}
										onChange={(e) => updateQuestionOption(index, (prev) => ({ ...prev, select: { ...prev.select, choiceMode: e.target.value } }))}
									>
										<option value="SINGLE">단일 선택</option>
										<option value="MULTI">다중 선택</option>
									</select>
								</td>
							</tr>
							<tr>
								<th>직접 입력 라벨</th>
								<td colSpan={3}>
									<input
										type="text"
										value={option.select.directInputLabel}
										onChange={(e) => updateQuestionOption(index, (prev) => ({ ...prev, select: { ...prev.select, directInputLabel: e.target.value } }))}
										placeholder="예: 기타 의견을 입력하세요."
									/>
								</td>
							</tr>
							<tr>
								<th>선택항목</th>
								<td colSpan={3}>
									<div style={{ display: 'grid', gap: 6 }}>
										{option.select.items.map((item, itemIndex) => (
											<div key={`select-${itemIndex}`} style={{ display: 'flex', gap: 6 }}>
												<input
													type="text"
													value={item}
													onChange={(e) => updateQuestionOptionList(index, 'select', itemIndex, e.target.value)}
													placeholder={`선택항목 ${itemIndex + 1}`}
												/>
												<button
													type="button"
													className="admin-footer-btn-delete"
													onClick={() => deleteQuestionOptionListItem(index, 'select', itemIndex)}
													disabled={option.select.items.length <= 1}
												>
													삭제
												</button>
											</div>
										))}
										<div>
											<button type="button" className="admin-list-btn-sky" onClick={() => addQuestionOptionListItem(index, 'select')}>
												항목 추가
											</button>
										</div>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
					</>
				)}

				{selectedTypes.includes('DATA') && (
					<>
					{renderSectionTypeName('DATA')}
					<table className="form-table">
						<tbody>
							<tr>
								<th style={{ width: 140 }}>문항 형식</th>
								<td>
									<select
										value={option.data.questionMode}
										onChange={(e) => updateQuestionOption(index, (prev) => ({ ...prev, data: { ...prev.data, questionMode: e.target.value } }))}
									>
										<option value="SINGLE">단일 문항</option>
										<option value="SUB">하위 문항</option>
									</select>
								</td>
								<th style={{ width: 140 }}>입력 형식</th>
								<td>
									<select
										value={option.data.inputType}
										onChange={(e) => updateQuestionOption(index, (prev) => ({ ...prev, data: { ...prev.data, inputType: e.target.value } }))}
									>
										<option value="TEXT">텍스트</option>
										<option value="TEXTAREA">여러 줄 텍스트</option>
									</select>
								</td>
							</tr>
							<tr>
								<th>입력 안내문</th>
								<td colSpan={3}>
									<input
										type="text"
										value={option.data.placeholder}
										onChange={(e) => updateQuestionOption(index, (prev) => ({ ...prev, data: { ...prev.data, placeholder: e.target.value } }))}
										placeholder="입력창 placeholder"
									/>
								</td>
							</tr>
							{option.data.questionMode === 'SUB' && (
								<tr>
									<th>하위 문항</th>
									<td colSpan={3}>
										<div style={{ display: 'grid', gap: 6 }}>
											{option.data.subItems.map((item, itemIndex) => (
												<div key={`data-${itemIndex}`} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 1fr auto', gap: 6 }}>
													<input
														type="text"
														value={item.name}
														onChange={(e) => updateQuestionOption(index, (prev) => ({
															...prev,
															data: {
																...prev.data,
																subItems: prev.data.subItems.map((sub, i) => (i === itemIndex ? { ...sub, name: e.target.value } : sub))
															}
														}))}
														placeholder={`하위 문항 ${itemIndex + 1}`}
													/>
													<select
														value={item.inputType}
														onChange={(e) => updateQuestionOption(index, (prev) => ({
															...prev,
															data: {
																...prev.data,
																subItems: prev.data.subItems.map((sub, i) => (i === itemIndex ? { ...sub, inputType: e.target.value } : sub))
															}
														}))}
													>
														<option value="TEXT">텍스트</option>
														<option value="TEXTAREA">여러 줄 텍스트</option>
													</select>
													<input
														type="text"
														value={item.placeholder}
														onChange={(e) => updateQuestionOption(index, (prev) => ({
															...prev,
															data: {
																...prev.data,
																subItems: prev.data.subItems.map((sub, i) => (i === itemIndex ? { ...sub, placeholder: e.target.value } : sub))
															}
														}))}
														placeholder="입력 안내문"
													/>
													<button
														type="button"
														className="admin-footer-btn-delete"
														onClick={() => updateQuestionOption(index, (prev) => ({
															...prev,
															data: { ...prev.data, subItems: prev.data.subItems.filter((_, i) => i !== itemIndex) }
														}))}
														disabled={option.data.subItems.length <= 1}
													>
														삭제
													</button>
												</div>
											))}
											<div>
												<button
													type="button"
													className="admin-list-btn-sky"
													onClick={() => updateQuestionOption(index, (prev) => ({
														...prev,
														data: {
															...prev.data,
															subItems: [...prev.data.subItems, { name: '', inputType: 'TEXT', placeholder: '' }]
														}
													}))}
												>
													하위 문항 추가
												</button>
											</div>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
					</>
				)}

				{selectedTypes.includes('PHOTO') && (
					<>
					{renderSectionTypeName('PHOTO')}
					<table className="form-table">
						<tbody>
							<tr>
								<th style={{ width: 140 }}>입력 항목 수</th>
								<td colSpan={3}>
									<select
										value={option.photo.itemCount}
										onChange={(e) => {
											const itemCount = Number(e.target.value)
											updateQuestionOption(index, (prev) => ({
												...prev,
												photo: {
													itemCount,
													labels: Array.from({ length: itemCount }, (_, i) => prev.photo.labels[i] || '')
												}
											}))
										}}
									>
										{[1, 2, 3, 4].map((count) => (
											<option key={count} value={count}>{count}</option>
										))}
									</select>
								</td>
							</tr>
							<tr>
								<th>라벨명</th>
								<td colSpan={3}>
									<div style={{ display: 'grid', gap: 6 }}>
										{Array.from({ length: option.photo.itemCount }).map((_, itemIndex) => (
											<input
												key={`photo-${itemIndex}`}
												type="text"
												value={option.photo.labels[itemIndex] || ''}
												onChange={(e) => updateQuestionOption(index, (prev) => ({
													...prev,
													photo: {
														...prev.photo,
														labels: Array.from({ length: prev.photo.itemCount }, (_, i) => (i === itemIndex ? e.target.value : prev.photo.labels[i] || ''))
													}
												}))}
												placeholder={`라벨명 ${itemIndex + 1}`}
											/>
										))}
									</div>
								</td>
							</tr>
						</tbody>
					</table>
					</>
				)}

				{selectedTypes.includes('SENTENCE') && (
					<>
					{renderSectionTypeName('SENTENCE')}
					<table className="form-table">
						<tbody>
							<tr>
								<th style={{ width: 140 }}>입력 방식</th>
								<td colSpan={3}>
									<select
										value={option.sentence.inputMode}
										onChange={(e) => updateQuestionOption(index, (prev) => ({ ...prev, sentence: { ...prev.sentence, inputMode: e.target.value } }))}
									>
										<option value="SINGLE">단일 입력</option>
										<option value="MULTI">다중 입력</option>
									</select>
								</td>
							</tr>
							<tr>
								<th>문장 입력</th>
								<td colSpan={3}>
									<textarea
										value={option.sentence.sentenceText}
										onChange={(e) => updateQuestionOption(index, (prev) => ({ ...prev, sentence: { ...prev.sentence, sentenceText: e.target.value } }))}
										rows={3}
										placeholder="빈칸은 {빈칸} 형태로 입력"
									/>
								</td>
							</tr>
							{option.sentence.inputMode === 'MULTI' && (
								<tr>
									<th>문장 항목</th>
									<td colSpan={3}>
										<div style={{ display: 'grid', gap: 6 }}>
											{option.sentence.items.map((item, itemIndex) => (
												<div key={`sentence-${itemIndex}`} style={{ display: 'flex', gap: 6 }}>
													<input
														type="text"
														value={item}
														onChange={(e) => updateQuestionOptionList(index, 'sentence', itemIndex, e.target.value)}
														placeholder={`문장 항목 ${itemIndex + 1}`}
													/>
													<button
														type="button"
														className="admin-footer-btn-delete"
														onClick={() => deleteQuestionOptionListItem(index, 'sentence', itemIndex)}
														disabled={option.sentence.items.length <= 1}
													>
														삭제
													</button>
												</div>
											))}
											<div>
												<button type="button" className="admin-list-btn-sky" onClick={() => addQuestionOptionListItem(index, 'sentence')}>
													문장 항목 추가
												</button>
											</div>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
					</>
				)}
			</div>
		)
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
		setQuestionImageFiles((prev) => {
			const next = { ...prev }
			const current = next[index]
			next[index] = next[nextIndex]
			next[nextIndex] = current
			if (!next[index]) delete next[index]
			if (!next[nextIndex]) delete next[nextIndex]
			return next
		})
		setQuestionImageNames((prev) => {
			const next = { ...prev }
			const current = next[index]
			next[index] = next[nextIndex]
			next[nextIndex] = current
			if (!next[index]) delete next[index]
			if (!next[nextIndex]) delete next[nextIndex]
			return next
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
				showPopupError('삭제할 섹션을 선택하세요.')
				return
			}
		setForm((prev) => ({
			...prev,
			questions: prev.questions
				.filter((_, index) => !selectedQuestionIndexes.has(index))
				.map((question, index) => ({ ...question, sortSeq: index + 1 }))
		}))
		setQuestionImageFiles((prev) => {
			const next: Record<number, File> = {}
			let nextIndex = 0
			form.questions.forEach((_, index) => {
				if (selectedQuestionIndexes.has(index)) return
				if (prev[index]) next[nextIndex] = prev[index]
				nextIndex += 1
			})
			return next
		})
		setQuestionImageNames((prev) => {
			const next: Record<number, string> = {}
			let nextIndex = 0
			form.questions.forEach((_, index) => {
				if (selectedQuestionIndexes.has(index)) return
				if (prev[index]) next[nextIndex] = prev[index]
				nextIndex += 1
			})
			return next
		})
		setSelectedQuestionIndexes(new Set())
		setPopupError(null)
	}

	const saveContent = async () => {
		setPopupError(null)
		if (!form.cntnTypeCd) {
			showPopupError('콘텐츠 타입을 선택하세요.')
			return
		}
		if (!form.cntnTtl.trim()) {
			showPopupError('제목을 입력하세요.')
			return
		}
		if ((form.prvdTypeCd || 'IMAGE') === 'IMAGE' && !imageFile && !form.imgAtchFileId) {
			showPopupError('이미지 파일을 첨부하세요.')
			return
		}
		if (form.prvdTypeCd === 'VIDEO') {
			if (!form.videoUrlAddr.trim()) {
				showPopupError('영상 링크(url)를 입력하세요.')
				return
			}
			if (!videoThumbFile && !form.videoThmbAtchFileId) {
				showPopupError('영상 썸네일 파일을 첨부하세요.')
				return
			}
			if (!form.videoTtl.trim()) {
				showPopupError('영상 제목을 입력하세요.')
				return
			}
		}
		for (const question of form.questions) {
			if (parseQuestionTypes(question.qstnTypeCd).length === 0) {
				showPopupError('섹션분류를 선택하세요.')
				return
			}
			if (!question.qstnNm.trim()) {
				showPopupError('섹션명을 입력하세요.')
				return
			}
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const provideType = form.prvdTypeCd || 'IMAGE'
			const imageFiId = provideType === 'IMAGE' ? await uploadImage() : ''
			const videoThumbFiId = provideType === 'VIDEO' ? await uploadVideoThumb() : ''
			const questions = await Promise.all(form.questions.map(async (question, index) => {
				const isSelectType = parseQuestionTypes(question.qstnTypeCd).includes('SELECT')
				const questionImageFile = isSelectType ? questionImageFiles[index] : null
				const qstnImgAtchFileId = isSelectType
					? questionImageFile
						? await uploadSingleImage(questionImageFile, question.qstnImgAtchFileId || '')
						: question.qstnImgAtchFileId || ''
					: ''
				return { ...question, qstnImgAtchFileId, sortSeq: index + 1 }
			}))
			const isEdit = popupMode === 'edit' && form.cntnSn != null
			const body = {
				...form,
				prvdTypeCd: provideType,
				imgAtchFileId: imageFiId,
				videoUrlAddr: provideType === 'VIDEO' ? form.videoUrlAddr : '',
				videoThmbAtchFileId: videoThumbFiId,
				videoTtl: provideType === 'VIDEO' ? form.videoTtl : '',
				questions
			}
			const res = await fetch(
				isEdit
					? `${BACKEND}/api/admin/education-contents/${form.cntnSn}`
					: `${BACKEND}/api/admin/education-contents`,
				{
					method: isEdit ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				}
			)
			const result: ApiResponse<EducationContent> = await res.json()
			if (!result.success) {
				showPopupError(result.message || '저장에 실패했습니다.')
				return
			}
			setMessage(isEdit ? '콘텐츠가 수정되었습니다.' : '콘텐츠가 등록되었습니다.')
			closePopup()
			await fetchList(page, pageSize)
		} catch (e) {
			showPopupError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteContent = async (row: EducationContent) => {
		if (!row.cntnSn) return
		if (!window.confirm(`"${row.cntnTtl}" 콘텐츠를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/education-contents/${row.cntnSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('콘텐츠가 삭제되었습니다.')
			await fetchList(page, pageSize)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const bulkDeleteContents = async () => {
		const targets = Array.from(selectedIds)
		if (targets.length === 0) {
			setError('삭제할 콘텐츠를 선택하세요.')
			return
		}
		if (!window.confirm('선택한 콘텐츠를 삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			for (const cntnSn of targets) {
				const res = await fetch(`${BACKEND}/api/admin/education-contents/${cntnSn}`, {
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
			setMessage('선택한 콘텐츠를 삭제했습니다.')
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
		setSelectedIds(new Set(list.map((row) => row.cntnSn).filter((v): v is number => v != null)))
	}

	const toggleSelectRow = (cntnSn: number | null) => {
		if (!cntnSn) return
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(cntnSn)) next.delete(cntnSn)
			else next.add(cntnSn)
			return next
		})
	}

	return (
		<AdminLayout title="콘텐츠 관리">
			<CrudPageCard title="콘텐츠 관리" error={popupOpen ? null : error} message={message}>
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
							onClick={() => void bulkDeleteContents()}
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
						<select className="bbs-post-filter-select" value="cntnTtl" aria-label="검색 조건" disabled>
							<option value="cntnTtl">활동지 이름</option>
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
						<label className="bbs-post-filter-label">콘텐츠 타입</label>
						<select value={cntnTypeFilter} onChange={(e) => setCntnTypeFilter(e.target.value)} className="bbs-post-filter-select">
							<option value="">전체</option>
							{CONTENT_TYPE_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">카드 분류</label>
						<select value={cardClsfFilter} onChange={(e) => setCardClsfFilter(e.target.value)} className="bbs-post-filter-select">
							<option value="">전체</option>
							{CARD_CLASS_OPTIONS.filter((option) => option.value).map((option) => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">사용</label>
						<select value={useYnFilter} onChange={(e) => setUseYnFilter(e.target.value)} className="bbs-post-filter-select">
							<option value="">전체</option>
							<option value="Y">사용</option>
							<option value="N">미사용</option>
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
							<th style={{ width: 150 }}>콘텐츠 타입</th>
							<th style={{ width: 120 }}>카드분류</th>
							<th>제목</th>
							<th style={{ width: 110 }}>작성자</th>
							<th style={{ width: 120 }}>등록일</th>
							<th style={{ width: 80 }}>사용</th>
							<th style={{ width: 120 }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr key={row.cntnSn ?? row.cntnTtl} onClick={() => void openEditPopup(row.cntnSn)}>
								<td onClick={(e) => e.stopPropagation()}>
									<input
										type="checkbox"
										checked={row.cntnSn != null && selectedIds.has(row.cntnSn)}
										onChange={() => toggleSelectRow(row.cntnSn)}
										aria-label={`${row.cntnTtl} 선택`}
									/>
								</td>
								<td>{row.cntnSn}</td>
								<td>{row.cntnTypeNm || optionLabel(CONTENT_TYPE_OPTIONS, row.cntnTypeCd)}</td>
								<td>{row.cardClsfNm || optionLabel(CARD_CLASS_OPTIONS, row.cardClsfCd)}</td>
								<td style={{ textAlign: 'left' }}>{row.cntnTtl}</td>
								<td>{row.rgtr || '-'}</td>
								<td>{formatDate(row.regDt)}</td>
								<td>{renderUseBadge(row.useYn)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => void openEditPopup(row.cntnSn)}
										onDelete={() => void deleteContent(row)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={9} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
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
				title={popupMode === 'new' ? '콘텐츠 등록' : '콘텐츠 수정'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveContent()} disabled={loading}>
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
							<th>콘텐츠 타입 <span className="required">*</span></th>
							<td>
								<select value={form.cntnTypeCd} onChange={(e) => setForm({ ...form, cntnTypeCd: e.target.value })}>
									{CONTENT_TYPE_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>{option.label}</option>
									))}
								</select>
							</td>
							<th>카드분류</th>
							<td>
								<select value={form.cardClsfCd || ''} onChange={(e) => setForm({ ...form, cardClsfCd: e.target.value })}>
									{CARD_CLASS_OPTIONS.map((option) => (
										<option key={option.value || 'none'} value={option.value}>{option.label}</option>
									))}
								</select>
							</td>
						</tr>
						<tr>
							<th>제목 <span className="required">*</span></th>
							<td colSpan={3}>
								<input type="text" value={form.cntnTtl} onChange={(e) => setForm({ ...form, cntnTtl: e.target.value })} />
							</td>
						</tr>
						<tr>
							<th>내용 입력</th>
							<td colSpan={3}>
								<textarea value={form.cntnCn || ''} onChange={(e) => setForm({ ...form, cntnCn: e.target.value })} rows={5} />
							</td>
						</tr>
							<tr>
								<th>제공 형태</th>
								<td colSpan={3}>
									<label style={{ marginRight: 18 }}>
										<input
											type="radio"
											name="contentProvideType"
											checked={(form.prvdTypeCd || 'IMAGE') === 'IMAGE'}
											onChange={() => setForm({ ...form, prvdTypeCd: 'IMAGE' })}
										/> 이미지
									</label>
									<label>
										<input
											type="radio"
											name="contentProvideType"
											checked={form.prvdTypeCd === 'VIDEO'}
											onChange={() => setForm({ ...form, prvdTypeCd: 'VIDEO' })}
										/> 동영상
									</label>
								</td>
							</tr>
							{(form.prvdTypeCd || 'IMAGE') === 'IMAGE' && (
								<tr>
									<th>이미지 업로드</th>
									<td colSpan={3}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
											{imagePreviewUrl ? <img src={imagePreviewUrl} alt="" className="product-list-thumb" /> : null}
											<input
												ref={imageInputRef}
												type="file"
												accept="image/jpeg,image/png"
												style={{ display: 'none' }}
												onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
											/>
											<button type="button" className="admin-list-btn-sky" onClick={() => imageInputRef.current?.click()}>
												파일 첨부
											</button>
											<span className="muted">{imageDisplayName || '첨부파일 없음'}</span>
										</div>
									</td>
								</tr>
							)}
							{form.prvdTypeCd === 'VIDEO' && (
								<>
									<tr>
										<th>영상 링크 (url)</th>
										<td colSpan={3}>
											<input
												type="text"
												value={form.videoUrlAddr || ''}
												onChange={(e) => setForm({ ...form, videoUrlAddr: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>영상 썸네일</th>
										<td colSpan={3}>
											<div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
												{videoThumbPreviewUrl ? <img src={videoThumbPreviewUrl} alt="" className="product-list-thumb" /> : null}
												<input
													ref={videoThumbInputRef}
													type="file"
													accept="image/jpeg,image/png"
													style={{ display: 'none' }}
													onChange={(e) => handleVideoThumbChange(e.target.files?.[0] ?? null)}
												/>
												<button type="button" className="admin-list-btn-sky" onClick={() => videoThumbInputRef.current?.click()}>
													파일 첨부
												</button>
												<span className="muted">{videoThumbDisplayName || '첨부파일 없음'}</span>
											</div>
										</td>
									</tr>
									<tr>
										<th>영상 제목</th>
										<td colSpan={3}>
											<input type="text" value={form.videoTtl || ''} onChange={(e) => setForm({ ...form, videoTtl: e.target.value })} />
										</td>
									</tr>
								</>
							)}
							<tr>
								<th>콘텐츠 사용 여부</th>
								<td colSpan={3}>
									<label style={{ marginRight: 18 }}>
										<input
											type="radio"
											name="contentUseYn"
											checked={form.useYn === 'Y'}
											onChange={() => setForm({ ...form, useYn: 'Y' })}
										/> 사용
									</label>
									<label>
										<input
											type="radio"
											name="contentUseYn"
											checked={form.useYn !== 'Y'}
											onChange={() => setForm({ ...form, useYn: 'N' })}
										/> 미사용
									</label>
								</td>
							</tr>
							<tr>
								<th>섹션 관리</th>
								<td colSpan={3}>
									<div className="list-toolbar" style={{ marginBottom: 8 }}>
										<div className="list-toolbar-left">
											<span className="muted">섹션분류를 체크하면 한 섹션 안에 여러 활동 입력 묶음을 조합할 수 있습니다.</span>
										</div>
										<div className="list-toolbar-actions">
											<button
												type="button"
												className="admin-footer-btn-delete"
												onClick={deleteSelectedQuestions}
												disabled={selectedQuestionIndexes.size === 0}
											>
												선택삭제
											</button>
											<button type="button" className="admin-list-btn-sky" onClick={addQuestion}>
												섹션 추가
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
														aria-label="섹션 전체 선택"
													/>
												</th>
												<th style={{ width: 90 }}>순서변경</th>
												<th style={{ width: 420 }}>섹션분류</th>
												<th style={{ width: 220 }}>섹션명</th>
											</tr>
										</thead>
										<tbody>
											{form.questions.map((question, index) => (
												<React.Fragment key={`${question.cntnQstnSn ?? 'new'}-${index}`}>
													<tr>
														<td>
															<input
																type="checkbox"
																checked={selectedQuestionIndexes.has(index)}
																onChange={() => toggleQuestionSelect(index)}
																aria-label={`${index + 1}번 섹션 선택`}
															/>
														</td>
														<td>
															<div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
																<button type="button" className="admin-list-btn-edit" disabled={index === 0} onClick={() => moveQuestion(index, -1)}>↑</button>
																<button type="button" className="admin-list-btn-edit" disabled={index === form.questions.length - 1} onClick={() => moveQuestion(index, 1)}>↓</button>
															</div>
														</td>
														<td>
															<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, textAlign: 'left' }}>
																{QUESTION_TYPE_OPTIONS.map((option) => (
																	<label key={option.value}>
																		<input
																			type="checkbox"
																			checked={parseQuestionTypes(question.qstnTypeCd).includes(option.value)}
																			onChange={() => toggleQuestionType(index, option.value)}
																		/> {option.label}
																	</label>
																))}
															</div>
														</td>
														<td>
															<input type="text" value={question.qstnNm} onChange={(e) => updateQuestion(index, { qstnNm: e.target.value })} />
														</td>
													</tr>
													<tr>
														<td />
														<td colSpan={3} style={{ textAlign: 'left', background: '#fff' }}>
															{renderQuestionDetailEditor(question, index)}
														</td>
													</tr>
												</React.Fragment>
											))}
											{form.questions.length === 0 && (
												<tr>
													<td colSpan={4} style={{ textAlign: 'center' }}>등록된 섹션이 없습니다.</td>
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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { API_BASE_URL, adminFileDownloadUrl, resolveBackendUrl } from '../config'
import { BbsPostListBasicTemplate } from './bbs-post-templates/BbsPostListBasicTemplate'
import { BbsPostListCardTemplate } from './bbs-post-templates/BbsPostListCardTemplate'
import { BbsPostListThumbTemplate } from './bbs-post-templates/BbsPostListThumbTemplate'
import { summernoteOnEnterKeydown } from '../utils/summernoteCallbacks'

const SUMMERNOTE_ID = 'bbs-post-content'

/** Summernote/jQuery 사용을 위한 타입 (CDN 로드, @types/jquery 미사용) */
type JqLike = (sel: string | HTMLElement) => { length: number; summernote: (a: string | object, b?: string, c?: string) => unknown }

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type BbsPostDto = {
	bbsId: string
	pstSn: string
	pstTtl: string
	pstCn: string
	wrtrNm: string
	wrtrId: string
	nttSeq: number
	category: string
	ntcYn: string
	upendFixYn: string
	lckYn: string
	lnkgUrlAddr: string
	pstgYmd: string
	thumFileId?: string
	thmbFileId?: string
	atchFileMngNo?: string
	useYn: string
	inqCnt: number
	regDt: string
	etc1?: string
	etc2?: string
	etc3?: string
	etc4?: string
	etc5?: string
	ansSttsCd?: string
	ansCn?: string
	answrNm?: string
	answrId?: string
	ansYmd?: string
	ansDt?: string
}

type CodeDetailRow = {
	code: string
	cdDtlNm: string
	seq?: number | null
}

const NOTICE_LEARNING_TYPE_OPTIONS: CodeDetailRow[] = [
	{ code: '사전학습', cdDtlNm: '사전학습' },
	{ code: '본학습', cdDtlNm: '본학습' },
	{ code: '사후학습', cdDtlNm: '사후학습' }
]

type EtcIdx = 1 | 2 | 3 | 4 | 5
type NttEtcKey = 'etc1' | 'etc2' | 'etc3' | 'etc4' | 'etc5'

const ETC_CODE_TYPES = ['select', 'radio', 'checkbox'] as const

function getMasterEtc(m: Record<string, string | undefined> | null, idx: EtcIdx, key: 'Yn' | 'Nm' | 'Tp' | 'Cd'): string {
	if (!m) return ''
	const v = m[`etc${idx}${key}`]
	return v == null ? '' : String(v)
}

function bbsMasterIsY(m: Record<string, string | undefined> | null, key: string): boolean {
	if (!m) return false
	const v = m[key]
	return (v || '').toUpperCase() === 'Y'
}

function getExplicitThumbnailId(row: Partial<BbsPostDto>): string {
	return ((row.thumFileId || row.thmbFileId || '') as string).trim()
}

function getListThumbnailId(row: Partial<BbsPostDto>): string {
	return getExplicitThumbnailId(row) || ((row.atchFileMngNo || '') as string).trim()
}

function normalizeBbsMasterForPost(raw: Record<string, string | undefined>): Record<string, string | undefined> {
	return {
		...raw,
		thumYn: raw.thumYn ?? raw.thmbYn,
		topYn: raw.topYn ?? raw.upendFixYn,
		cateYn: raw.cateYn ?? raw.ctgrYn,
		cateCd: raw.cateCd ?? raw.ctgrCdId,
		linkYn: raw.linkYn ?? raw.lnkgYn,
		lockYn: raw.lockYn ?? raw.lckYn,
		fileCnt: raw.fileCnt ?? raw.atchFileCnt,
		fileSize: raw.fileSize ?? raw.atchFileSz,
		etc1Yn: raw.etc1Yn ?? raw.etc1UseYn,
		etc1Tp: raw.etc1Tp ?? raw.etc1TypeCd,
		etc1Cd: raw.etc1Cd ?? raw.etc1CdId,
		etc2Yn: raw.etc2Yn ?? raw.etc2UseYn,
		etc2Tp: raw.etc2Tp ?? raw.etc2TypeCd,
		etc2Cd: raw.etc2Cd ?? raw.etc2CdId,
		etc3Yn: raw.etc3Yn ?? raw.etc3UseYn,
		etc3Tp: raw.etc3Tp ?? raw.etc3TypeCd,
		etc3Cd: raw.etc3Cd ?? raw.etc3CdId,
		etc4Yn: raw.etc4Yn ?? raw.etc4UseYn,
		etc4Tp: raw.etc4Tp ?? raw.etc4TypeCd,
		etc4Cd: raw.etc4Cd ?? raw.etc4CdId,
		etc5Yn: raw.etc5Yn ?? raw.etc5UseYn,
		etc5Tp: raw.etc5Tp ?? raw.etc5TypeCd,
		etc5Cd: raw.etc5Cd ?? raw.etc5CdId
	}
}

function parseEtcCsv(s: string): string[] {
	return (s || '')
		.split(',')
		.map((x) => x.trim())
		.filter(Boolean)
}

function toggleEtcCsv(s: string, code: string): string {
	const set = new Set(parseEtcCsv(s))
	if (set.has(code)) set.delete(code)
	else set.add(code)
	return [...set].join(',')
}

type ListResponse = {
	posts: BbsPostDto[]
	totalCount: number
	page: number
	size: number
	totalPages: number
}

type SessionInfo = {
	valid: boolean
	adminId: string
	adminName: string
}

type UploadInfo = {
	fileUrl?: string
	fileOriginName?: string
}

type AttachFileInfoRow = {
	fiId: string
	fiSn?: string
	fileUrl?: string
	fileOriginName?: string
}

const BACKEND = API_BASE_URL
const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

const defaultForm: Partial<BbsPostDto> = {
	pstTtl: '',
	pstCn: '',
	wrtrNm: '',
	wrtrId: '',
	nttSeq: 0,
	category: '',
	ntcYn: 'N',
	upendFixYn: 'N',
	lckYn: 'N',
	lnkgUrlAddr: '',
	pstgYmd: '',
	useYn: 'Y',
	etc1: '',
	etc2: '',
	etc3: '',
	etc4: '',
	etc5: '',
	ansSttsCd: 'WAIT',
	ansCn: '',
	answrNm: '',
	answrId: '',
	ansYmd: ''
}

/** 게시판 마스터 상세와 동일한 Y/N 토글 (라벨만 필드에 맞게) */
const renderYnToggle = (
	name: string,
	value: string,
	onChange: (next: string) => void,
	labelOn: string,
	labelOff: string
) => (
	<button
		type="button"
		name={name}
		className={`yn-toggle ${value === 'Y' ? 'is-on' : 'is-off'}`}
		onClick={() => onChange(value === 'Y' ? 'N' : 'Y')}
		aria-pressed={value === 'Y'}
	>
		<span className="yn-toggle-label">{value === 'Y' ? labelOn : labelOff}</span>
		<span className="yn-toggle-knob" aria-hidden="true" />
	</button>
)

export const BbsPostPage: React.FC = () => {
	const { bbsId } = useParams<{ bbsId: string }>()
	const navigate = useNavigate()
	const [list, setList] = useState<BbsPostDto[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
	const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(() => new Set())
	const [bbsName, setBbsName] = useState('')
	const [searchType, setSearchType] = useState<string>('title')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [searchCategory, setSearchCategory] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [form, setForm] = useState<Partial<BbsPostDto>>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const postFormRef = useRef<HTMLFormElement | null>(null)
	const initialContentRef = useRef<string>('')
	const postContentRef = useRef<string>('')
	const [bbsMaster, setBbsMaster] = useState<Record<string, string | undefined> | null>(null)
	const [etcCodeOptions, setEtcCodeOptions] = useState<Record<string, CodeDetailRow[]>>({})
	const [thumFile, setThumFile] = useState<File | null>(null)
	const [thumPreviewUrl, setThumPreviewUrl] = useState('')
	const [thumDisplayName, setThumDisplayName] = useState('')
	const thumInputRef = useRef<HTMLInputElement>(null)
	const thumObjectUrlRef = useRef<string | null>(null)
	const [attachFiles, setAttachFiles] = useState<File[]>([])
	const [attachFileInfos, setAttachFileInfos] = useState<AttachFileInfoRow[]>([])
	const attachInputRef = useRef<HTMLInputElement>(null)
	const [listThumbMap, setListThumbMap] = useState<Record<string, string>>({})
	const sessionAuthorRef = useRef<{ adminId: string; adminName: string }>({ adminId: '', adminName: '' })
	const skinTemplateKey = (bbsMaster?.bbsSkinCd || '').trim().toUpperCase()
	const currentBbsId = (bbsId || '').trim().toUpperCase()
	const isFaqBoard = currentBbsId === 'FAQ01'
	const isGalleryBoard = currentBbsId === 'GALRY'
	const isQnaBoard = currentBbsId === 'QNA01'
	const isNoticeBoard = currentBbsId === 'ZEHSB'
	const categoryFieldLabel = isNoticeBoard ? '학습 유형' : isFaqBoard ? 'FAQ 분류' : isGalleryBoard ? '구분' : '카테고리'
	const titleFieldLabel = isFaqBoard ? '질문' : isQnaBoard ? '문의제목' : '제목'
	const contentFieldLabel = isFaqBoard ? '답변' : isQnaBoard ? '문의내용' : '내용'
	const linkFieldLabel = isGalleryBoard ? '영상 임베드 링크' : '링크'
	const attachFieldLabel = isGalleryBoard ? '첨부파일(이미지)' : '첨부파일'

	const getPostFormValue = (formData: FormData, name: string, fallback = '') => {
		const value = formData.get(name)
		return typeof value === 'string' ? value : fallback
	}

	const getLiveFormValue = (name: string, fallback = '', formElement = postFormRef.current) => {
		const field = formElement?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
			`[name="${name}"]`
		)
		return field ? field.value : fallback
	}

	const getVisibleDocumentValue = (name: string, fallback = '') => {
		const fields = Array.from(
			document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${name}"]`)
		)
		const visibleField = fields.find((field) => !field.disabled && field.offsetParent !== null)
		return visibleField ? visibleField.value : fields.at(-1)?.value ?? fallback
	}

	const buildBbsPostRequestBody = (source: Partial<BbsPostDto> & { bbsId: string; pstCn: string }) => {
		const body = { ...source } as Record<string, unknown>
		const text = (value: unknown) => (value == null ? '' : String(value))
		const numberValue = (value: unknown, fallback = 0) => {
			const n = Number(value)
			return Number.isFinite(n) ? n : fallback
		}

		body.postId = body.pstSn ?? body.postId ?? ''
		body.pstTtl = text(body.pstTtl ?? body.nttSj)
		body.nttSj = body.pstTtl
		body.pstCn = text(body.pstCn ?? body.nttCn)
		body.nttCn = body.pstCn
		body.wrtrNm = text(body.wrtrNm ?? body.nttNm)
		body.nttNm = body.wrtrNm
		body.wrtrId = text(body.wrtrId ?? body.nttId)
		body.nttId = body.wrtrId
		body.sortSeq = numberValue(body.sortSeq ?? body.nttSeq)
		body.nttSeq = body.sortSeq
		body.ctgrCd = text(body.category !== undefined ? body.category : body.ctgrCd)
		body.category = body.ctgrCd
		body.nttLink = text(body.lnkgUrlAddr ?? body.nttLink)
		body.lnkgUrlAddr = body.nttLink
		body.nttRegdt = text(body.pstgYmd ?? body.nttRegdt)
		body.pstgYmd = body.nttRegdt
		body.thmbFileId = text(body.thmbFileId ?? body.thumFileId)
		body.thumFileId = body.thmbFileId
		body.vodFileId = text(body.vodFileId ?? body.vdoFileId)
		body.vdoFileId = body.vodFileId
		;([1, 2, 3, 4, 5] as const).forEach((idx) => {
			const canonical = `etc${idx}`
			const alias = `nttEtc${idx}`
			body[canonical] = text(body[canonical] ?? body[alias])
			body[alias] = body[canonical]
		})

		return body
	}

	const getCurrentPostForm = (formElement = postFormRef.current): Partial<BbsPostDto> => {
		if (!formElement) return form
		const formData = new FormData(formElement)
		const pstTtl = getLiveFormValue('pstTtl', getPostFormValue(formData, 'pstTtl', form.pstTtl ?? ''), formElement)
		const current: Partial<BbsPostDto> = {
			...form,
			pstTtl: getVisibleDocumentValue('pstTtl', pstTtl),
			useYn: getLiveFormValue('useYn', getPostFormValue(formData, 'useYn', form.useYn ?? 'Y'), formElement),
			pstgYmd: getLiveFormValue('pstgYmd', getPostFormValue(formData, 'pstgYmd', form.pstgYmd ?? ''), formElement),
			category: getLiveFormValue('category', getPostFormValue(formData, 'category', form.category ?? ''), formElement),
			upendFixYn: getLiveFormValue('upendFixYn', getPostFormValue(formData, 'upendFixYn', form.upendFixYn ?? 'N'), formElement),
			lckYn: getLiveFormValue('lckYn', getPostFormValue(formData, 'lckYn', form.lckYn ?? 'N'), formElement),
			lnkgUrlAddr: getLiveFormValue('lnkgUrlAddr', getPostFormValue(formData, 'lnkgUrlAddr', form.lnkgUrlAddr ?? ''), formElement),
			ansSttsCd: getLiveFormValue('ansSttsCd', getPostFormValue(formData, 'ansSttsCd', form.ansSttsCd ?? 'WAIT'), formElement),
			ansYmd: getLiveFormValue('ansYmd', getPostFormValue(formData, 'ansYmd', form.ansYmd ?? ''), formElement),
			ansCn: getLiveFormValue('ansCn', getPostFormValue(formData, 'ansCn', form.ansCn ?? ''), formElement),
			wrtrNm: getLiveFormValue('wrtrNm', getPostFormValue(formData, 'wrtrNm', form.wrtrNm ?? ''), formElement),
			wrtrId: getLiveFormValue('wrtrId', getPostFormValue(formData, 'wrtrId', form.wrtrId ?? ''), formElement)
		}
		;([1, 2, 3, 4, 5] as const).forEach((idx) => {
			const field = `etc${idx}` as NttEtcKey
			const values = formData
				.getAll(field)
				.map((value) => (typeof value === 'string' ? value : ''))
				.filter(Boolean)
			current[field] = values.length > 1 ? values.join(',') : values[0] ?? form[field] ?? ''
		})
		return current
	}

	const getCurrentPostContent = (fallback = '') => {
		if (isQnaBoard) return fallback
		const w = typeof window !== 'undefined' ? (window as unknown as { jQuery?: JqLike; $?: JqLike }) : null
		const $: JqLike | undefined = w ? (w.jQuery ?? w.$) : undefined
		if ($) {
			try {
				const code = $('#' + SUMMERNOTE_ID).summernote('code')
				if (typeof code === 'string') return code
			} catch {
				// fall through to DOM/ref fallback
			}
		}
		const editable = document
			.getElementById(SUMMERNOTE_ID)
			?.parentElement
			?.querySelector<HTMLElement>('.note-editable')
		if (editable) return editable.innerHTML
		const textarea = document.getElementById(SUMMERNOTE_ID) as HTMLTextAreaElement | null
		return textarea?.value || postContentRef.current || fallback
	}

	useEffect(() => {
		if (!message) return
		const timer = window.setTimeout(() => {
			setMessage(null)
		}, 3000)
		return () => window.clearTimeout(timer)
	}, [message])

	useEffect(() => {
		let cancelled = false
		void fetch(`${BACKEND}/api/admin/auth/session`, { credentials: 'include' })
			.then((r) => r.json())
			.then((j: ApiResponse<SessionInfo>) => {
				if (cancelled || !j.success || !j.data) return
				const d = j.data
				if (d.valid && d.adminId) {
					sessionAuthorRef.current = {
						adminId: d.adminId,
						adminName: (d.adminName || '').trim()
					}
				}
			})
			.catch(() => {
				// ignore
			})
		return () => {
			cancelled = true
		}
	}, [])

	const fetchBbsMasterForPost = useCallback(async (id: string) => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/bbs-master/${encodeURIComponent(id)}`, {
				credentials: 'include'
			})
			const result: ApiResponse<Record<string, unknown>> = await res.json()
			if (result.success && result.data) {
				const mapped: Record<string, string | undefined> = {}
				for (const [k, v] of Object.entries(result.data)) {
					mapped[k] = v == null ? undefined : String(v)
				}
				setBbsMaster(normalizeBbsMasterForPost(mapped))
				setBbsName(mapped.bbsNm || id)
			} else {
				setBbsMaster(null)
				setBbsName(id)
			}
		} catch {
			setBbsMaster(null)
			setBbsName(id)
		}
	}, [])

	const fetchList = useCallback(async () => {
		if (!bbsId) return
		setError(null)
		try {
			const params = new URLSearchParams()
			params.set('page', String(page))
			params.set('size', String(pageSize))
			if (searchKeyword.trim()) {
				params.set('searchType', searchType)
				params.set('searchKeyword', searchKeyword.trim())
			}
			if (searchCategory.trim()) {
				params.set('category', searchCategory.trim())
			}
			if (startDate) params.set('startDate', startDate)
			if (endDate) params.set('endDate', endDate)
			const res = await fetch(
				`${BACKEND}/api/admin/bbs-post/${encodeURIComponent(bbsId)}?${params.toString()}`,
				{ credentials: 'include' }
			)
			const result: ApiResponse<ListResponse> = await res.json()
			if (!result.success) {
				setError(result.message || '목록 조회에 실패했습니다.')
				return
			}
			const data = result.data as ListResponse
			setList(data.posts ?? [])
			setTotalCount(data.totalCount ?? 0)
		} catch {
			setError('게시글 목록 조회 중 오류가 발생했습니다.')
		}
	}, [bbsId, page, pageSize, searchType, searchKeyword, searchCategory, startDate, endDate])

	useEffect(() => {
		setSelectedPostIds(new Set())
	}, [bbsId, page, pageSize])

	useEffect(() => {
		if (bbsId) {
			fetchBbsMasterForPost(bbsId)
			fetchList()
		}
	}, [bbsId, fetchBbsMasterForPost, fetchList])

	useEffect(() => {
		if (!bbsMaster) return
		const codeIds = new Set<string>()
		for (const idx of [1, 2, 3, 4, 5] as const) {
			const yn = getMasterEtc(bbsMaster, idx, 'Yn')
			const tp = getMasterEtc(bbsMaster, idx, 'Tp').toLowerCase()
			const cd = getMasterEtc(bbsMaster, idx, 'Cd').trim()
			if (yn === 'Y' && (ETC_CODE_TYPES as readonly string[]).includes(tp) && cd) {
				codeIds.add(cd)
			}
		}
		if (bbsMasterIsY(bbsMaster, 'cateYn')) {
			const ccd = (bbsMaster.cateCd || '').trim()
			if (ccd) codeIds.add(ccd)
		}
		if (codeIds.size === 0) return
		let cancelled = false
		void (async () => {
			const updates: Record<string, CodeDetailRow[]> = {}
			for (const cdId of codeIds) {
				try {
					const res = await fetch(
						`${BACKEND}/api/admin/codes/detail?cdId=${encodeURIComponent(cdId)}&useYn=Y`,
						{ credentials: 'include' }
					)
					const result: ApiResponse<CodeDetailRow[]> = await res.json()
					if (result.success && result.data?.length) {
						updates[cdId] = [...result.data].sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
					}
				} catch {
					// ignore
				}
			}
			if (!cancelled && Object.keys(updates).length > 0) {
				setEtcCodeOptions((prev) => ({ ...prev, ...updates }))
			}
		})()
		return () => {
			cancelled = true
		}
	}, [bbsMaster])

	const showCateInList = isNoticeBoard || bbsMasterIsY(bbsMaster, 'cateYn')
	const showThumInList = bbsMasterIsY(bbsMaster, 'thumYn')
	const showTopInList = bbsMasterIsY(bbsMaster, 'topYn')
	const getCategoryLabel = (code: string | undefined): string => {
		const c = (code || '').trim()
		if (!c) return '-'
		const cdId = (bbsMaster?.cateCd || '').trim()
		if (!cdId) return c
		const match = (etcCodeOptions[cdId] || []).find((o) => o.code === c)
		return match?.cdDtlNm || c
	}
	const getCategoryOptions = (): CodeDetailRow[] => {
		if (isNoticeBoard) return NOTICE_LEARNING_TYPE_OPTIONS
		const cdId = (bbsMaster?.cateCd || '').trim()
		return cdId ? etcCodeOptions[cdId] ?? [] : []
	}

	useEffect(() => {
		const thumbnailId = getExplicitThumbnailId(form)
		if (!popupOpen || !bbsMasterIsY(bbsMaster, 'thumYn') || !thumbnailId || thumFile) {
			return
		}
		let cancelled = false
		void fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(thumbnailId)}`, { credentials: 'include' })
			.then((r) => r.json())
			.then((j: ApiResponse<UploadInfo>) => {
				if (cancelled || !j.success || !j.data?.fileUrl) return
				setThumPreviewUrl(resolveBackendUrl(j.data.fileUrl))
				setThumDisplayName(j.data.fileOriginName || '')
			})
			.catch(() => {
				// ignore
			})
		return () => {
			cancelled = true
		}
	}, [popupOpen, bbsMaster, form.thumFileId, form.thmbFileId, thumFile])

	const loadAttachFileInfos = useCallback(async (fiId: string) => {
		const id = (fiId || '').trim()
		if (!id) {
			setAttachFileInfos([])
			return
		}
		try {
			const res = await fetch(`${BACKEND}/api/admin/upload/infos/${encodeURIComponent(id)}`, {
				credentials: 'include'
			})
			const r: ApiResponse<AttachFileInfoRow[]> = await res.json()
			if (!r.success || !Array.isArray(r.data)) {
				setAttachFileInfos([])
				return
			}
			setAttachFileInfos(r.data)
		} catch {
			setAttachFileInfos([])
		}
	}, [])

	useEffect(() => {
		if (!popupOpen || !bbsMasterIsY(bbsMaster, 'atchFileYn')) {
			return
		}
		void loadAttachFileInfos(form.atchFileMngNo ?? '')
	}, [popupOpen, bbsMaster, form.atchFileMngNo, loadAttachFileInfos])

	const revokeThumObjectUrl = () => {
		if (thumObjectUrlRef.current) {
			URL.revokeObjectURL(thumObjectUrlRef.current)
			thumObjectUrlRef.current = null
		}
	}

	useEffect(() => {
		if (!showThumInList || list.length === 0) {
			setListThumbMap({})
			return
		}
		const ids = [...new Set(list.map((row) => getListThumbnailId(row)).filter(Boolean))]
		if (ids.length === 0) {
			setListThumbMap({})
			return
		}
		let cancelled = false
		void (async () => {
			const entries = await Promise.all(
				ids.map(async (fiId) => {
					try {
						const r = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, {
							credentials: 'include'
						})
						const j: ApiResponse<UploadInfo> = await r.json()
						return [fiId, j.success ? resolveBackendUrl(j.data?.fileUrl || '') : ''] as const
					} catch {
						return [fiId, ''] as const
					}
				})
			)
			if (cancelled) return
			const map: Record<string, string> = {}
			for (const [fiId, fileUrl] of entries) {
				if (fileUrl) map[fiId] = fileUrl
			}
			setListThumbMap(map)
		})()
		return () => {
			cancelled = true
		}
	}, [showThumInList, list])

	const openNewPopup = () => {
		const applyNewForm = () => {
			const { adminId, adminName } = sessionAuthorRef.current
			setForm({
				...defaultForm,
				bbsId,
				wrtrNm: adminName,
				wrtrId: adminId,
				pstgYmd: new Date().toISOString().slice(0, 10),
				etc1: '',
				etc2: '',
				etc3: '',
				etc4: '',
				etc5: '',
				ansSttsCd: 'WAIT',
				ansCn: '',
				answrNm: '',
				answrId: '',
				ansYmd: ''
			})
			revokeThumObjectUrl()
			setThumFile(null)
			setThumPreviewUrl('')
			setThumDisplayName('')
			setAttachFiles([])
			setAttachFileInfos([])
			if (thumInputRef.current) thumInputRef.current.value = ''
			if (attachInputRef.current) attachInputRef.current.value = ''
			setPopupMode('new')
			setPopupOpen(true)
		}
		if (sessionAuthorRef.current.adminId) {
			applyNewForm()
			return
		}
		void fetch(`${BACKEND}/api/admin/auth/session`, { credentials: 'include' })
			.then((r) => r.json())
			.then((j: ApiResponse<SessionInfo>) => {
				if (j.success && j.data?.valid && j.data.adminId) {
					sessionAuthorRef.current = {
						adminId: j.data.adminId,
						adminName: (j.data.adminName || '').trim()
					}
				}
			})
			.catch(() => {
				// ignore
			})
			.finally(() => {
				applyNewForm()
			})
	}
	const openEditPopup = (row: BbsPostDto) => {
		setForm({
			...row,
			pstgYmd: row.pstgYmd || '',
			etc1: row.etc1 ?? '',
			etc2: row.etc2 ?? '',
			etc3: row.etc3 ?? '',
			etc4: row.etc4 ?? '',
			etc5: row.etc5 ?? '',
			ansSttsCd: row.ansSttsCd ?? 'WAIT',
			ansCn: row.ansCn ?? '',
			answrNm: row.answrNm ?? '',
			answrId: row.answrId ?? '',
			ansYmd: row.ansYmd || new Date().toISOString().slice(0, 10)
		})
		setThumFile(null)
		setThumPreviewUrl('')
		setThumDisplayName('')
		setAttachFiles([])
		if (thumInputRef.current) thumInputRef.current.value = ''
		if (attachInputRef.current) attachInputRef.current.value = ''
		setPopupMode('edit')
		setPopupOpen(true)
	}
	const closePopup = () => {
		setPopupOpen(false)
		setError(null)
		revokeThumObjectUrl()
		setThumFile(null)
		setThumPreviewUrl('')
		setThumDisplayName('')
		setAttachFiles([])
		setAttachFileInfos([])
		if (thumInputRef.current) thumInputRef.current.value = ''
		if (attachInputRef.current) attachInputRef.current.value = ''
	}

	const clearThumImage = () => {
		revokeThumObjectUrl()
		setThumFile(null)
		setThumPreviewUrl('')
		setThumDisplayName('')
		setForm((prev) => ({ ...prev, thumFileId: '', thmbFileId: '' }))
		if (thumInputRef.current) thumInputRef.current.value = ''
	}

	const handleThumFileSelected = (file: File | null) => {
		if (!file) return
		revokeThumObjectUrl()
		thumObjectUrlRef.current = URL.createObjectURL(file)
		setThumPreviewUrl(thumObjectUrlRef.current)
		setThumDisplayName(file.name)
		setThumFile(file)
		setError(null)
		if (thumInputRef.current) thumInputRef.current.value = ''
	}

	const resetAllAttachments = () => {
		setAttachFiles([])
		setAttachFileInfos([])
		setForm((prev) => ({ ...prev, atchFileMngNo: '' }))
		if (attachInputRef.current) attachInputRef.current.value = ''
	}

	const handleRemovePendingAttach = (index: number) => {
		setAttachFiles((prev) => prev.filter((_, i) => i !== index))
	}

	const handleDeleteSavedAttach = async (fileInfo: AttachFileInfoRow) => {
		if (!fileInfo.fiId || fileInfo.fiSn == null || fileInfo.fiSn === '') return
		if (!window.confirm('해당 첨부파일을 삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(
				`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fileInfo.fiId)}/${encodeURIComponent(fileInfo.fiSn)}`,
				{ method: 'DELETE', credentials: 'include' }
			)
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '첨부파일 삭제에 실패했습니다.')
				return
			}
			const next = attachFileInfos.filter(
				(it) => !(it.fiId === fileInfo.fiId && String(it.fiSn) === String(fileInfo.fiSn))
			)
			setAttachFileInfos(next)
			if (next.length === 0 && attachFiles.length === 0) {
				setForm((prev) => ({ ...prev, atchFileMngNo: '' }))
			}
		} catch {
			setError('첨부파일 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const uploadAttachFileToFiId = async (file: File, fiId?: string): Promise<string> => {
		const fd = new FormData()
		fd.append('file', file)
		fd.append('menuType', 'bbs_attach')
		if (bbsId) fd.append('menuId', bbsId)
		if (fiId?.trim()) fd.append('fiId', fiId.trim())
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

	const maxAttachBytes = useMemo(() => {
		const raw = bbsMaster?.fileSize?.trim()
		if (!raw) return 0
		const n = Number(raw)
		return Number.isFinite(n) && n > 0 ? n : 0
	}, [bbsMaster?.fileSize])

	const maxAttachMbLabel = useMemo(() => {
		if (maxAttachBytes <= 0) return ''
		const mb = maxAttachBytes / (1024 * 1024)
		return mb >= 1 ? `${Math.round(mb)}MB` : `${Math.round((maxAttachBytes / 1024) * 10) / 10}KB`
	}, [maxAttachBytes])

	const maxAttachCount = useMemo(() => {
		const raw = bbsMaster?.fileCnt?.trim()
		const n = Number(raw)
		return Number.isFinite(n) && n > 0 ? n : 0
	}, [bbsMaster?.fileCnt])

	const handleAttachFilesSelected = (files: File[]) => {
		if (files.length === 0) return
		const current = attachFileInfos.length + attachFiles.length
		if (maxAttachCount > 0 && current + files.length > maxAttachCount) {
			setError(`첨부파일은 최대 ${maxAttachCount}개까지 등록할 수 있습니다.`)
			return
		}
		for (const file of files) {
			if (maxAttachBytes > 0 && file.size > maxAttachBytes) {
				setError(
					maxAttachMbLabel
						? `첨부파일은 개당 ${maxAttachMbLabel} 이하여야 합니다.`
						: '첨부파일 용량 제한을 초과했습니다.'
				)
				return
			}
		}
		setError(null)
		setAttachFiles((prev) => [...prev, ...files])
	}

	// Summernote (lesec와 동일): 팝업 열릴 때 생성, 닫을 때 제거
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
		postContentRef.current = form.pstCn ?? ''
		const t = setTimeout(() => {
			if (typeof window === 'undefined' || !$) return
			const el = document.getElementById(SUMMERNOTE_ID)
			if (!el) return
			const initial = initialContentRef.current
			const $el = $(el)
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
					onChange: function (contents: string) {
						postContentRef.current = contents
						setForm((prev) => ({ ...prev, pstCn: contents }))
					},
					onImageUpload: function (files: FileList | File[]) {
						const fileList = Array.isArray(files) ? files : Array.from(files)
						for (let i = 0; i < fileList.length; i++) {
							const file = fileList[i]
							const formData = new FormData()
							formData.append('file', file)
							formData.append('menuType', 'bbs')
							if (bbsId) formData.append('menuId', bbsId)
							fetch(`${BACKEND}/api/admin/upload/image`, {
								method: 'POST',
								body: formData,
								credentials: 'include'
							})
								.then((res) => res.json())
								.then((result: { success?: boolean; data?: { url?: string }; message?: string }) => {
									if (result.success && result.data?.url) {
										// 도메인 제외 경로만 저장 (사용자페이지 등 동일 이미지 노출용)
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

	const handleSave = async (formElement = postFormRef.current) => {
		if (!bbsId) return
		const currentForm = getCurrentPostForm(formElement)
		setForm(currentForm)
		if (!currentForm.pstTtl?.trim()) {
			setError('제목을 입력하세요.')
			return
		}
		if (isNoticeBoard && !currentForm.category?.trim()) {
			setError('학습 유형을 선택하세요.')
			return
		}
		let pstCn = getCurrentPostContent(currentForm.pstCn ?? '')
		// img src에서 도메인 제거 → /uploads/... 만 저장 (사용자페이지 공통 노출용)
		pstCn = (pstCn || '').replace(/src="(https?:\/\/[^"]*)(\/uploads\/[^"]+)"/gi, 'src="$2"')
		const payload: Partial<BbsPostDto> & { bbsId: string; pstCn: string } = { ...currentForm, pstCn, bbsId }
		if (isQnaBoard) {
			const answerStatus = (payload.ansSttsCd || 'WAIT').toUpperCase()
			payload.ansSttsCd = answerStatus === 'DONE' ? 'DONE' : 'WAIT'
			if (payload.ansSttsCd === 'DONE') {
				if (!String(payload.ansCn || '').trim()) {
					setError('답변내용을 입력하세요.')
					return
				}
				const { adminId, adminName } = sessionAuthorRef.current
				payload.answrId = payload.answrId || adminId
				payload.answrNm = payload.answrNm || adminName
				payload.ansYmd = payload.ansYmd || new Date().toISOString().slice(0, 10)
			} else {
				payload.answrId = ''
				payload.answrNm = ''
				payload.ansYmd = ''
				payload.ansCn = ''
			}
		}
		if (bbsMaster) {
			if (!bbsMasterIsY(bbsMaster, 'topYn')) {
				payload.ntcYn = 'N'
				payload.upendFixYn = 'N'
			} else {
				payload.ntcYn = payload.upendFixYn === 'Y' ? 'Y' : 'N'
			}
			if (!bbsMasterIsY(bbsMaster, 'lockYn')) {
				payload.lckYn = 'N'
			}
			if (!bbsMasterIsY(bbsMaster, 'linkYn')) {
				payload.lnkgUrlAddr = ''
			}
			if (!isNoticeBoard && !bbsMasterIsY(bbsMaster, 'cateYn')) {
				payload.category = ''
			}
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			if (isQnaBoard && popupMode !== 'new') {
				const { adminId } = sessionAuthorRef.current
				const answerPayload = {
					ansSttsCd: payload.ansSttsCd,
					ansCn: payload.ansCn,
					answrNm: payload.answrNm,
					answrId: payload.answrId,
					ansYmd: payload.ansYmd,
					mdtr: adminId || payload.answrId || ''
				}
				const res = await fetch(
					`${BACKEND}/api/admin/bbs-post/${encodeURIComponent(bbsId)}/${encodeURIComponent(currentForm.pstSn!)}/answer`,
					{
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(answerPayload),
						credentials: 'include'
					}
				)
				const result: ApiResponse<BbsPostDto> = await res.json()
				if (!result.success) {
					setError(result.message || '답변 저장에 실패했습니다.')
					return
				}
				setMessage('답변이 저장되었습니다.')
				closePopup()
				await fetchList()
				return
			}

			if (bbsMasterIsY(bbsMaster, 'thumYn')) {
				if (thumFile) {
					const fd = new FormData()
					fd.append('file', thumFile)
					fd.append('menuType', 'bbs')
					if (bbsId) fd.append('menuId', bbsId)
					const uploadRes = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
						method: 'POST',
						body: fd,
						credentials: 'include'
					})
					const uploadResult: ApiResponse<{ fiId?: string }> = await uploadRes.json()
					if (!uploadResult.success || !uploadResult.data?.fiId) {
						setError(uploadResult.message || '썸네일 업로드에 실패했습니다.')
						return
					}
					payload.thumFileId = uploadResult.data.fiId
					payload.thmbFileId = uploadResult.data.fiId
				} else {
					const thumbnailId = getExplicitThumbnailId(currentForm)
					payload.thumFileId = thumbnailId
					payload.thmbFileId = thumbnailId
				}
			} else {
				payload.thumFileId = ''
				payload.thmbFileId = ''
			}

			if (bbsMasterIsY(bbsMaster, 'atchFileYn')) {
				let atchFiId = (currentForm.atchFileMngNo ?? '').trim()
				let firstNewAttachIsImage = false
				for (let i = 0; i < attachFiles.length; i++) {
					if (i === 0) firstNewAttachIsImage = attachFiles[i].type.startsWith('image/')
					atchFiId = await uploadAttachFileToFiId(attachFiles[i], atchFiId)
				}
				payload.atchFileMngNo = atchFiId
				if (bbsMasterIsY(bbsMaster, 'thumYn') && !payload.thumFileId && firstNewAttachIsImage) {
					payload.thumFileId = atchFiId
					payload.thmbFileId = atchFiId
				}
			} else {
				payload.atchFileMngNo = ''
			}

			payload.pstTtl = getVisibleDocumentValue('pstTtl', currentForm.pstTtl ?? '')
			const requestBody = buildBbsPostRequestBody(payload)

			if (popupMode === 'new') {
				const body = { ...requestBody }
				delete (body as Record<string, unknown>).pstSn
				delete (body as Record<string, unknown>).postId
				const res = await fetch(`${BACKEND}/api/admin/bbs-post/${encodeURIComponent(bbsId)}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				})
				const result: ApiResponse<BbsPostDto> = await res.json()
				if (!result.success) {
					setError(result.message || '등록에 실패했습니다.')
					return
				}
				setMessage('게시글이 등록되었습니다.')
			} else {
				const res = await fetch(
					`${BACKEND}/api/admin/bbs-post/${encodeURIComponent(bbsId)}/${encodeURIComponent(currentForm.pstSn!)}`,
					{
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(requestBody),
						credentials: 'include'
					}
				)
				const result: ApiResponse<BbsPostDto> = await res.json()
				if (!result.success) {
					setError(result.message || '수정에 실패했습니다.')
					return
				}
				setMessage('게시글이 수정되었습니다.')
			}
			closePopup()
			await fetchList()
		} catch {
			setError(popupMode === 'new' ? '등록 중 오류가 발생했습니다.' : '수정 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!bbsId || !form.pstSn) return
		if (!window.confirm(`"${form.pstTtl}" 게시글을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(
				`${BACKEND}/api/admin/bbs-post/${encodeURIComponent(bbsId)}/${encodeURIComponent(form.pstSn)}`,
				{ method: 'DELETE', credentials: 'include' }
			)
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('게시글이 삭제되었습니다.')
			closePopup()
			await fetchList()
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleSearch = () => setPage(1)
	const clearSearch = () => {
		setSearchKeyword('')
		setSearchCategory('')
		setStartDate('')
		setEndDate('')
		setSearchType('title')
		setPage(1)
	}

	const handleToggleSelect = (pstSn: string, checked: boolean) => {
		setSelectedPostIds((prev) => {
			const next = new Set(prev)
			if (checked) next.add(pstSn)
			else next.delete(pstSn)
			return next
		})
	}

	const handleToggleSelectAll = (checked: boolean) => {
		setSelectedPostIds((prev) => {
			const next = new Set(prev)
			for (const row of list) {
				if (checked) next.add(row.pstSn)
				else next.delete(row.pstSn)
			}
			return next
		})
	}

	const handleBulkDelete = async () => {
		if (!bbsId || selectedPostIds.size === 0) return
		const ids = [...selectedPostIds]
		if (!window.confirm(`선택한 ${ids.length}건의 게시글을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const results = await Promise.all(
				ids.map(async (pstSn) => {
					const res = await fetch(
						`${BACKEND}/api/admin/bbs-post/${encodeURIComponent(bbsId)}/${encodeURIComponent(pstSn)}`,
						{ method: 'DELETE', credentials: 'include' }
					)
					const result: ApiResponse<unknown> = await res.json()
					return { pstSn, ok: res.ok && result.success, message: result.message }
				})
			)
			const failed = results.filter((r) => !r.ok)
			if (failed.length > 0) {
				setError(failed[0].message || `삭제 실패 ${failed.length}건`)
				return
			}
			setMessage(`${ids.length}건의 게시글이 삭제되었습니다.`)
			setSelectedPostIds(new Set())
			await fetchList()
		} catch {
			setError('선택 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteRow = async (pstSn: string, pstTtl: string) => {
		if (!bbsId) return
		if (!window.confirm(`"${pstTtl}" 게시글을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(
				`${BACKEND}/api/admin/bbs-post/${encodeURIComponent(bbsId)}/${encodeURIComponent(pstSn)}`,
				{ method: 'DELETE', credentials: 'include' }
			)
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('게시글이 삭제되었습니다.')
			setSelectedPostIds((prev) => {
				const next = new Set(prev)
				next.delete(pstSn)
				return next
			})
			await fetchList()
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const allSelected = list.length > 0 && list.every((row) => selectedPostIds.has(row.pstSn))
	const someSelected = list.some((row) => selectedPostIds.has(row.pstSn)) && !allSelected
	const listSelectionProps = {
		selectedPostIds,
		onToggleSelect: handleToggleSelect
	}

	if (!bbsId) {
		return (
			<AdminLayout title="게시글 관리">
				<div className="card">
					<div className="card-body">
						<p className="form-error">게시판 ID가 없습니다. 메뉴에서 게시판을 선택해 주세요.</p>
						<button type="button" onClick={() => navigate('/admin/bbs-master')}>게시판 마스터로 이동</button>
					</div>
				</div>
			</AdminLayout>
		)
	}

	const totalPages = Math.ceil(totalCount / pageSize) || 1

	const renderListTemplate = () => {
		if (skinTemplateKey === 'LIST_CARD') {
			return (
				<BbsPostListCardTemplate
					list={list}
					totalCount={totalCount}
					page={page}
					pageSize={pageSize}
					loading={loading}
					showTop={showTopInList}
					{...listSelectionProps}
					onEdit={(row) => openEditPopup(row as BbsPostDto)}
					onDelete={handleDeleteRow}
				/>
			)
		}
		if (skinTemplateKey === 'LIST_THUMB') {
			return (
				<BbsPostListThumbTemplate
					list={list}
					totalCount={totalCount}
					page={page}
					pageSize={pageSize}
					loading={loading}
					thumbnailUrlMap={listThumbMap}
					showCate={showCateInList}
					categoryLabel={categoryFieldLabel}
					getCategoryLabel={getCategoryLabel}
					showTop={showTopInList}
					{...listSelectionProps}
					onEdit={(row) => openEditPopup(row as BbsPostDto)}
					onDelete={handleDeleteRow}
				/>
			)
		}

		return (
			<BbsPostListBasicTemplate
				list={list}
				totalCount={totalCount}
				page={page}
				pageSize={pageSize}
				loading={loading}
				showThum={showThumInList}
				thumbnailUrlMap={listThumbMap}
					showCate={showCateInList}
					categoryLabel={categoryFieldLabel}
					titleLabel={titleFieldLabel}
					qnaMode={isQnaBoard}
					showTop={showTopInList}
					getCategoryLabel={getCategoryLabel}
				{...listSelectionProps}
				allSelected={allSelected}
				someSelected={someSelected}
				onToggleSelectAll={handleToggleSelectAll}
				onEdit={(row) => openEditPopup(row as BbsPostDto)}
				onDelete={handleDeleteRow}
			/>
		)
	}

	return (
		<AdminLayout title={bbsName ? `${bbsName} 관리` : '게시글 관리'}>
			<CrudPageCard
				title={bbsName ? `${bbsName} 관리` : `게시글 관리 (${bbsId})`}
				error={error}
				message={message}
			>
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
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</div>
						<div className="list-toolbar-actions">
							<button
								type="button"
								className="admin-footer-btn-delete"
							disabled={selectedPostIds.size === 0 || loading}
							onClick={handleBulkDelete}
							>
								선택삭제{selectedPostIds.size > 0 ? ` (${selectedPostIds.size})` : ''}
							</button>
							{!isQnaBoard ? (
								<button type="button" className="admin-list-btn-sky" onClick={openNewPopup}>신규</button>
							) : null}
						</div>
				</div>
				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<select
							value={searchType}
							onChange={(e) => setSearchType(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="title">{titleFieldLabel}</option>
							<option value="content">내용</option>
							<option value="all">{titleFieldLabel}+내용</option>
						</select>
						<input
							type="text"
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							placeholder="검색어"
							className="bbs-post-filter-input"
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
						/>
					</div>
					{showCateInList ? (
						<div className="bbs-post-filter-row">
							<label className="bbs-post-filter-label">{categoryFieldLabel}</label>
							{(() => {
								const opts = getCategoryOptions()
								return (
									<select
										value={searchCategory}
										onChange={(e) => setSearchCategory(e.target.value)}
										className="bbs-post-filter-select"
									>
										<option value="">전체</option>
										{opts.map((o) => (
											<option key={o.code} value={o.code}>
												{o.cdDtlNm}
											</option>
										))}
									</select>
								)
							})()}
						</div>
					) : null}
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">등록일</label>
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="bbs-post-filter-date"
						/>
						<span className="bbs-post-filter-sep">~</span>
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="bbs-post-filter-date"
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={handleSearch}>검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={clearSearch}>초기화</button>
					</div>
				</div>
				{renderListTemplate()}
				{totalPages > 1 && (
					<div className="pagination-wrap">
						<nav className="pagination" aria-label="페이지 네비게이션">
							<button
								type="button"
								className="pagination-btn pagination-prev"
								disabled={page <= 1}
								onClick={() => setPage(1)}
								aria-label="처음"
							>
								‹‹
							</button>
							<button
								type="button"
								className="pagination-btn pagination-prev"
								disabled={page <= 1}
								onClick={() => setPage((p) => p - 1)}
								aria-label="이전"
							>
								‹
							</button>
							<ul className="pagination-list">
								{((): number[] => {
									const delta = 2
									const left = Math.max(1, page - delta)
									const right = Math.min(totalPages, page + delta)
									const pages: number[] = []
									for (let i = left; i <= right; i++) pages.push(i)
									if (left > 2) pages.unshift(1)
									if (right < totalPages - 1) pages.push(totalPages)
									return [...new Set(pages)].sort((a, b) => a - b)
								})().map((p, i, arr) => (
									<React.Fragment key={p}>
										{i > 0 && arr[i - 1] !== p - 1 && (
											<li className="pagination-ellipsis">…</li>
										)}
										<li>
											<button
												type="button"
												className={`pagination-btn pagination-num ${page === p ? 'active' : ''}`}
												onClick={() => setPage(p)}
												aria-current={page === p ? 'page' : undefined}
											>
												{p}
											</button>
										</li>
									</React.Fragment>
								))}
							</ul>
							<button
								type="button"
								className="pagination-btn pagination-next"
								disabled={page >= totalPages}
								onClick={() => setPage((p) => p + 1)}
								aria-label="다음"
							>
								›
							</button>
							<button
								type="button"
								className="pagination-btn pagination-next"
								disabled={page >= totalPages}
								onClick={() => setPage(totalPages)}
								aria-label="마지막"
							>
								››
							</button>
						</nav>
					</div>
				)}
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={isQnaBoard ? '1:1 문의 상세' : popupMode === 'new' ? '게시글 등록' : '게시글 상세 (수정)'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						{popupMode === 'edit' && form.pstSn && (
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
						<button type="submit" form="bbs-post-form" className="admin-list-btn-edit" disabled={loading}>
							{isQnaBoard ? '저장' : popupMode === 'new' ? '등록' : '수정'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup}>닫기</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<form
					id="bbs-post-form"
					ref={postFormRef}
					onSubmit={(e) => {
						e.preventDefault()
						void handleSave(e.currentTarget)
					}}
				>
				<table className="form-table form-table-cols4">
					<tbody>
						{popupMode === 'edit' && (
							<tr>
								<th>게시글ID</th>
								<td>
									<input type="text" name="pstSn" value={form.pstSn ?? ''} readOnly />
								</td>
								<th>조회수</th>
								<td>
									<input type="text" value={form.inqCnt ?? 0} readOnly />
								</td>
							</tr>
						)}
						<tr>
							<th>{titleFieldLabel}</th>
							<td colSpan={3}>
								<input
									name="pstTtl"
									type="text"
									key={`pstTtl-${form.pstSn ?? 'new'}-${popupOpen ? 'open' : 'closed'}`}
									defaultValue={form.pstTtl ?? ''}
									readOnly={isQnaBoard}
									style={{ width: '100%', maxWidth: '100%' }}
								/>
							</td>
						</tr>
						<tr>
							<th>사용여부</th>
							<td>
								<input type="hidden" name="useYn" value={form.useYn ?? 'Y'} />
								{renderYnToggle(
									'useYn',
									form.useYn ?? 'Y',
									(v) => setForm({ ...form, useYn: v }),
									'사용',
									'미사용'
								)}
							</td>
							<th>표시등록일</th>
							<td>
								<input
									name="pstgYmd"
									type="date"
									className="bbs-post-regDt-input"
									value={form.pstgYmd ?? ''}
									onChange={(e) => setForm({ ...form, pstgYmd: e.target.value })}
								/>
							</td>
						</tr>
						{(isNoticeBoard || bbsMasterIsY(bbsMaster, 'cateYn') || bbsMasterIsY(bbsMaster, 'topYn')) ? (
							<tr>
								{(isNoticeBoard || bbsMasterIsY(bbsMaster, 'cateYn')) ? (
									<>
										<th>{categoryFieldLabel}</th>
										<td colSpan={bbsMasterIsY(bbsMaster, 'topYn') ? 1 : 3}>
											{(() => {
												const cd = (bbsMaster?.cateCd || '').trim()
												const opts = getCategoryOptions()
												if (opts.length > 0) {
													return (
														<select
															name="category"
															className="bbs-post-category-input"
															value={form.category ?? ''}
															onChange={(e) => setForm({ ...form, category: e.target.value })}
														>
															<option value="">선택</option>
															{opts.map((o) => (
																<option key={o.code} value={o.code}>
																	{o.cdDtlNm}
																</option>
															))}
														</select>
													)
												}
												return (
													<input
														name="category"
														type="text"
														className="bbs-post-category-input"
														value={form.category ?? ''}
														onChange={(e) => setForm({ ...form, category: e.target.value })}
														placeholder={cd ? `공통코드 ${cd} 항목이 없으면 직접 입력` : categoryFieldLabel}
													/>
												)
											})()}
										</td>
									</>
								) : null}
								{bbsMasterIsY(bbsMaster, 'topYn') ? (
									<>
										<th>상단고정</th>
										<td colSpan={(isNoticeBoard || bbsMasterIsY(bbsMaster, 'cateYn')) ? 1 : 3}>
											<input type="hidden" name="upendFixYn" value={form.upendFixYn ?? 'N'} />
											{renderYnToggle(
												'upendFixYn',
												form.upendFixYn ?? 'N',
												(v) => setForm({ ...form, upendFixYn: v }),
												'상단고정',
												'일반'
											)}
										</td>
									</>
								) : null}
							</tr>
						) : null}
						{bbsMasterIsY(bbsMaster, 'lockYn') ? (
							<tr>
								<th>비밀글</th>
								<td colSpan={3}>
									<input type="hidden" name="lckYn" value={form.lckYn ?? 'N'} />
									{renderYnToggle(
										'lckYn',
										form.lckYn ?? 'N',
										(v) => setForm({ ...form, lckYn: v }),
										'비밀글',
										'일반'
									)}
								</td>
							</tr>
						) : null}
						{bbsMasterIsY(bbsMaster, 'linkYn') ? (
							<tr>
									<th>{linkFieldLabel}</th>
								<td colSpan={3}>
									<input
										name="lnkgUrlAddr"
										type="text"
										value={form.lnkgUrlAddr ?? ''}
										onChange={(e) => setForm({ ...form, lnkgUrlAddr: e.target.value })}
										style={{ width: '100%', maxWidth: '100%' }}
									/>
								</td>
							</tr>
						) : null}
						{bbsMasterIsY(bbsMaster, 'thumYn') ? (
							<tr>
								<th>썸네일 이미지</th>
								<td colSpan={3}>
									<input
										ref={thumInputRef}
										type="file"
										accept="image/*"
										className="bbs-post-attach-input-hidden"
										onChange={(e) => {
											const file = e.target.files?.[0] ?? null
											e.target.value = ''
											handleThumFileSelected(file)
										}}
									/>
									<div className="bbs-post-thumb-wrap">
										<div className="bbs-post-attach-actions">
											<button
												type="button"
												className="admin-list-btn-sky"
												onClick={() => thumInputRef.current?.click()}
												disabled={loading}
											>
												파일 선택
											</button>
											{(thumFile || getExplicitThumbnailId(form)) && (
												<button
													type="button"
													className="admin-footer-btn-delete"
													onClick={clearThumImage}
													disabled={loading}
												>
													제거
												</button>
											)}
										</div>
										{thumPreviewUrl ? (
											<div className="bbs-post-thumb-preview-box">
												<img
													src={thumPreviewUrl}
													alt="썸네일 미리보기"
													className="bbs-post-thumb-preview-img"
												/>
												<div className="bbs-post-thumb-preview-name">
													{thumFile
														? thumFile.name
														: thumDisplayName || getExplicitThumbnailId(form)}
											</div>
											</div>
										) : null}
									</div>
								</td>
							</tr>
						) : null}
						{bbsMasterIsY(bbsMaster, 'atchFileYn') ? (
							<tr>
									<th>{attachFieldLabel}</th>
								<td colSpan={3}>
									<input
										ref={attachInputRef}
										type="file"
										multiple
										className="bbs-post-attach-input-hidden"
										onChange={(e) => {
											const files = e.target.files ? Array.from(e.target.files) : []
											handleAttachFilesSelected(files)
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
											{(attachFiles.length > 0 ||
												attachFileInfos.length > 0 ||
												(form.atchFileMngNo || '').trim()) && (
												<button
													type="button"
													className="admin-footer-btn-delete"
													onClick={resetAllAttachments}
													disabled={loading}
												>
													전체 삭제
												</button>
											)}
										</div>
										<ul className="bbs-post-attach-list">
											{attachFileInfos.map((it) => (
												<li key={`saved-${it.fiId}-${it.fiSn ?? ''}`}>
													<span>{it.fileOriginName || `${it.fiId}#${it.fiSn ?? ''}`}</span>
													{it.fiId && it.fiSn != null ? (
														<a
															href={adminFileDownloadUrl(it.fiId, it.fiSn)}
															target="_blank"
															rel="noreferrer"
														>
															다운로드
														</a>
													) : null}
													<button
														type="button"
														className="admin-footer-btn-delete bbs-post-attach-del"
														onClick={() => void handleDeleteSavedAttach(it)}
														disabled={loading}
													>
														삭제
													</button>
												</li>
											))}
											{attachFiles.map((file, idx) => (
												<li key={`pending-${idx}-${file.name}`}>
													<span>{file.name}</span>
													<span className="bbs-post-attach-pending">(저장 시 업로드)</span>
													<button
														type="button"
														className="admin-footer-btn-delete bbs-post-attach-del"
														onClick={() => handleRemovePendingAttach(idx)}
														disabled={loading}
													>
														삭제
													</button>
												</li>
											))}
											{attachFileInfos.length === 0 && attachFiles.length === 0 ? (
												<li className="bbs-post-attach-empty">선택된 파일 없음</li>
											) : null}
										</ul>
									</div>
									{(maxAttachCount > 0 || maxAttachMbLabel) && (
										<p className="bbs-post-attach-limit-hint">
											{maxAttachCount > 0 ? (
												<span className="bbs-post-attach-limit">(최대 {maxAttachCount}개)</span>
											) : null}
											{maxAttachMbLabel ? (
												<span className="bbs-post-attach-limit">({maxAttachMbLabel} 이하)</span>
											) : null}
										</p>
									)}
								</td>
							</tr>
						) : null}
						{([1, 2, 3, 4, 5] as const).flatMap((idx) => {
							if (!bbsMaster || getMasterEtc(bbsMaster, idx, 'Yn') !== 'Y') {
								return []
							}
							const label = getMasterEtc(bbsMaster, idx, 'Nm').trim() || `ETC${idx}`
							const tp = (getMasterEtc(bbsMaster, idx, 'Tp').toLowerCase() || 'input').trim()
							const cdId = getMasterEtc(bbsMaster, idx, 'Cd').trim()
							const field = `nttEtc${idx}` as NttEtcKey
							const rawVal = form[field] ?? ''
							const opts = cdId ? etcCodeOptions[cdId] ?? [] : []

							let control: React.ReactNode
							if (tp === 'textarea') {
								control = (
									<textarea
										name={field}
										value={rawVal}
										onChange={(e) => setForm({ ...form, [field]: e.target.value })}
										rows={4}
										style={{ width: '100%', maxWidth: '100%', padding: 8, resize: 'vertical' }}
									/>
								)
							} else if (tp === 'select' && opts.length > 0) {
								control = (
									<select
										name={field}
										value={rawVal}
										onChange={(e) => setForm({ ...form, [field]: e.target.value })}
										style={{ minWidth: 200 }}
									>
										<option value="">선택</option>
										{opts.map((o) => (
											<option key={o.code} value={o.code}>
												{o.cdDtlNm}
											</option>
										))}
									</select>
								)
							} else if (tp === 'radio' && opts.length > 0) {
								control = (
									<div className="bbs-master-inline-group" style={{ flexWrap: 'wrap', gap: 12 }}>
										{opts.map((o) => (
											<label key={o.code} style={{ marginRight: 8 }}>
												<input
													type="radio"
													name={field}
													value={o.code}
													checked={rawVal === o.code}
													onChange={() => setForm({ ...form, [field]: o.code })}
												/>{' '}
												{o.cdDtlNm}
											</label>
										))}
									</div>
								)
							} else if (tp === 'checkbox' && opts.length > 0) {
								const selected = new Set(parseEtcCsv(rawVal))
								control = (
									<div className="bbs-master-inline-group" style={{ flexWrap: 'wrap', gap: 12 }}>
										{opts.map((o) => (
											<label key={o.code} style={{ marginRight: 8 }}>
												<input
													type="checkbox"
													name={field}
													value={o.code}
													checked={selected.has(o.code)}
													onChange={() =>
														setForm({ ...form, [field]: toggleEtcCsv(rawVal, o.code) })
													}
												/>{' '}
												{o.cdDtlNm}
											</label>
										))}
									</div>
								)
							} else if (tp === 'checkbox' && opts.length === 0) {
								const yn = rawVal === 'Y' ? 'Y' : 'N'
								control = renderYnToggle(
									`nttEtc${idx}`,
									yn,
									(v) => setForm({ ...form, [field]: v }),
									'예',
									'아니오'
								)
							} else if ((tp === 'select' || tp === 'radio') && opts.length === 0) {
								control = (
									<input
										name={field}
										type="text"
										value={rawVal}
										onChange={(e) => setForm({ ...form, [field]: e.target.value })}
										placeholder={cdId ? `공통코드 ${cdId} 항목이 없습니다` : ''}
										style={{ width: '100%', maxWidth: 480 }}
									/>
								)
							} else {
								control = (
									<input
										name={field}
										type="text"
										value={rawVal}
										onChange={(e) => setForm({ ...form, [field]: e.target.value })}
										style={{ width: '100%', maxWidth: 480 }}
									/>
								)
							}

							return [
								<tr key={`bbs-post-etc-${idx}`}>
									<th>{label}</th>
									<td colSpan={3}>{control}</td>
								</tr>
							]
						})}
							{isQnaBoard ? (
								<>
									<tr>
										<th>{contentFieldLabel}</th>
										<td colSpan={3}>
											<div
												className="bbs-post-qna-content"
												dangerouslySetInnerHTML={{ __html: form.pstCn || '' }}
											/>
										</td>
									</tr>
									<tr>
										<th>답변상태</th>
										<td>
											<select
												name="ansSttsCd"
												value={(form.ansSttsCd || 'WAIT').toUpperCase()}
												onChange={(e) => setForm({ ...form, ansSttsCd: e.target.value })}
												className="bbs-post-category-input"
											>
												<option value="WAIT">답변대기</option>
												<option value="DONE">답변완료</option>
											</select>
										</td>
										<th>답변일</th>
										<td>
											<input
												name="ansYmd"
												type="date"
												className="bbs-post-regDt-input"
												value={form.ansYmd ?? ''}
												disabled={(form.ansSttsCd || 'WAIT').toUpperCase() !== 'DONE'}
												onChange={(e) => setForm({ ...form, ansYmd: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>답변자</th>
										<td colSpan={3}>
											<input
												type="text"
												className="bbs-post-author-input"
												value={form.answrNm || sessionAuthorRef.current.adminName || ''}
												readOnly
											/>
										</td>
									</tr>
									<tr>
										<th>답변내용</th>
										<td colSpan={3}>
											<textarea
												name="ansCn"
												value={form.ansCn ?? ''}
												disabled={(form.ansSttsCd || 'WAIT').toUpperCase() !== 'DONE'}
												onChange={(e) => setForm({ ...form, ansCn: e.target.value })}
												rows={8}
												style={{ width: '100%', maxWidth: '100%', padding: 8, resize: 'vertical' }}
											/>
										</td>
									</tr>
								</>
							) : (
								<tr>
									<th>{contentFieldLabel}</th>
									<td colSpan={3}>
										<div className="bbs-post-summernote-wrap">
											<textarea
												id={SUMMERNOTE_ID}
												name="pstCn"
												defaultValue={form.pstCn ?? ''}
												className="board-form-textarea summernote-editor"
												rows={10}
											/>
										</div>
									</td>
								</tr>
							)}
						<tr>
							<th>작성자명</th>
							<td>
								<input
									name="wrtrNm"
									type="text"
									className="bbs-post-author-input"
									value={form.wrtrNm ?? ''}
									onChange={(e) => setForm({ ...form, wrtrNm: e.target.value })}
								/>
							</td>
							<th>작성자ID</th>
							<td>
								<input
									name="wrtrId"
									type="text"
									className="bbs-post-author-input"
									value={form.wrtrId ?? ''}
									onChange={(e) => setForm({ ...form, wrtrId: e.target.value })}
								/>
							</td>
						</tr>
					</tbody>
				</table>
				</form>
			</LayerPopup>
		</AdminLayout>
	)
}

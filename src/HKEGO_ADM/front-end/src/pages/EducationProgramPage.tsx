import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { ListPagination } from '../components/ListPagination'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL } from '../config'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'

type ProgramType = 'EXPLORE' | 'MISSION'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type EducationProgram = {
	prgrmSn: number | null
	prgrmTypeCd: ProgramType
	prgrmTypeNm?: string
	prgrmNm: string
	trgtCn: string
	totalTmMnt: number | null
	maxNope: number | null
	simpleExpln: string
	startExpln: string
	useYn: string
	teamCnt: number | null
	routeJson: string
	stepJson: string
	evalJson: string
	regDt?: string
	rgtr?: string
}

type ProgramRouteRow = {
	name: string
	steps: string[]
}

type ProgramContentRow = {
	cntnSn?: number | null
	cardCategory?: string
	contentType: string
	contentName: string
	videoUrl?: string
}

type ProgramTextRow = {
	text: string
}

type ProgramQuestDetail = {
	name: string
	title: string
	place: string
	limitMin: number | string
	contents: ProgramContentRow[]
}

type ProgramStepDetail = {
	step: string
	stepName?: string
	title: string
	place: string
	limitMin: number | string
	content?: string
	videos?: ProgramContentRow[]
	thoughts?: ProgramTextRow[]
	quests?: ProgramQuestDetail[]
	contents?: ProgramContentRow[]
	safetyRules?: ProgramTextRow[]
	checklists?: ProgramTextRow[]
}

type EducationProgramPageProps = {
	programType: ProgramType
}

const BACKEND = API_BASE_URL
const PAGE_SIZE_OPTIONS = [20, 50, 100]
const PROGRAM_IMAGE_KEY = 'programImageAtchFileId'
const PROGRAM_ROUTE_STEP_COUNT = 4

type UploadInfo = {
	fiId?: string
	streFileNm?: string
	orgnlFileNm?: string
	url?: string
}

type EducationContentSummary = {
	cntnSn: number | null
	cntnTypeCd: string
	cntnTypeNm?: string
	cardClsfCd: string
	cardClsfNm?: string
	cntnTtl: string
	videoUrlAddr?: string
}

type ContentPickerTarget =
	| { kind: 'stepList'; stepIndex: number; key: 'videos' | 'contents' }
	| { kind: 'quest'; stepIndex: number; questIndex: number }

type EvaluationPickerKind = 'studentEvaluation' | 'teacherEvaluation' | 'survey'

type EvaluationPickerSummary = {
	qstnrSn: number | null
	evlSeCd?: string
	evlSeNm?: string
	qstnrNm: string
}

const defaultRouteRows = (programType: ProgramType) => {
	const labels = programType === 'MISSION' ? ['동선 A', '동선 B', '동선 C', '동선 D'] : ['A팀(코스 A)', 'B팀(코스 B)', 'C팀(코스 C)', 'D팀(코스 D)']
	return labels.map((name) => ({ name, steps: Array.from({ length: PROGRAM_ROUTE_STEP_COUNT }, () => '') }))
}

const defaultContentRow = (cardCategory = '', contentType = '', contentName = ''): ProgramContentRow => ({
	cardCategory,
	contentType,
	contentName,
	videoUrl: ''
})

const defaultTextRow = (text = ''): ProgramTextRow => ({ text })

const defaultVideoRows = (count: number): ProgramContentRow[] => Array.from({ length: count }, () => defaultContentRow())

const defaultStepRows = (programType: ProgramType): ProgramStepDetail[] => (
	programType === 'MISSION'
		? [
				{
					step: 'STEP1',
					stepName: '',
					title: '',
					place: '',
					limitMin: '',
					videos: defaultVideoRows(1),
					thoughts: []
				},
				{
					step: 'STEP3',
					title: '',
					place: '',
					limitMin: '',
					quests: ['지구존', '미래존', '사회존', '도서관존'].map((name) => ({
						name,
						title: '',
						place: '',
						limitMin: '',
						contents: []
					}))
				},
				{
					step: 'STEP4',
					title: '',
					place: '',
					limitMin: '',
					contents: []
				}
			]
		: [
				{
					step: 'STEP1',
					title: '',
					place: '',
					limitMin: '',
					videos: defaultVideoRows(3),
					thoughts: []
				},
			{
				step: 'STEP2',
				title: '',
				place: '',
				limitMin: '',
				quests: ['퀘스트1', '퀘스트2', '퀘스트3', '퀘스트4'].map((name) => ({
					name,
					title: '',
					place: '',
					limitMin: '',
					contents: []
				}))
			},
			{
				step: 'STEP3',
				title: '',
				place: '',
				limitMin: '',
				safetyRules: [],
				checklists: [],
				contents: []
			},
			{
				step: 'STEP4',
				title: '',
				place: '',
				limitMin: '',
				contents: []
			}
		]
)

const defaultForm = (programType: ProgramType): EducationProgram => ({
	prgrmSn: null,
	prgrmTypeCd: programType,
	prgrmNm: '',
	trgtCn: '',
	totalTmMnt: null,
	maxNope: null,
	simpleExpln: '',
	startExpln: '',
	useYn: 'Y',
	teamCnt: null,
	routeJson: JSON.stringify(defaultRouteRows(programType)),
	stepJson: JSON.stringify(defaultStepRows(programType)),
	evalJson: JSON.stringify({ studentEvaluation: '', teacherEvaluation: '', survey: '' })
})

function formatDate(value: string | null | undefined): string {
	if (!value) return '-'
	return String(value).slice(0, 10)
}

function parseJsonList<T>(value: string, fallback: T[]): T[] {
	try {
		const parsed = JSON.parse(value || '[]')
		return Array.isArray(parsed) ? parsed : fallback
	} catch {
		return fallback
	}
}

function parseJsonObject<T>(value: string, fallback: T): T {
	try {
		const parsed = JSON.parse(value || '{}')
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? { ...fallback, ...parsed } : fallback
	} catch {
		return fallback
	}
}

function normalizeRouteRows(value: string, programType: ProgramType): ProgramRouteRow[] {
	const fallback = defaultRouteRows(programType)
	return parseJsonList<Record<string, unknown>>(value, fallback).map((row, index) => {
		const fallbackRow = fallback[index] ?? fallback[0]
		const rawSteps = Array.isArray(row.steps)
			? row.steps
			: typeof row.route === 'string'
				? row.route.split(/→|>/)
				: []
		const steps = Array.from({ length: PROGRAM_ROUTE_STEP_COUNT }, (_, stepIndex) => {
			const value = rawSteps[stepIndex]
			return typeof value === 'string' && value.trim() ? value.trim() : fallbackRow.steps[stepIndex]
		})
		return {
			name: typeof row.name === 'string' && row.name.trim() ? row.name.trim() : fallbackRow.name,
			steps
		}
	})
}

function normalizeFixedVideoRows(rows: ProgramContentRow[] | undefined, count: number): ProgramContentRow[] {
	const sourceRows = Array.isArray(rows) ? rows : []
	return Array.from({ length: count }, (_, index) => sourceRows[index] ?? defaultContentRow())
}

function normalizeStepRows(value: string, programType: ProgramType): ProgramStepDetail[] {
	const fallback = defaultStepRows(programType)
	return parseJsonList<Record<string, unknown>>(value, fallback).map((row, index) => {
		const fallbackRow = fallback[index] ?? fallback[0]
		const normalized = { ...fallbackRow, ...row } as ProgramStepDetail
		normalized.step = typeof row.step === 'string' && row.step.trim() ? row.step.trim() : fallbackRow.step
		normalized.stepName = typeof row.stepName === 'string' ? row.stepName : fallbackRow.stepName
		normalized.title = typeof row.title === 'string' ? row.title : fallbackRow.title
		normalized.place = typeof row.place === 'string' ? row.place : fallbackRow.place
		normalized.limitMin = typeof row.limitMin === 'number' || typeof row.limitMin === 'string' ? row.limitMin : fallbackRow.limitMin
		normalized.videos = Array.isArray(row.videos) ? row.videos as ProgramContentRow[] : fallbackRow.videos
		if (normalized.videos) {
			normalized.videos = normalizeFixedVideoRows(normalized.videos, programType === 'MISSION' ? 1 : 3)
		}
		normalized.thoughts = Array.isArray(row.thoughts) ? row.thoughts as ProgramTextRow[] : fallbackRow.thoughts
		normalized.quests = Array.isArray(row.quests) ? row.quests as ProgramQuestDetail[] : fallbackRow.quests
		normalized.contents = Array.isArray(row.contents) ? row.contents as ProgramContentRow[] : fallbackRow.contents
		normalized.safetyRules = Array.isArray(row.safetyRules) ? row.safetyRules as ProgramTextRow[] : fallbackRow.safetyRules
		normalized.checklists = Array.isArray(row.checklists) ? row.checklists as ProgramTextRow[] : fallbackRow.checklists
		return normalized
	})
}

function renderUseBadge(useYn: string) {
	const enabled = useYn === 'Y'
	return <span className={`bbs-master-list-badge ${enabled ? 'is-on use' : ''}`}>{enabled ? '운영중' : '미운영'}</span>
}

export const EducationProgramPage: React.FC<EducationProgramPageProps> = ({ programType }) => {
	const pageTitle = programType === 'MISSION' ? '미션 프로그램 관리' : '사건탐구 프로그램 관리'
	const nameLabel = programType === 'MISSION' ? '미션명' : '프로그램명'
	const teamLabel = programType === 'MISSION' ? '총 동선 수' : '총 팀(모둠) 수'
	const [list, setList] = useState<EducationProgram[]>([])
	const [form, setForm] = useState<EducationProgram>(defaultForm(programType))
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [popupError, setPopupError] = useState<string | null>(null)
	const [useYnFilter, setUseYnFilter] = useState('')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_LIST_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [programImageFile, setProgramImageFile] = useState<File | null>(null)
	const [programImageName, setProgramImageName] = useState('')
	const [contentPickerOpen, setContentPickerOpen] = useState(false)
	const [contentPickerTarget, setContentPickerTarget] = useState<ContentPickerTarget | null>(null)
	const [contentPickerKeyword, setContentPickerKeyword] = useState('')
	const [contentPickerList, setContentPickerList] = useState<EducationContentSummary[]>([])
	const [contentPickerLoading, setContentPickerLoading] = useState(false)
	const [contentPickerError, setContentPickerError] = useState<string | null>(null)
	const [evaluationPickerOpen, setEvaluationPickerOpen] = useState(false)
	const [evaluationPickerKind, setEvaluationPickerKind] = useState<EvaluationPickerKind>('studentEvaluation')
	const [evaluationPickerKeyword, setEvaluationPickerKeyword] = useState('')
	const [evaluationPickerList, setEvaluationPickerList] = useState<EvaluationPickerSummary[]>([])
	const [evaluationPickerLoading, setEvaluationPickerLoading] = useState(false)
	const [evaluationPickerError, setEvaluationPickerError] = useState<string | null>(null)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])
	const allSelected = list.length > 0 && list.every((row) => row.prgrmSn != null && selectedIds.has(row.prgrmSn))
	const routeRows = normalizeRouteRows(form.routeJson, programType)
	const stepRows = normalizeStepRows(form.stepJson, programType)
	const visibleStepRows = stepRows
		.map((row, index) => ({ row, index }))
		.filter(({ row }) => programType === 'EXPLORE' ? row.step !== 'STEP3' && row.step !== 'STEP4' : row.step !== 'STEP4')
	const evalInfo = parseJsonObject(form.evalJson, { studentEvaluation: '', teacherEvaluation: '', survey: '', [PROGRAM_IMAGE_KEY]: '' })
	const routeStepOptions = programType === 'MISSION' ? ['지구존', '미래존', '사회존', '도서관존'] : ['퀘스트1', '퀘스트2', '퀘스트3', '퀘스트4']

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize, filters?: { useYn?: string; searchKeyword?: string }) => {
		const targetUseYn = filters?.useYn ?? useYnFilter
		const targetSearchKeyword = filters?.searchKeyword ?? searchKeyword
		const qs = new URLSearchParams()
		qs.set('prgrmTypeCd', programType)
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		if (targetUseYn) qs.set('useYn', targetUseYn)
		if (targetSearchKeyword.trim()) qs.set('searchKeyword', targetSearchKeyword.trim())
		return qs.toString()
	}, [pageSize, programType, searchKeyword, useYnFilter])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize, filters?: { useYn?: string; searchKeyword?: string }) => {
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/education-programs?${buildSearchParams(targetPage, targetSize, filters)}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<EducationProgram>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '프로그램 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('프로그램 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	const fetchContentPickerList = useCallback(async (keyword = contentPickerKeyword) => {
		setContentPickerLoading(true)
		setContentPickerError(null)
		try {
			const qs = new URLSearchParams()
			qs.set('page', '1')
			qs.set('size', '20')
			qs.set('useYn', 'Y')
			if (keyword.trim()) qs.set('searchKeyword', keyword.trim())
			const res = await fetch(`${BACKEND}/api/admin/education-contents?${qs.toString()}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<EducationContentSummary>> = await res.json()
			if (!result.success || !result.data) {
				setContentPickerError(result.message || '콘텐츠 목록 조회에 실패했습니다.')
				setContentPickerList([])
				return
			}
			setContentPickerList(result.data.list ?? [])
		} catch {
			setContentPickerError('콘텐츠 목록 조회 중 오류가 발생했습니다.')
			setContentPickerList([])
		} finally {
			setContentPickerLoading(false)
		}
	}, [contentPickerKeyword])

	const fetchEvaluationPickerList = useCallback(async (kind = evaluationPickerKind, keyword = evaluationPickerKeyword) => {
		setEvaluationPickerLoading(true)
		setEvaluationPickerError(null)
		try {
			const qs = new URLSearchParams()
			qs.set('page', '1')
			qs.set('size', '20')
			if (keyword.trim()) qs.set('searchKeyword', keyword.trim())
			let endpoint = `${BACKEND}/api/admin/evaluation-forms`
			if (kind === 'studentEvaluation') {
				qs.set('evlSeCd', 'STUDENT')
			} else if (kind === 'teacherEvaluation') {
				qs.set('evlSeCd', 'TEACHER')
			} else {
				endpoint = `${BACKEND}/api/admin/survey-forms`
			}
			const res = await fetch(`${endpoint}?${qs.toString()}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<EvaluationPickerSummary>> = await res.json()
			if (!result.success || !result.data) {
				setEvaluationPickerError(result.message || '목록 조회에 실패했습니다.')
				setEvaluationPickerList([])
				return
			}
			setEvaluationPickerList(result.data.list ?? [])
		} catch {
			setEvaluationPickerError('목록 조회 중 오류가 발생했습니다.')
			setEvaluationPickerList([])
		} finally {
			setEvaluationPickerLoading(false)
		}
	}, [evaluationPickerKind, evaluationPickerKeyword])

	useEffect(() => {
		setForm(defaultForm(programType))
		setSelectedIds(new Set())
		void fetchList(1, DEFAULT_LIST_PAGE_SIZE)
	}, [programType])

		const showPopupError = (value: string) => {
		setPopupError(value)
		window.setTimeout(() => document.querySelector('.layer-popup-body')?.scrollTo({ top: 0, behavior: 'smooth' }), 0)
	}

	const openNewPopup = () => {
		setPopupMode('new')
		setForm(defaultForm(programType))
		setPopupError(null)
		setProgramImageFile(null)
		setProgramImageName('')
		setPopupOpen(true)
	}

	const fetchUploadInfo = async (fiId: string): Promise<UploadInfo | null> => {
		if (!fiId) return null
		try {
			const res = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, { credentials: 'include' })
			const result: ApiResponse<UploadInfo> = await res.json()
			return result.success ? result.data : null
		} catch {
			return null
		}
	}

	const openEditPopup = async (prgrmSn: number | null) => {
		if (!prgrmSn) return
		setPopupMode('edit')
		setLoading(true)
		setPopupError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/education-programs/${programType}/${prgrmSn}`, { credentials: 'include' })
			const result: ApiResponse<EducationProgram> = await res.json()
				if (!result.success || !result.data) {
					setError(result.message || '프로그램 상세 조회에 실패했습니다.')
					return
				}
				const nextForm = { ...defaultForm(programType), ...result.data }
				const nextEvalInfo = parseJsonObject(nextForm.evalJson, { studentEvaluation: '', teacherEvaluation: '', survey: '', [PROGRAM_IMAGE_KEY]: '' })
				setProgramImageFile(null)
				setProgramImageName('')
				if (nextEvalInfo[PROGRAM_IMAGE_KEY]) {
					const info = await fetchUploadInfo(nextEvalInfo[PROGRAM_IMAGE_KEY])
					setProgramImageName(info?.orgnlFileNm || info?.streFileNm || nextEvalInfo[PROGRAM_IMAGE_KEY])
				}
				setForm(nextForm)
				setPopupOpen(true)
			} catch {
			setError('프로그램 상세 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const closePopup = () => {
		setPopupOpen(false)
		setPopupError(null)
		setForm(defaultForm(programType))
		setProgramImageFile(null)
		setProgramImageName('')
	}

	const updateRoute = (index: number, patch: Partial<ProgramRouteRow>) => {
		const next = routeRows.map((row, i) => (i === index ? { ...row, ...patch } : row))
		setForm({ ...form, routeJson: JSON.stringify(next) })
	}

	const updateRouteStep = (index: number, stepIndex: number, value: string) => {
		const row = routeRows[index]
		if (!row) return
		const steps = row.steps.map((step, i) => (i === stepIndex ? value : step))
		updateRoute(index, { steps })
	}

	const updateStep = (index: number, patch: Partial<ProgramStepDetail>) => {
		const next = stepRows.map((row, i) => (i === index ? { ...row, ...patch } : row))
		setForm({ ...form, stepJson: JSON.stringify(next) })
	}

	const updateStepList = <T,>(stepIndex: number, key: 'videos' | 'thoughts' | 'contents' | 'safetyRules' | 'checklists', list: T[]) => {
		updateStep(stepIndex, { [key]: list } as Partial<ProgramStepDetail>)
	}

	const updateQuest = (stepIndex: number, questIndex: number, patch: Partial<ProgramQuestDetail>) => {
		const step = stepRows[stepIndex]
		if (!step?.quests) return
		const quests = step.quests.map((quest, i) => (i === questIndex ? { ...quest, ...patch } : quest))
		updateStep(stepIndex, { quests })
	}

	const updateQuestContent = (stepIndex: number, questIndex: number, contentIndex: number, patch: Partial<ProgramContentRow>) => {
		const quest = stepRows[stepIndex]?.quests?.[questIndex]
		if (!quest) return
		const contents = quest.contents.map((content, i) => (i === contentIndex ? { ...content, ...patch } : content))
		updateQuest(stepIndex, questIndex, { contents })
	}

	const openContentPicker = (target: ContentPickerTarget) => {
		setContentPickerTarget(target)
		setContentPickerKeyword('')
		setContentPickerError(null)
		setContentPickerOpen(true)
		void fetchContentPickerList('')
	}

	const deleteQuestContent = (stepIndex: number, questIndex: number, contentIndex: number) => {
		const quest = stepRows[stepIndex]?.quests?.[questIndex]
		if (!quest) return
		updateQuest(stepIndex, questIndex, { contents: quest.contents.filter((_, i) => i !== contentIndex) })
	}

	const moveQuestContent = (stepIndex: number, questIndex: number, contentIndex: number, direction: -1 | 1) => {
		const quest = stepRows[stepIndex]?.quests?.[questIndex]
		if (!quest) return
		updateQuest(stepIndex, questIndex, { contents: moveListItem(quest.contents, contentIndex, direction) })
	}

	const contentToProgramRow = (content: EducationContentSummary): ProgramContentRow => ({
		cntnSn: content.cntnSn,
		cardCategory: content.cardClsfNm || content.cardClsfCd || '',
		contentType: content.cntnTypeNm || content.cntnTypeCd || '',
		contentName: content.cntnTtl || '',
		videoUrl: content.videoUrlAddr || ''
	})

	const showContentPickerCardCategory = () => !(programType === 'MISSION' && contentPickerTarget?.kind === 'quest')

	const getStepTitleSuffix = (step: ProgramStepDetail) => {
		if (programType === 'MISSION' && step.step === 'STEP3') return ' (미션수행)'
		if (programType === 'MISSION' && step.step === 'STEP4') return ' (실천력 부여)'
		if (programType === 'EXPLORE' && step.step === 'STEP2') return ' (사건탐색 - 퀘스트 1~4)'
		return ''
	}

	const selectContentFromPicker = (content: EducationContentSummary) => {
		if (!contentPickerTarget) return
		const selected = contentToProgramRow(content)
		if (contentPickerTarget.kind === 'stepList') {
			const step = stepRows[contentPickerTarget.stepIndex]
			if (!step) return
			const currentRows = (step[contentPickerTarget.key] ?? []) as ProgramContentRow[]
			updateStepList(contentPickerTarget.stepIndex, contentPickerTarget.key, [...currentRows, selected])
		} else {
			const quest = stepRows[contentPickerTarget.stepIndex]?.quests?.[contentPickerTarget.questIndex]
			if (!quest) return
			updateQuest(contentPickerTarget.stepIndex, contentPickerTarget.questIndex, { contents: [...quest.contents, selected] })
		}
		setContentPickerOpen(false)
		setContentPickerTarget(null)
	}

	const evaluationPickerTitle = (kind = evaluationPickerKind) => {
		if (kind === 'studentEvaluation') return '학생 평가지 선택'
		if (kind === 'teacherEvaluation') return '선생님 운영 평가지 선택'
		return '학생 만족도 설문지 선택'
	}

	const openEvaluationPicker = (kind: EvaluationPickerKind) => {
		setEvaluationPickerKind(kind)
		setEvaluationPickerKeyword('')
		setEvaluationPickerError(null)
		setEvaluationPickerOpen(true)
		void fetchEvaluationPickerList(kind, '')
	}

	const selectEvaluationFromPicker = (item: EvaluationPickerSummary) => {
		const nextEvalInfo = {
			...evalInfo,
			[evaluationPickerKind]: item.qstnrNm || '',
			[`${evaluationPickerKind}Sn`]: item.qstnrSn ?? null
		}
		setForm({ ...form, evalJson: JSON.stringify(nextEvalInfo) })
		setEvaluationPickerOpen(false)
	}

	const saveProgram = async () => {
		setPopupError(null)
		if (!form.prgrmNm.trim()) {
			showPopupError(`${nameLabel}을(를) 입력하세요.`)
			return
		}
		if (form.teamCnt != null && form.teamCnt > PROGRAM_ROUTE_STEP_COUNT) {
			showPopupError(`${teamLabel}은(는) 최대 ${PROGRAM_ROUTE_STEP_COUNT}${programType === 'MISSION' ? '개 동선' : '팀'}까지 입력할 수 있습니다.`)
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const isEdit = popupMode === 'edit' && form.prgrmSn != null
			const nextEvalInfo = { ...evalInfo }
			if (programImageFile) {
				const formData = new FormData()
				formData.append('file', programImageFile)
				formData.append('fiId', String(nextEvalInfo[PROGRAM_IMAGE_KEY] || ''))
				const uploadRes = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
					method: 'POST',
					body: formData,
					credentials: 'include'
				})
				const uploadResult: ApiResponse<UploadInfo> = await uploadRes.json()
				if (!uploadResult.success || !uploadResult.data?.fiId) {
					showPopupError(uploadResult.message || '이미지 업로드에 실패했습니다.')
					return
				}
				nextEvalInfo[PROGRAM_IMAGE_KEY] = uploadResult.data.fiId
			}
			const body = { ...form, prgrmTypeCd: undefined, prgrmSn: undefined, routeJson: JSON.stringify(routeRows), stepJson: JSON.stringify(stepRows), evalJson: JSON.stringify(nextEvalInfo) }
			const res = await fetch(
				isEdit
					? `${BACKEND}/api/admin/education-programs/${programType}/${form.prgrmSn}`
					: `${BACKEND}/api/admin/education-programs/${programType}`,
				{
					method: isEdit ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				}
			)
			const result: ApiResponse<EducationProgram> = await res.json()
			if (!result.success) {
				showPopupError(result.message || '저장에 실패했습니다.')
				return
			}
			setMessage(isEdit ? '프로그램이 수정되었습니다.' : '프로그램이 등록되었습니다.')
			closePopup()
			await fetchList(page, pageSize)
		} catch (e) {
			showPopupError(e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteProgram = async (row: EducationProgram, skipConfirm = false) => {
		if (!row.prgrmSn) return
		if (!skipConfirm && !window.confirm(`"${row.prgrmNm}" 프로그램을 삭제하시겠습니까?`)) return
		setLoading(true)
		try {
			const res = await fetch(`${BACKEND}/api/admin/education-programs/${programType}/${row.prgrmSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('프로그램이 삭제되었습니다.')
			await fetchList(page, pageSize)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const bulkDeletePrograms = async () => {
		const targets = Array.from(selectedIds)
		if (targets.length === 0) {
			setError('삭제할 프로그램을 선택하세요.')
			return
		}
		if (!window.confirm('선택한 프로그램을 삭제하시겠습니까?')) return
		for (const prgrmSn of targets) {
			const row = list.find((item) => item.prgrmSn === prgrmSn)
			if (row) await deleteProgram(row, true)
		}
	}

	const toggleSelectAll = () => {
		setSelectedIds(allSelected ? new Set() : new Set(list.map((row) => row.prgrmSn).filter((v): v is number => v != null)))
	}

	const toggleSelectRow = (prgrmSn: number | null) => {
		if (!prgrmSn) return
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(prgrmSn)) next.delete(prgrmSn)
			else next.add(prgrmSn)
			return next
		})
	}

	const moveListItem = <T,>(list: T[], index: number, direction: -1 | 1): T[] => {
		const nextIndex = index + direction
		if (nextIndex < 0 || nextIndex >= list.length) return list
		const next = [...list]
		const target = next[index]
		next[index] = next[nextIndex]
		next[nextIndex] = target
		return next
	}

	const renderTextRows = (
		title: string,
		rows: ProgramTextRow[],
		onChange: (rows: ProgramTextRow[]) => void
	) => (
		<div className="education-program-sub-block">
			<div className="education-program-sub-header">
				<strong>{title}</strong>
				<button type="button" className="admin-list-btn-sky" onClick={() => onChange([...rows, defaultTextRow()])}>추가</button>
			</div>
				{rows.length > 0 && (
					<table className="table education-program-nested-table">
						<thead><tr><th style={{ width: 76 }}>순서변경</th><th>텍스트 입력</th><th style={{ width: 76 }}>관리</th></tr></thead>
						<tbody>
							{rows.map((row, index) => (
								<tr key={index}>
									<td>
										<div className="education-program-order-buttons">
											<button type="button" onClick={() => onChange(moveListItem(rows, index, -1))}>↑</button>
											<button type="button" onClick={() => onChange(moveListItem(rows, index, 1))}>↓</button>
										</div>
									</td>
									<td><input type="text" value={row.text} onChange={(e) => onChange(rows.map((item, i) => i === index ? { ...item, text: e.target.value } : item))} /></td>
									<td><button type="button" className="admin-footer-btn-delete" onClick={() => onChange(rows.filter((_, i) => i !== index))}>삭제</button></td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		)

	const renderContentRows = (
		title: string,
		rows: ProgramContentRow[],
		onChange: (rows: ProgramContentRow[]) => void,
		options?: { showCardCategory?: boolean; showContentType?: boolean; showVideoUrl?: boolean; onAdd?: () => void }
	) => {
		const showCardCategory = options?.showCardCategory !== false
		const showContentType = options?.showContentType !== false
			return (
				<div className="education-program-sub-block">
				<div className="education-program-sub-header">
					<strong>{title}</strong>
					<button type="button" className="admin-list-btn-sky" onClick={() => options?.onAdd ? options.onAdd() : onChange([...rows, defaultContentRow()])}>추가</button>
				</div>
					{rows.length > 0 && (
						<table className="table education-program-nested-table">
							<thead>
								<tr>
									<th style={{ width: 76 }}>순서변경</th>
									{showCardCategory && <th style={{ width: 120 }}>카드분류</th>}
									{showContentType && <th style={{ width: 150 }}>콘텐츠 타입</th>}
									<th>콘텐츠 이름</th>
									{options?.showVideoUrl && <th>영상 url</th>}
									<th style={{ width: 76 }}>관리</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((row, index) => (
									<tr key={index}>
										<td>
											<div className="education-program-order-buttons">
												<button type="button" onClick={() => onChange(moveListItem(rows, index, -1))}>↑</button>
												<button type="button" onClick={() => onChange(moveListItem(rows, index, 1))}>↓</button>
											</div>
										</td>
										{showCardCategory && <td><input type="text" value={row.cardCategory || ''} onChange={(e) => onChange(rows.map((item, i) => i === index ? { ...item, cardCategory: e.target.value } : item))} /></td>}
										{showContentType && <td><input type="text" value={row.contentType} onChange={(e) => onChange(rows.map((item, i) => i === index ? { ...item, contentType: e.target.value } : item))} /></td>}
										<td><input type="text" value={row.contentName} onChange={(e) => onChange(rows.map((item, i) => i === index ? { ...item, contentName: e.target.value } : item))} /></td>
										{options?.showVideoUrl && <td><input type="text" value={row.videoUrl || ''} onChange={(e) => onChange(rows.map((item, i) => i === index ? { ...item, videoUrl: e.target.value } : item))} /></td>}
										<td><button type="button" className="admin-footer-btn-delete" onClick={() => onChange(rows.filter((_, i) => i !== index))}>삭제</button></td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			)
			}

	const renderFixedVideoRows = (title: string, rows: ProgramContentRow[], fixedCount: number, onChange: (rows: ProgramContentRow[]) => void) => {
		const fixedRows = normalizeFixedVideoRows(rows, fixedCount)
		const showOrder = fixedCount > 1
		return (
			<div className="education-program-sub-block">
				<div className="education-program-sub-header">
					<strong>{title}</strong>
				</div>
				<table className="table education-program-nested-table">
					<thead>
						<tr>
							{showOrder && <th style={{ width: 76 }}>순서변경</th>}
							<th>콘텐츠 이름</th>
							<th>영상 url</th>
						</tr>
					</thead>
					<tbody>
						{fixedRows.map((row, index) => (
							<tr key={index}>
								{showOrder && (
									<td>
										<div className="education-program-order-buttons">
											<button type="button" onClick={() => onChange(moveListItem(fixedRows, index, -1))}>↑</button>
											<button type="button" onClick={() => onChange(moveListItem(fixedRows, index, 1))}>↓</button>
										</div>
									</td>
								)}
								<td><input type="text" value={row.contentName} onChange={(e) => onChange(fixedRows.map((item, i) => i === index ? { ...item, contentName: e.target.value } : item))} /></td>
								<td><input type="text" value={row.videoUrl || ''} onChange={(e) => onChange(fixedRows.map((item, i) => i === index ? { ...item, videoUrl: e.target.value } : item))} /></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	}

	const renderTextareaBlock = (
		title: string,
		rows: ProgramTextRow[],
		onChange: (rows: ProgramTextRow[]) => void
	) => (
		<div className="education-program-textarea-block">
			<label>
				<span>{title}</span>
				<textarea
					rows={3}
					value={rows.map((row) => row.text).join('\n')}
					onChange={(e) => onChange(e.target.value ? [{ text: e.target.value }] : [])}
				/>
			</label>
		</div>
	)

	const renderEvaluationRows = () => (
		<div className="education-program-eval-block">
			<div className="education-program-sub-header">
				<strong>평가지 및 설문지</strong>
			</div>
			<div className="education-program-eval-rows">
				<label>
					<span>학생 평가지</span>
					<div className="education-program-eval-picker-row">
						<button type="button" className="admin-list-btn-sky" onClick={() => openEvaluationPicker('studentEvaluation')}>추가</button>
						<input type="text" value={evalInfo.studentEvaluation} onChange={(e) => setForm({ ...form, evalJson: JSON.stringify({ ...evalInfo, studentEvaluation: e.target.value }) })} placeholder="평가지를 등록해 주세요." />
					</div>
				</label>
				<label>
					<span>학생 만족도 설문지</span>
					<div className="education-program-eval-picker-row">
						<button type="button" className="admin-list-btn-sky" onClick={() => openEvaluationPicker('survey')}>추가</button>
						<input type="text" value={evalInfo.survey} onChange={(e) => setForm({ ...form, evalJson: JSON.stringify({ ...evalInfo, survey: e.target.value }) })} placeholder="설문지를 등록해 주세요." />
					</div>
				</label>
				<label>
					<span>선생님 운영 평가지</span>
					<div className="education-program-eval-picker-row">
						<button type="button" className="admin-list-btn-sky" onClick={() => openEvaluationPicker('teacherEvaluation')}>추가</button>
						<input type="text" value={evalInfo.teacherEvaluation} onChange={(e) => setForm({ ...form, evalJson: JSON.stringify({ ...evalInfo, teacherEvaluation: e.target.value }) })} placeholder="평가지를 등록해 주세요." />
					</div>
				</label>
			</div>
		</div>
	)

	const renderQuestBlocks = (stepIndex: number, quests: ProgramQuestDetail[]) => (
		<div className="education-program-quest-list">
			{quests.map((quest, questIndex) => (
				<div className="education-program-quest-card" key={quest.name}>
					<div className="education-program-quest-title">{quest.name}</div>
					<div className="education-program-basic-grid">
						<label>제목<input type="text" value={quest.title} onChange={(e) => updateQuest(stepIndex, questIndex, { title: e.target.value })} /></label>
						<label>진행장소<input type="text" value={quest.place} onChange={(e) => updateQuest(stepIndex, questIndex, { place: e.target.value })} /></label>
						<label>제한시간(분)<input type="number" value={quest.limitMin} onChange={(e) => updateQuest(stepIndex, questIndex, { limitMin: e.target.value })} /></label>
					</div>
					<div className="education-program-sub-header">
						<strong>콘텐츠</strong>
							<button type="button" className="admin-list-btn-sky" onClick={() => openContentPicker({ kind: 'quest', stepIndex, questIndex })}>추가</button>
					</div>
					{quest.contents.length > 0 && (
						<table className="table education-program-nested-table">
							<thead>
								<tr>
									<th style={{ width: 76 }}>순서변경</th>
									{programType !== 'MISSION' && <th style={{ width: 120 }}>카드분류</th>}
									<th style={{ width: 150 }}>콘텐츠 타입</th>
									<th>콘텐츠 이름</th>
									<th style={{ width: 76 }}>관리</th>
								</tr>
							</thead>
							<tbody>
								{quest.contents.map((content, contentIndex) => (
									<tr key={contentIndex}>
										<td>
											<div className="education-program-order-buttons">
												<button type="button" onClick={() => moveQuestContent(stepIndex, questIndex, contentIndex, -1)}>↑</button>
												<button type="button" onClick={() => moveQuestContent(stepIndex, questIndex, contentIndex, 1)}>↓</button>
											</div>
										</td>
										{programType !== 'MISSION' && <td><input type="text" value={content.cardCategory || ''} onChange={(e) => updateQuestContent(stepIndex, questIndex, contentIndex, { cardCategory: e.target.value })} /></td>}
										<td><input type="text" value={content.contentType} onChange={(e) => updateQuestContent(stepIndex, questIndex, contentIndex, { contentType: e.target.value })} /></td>
										<td><input type="text" value={content.contentName} onChange={(e) => updateQuestContent(stepIndex, questIndex, contentIndex, { contentName: e.target.value })} /></td>
										<td><button type="button" className="admin-footer-btn-delete" onClick={() => deleteQuestContent(stepIndex, questIndex, contentIndex)}>삭제</button></td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			))}
		</div>
	)

	const renderStepDetail = (step: ProgramStepDetail, stepIndex: number) => {
		const hideStepBasicGrid = programType === 'EXPLORE' && step.step === 'STEP2'
		const showStepName = programType === 'MISSION' && step.step === 'STEP1'
		return (
			<div className="education-program-step-card" key={step.step}>
				<div className="education-program-step-title">
					{step.step} 정보{getStepTitleSuffix(step)}
				</div>
				{!hideStepBasicGrid && (
					<div className={`education-program-basic-grid ${showStepName ? 'is-four' : ''}`}>
						{showStepName && <label>STEP1<input type="text" value={step.stepName || ''} onChange={(e) => updateStep(stepIndex, { stepName: e.target.value })} /></label>}
						<label>{showStepName ? 'STEP1 제목' : '제목'}<input type="text" value={step.title} onChange={(e) => updateStep(stepIndex, { title: e.target.value })} /></label>
						<label>진행장소<input type="text" value={step.place} onChange={(e) => updateStep(stepIndex, { place: e.target.value })} /></label>
						<label>제한시간(분)<input type="number" value={step.limitMin} onChange={(e) => updateStep(stepIndex, { limitMin: e.target.value })} /></label>
					</div>
				)}
				{step.videos && renderFixedVideoRows('도입 영상', step.videos, programType === 'MISSION' ? 1 : 3, (rows) => updateStepList(stepIndex, 'videos', rows))}
				{step.thoughts && renderTextRows('생각해봐요', step.thoughts, (rows) => updateStepList(stepIndex, 'thoughts', rows))}
				{step.quests && renderQuestBlocks(stepIndex, step.quests)}
				{step.safetyRules && renderTextareaBlock('안전 수칙', step.safetyRules, (rows) => updateStepList(stepIndex, 'safetyRules', rows))}
				{step.checklists && renderTextareaBlock('제작 체크리스트', step.checklists, (rows) => updateStepList(stepIndex, 'checklists', rows))}
				{step.contents && renderContentRows('콘텐츠', step.contents, (rows) => updateStepList(stepIndex, 'contents', rows), { showCardCategory: programType !== 'MISSION' || step.step !== 'STEP4', onAdd: () => openContentPicker({ kind: 'stepList', stepIndex, key: 'contents' }) })}
				{step.step === 'STEP4' && renderEvaluationRows()}
			</div>
		)
	}

	return (
		<AdminLayout title={pageTitle}>
			<CrudPageCard title={pageTitle} error={popupOpen ? null : error} message={message}>
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
							{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button type="button" className="admin-footer-btn-delete" disabled={selectedIds.size === 0 || loading} onClick={() => void bulkDeletePrograms()}>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openNewPopup} disabled={loading}>등록</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<select className="bbs-post-filter-select" value="prgrmNm" aria-label="검색 조건" disabled>
							<option value="prgrmNm">{nameLabel}</option>
						</select>
						<input
							type="text"
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') void fetchList(1, pageSize) }}
							placeholder="검색어"
							className="bbs-post-filter-input"
						/>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">운영중</label>
						<select value={useYnFilter} onChange={(e) => setUseYnFilter(e.target.value)} className="bbs-post-filter-select">
							<option value="">전체</option>
							<option value="Y">Y</option>
							<option value="N">N</option>
						</select>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList(1, pageSize)} disabled={loading}>검색</button>
						<button
							type="button"
							className="admin-filter-btn-reset"
							onClick={() => {
								setSearchKeyword('')
								setUseYnFilter('')
								void fetchList(1, pageSize, { searchKeyword: '', useYn: '' })
							}}
							disabled={loading}
						>
							초기화
						</button>
					</div>
				</div>
				{programType === 'MISSION' && (
					<p className="education-program-list-note">
						※ 미션 3개(소비습관·이상한 날씨·미래 실천)는 '울산 SDGs 히어로즈'로 묶여 운영됩니다.
					</p>
				)}

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 44 }}><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="전체 선택" /></th>
							<th style={{ width: 80 }}>번호</th>
							<th>{nameLabel}</th>
							<th style={{ width: 90 }}>운영중</th>
							<th style={{ width: 120 }}>작성자</th>
							<th style={{ width: 120 }}>등록일</th>
							<th style={{ width: 120 }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr key={row.prgrmSn ?? row.prgrmNm} onClick={() => void openEditPopup(row.prgrmSn)}>
								<td onClick={(e) => e.stopPropagation()}>
									<input type="checkbox" checked={row.prgrmSn != null && selectedIds.has(row.prgrmSn)} onChange={() => toggleSelectRow(row.prgrmSn)} aria-label={`${row.prgrmNm} 선택`} />
								</td>
								<td>{row.prgrmSn}</td>
								<td style={{ textAlign: 'left' }}>{row.prgrmNm}</td>
								<td>{renderUseBadge(row.useYn)}</td>
								<td>{row.rgtr || '-'}</td>
								<td>{formatDate(row.regDt)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons onEdit={() => void openEditPopup(row.prgrmSn)} onDelete={() => void deleteProgram(row)} disabled={loading} />
								</td>
							</tr>
						))}
						{list.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>}
					</tbody>
				</table>
				<ListPagination page={page} totalPages={totalPages} disabled={loading} onPageChange={(nextPage) => { setPage(nextPage); void fetchList(nextPage, pageSize) }} />
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={popupMode === 'new' ? `${pageTitle.replace(' 관리', '')} 등록` : `${pageTitle.replace(' 관리', '')} 수정`}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveProgram()} disabled={loading}>{popupMode === 'new' ? '등록' : '수정'}</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup} disabled={loading}>닫기</button>
					</>
				}
			>
					{popupError && <p className="form-error" style={{ position: 'sticky', top: 0, zIndex: 2, marginTop: 0 }}>{popupError}</p>}
					<table className="form-table education-program-form-table">
						<tbody>
							<tr className="education-program-section-row">
								<th colSpan={4}>프로그램 기본 정보</th>
							</tr>
							<tr>
								<th>{nameLabel} <span className="required">*</span></th>
								<td colSpan={3}><input type="text" value={form.prgrmNm} onChange={(e) => setForm({ ...form, prgrmNm: e.target.value })} /></td>
							</tr>
							<tr>
								<th>대상</th>
								<td colSpan={3}><input type="text" value={form.trgtCn || ''} onChange={(e) => setForm({ ...form, trgtCn: e.target.value })} /></td>
							</tr>
							<tr>
								<th>총 시간</th>
								<td><input type="number" value={form.totalTmMnt ?? ''} onChange={(e) => setForm({ ...form, totalTmMnt: e.target.value ? Number(e.target.value) : null })} placeholder="분" /></td>
								<th>최대 인원</th>
								<td><input type="number" value={form.maxNope ?? ''} onChange={(e) => setForm({ ...form, maxNope: e.target.value ? Number(e.target.value) : null })} placeholder="명" /></td>
							</tr>
							<tr>
								<th>운영중</th>
								<td colSpan={3}>
									<label style={{ marginRight: 18 }}><input type="radio" checked={form.useYn === 'Y'} onChange={() => setForm({ ...form, useYn: 'Y' })} /> Y</label>
									<label><input type="radio" checked={form.useYn !== 'Y'} onChange={() => setForm({ ...form, useYn: 'N' })} /> N</label>
								</td>
							</tr>
							{programType !== 'MISSION' && (
								<tr>
									<th>간단한 설명</th>
									<td colSpan={3}><input type="text" value={form.simpleExpln || ''} onChange={(e) => setForm({ ...form, simpleExpln: e.target.value })} /></td>
								</tr>
							)}
							<tr>
								<th>시작 전 설명</th>
								<td colSpan={3}><textarea rows={4} value={form.startExpln || ''} onChange={(e) => setForm({ ...form, startExpln: e.target.value })} /></td>
							</tr>
							{programType !== 'MISSION' && (
								<tr>
									<th>이미지 관리</th>
									<td colSpan={3}>
										<div className="education-program-file-row">
											<label className="admin-list-btn-sky">
												파일 첨부
												<input
													type="file"
													accept="image/*"
													style={{ display: 'none' }}
													onChange={(e) => {
														const file = e.target.files?.[0] ?? null
														setProgramImageFile(file)
														setProgramImageName(file?.name || programImageName)
													}}
												/>
											</label>
											<span className="muted">{programImageName || evalInfo[PROGRAM_IMAGE_KEY] || '첨부파일 없음'}</span>
										</div>
									</td>
								</tr>
							)}
							<tr className="education-program-section-row">
								<th colSpan={4}>팀/코스/동선 정보</th>
							</tr>
							<tr>
								<th>{teamLabel}</th>
								<td colSpan={3}>
									<div className="education-program-count-inline">
										<input type="number" value={form.teamCnt ?? ''} onChange={(e) => setForm({ ...form, teamCnt: e.target.value ? Number(e.target.value) : null })} />
										<span>{programType === 'MISSION' ? '개 동선' : '팀'}</span>
									</div>
								</td>
							</tr>
							<tr>
								<th>{programType === 'MISSION' ? '동선정보' : '동선(퀘스트 진행 순서)'}</th>
								<td colSpan={3}>
									<table className="table education-program-nested-table">
										<thead>
											<tr>
												<th style={{ width: 150 }}>{programType === 'MISSION' ? '동선' : '팀/코스'}</th>
												{Array.from({ length: PROGRAM_ROUTE_STEP_COUNT }, (_, stepIndex) => <th key={stepIndex}>{stepIndex + 1}순서</th>)}
											</tr>
										</thead>
										<tbody>
											{routeRows.map((row, index) => (
													<tr key={index}>
														<td className="education-program-fixed-label">{row.name}</td>
														{row.steps.map((step, stepIndex) => (
															<td key={stepIndex}>
																<select value={step} onChange={(e) => updateRouteStep(index, stepIndex, e.target.value)}>
																	<option value="">선택</option>
																	{routeStepOptions.map((option) => <option key={option} value={option}>{option}</option>)}
																</select>
															</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</td>
							</tr>
							<tr className="education-program-section-row">
								<th colSpan={4}>STEP 정보</th>
							</tr>
							<tr>
								<th>상세 설정</th>
								<td colSpan={3}>{visibleStepRows.map(({ row, index }) => renderStepDetail(row, index))}</td>
							</tr>
					</tbody>
				</table>
			</LayerPopup>
			<LayerPopup
				open={contentPickerOpen}
				title="콘텐츠 검색"
				onClose={() => {
					setContentPickerOpen(false)
					setContentPickerTarget(null)
				}}
				footer={
					<button
						type="button"
						className="admin-footer-btn-close"
						onClick={() => {
							setContentPickerOpen(false)
							setContentPickerTarget(null)
						}}
					>
						닫기
					</button>
				}
			>
				{contentPickerError && <p className="form-error" style={{ marginTop: 0 }}>{contentPickerError}</p>}
				<div className="bbs-post-filters search-section education-program-picker-filter">
					<div className="bbs-post-filter-row">
						<input
							type="text"
							value={contentPickerKeyword}
							onChange={(e) => setContentPickerKeyword(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') void fetchContentPickerList(contentPickerKeyword) }}
							placeholder="콘텐츠 이름을 검색해주세요."
							className="bbs-post-filter-input"
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchContentPickerList(contentPickerKeyword)} disabled={contentPickerLoading}>검색</button>
					</div>
				</div>
				<table className="table education-program-picker-table">
					<thead>
						<tr>
							<th style={{ width: 70 }}>번호</th>
							{showContentPickerCardCategory() && <th style={{ width: 120 }}>카드분류</th>}
							<th style={{ width: 150 }}>콘텐츠 타입</th>
							<th>콘텐츠 이름</th>
							<th style={{ width: 80 }}>선택</th>
						</tr>
					</thead>
					<tbody>
						{contentPickerList.map((content) => (
							<tr key={content.cntnSn ?? content.cntnTtl}>
								<td>{content.cntnSn}</td>
								{showContentPickerCardCategory() && <td>{content.cardClsfNm || content.cardClsfCd || '-'}</td>}
								<td>{content.cntnTypeNm || content.cntnTypeCd || '-'}</td>
								<td style={{ textAlign: 'left' }}>{content.cntnTtl}</td>
								<td><button type="button" className="admin-list-btn-sky" onClick={() => selectContentFromPicker(content)}>선택</button></td>
							</tr>
						))}
						{contentPickerList.length === 0 && (
							<tr>
								<td colSpan={showContentPickerCardCategory() ? 5 : 4} style={{ textAlign: 'center' }}>{contentPickerLoading ? '조회 중입니다.' : '데이터가 없습니다.'}</td>
							</tr>
						)}
					</tbody>
				</table>
			</LayerPopup>
			<LayerPopup
				open={evaluationPickerOpen}
				title={evaluationPickerTitle()}
				onClose={() => setEvaluationPickerOpen(false)}
				footer={
					<button type="button" className="admin-footer-btn-close" onClick={() => setEvaluationPickerOpen(false)}>
						닫기
					</button>
				}
			>
				{evaluationPickerError && <p className="form-error" style={{ marginTop: 0 }}>{evaluationPickerError}</p>}
				<div className="bbs-post-filters search-section education-program-picker-filter">
					<div className="bbs-post-filter-row">
						<input
							type="text"
							value={evaluationPickerKeyword}
							onChange={(e) => setEvaluationPickerKeyword(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') void fetchEvaluationPickerList(evaluationPickerKind, evaluationPickerKeyword) }}
							placeholder={evaluationPickerKind === 'survey' ? '설문지 이름을 검색해주세요.' : '평가지 이름을 검색해주세요.'}
							className="bbs-post-filter-input"
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchEvaluationPickerList(evaluationPickerKind, evaluationPickerKeyword)} disabled={evaluationPickerLoading}>검색</button>
					</div>
				</div>
				<table className="table education-program-picker-table">
					<thead>
						<tr>
							<th style={{ width: 70 }}>번호</th>
							<th>{evaluationPickerKind === 'survey' ? '설문지 이름' : '평가지 이름'}</th>
							<th style={{ width: 80 }}>선택</th>
						</tr>
					</thead>
					<tbody>
						{evaluationPickerList.map((item) => (
							<tr key={item.qstnrSn ?? item.qstnrNm}>
								<td>{item.qstnrSn}</td>
								<td style={{ textAlign: 'left' }}>{item.qstnrNm}</td>
								<td><button type="button" className="admin-list-btn-sky" onClick={() => selectEvaluationFromPicker(item)}>선택</button></td>
							</tr>
						))}
						{evaluationPickerList.length === 0 && (
							<tr>
								<td colSpan={3} style={{ textAlign: 'center' }}>
									{evaluationPickerLoading ? '조회 중입니다.' : '데이터가 없습니다.'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

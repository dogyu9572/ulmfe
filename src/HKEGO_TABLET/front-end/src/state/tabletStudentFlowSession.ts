import { TabletContent, TabletProgressLog, TabletQuestionnaireQuestion, TabletSavedAnswer, TabletSession, TabletStudent } from '../api/tabletApi'
import { stripEmphasisMarkers } from '../utils/emphasisText'

const STORAGE_KEY = 'hkegoTabletStudentFlowSession'

const normalizeTeamName = (value?: string | null) => {
	const normalized = (value || '').trim()
	if (!normalized) return ''
	return normalized.endsWith('팀') ? normalized : `${normalized}팀`
}

const routeSeparators = /\s*(?:->|→|,|，|>|\/)\s*/g

export type TabletStudentFlowStudent = Pick<TabletStudent, 'stdntSn' | 'stdntNo' | 'clasNm' | 'clasNo' | 'stdntNm' | 'teamNm' | 'asgnNm' | 'routeCn' | 'prgrsRt'>

export type TabletProgramRouteRow = {
	name: string
	steps: string[]
}

export type TabletProgramQuest = {
	name: string
	title?: string
	place?: string
	limitMin?: number | string
	contents?: TabletProgramContentRow[]
}

export type TabletProgramContentRow = {
	cntnSn?: number | string | null
	contentName?: string
	contentType?: string
	cardCategory?: string
	videoUrl?: string
}

export type TabletProgramTextRow = {
	text: string
}

export type TabletProgramStep = {
	step: string
	stepName?: string
	title?: string
	place?: string
	limitMin?: number | string
	content?: string
	videos?: TabletProgramContentRow[]
	thoughts?: TabletProgramTextRow[]
	quests?: TabletProgramQuest[]
	contents?: TabletProgramContentRow[]
	safetyRules?: TabletProgramTextRow[]
	checklists?: TabletProgramTextRow[]
}

export type TabletStudentFlowSession = {
	rsvtSn: number
	rsvtYmd: string
	vstHm: string
	schlNm: string
	scyrNm: string
	prgrmTypeCd: string
	prgrmTypeNm: string
	prgrmSn: number
	prgrmNm: string
	simpleExpln?: string
	startExpln?: string
	routeJson?: string
	stepJson?: string
	evalJson?: string
	totalStudentCount: number
	selectedStudents: TabletStudentFlowStudent[]
	contents: TabletContent[]
	progressLogs: TabletProgressLog[]
	savedAnswers: TabletSavedAnswer[]
	evaluationQuestions: TabletQuestionnaireQuestion[]
	surveyQuestions: TabletQuestionnaireQuestion[]
}

const readJson = (value: string | null): TabletStudentFlowSession | null => {
	if (!value) return null
	try {
		const parsed = JSON.parse(value) as TabletStudentFlowSession
		if (!parsed?.rsvtSn || !Array.isArray(parsed.selectedStudents) || parsed.selectedStudents.length === 0) return null
		return parsed
	} catch {
		return null
	}
}

export const readTabletStudentFlowSession = () => {
	if (typeof window === 'undefined') return null
	return readJson(window.sessionStorage.getItem(STORAGE_KEY))
}

export const saveTabletStudentFlowSession = (session: TabletSession, selectedStudentSns: number[]) => {
	const reservation = session.reservation
	if (!reservation) return null
	const selectedSet = new Set(selectedStudentSns)
	const selectedStudents = session.students
		.filter((student) => selectedSet.has(student.stdntSn))
		.map(({ stdntSn, stdntNo, clasNm, clasNo, stdntNm, teamNm, asgnNm, routeCn, prgrsRt }) => ({ stdntSn, stdntNo, clasNm, clasNo, stdntNm, teamNm: normalizeTeamName(teamNm), asgnNm, routeCn, prgrsRt }))

	if (selectedStudents.length === 0) return null

	const flowSession: TabletStudentFlowSession = {
		rsvtSn: reservation.rsvtSn,
		rsvtYmd: session.rsvtYmd,
		vstHm: reservation.vstHm,
		schlNm: reservation.schlNm,
		scyrNm: reservation.scyrNm,
		prgrmTypeCd: reservation.prgrmTypeCd,
		prgrmTypeNm: reservation.prgrmTypeNm,
		prgrmSn: reservation.prgrmSn,
		prgrmNm: reservation.prgrmNm,
		simpleExpln: reservation.simpleExpln,
		startExpln: reservation.startExpln,
		routeJson: reservation.routeJson,
		stepJson: reservation.stepJson,
		evalJson: reservation.evalJson,
		totalStudentCount: session.students.length || reservation.stdntCnt || reservation.actlNope || reservation.rsvtNope,
		selectedStudents,
		contents: session.contents ?? [],
		progressLogs: session.progressLogs ?? [],
		savedAnswers: session.savedAnswers ?? [],
		evaluationQuestions: session.evaluationQuestions ?? [],
		surveyQuestions: session.surveyQuestions ?? []
	}
	window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flowSession))
	return flowSession
}

export const clearTabletStudentFlowSession = () => {
	if (typeof window === 'undefined') return
	window.sessionStorage.removeItem(STORAGE_KEY)
}

export const studentFlowDisplayName = (session: TabletStudentFlowSession | null) => {
	const students = session?.selectedStudents ?? []
	if (students.length === 0) return '학생 정보 없음'
	if (students.length === 1) return students[0].stdntNm
	return `${students[0].stdntNm} 외 ${students.length - 1}명`
}

export const studentFlowTeamName = (session: TabletStudentFlowSession | null) => {
	const teams = Array.from(new Set((session?.selectedStudents ?? []).map((student) => normalizeTeamName(student.teamNm)).filter(Boolean)))
	return teams.length > 0 ? teams.join(', ') : '팀 정보 없음'
}

export const studentFlowCourseName = (session: TabletStudentFlowSession | null) => {
	const teams = Array.from(new Set((session?.selectedStudents ?? []).map((student) => normalizeTeamName(student.teamNm)).filter(Boolean)))
	if (teams.length > 0) return teams.map((team) => team.replace(/팀$/, '코스')).join(', ')
	return '동선 정보 없음'
}

const parseJsonList = <T>(value?: string | null): T[] => {
	if (!value) return []
	try {
		const parsed = JSON.parse(value) as unknown
		return Array.isArray(parsed) ? parsed as T[] : []
	} catch {
		return []
	}
}

const normalizeProgramContentRows = (rows: unknown): TabletProgramContentRow[] => {
	if (!Array.isArray(rows)) return []
	return rows
		.map((content) => {
			const row = content as Partial<TabletProgramContentRow>
			return {
				cntnSn: row.cntnSn,
				contentName: typeof row.contentName === 'string' ? row.contentName.trim() : '',
				contentType: typeof row.contentType === 'string' ? row.contentType.trim() : '',
				cardCategory: typeof row.cardCategory === 'string' ? row.cardCategory.trim() : '',
				videoUrl: typeof row.videoUrl === 'string' ? row.videoUrl.trim() : ''
			}
		})
		.filter((content) => content.cntnSn || content.contentName || content.videoUrl)
}

const normalizeProgramTextRows = (rows: unknown): TabletProgramTextRow[] => {
	if (!Array.isArray(rows)) return []
	return rows
		.map((row) => {
			if (typeof row === 'string') return { text: row.trim() }
			const text = (row as Partial<TabletProgramTextRow>)?.text
			return { text: typeof text === 'string' ? text.trim() : '' }
		})
		.filter((row) => row.text)
}

const courseKeyFromTeam = (session: TabletStudentFlowSession | null) => {
	const firstTeam = normalizeTeamName(session?.selectedStudents[0]?.teamNm)
	return firstTeam.replace(/팀$/, '').trim()
}

const routeNameMatchesCourse = (routeName: string, courseKey: string) => {
	if (!courseKey) return false
	const normalizedName = routeName.replace(/\s/g, '')
	const normalizedKey = courseKey.replace(/\s/g, '')
	return normalizedName.includes(normalizedKey)
}

export const studentFlowProgramRouteRows = (session: TabletStudentFlowSession | null) => parseJsonList<Partial<TabletProgramRouteRow>>(session?.routeJson)
	.map((row) => ({
		name: typeof row.name === 'string' ? row.name.trim() : '',
		steps: Array.isArray(row.steps) ? row.steps.map((step) => typeof step === 'string' ? step.trim() : '').filter(Boolean) : []
	}))
	.filter((row) => row.name || row.steps.length > 0)

export const studentFlowSelectedProgramRoute = (session: TabletStudentFlowSession | null) => {
	const rows = studentFlowProgramRouteRows(session)
	const courseKey = courseKeyFromTeam(session)
	return rows.find((row) => routeNameMatchesCourse(row.name, courseKey)) ?? rows[0] ?? null
}

export const studentFlowRouteItems = (session: TabletStudentFlowSession | null) => {
	const programRouteSteps = studentFlowSelectedProgramRoute(session)?.steps ?? []
	if (programRouteSteps.length > 0) return programRouteSteps

	const routeTexts = Array.from(new Set((session?.selectedStudents ?? []).map((student) => (student.routeCn || '').trim()).filter(Boolean)))
	const selectedRoute = routeTexts[0]
	if (!selectedRoute) return []
	return selectedRoute
		.split(routeSeparators)
		.map((item) => item.trim())
		.filter(Boolean)
}

export const studentFlowAssignmentName = (session: TabletStudentFlowSession | null) => {
	const assignments = Array.from(new Set((session?.selectedStudents ?? []).map((student) => (student.asgnNm || '').trim()).filter(Boolean)))
	return assignments.join(', ')
}

export const studentFlowMissionStartExpln = (session: TabletStudentFlowSession | null) => stripEmphasisMarkers(session?.startExpln).trim()

export const studentFlowProgramSteps = (session: TabletStudentFlowSession | null) => parseJsonList<Partial<TabletProgramStep>>(session?.stepJson)
	.map((row) => ({
		step: typeof row.step === 'string' ? row.step.trim() : '',
		stepName: typeof row.stepName === 'string' ? row.stepName.trim() : '',
		title: typeof row.title === 'string' ? row.title.trim() : '',
		place: typeof row.place === 'string' ? row.place.trim() : '',
		limitMin: row.limitMin,
		content: typeof row.content === 'string' ? row.content.trim() : '',
		videos: normalizeProgramContentRows(row.videos),
		thoughts: normalizeProgramTextRows(row.thoughts),
		quests: Array.isArray(row.quests)
			? row.quests.map((quest) => ({
					name: typeof quest.name === 'string' ? quest.name.trim() : '',
					title: typeof quest.title === 'string' ? quest.title.trim() : '',
					place: typeof quest.place === 'string' ? quest.place.trim() : '',
					limitMin: quest.limitMin,
					contents: normalizeProgramContentRows(quest.contents)
				})).filter((quest) => quest.name || quest.title || quest.place)
			: [],
		contents: normalizeProgramContentRows(row.contents),
		safetyRules: normalizeProgramTextRows(row.safetyRules),
		checklists: normalizeProgramTextRows(row.checklists)
	}))
	.filter((row) => row.step || row.title || row.place || (row.quests?.length ?? 0) > 0)

export const studentFlowMissionQuestByRouteIndex = (session: TabletStudentFlowSession | null, routeIndex: number): TabletProgramQuest | null => {
	const routeName = studentFlowRouteItems(session)[routeIndex] || ''
	const step3 = studentFlowProgramSteps(session).find((step) => step.step === 'STEP3')
	const quest = step3?.quests?.find((item) => item.name === routeName)
	return quest ?? (routeName ? { name: routeName, title: '', place: '', contents: [] } : null)
}

export const studentFlowMissionPagePathByRouteIndex = (routeIndex: number) => `/student/mission${String(routeIndex + 3).padStart(2, '0')}`

export const studentFlowMissionEndPagePathByRouteIndex = (routeIndex: number) => `/student/mission${String(routeIndex + 3).padStart(2, '0')}_end`

export const studentFlowNextMissionPathAfterRouteIndex = (session: TabletStudentFlowSession | null, routeIndex: number) => {
	const nextIndex = routeIndex + 1
	return studentFlowRouteItems(session)[nextIndex] ? studentFlowMissionPagePathByRouteIndex(nextIndex) : '/student/mission_end'
}

export const studentFlowNextMissionLabelAfterRouteIndex = (session: TabletStudentFlowSession | null, routeIndex: number) => {
	const nextLabel = studentFlowRouteItems(session)[routeIndex + 1] || ''
	return nextLabel || '실천력 부여'
}

export const studentFlowCompletedMissionStepCodes = (session: TabletStudentFlowSession | null) => {
	const selectedStudentIds = (session?.selectedStudents ?? []).map((student) => student.stdntSn)
	const routes = studentFlowRouteItems(session)
	return new Set(routes.flatMap((_routeName, routeIndex) => {
		const stepCd = studentFlowMissionStepCode(routeIndex)
		const contents = studentFlowMissionQuestContents(session, routeIndex)
		const requiredAnswerKeys = contents.flatMap((content) => {
			const contentId = content.cntnSn || 0
			const questionIds = content.questions.length > 0
				? content.questions.map((question) => question.cntnQstnSn || 0)
				: [contentId]
			return questionIds.map((questionId) => `${contentId}:${questionId}`)
		})
		if (selectedStudentIds.length === 0 || requiredAnswerKeys.length === 0) return []

		const completedByEveryStudent = selectedStudentIds.every((studentSn) => {
			const hasDoneLog = (session?.progressLogs ?? []).some((log) =>
				log.stdntSn === studentSn && log.stepCd === stepCd && log.stepSttsCd === 'DONE')
			if (!hasDoneLog) return false
			const answerKeys = new Set((session?.savedAnswers ?? [])
				.filter((answer) => answer.stdntSn === studentSn && answer.stepCd === stepCd && (answer.ansCn || '').trim())
				.map((answer) => `${answer.cntnSn || 0}:${answer.qstnSn || 0}`))
			return requiredAnswerKeys.every((key) => answerKeys.has(key))
		})
		return completedByEveryStudent ? [stepCd] : []
	}))
}

export const studentFlowStoredProgressRate = (session: TabletStudentFlowSession | null) => {
	const rates = (session?.selectedStudents ?? [])
		.map((student) => Number(student.prgrsRt) || 0)
		.filter((rate) => Number.isFinite(rate))
	return rates.length > 0 ? Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length) : 0
}

export const studentFlowMissionStepCode = (routeIndex: number) => `MISSION${String(routeIndex + 1).padStart(2, '0')}`

export const studentFlowSavedAnswersByQuestion = (session: TabletStudentFlowSession | null, routeIndex: number) => {
	const selectedStudentIds = new Set((session?.selectedStudents ?? []).map((student) => student.stdntSn))
	const stepCd = studentFlowMissionStepCode(routeIndex)
	const map = new Map<string, string>()
	;(session?.savedAnswers ?? [])
		.filter((answer) => selectedStudentIds.has(answer.stdntSn) && answer.stepCd === stepCd)
		.forEach((answer) => {
			const key = `${answer.cntnSn || 0}:${answer.qstnSn || 0}`
			if (!map.has(key)) map.set(key, answer.ansCn || '')
			const questionTextKey = `${answer.cntnSn || 0}:${answer.qstnCn || ''}`
			if (answer.qstnCn && !map.has(questionTextKey)) map.set(questionTextKey, answer.ansCn || '')
		})
	return map
}

const contentTypeNameByCode: Record<string, string> = {
	SELECT: '선택형 활동',
	DATA: '데이터 입력',
	SENTENCE: '문장 완성',
	PHOTO: '사진 업로드'
}

const cardCategoryNameByCode: Record<string, string> = {
	EXP: '탐구카드',
	EXPLORE: '탐구카드',
	MISSION: '미션카드',
	EXPERIENCE: '체험카드',
	ACTIVITY: '체험카드'
}

const resolveLinkedProgramContents = (linkedContents: TabletProgramContentRow[], contentDetails: TabletContent[]): TabletContent[] => linkedContents.map((linked, index) => {
	const linkedId = Number(linked.cntnSn)
	const detail = contentDetails.find((content) => Number.isFinite(linkedId) && content.cntnSn === linkedId)
		?? contentDetails.find((content) => content.cntnTtl === linked.contentName)
	if (detail) return detail

	const contentType = linked.contentType || ''
	const cardCategory = linked.cardCategory || ''
	return {
		cntnSn: Number.isFinite(linkedId) ? linkedId : -1 * (index + 1),
		cntnTypeCd: contentType,
		cntnTypeNm: contentTypeNameByCode[contentType] || contentType,
		cardClsfCd: cardCategory,
		cardClsfNm: cardCategoryNameByCode[cardCategory] || cardCategory,
		cntnTtl: linked.contentName || '콘텐츠 상세가 없습니다.',
		cntnCn: '',
		questions: []
	}
})

export const studentFlowMissionQuestContents = (session: TabletStudentFlowSession | null, routeIndex: number) => {
	const quest = studentFlowMissionQuestByRouteIndex(session, routeIndex)
	const linkedContents = quest?.contents ?? []
	const contentDetails = session?.contents ?? []
	if (linkedContents.length === 0) return []

	return resolveLinkedProgramContents(linkedContents, contentDetails)
}

const selectedStudentIdSet = (session: TabletStudentFlowSession | null) => new Set((session?.selectedStudents ?? []).map((student) => student.stdntSn))

const missionAnswerKeysByRouteIndex = (session: TabletStudentFlowSession | null, routeIndex: number) => {
	const selectedStudentIds = selectedStudentIdSet(session)
	const stepCd = studentFlowMissionStepCode(routeIndex)
	return new Set((session?.savedAnswers ?? [])
		.filter((answer) => selectedStudentIds.has(answer.stdntSn) && answer.stepCd === stepCd && (answer.ansCn || '').trim())
		.map((answer) => `${answer.cntnSn || 0}:${answer.qstnSn || 0}`))
}

export const studentFlowMissionCompletedContentCountByRouteIndex = (session: TabletStudentFlowSession | null, routeIndex: number) => {
	const contents = studentFlowMissionQuestContents(session, routeIndex)
	if (contents.length === 0) return 0
	const answerKeys = missionAnswerKeysByRouteIndex(session, routeIndex)
	return contents.filter((content) => {
		const contentId = content.cntnSn || 0
		const questionIds = content.questions.length > 0
			? content.questions.map((question) => question.cntnQstnSn || 0)
			: [contentId]
		return questionIds.length > 0 && questionIds.every((questionId) => answerKeys.has(`${contentId}:${questionId}`))
	}).length
}

export const studentFlowMissionRegularStickerCount = (session: TabletStudentFlowSession | null) => {
	const completedStepCodes = studentFlowCompletedMissionStepCodes(session)
	return studentFlowRouteItems(session)
		.slice(0, 3)
		.filter((_routeName, routeIndex) => completedStepCodes.has(studentFlowMissionStepCode(routeIndex)))
		.length
}

export const studentFlowMissionBonusStickerCount = (session: TabletStudentFlowSession | null) => {
	const routes = studentFlowRouteItems(session)
	const completedStepCodes = studentFlowCompletedMissionStepCodes(session)
	const completedMissionCount = routes.filter((_routeName, routeIndex) => completedStepCodes.has(studentFlowMissionStepCode(routeIndex))).length
	const allRouteMissionsCompleted = routes.length > 0 && completedMissionCount >= routes.length
	return allRouteMissionsCompleted ? 4 : 0
}

export const studentFlowExploreIntroStep = (session: TabletStudentFlowSession | null) => studentFlowProgramSteps(session).find((step) => step.step === 'STEP1') ?? null

export const studentFlowExploreVideoRows = (session: TabletStudentFlowSession | null) => {
	const step = studentFlowExploreIntroStep(session)
	return step?.videos ?? []
}

export const studentFlowExploreThoughtRows = (session: TabletStudentFlowSession | null) => {
	const step = studentFlowExploreIntroStep(session)
	return (step?.thoughts ?? []).map((thought) => thought.text).filter(Boolean)
}

export const studentFlowExploreStepByCode = (session: TabletStudentFlowSession | null, stepCode: string) => studentFlowProgramSteps(session).find((step) => step.step === stepCode) ?? null

export const studentFlowExploreQuestByRouteIndex = (session: TabletStudentFlowSession | null, routeIndex: number): TabletProgramQuest | null => {
	const routeName = studentFlowRouteItems(session)[routeIndex] || ''
	const step2 = studentFlowExploreStepByCode(session, 'STEP2')
	const quest = step2?.quests?.find((item) => item.name === routeName)
	return quest ?? (routeName ? { name: routeName, title: '', place: '', contents: [] } : null)
}

export const studentFlowExploreStepCode = (routeIndex: number) => `QUEST${String(routeIndex + 1).padStart(2, '0')}`

export const studentFlowExploreSavedAnswersByQuestion = (session: TabletStudentFlowSession | null, routeIndex: number) => {
	const selectedStudentIds = new Set((session?.selectedStudents ?? []).map((student) => student.stdntSn))
	const stepCd = studentFlowExploreStepCode(routeIndex)
	const map = new Map<string, string>()
	;(session?.savedAnswers ?? [])
		.filter((answer) => selectedStudentIds.has(answer.stdntSn) && answer.stepCd === stepCd)
		.forEach((answer) => {
			const key = `${answer.cntnSn || 0}:${answer.qstnSn || 0}`
			if (!map.has(key)) map.set(key, answer.ansCn || '')
			const questionTextKey = `${answer.cntnSn || 0}:${answer.qstnCn || ''}`
			if (answer.qstnCn && !map.has(questionTextKey)) map.set(questionTextKey, answer.ansCn || '')
		})
	return map
}

export const studentFlowExploreQuestContents = (session: TabletStudentFlowSession | null, routeIndex: number) => {
	const quest = studentFlowExploreQuestByRouteIndex(session, routeIndex)
	const linkedContents = quest?.contents ?? []
	const contentDetails = session?.contents ?? []
	if (linkedContents.length === 0) return []

	return resolveLinkedProgramContents(linkedContents, contentDetails)
}

export const studentFlowExploreStepContents = (session: TabletStudentFlowSession | null, stepCode: string) => {
	const step = studentFlowExploreStepByCode(session, stepCode)
	const linkedContents = step?.contents ?? []
	const contentDetails = session?.contents ?? []
	if (linkedContents.length === 0) return []

	return resolveLinkedProgramContents(linkedContents, contentDetails)
}

export const studentFlowCompletedExploreStepCodes = (session: TabletStudentFlowSession | null) => {
	const selectedStudentIds = new Set((session?.selectedStudents ?? []).map((student) => student.stdntSn))
	return new Set((session?.progressLogs ?? [])
		.filter((log) => selectedStudentIds.has(log.stdntSn) && log.stepSttsCd === 'DONE')
		.map((log) => log.stepCd))
}

export const studentFlowClassName = (session: TabletStudentFlowSession | null) => {
	const firstStudent = session?.selectedStudents[0]
	const school = session?.schlNm || ''
	const grade = session?.scyrNm ? `${session.scyrNm}학년` : ''
	const className = firstStudent?.clasNm ? `${firstStudent.clasNm}반` : ''
	return [school, grade, className].filter(Boolean).join(' ')
}

export const studentFlowReservation = (session: TabletStudentFlowSession | null) => {
	if (!session) return null
	return {
		rsvtSn: session.rsvtSn,
		rsvtNo: '',
		schlNm: session.schlNm,
		scyrNm: session.scyrNm,
		rsvtYmd: session.rsvtYmd,
		vstHm: session.vstHm,
		rsvtNope: session.totalStudentCount,
		actlNope: session.totalStudentCount,
		prgrmTypeCd: session.prgrmTypeCd,
		prgrmTypeNm: session.prgrmTypeNm,
		prgrmSn: 0,
		prgrmNm: session.prgrmNm,
		simpleExpln: session.simpleExpln,
		startExpln: session.startExpln,
		routeJson: session.routeJson,
		stepJson: session.stepJson,
		evalJson: session.evalJson,
		lrnSttsCd: '',
		lrnSttsNm: '',
		stdntCnt: session.totalStudentCount
	}
}

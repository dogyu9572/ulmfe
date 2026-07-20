export const questionnaireLinkCode = (
	qstnrSn: number | null | undefined,
	qstnrTypeCd: 'EVAL' | 'SURVEY',
	evlSeCd?: string
) => {
	if (qstnrSn == null || qstnrSn <= 0) return ''
	const prefix = qstnrTypeCd === 'SURVEY' ? 'survey' : evlSeCd === 'TEACHER' ? 'op-eval' : 'eval'
	return `${prefix}${String(qstnrSn).padStart(3, '0')}`
}

export const questionnairePreviewUrl = (linkCode: string) => {
	const path = `/student/quest_survey/${encodeURIComponent(linkCode)}`
	const configuredBaseUrl = (import.meta.env.VITE_TABLET_BASE_URL ?? '').trim().replace(/\/$/, '')
	if (configuredBaseUrl) return `${configuredBaseUrl}${path}`

	const url = new URL(window.location.href)
	if (url.hostname.includes('ulmfe-adm')) url.hostname = url.hostname.replace('ulmfe-adm', 'ulmfe-tablet')
	if (url.port === '9131') url.port = '9133'
	url.pathname = path
	url.search = ''
	url.hash = ''
	return url.toString()
}

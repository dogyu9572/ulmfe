import { BASE_PATH, withBasePath } from './basePath'

export type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

export type PublicPageResult<T> = {
	list: T[]
	totalCount: number
	page: number
	size: number
	totalPages: number
}

export type PublicFileInfo = {
	fileId: string
	fileSeq: number
	originalFileName: string
	storedFileName: string
	fileUrl: string
	fileSize: number
	fileExtension: string
	contentType: string
	registeredAt: string
}

export type PublicBoardPost = {
	boardId: string
	postId: string
	title: string
	content: string | null
	writerName: string | null
	categoryCode: string | null
	categoryName: string | null
	noticeYn: string | null
	pinnedYn: string | null
	newYn: string | null
	linkUrl: string | null
	publishedDate: string | null
	attachmentFileId: string | null
	thumbnailFileId: string | null
	thumbnailUrl: string | null
	videoFileId: string | null
	videoUrl: string | null
	viewCount: number
	registeredAt: string | null
	modifiedAt: string | null
	previousPostId: string | null
	previousPostTitle: string | null
	nextPostId: string | null
	nextPostTitle: string | null
	attachments: PublicFileInfo[]
}

export type PublicBoardCategory = {
	categoryCode: string
	categoryName: string
}

export type PublicMainBanner = {
	bannerId: number
	name: string
	mainText: string | null
	subText: string | null
	linkUrl: string | null
	linkTargetCode: string | null
	pcImageUrl: string | null
	mobileImageUrl: string | null
}

export type PublicClosedDayMonth = {
	month: string
	days: number[]
	noticeText: string
}

export type PublicPopup = {
	popupId: number
	name: string
	content: string | null
	positionX: number | null
	positionY: number | null
	width: number | null
	height: number | null
	linkUrl: string | null
	linkTargetCode: string | null
	imageUrl: string | null
}

export type PublicHistory = {
	historyId: number
	year: string
	month: string
	content: string
	imageUrl: string | null
}

/** CI 구분. 구분마다 사용자 페이지 마크업이 달라 네 값으로 고정되어 있다. FILE은 통합 다운로드 파일이다. */
export type PublicCiSectionCode = 'SYMBOL' | 'SIGN' | 'CHAR' | 'FILE'

export type PublicCiItem = {
	ciId: number
	seCd: PublicCiSectionCode
	title: string
	/** 이미지 구분은 노출 경로, FILE 구분은 다운로드 경로다. */
	fileUrl: string | null
	fileName: string | null
}

export type PublicMenu = {
	menuCd: string
	parentMenuCd: string | null
	menuDepth: number
	menuNm: string
	sortSeq: number
}

export type PublicSiteSetting = {
	siteTitle: string | null
	homepageUrl: string | null
	managerEmail: string | null
	institutionName: string | null
	institutionAddress: string | null
	institutionTel: string | null
	/** 관리자가 올린 로고 경로. 비어 있으면 화면이 기본 이미지를 쓴다. */
	logoUrl: string | null
	/** 관리자가 올린 파비콘 경로. 비어 있으면 화면이 기본 파비콘을 쓴다. */
	faviconUrl: string | null
	footerContent: string | null
	/** 서버 application.yml 의 카카오맵 앱 키. */
	kakaoMapAppKey: string | null
}

export type PublicOrganizationMember = {
	organizationMemberId: number
	firstCategoryCode: string
	firstCategoryName: string
	secondCategoryCode: string
	secondCategoryName: string
	position: string
	task: string
	telephone: string
	sortSequence: number
}

export type PublicTerms = {
	termsId: number
	termsTypeCode: 'USE' | 'PRIVACY' | 'VIDEO' | 'EMAIL'
	termsTypeName: string
	title: string
	content: string
	registeredAt: string | null
	modifiedAt: string | null
}

export type PublicSearchPage = {
	searchPageId: number
	menu1DepthName: string
	menu2DepthName: string | null
	menu3DepthName: string | null
	title: string
	content: string
	pageUrl: string
}

export type PublicLibraryBook = {
	bookId: number
	bookManagementNumber: string
	title: string
	imageUrl: string | null
	authorName: string | null
	publisherName: string | null
	publicationYear: string | null
	callNumber: string | null
	locationName: string | null
	description: string | null
	recommendedYn: string | null
	recommendationCategoryCode: string | null
	recommendationCategoryName: string | null
	recommendationSortSequence: number | null
	newBookYear: string | null
	newBookMonth: string | null
	registeredDate: string | null
	viewCount: number
	relatedBooks: PublicLibraryBook[]
}

export type LibraryBookListParams = {
	page?: number
	size?: number
	searchType?: 'all' | 'title' | 'author' | 'content'
	keyword?: string
	recommendedYn?: 'Y'
	category?: string
	newOnly?: boolean
	newBookYear?: string
	newBookMonth?: string
}

export type PublicBoardId = 'ZEHSB' | 'EXHBT' | 'EVENT' | 'FAQ01' | 'GALRY' | 'LRNSUP' | 'LBARC'

export type BoardListParams = {
	page?: number
	size?: number
	searchType?: 'all' | 'title' | 'content'
	keyword?: string
	category?: string
	zone?: 'FUTURE' | 'EARTH' | 'SOCIETY'
	programType?: 'EXPLORE' | 'MISSION'
}

async function requestPublicApi<T>(url: string): Promise<T> {
	const response = await fetch(withBasePath(url), {
		credentials: 'same-origin',
		cache: 'no-store'
	})
	const result = await response.json() as ApiResponse<T>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '데이터를 불러오지 못했습니다.')
	}
	return result.data
}

function toQueryString(params: BoardListParams): string {
	const query = new URLSearchParams()
	if (params.page) query.set('page', String(params.page))
	if (params.size) query.set('size', String(params.size))
	if (params.searchType) query.set('searchType', params.searchType)
	if (params.keyword?.trim()) query.set('keyword', params.keyword.trim())
	if (params.category?.trim()) query.set('category', params.category.trim())
	if (params.zone) query.set('zone', params.zone)
	if (params.programType) query.set('programType', params.programType)
	const value = query.toString()
	return value ? `?${value}` : ''
}

export function getPublicBoardPosts(boardId: PublicBoardId, params: BoardListParams = {}) {
	return requestPublicApi<PublicPageResult<PublicBoardPost>>(
		`/api/user/boards/${encodeURIComponent(boardId)}${toQueryString(params)}`
	)
}

export function getPublicBoardPost(boardId: PublicBoardId, postId: string, increaseViewCount = true) {
	const query = increaseViewCount ? '' : '?increaseViewCount=false'
	return requestPublicApi<PublicBoardPost>(
		`/api/user/boards/${encodeURIComponent(boardId)}/${encodeURIComponent(postId)}${query}`
	)
}

export function getPublicBoardCategories(boardId: PublicBoardId) {
	return requestPublicApi<PublicBoardCategory[]>(
		`/api/user/boards/${encodeURIComponent(boardId)}/categories`
	)
}

export function getPublicClosedDays(month?: string) {
	const query = month ? `?month=${encodeURIComponent(month)}` : ''
	return requestPublicApi<PublicClosedDayMonth>(`/api/user/main/closed-days${query}`)
}

export function getPublicMainBanners() {
	return requestPublicApi<PublicMainBanner[]>('/api/user/main/banners')
}

export function getPublicPopups() {
	return requestPublicApi<PublicPopup[]>('/api/user/main/popups')
}

export function getPublicCi() {
	return requestPublicApi<PublicCiItem[]>('/api/user/ci')
}

export function getPublicHistory() {
	return requestPublicApi<PublicHistory[]>('/api/user/history')
}

export function getPublicOrganization() {
	return requestPublicApi<PublicOrganizationMember[]>('/api/user/organization')
}

export function getPublicTerms(termsTypeCode: PublicTerms['termsTypeCode']) {
	return requestPublicApi<PublicTerms>(`/api/user/terms/${encodeURIComponent(termsTypeCode)}`)
}

export function getPublicSearchPages(keyword: string) {
	const query = new URLSearchParams({ keyword })
	return requestPublicApi<PublicSearchPage[]>(`/api/user/search?${query.toString()}`)
}

function toLibraryBookQueryString(params: LibraryBookListParams): string {
	const query = new URLSearchParams()
	if (params.page) query.set('page', String(params.page))
	if (params.size) query.set('size', String(params.size))
	if (params.searchType) query.set('searchType', params.searchType)
	if (params.keyword?.trim()) query.set('keyword', params.keyword.trim())
	if (params.recommendedYn) query.set('recommendedYn', params.recommendedYn)
	if (params.category?.trim()) query.set('category', params.category.trim())
	if (params.newOnly) query.set('newOnly', 'true')
	if (params.newBookYear?.trim()) query.set('newBookYear', params.newBookYear.trim())
	if (params.newBookMonth?.trim()) query.set('newBookMonth', params.newBookMonth.trim())
	const value = query.toString()
	return value ? `?${value}` : ''
}

export function getPublicLibraryBooks(params: LibraryBookListParams = {}) {
	return requestPublicApi<PublicPageResult<PublicLibraryBook>>(`/api/user/library/books${toLibraryBookQueryString(params)}`)
}

export function getPublicLibraryBook(bookId: number) {
	return requestPublicApi<PublicLibraryBook>(`/api/user/library/books/${bookId}`)
}

export function getPublicLibraryBookCategories() {
	return requestPublicApi<PublicBoardCategory[]>('/api/user/library/books/categories')
}

export function getPublicEduPrograms() {
	return requestPublicApi<PublicEduProgram[]>('/api/user/edu-programs')
}

export function getPublicEduProgramCategories() {
	return requestPublicApi<PublicEduProgramCategory[]>('/api/user/edu-programs/categories')
}

export async function getPublicMenus(): Promise<PublicMenu[] | null> {
	try {
		return await requestPublicApi<PublicMenu[]>('/api/user/menus')
	} catch {
		return null
	}
}

export async function getPublicSiteSetting(): Promise<PublicSiteSetting | null> {
	try {
		return await requestPublicApi<PublicSiteSetting>('/api/user/site-setting')
	} catch {
		return null
	}
}

export function getPublicFiles(fileId: string) {
	return requestPublicApi<PublicFileInfo[]>(`/api/user/files/${encodeURIComponent(fileId)}`)
}

export function getPublicFileDownloadUrl(file: Pick<PublicFileInfo, 'fileId' | 'fileSeq'>) {
	return withBasePath(`/api/user/files/${encodeURIComponent(file.fileId)}/${file.fileSeq}/download`)
}

/** API 가 돌려주는 /uploads/... 상대 URL 에 basePath 를 붙인다. */
export function resolvePublicMediaUrl(url: string | null | undefined): string {
	if (!url) return ''
	return withBasePath(url)
}

/** 게시글/팝업 HTML 본문의 /uploads|/pub|/api 절대경로에 basePath 를 붙인다. */
export function resolvePublicHtmlMediaUrls(html: string | null | undefined): string {
	if (!html) return ''
	return html.replace(
		/(src|href)=(["'])(\/(?!\/)(?:uploads|pub|api)[^"']*)/gi,
		(match, attr: string, quote: string, path: string) => {
			if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return match
			return `${attr}=${quote}${withBasePath(path)}`
		}
	)
}

export type PublicEduProgram = {
	programId: number
	categoryCode: string
	categoryName: string | null
	title: string
	description: string | null
	place: string | null
	period: string | null
	capacity: string | null
	/** 비어 있으면 신청하기 버튼을 표시하지 않는다. */
	applyUrl: string | null
	thumbnailUrl: string | null
}

export type PublicEduProgramCategory = Pick<PublicEduProgram, 'categoryCode' | 'categoryName'>

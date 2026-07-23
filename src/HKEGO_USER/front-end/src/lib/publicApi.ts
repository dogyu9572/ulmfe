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

export type PublicOrganizationMember = {
	organizationMemberId: number
	firstCategoryCode: string
	firstCategoryName: string
	secondCategoryCode: string
	secondCategoryName: string
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
	searchType?: 'all' | 'title' | 'content'
	keyword?: string
	recommendedYn?: 'Y'
	category?: string
	newOnly?: boolean
	newBookYear?: string
	newBookMonth?: string
}

export type PublicBoardId = 'ZEHSB' | 'EXHBT' | 'EVENT' | 'FAQ01' | 'GALRY' | 'LRNSUP'

export type BoardListParams = {
	page?: number
	size?: number
	searchType?: 'all' | 'title' | 'content'
	keyword?: string
	category?: string
	programType?: 'EXPLORE' | 'MISSION'
}

async function requestPublicApi<T>(url: string): Promise<T> {
	const response = await fetch(url, {
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

export function getPublicFiles(fileId: string) {
	return requestPublicApi<PublicFileInfo[]>(`/api/user/files/${encodeURIComponent(fileId)}`)
}

export function getPublicFileDownloadUrl(file: Pick<PublicFileInfo, 'fileId' | 'fileSeq'>) {
	return `/api/user/files/${encodeURIComponent(file.fileId)}/${file.fileSeq}/download`
}

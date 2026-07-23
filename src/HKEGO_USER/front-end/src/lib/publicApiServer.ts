import 'server-only'

import type {
	ApiResponse,
	BoardListParams,
	PublicBoardCategory,
	PublicBoardId,
	PublicBoardPost,
	PublicHistory,
	PublicMainBanner,
	PublicLibraryBook,
	LibraryBookListParams,
	PublicOrganizationMember,
	PublicPopup,
	PublicSearchPage,
	PublicTerms,
	PublicPageResult
} from './publicApi'

const backendUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:9032').replace(/\/$/, '')

function toQueryString(params: BoardListParams): string {
	const query = new URLSearchParams()
	if (params.page) query.set('page', String(params.page))
	if (params.size) query.set('size', String(params.size))
	if (params.searchType) query.set('searchType', params.searchType)
	if (params.keyword?.trim()) query.set('keyword', params.keyword.trim())
	if (params.category?.trim()) query.set('category', params.category.trim())
	if (params.programType) query.set('programType', params.programType)
	return query.toString()
}

export async function getPublicBoardPostsServer(
	boardId: PublicBoardId,
	params: BoardListParams = {}
): Promise<PublicPageResult<PublicBoardPost>> {
	const query = toQueryString(params)
	const response = await fetch(
		`${backendUrl}/api/user/boards/${encodeURIComponent(boardId)}${query ? `?${query}` : ''}`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicPageResult<PublicBoardPost>>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '게시글을 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicBoardPostServer(
	boardId: PublicBoardId,
	postId: string
): Promise<PublicBoardPost> {
	const response = await fetch(
		`${backendUrl}/api/user/boards/${encodeURIComponent(boardId)}/${encodeURIComponent(postId)}?increaseViewCount=false`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicBoardPost>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '게시글을 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicBoardCategoriesServer(boardId: PublicBoardId): Promise<PublicBoardCategory[]> {
	const response = await fetch(
		`${backendUrl}/api/user/boards/${encodeURIComponent(boardId)}/categories`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicBoardCategory[]>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '게시판 분류를 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicMainBannersServer(): Promise<PublicMainBanner[]> {
	const response = await fetch(
		`${backendUrl}/api/user/main/banners`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicMainBanner[]>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '메인 배너를 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicPopupsServer(): Promise<PublicPopup[]> {
	const response = await fetch(
		`${backendUrl}/api/user/main/popups`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicPopup[]>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '메인 팝업을 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicHistoryServer(): Promise<PublicHistory[]> {
	const response = await fetch(
		`${backendUrl}/api/user/history`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicHistory[]>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '연혁을 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicOrganizationServer(): Promise<PublicOrganizationMember[]> {
	const response = await fetch(
		`${backendUrl}/api/user/organization`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicOrganizationMember[]>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '조직도를 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicTermsServer(termsTypeCode: PublicTerms['termsTypeCode']): Promise<PublicTerms | null> {
	const response = await fetch(
		`${backendUrl}/api/user/terms/${encodeURIComponent(termsTypeCode)}`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicTerms | null>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '약관을 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicSearchPagesServer(keyword: string): Promise<PublicSearchPage[]> {
	const query = new URLSearchParams({ keyword })
	const response = await fetch(
		`${backendUrl}/api/user/search?${query.toString()}`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicSearchPage[]>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '통합검색 결과를 불러오지 못했습니다.')
	}
	return result.data
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
	return query.toString()
}

export async function getPublicLibraryBooksServer(
	params: LibraryBookListParams = {}
): Promise<PublicPageResult<PublicLibraryBook>> {
	const query = toLibraryBookQueryString(params)
	const response = await fetch(
		`${backendUrl}/api/user/library/books${query ? `?${query}` : ''}`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicPageResult<PublicLibraryBook>>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '도서 목록을 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicLibraryBookServer(bookId: number): Promise<PublicLibraryBook | null> {
	const response = await fetch(
		`${backendUrl}/api/user/library/books/${bookId}`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicLibraryBook | null>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '도서 상세를 불러오지 못했습니다.')
	}
	return result.data
}

export async function getPublicLibraryBookCategoriesServer(): Promise<PublicBoardCategory[]> {
	const response = await fetch(
		`${backendUrl}/api/user/library/books/categories`,
		{ cache: 'no-store', headers: { Accept: 'application/json' } }
	)
	const result = await response.json() as ApiResponse<PublicBoardCategory[]>
	if (!response.ok || !result.success) {
		throw new Error(result.message || '추천도서 분류를 불러오지 못했습니다.')
	}
	return result.data
}

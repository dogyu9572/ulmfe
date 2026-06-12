export const DEFAULT_LIST_PAGE_SIZE = 10

export type PagedListData<T> = {
	list: T[]
	totalCount: number
	page: number
	size: number
	totalPages: number
}

export function extractPagedList<T>(data: T[] | PagedListData<T> | null | undefined): T[] {
	if (!data) return []
	if (Array.isArray(data)) return data
	return data.list ?? []
}

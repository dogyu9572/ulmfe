/** 목록 툴바: 총 N건 (현재페이지/전체페이지) */
export function formatListToolbarInfo(
	totalCount: number,
	page = 1,
	totalPages = 1,
): string {
	const safeTotal = Math.max(0, Number(totalCount) || 0)
	const safePage = Math.max(1, Number(page) || 1)
	const safeTotalPages = Math.max(1, Number(totalPages) || 1)
	return `총 ${safeTotal}건 (${safePage}/${safeTotalPages})`
}

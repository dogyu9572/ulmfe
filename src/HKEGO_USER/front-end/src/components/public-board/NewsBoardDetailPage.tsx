import NewsBoardDetail from './NewsBoardDetail'
import type { PageSearchParams } from '@/content/pageRegistry'
import type { PublicBoardId } from '@/lib/publicApi'
import { getPublicBoardPostServer } from '@/lib/publicApiServer'

type Props = {
	boardId: PublicBoardId
	listPath: string
	detailPath: string
	searchParams: PageSearchParams
}

export default async function NewsBoardDetailPage({ boardId, listPath, detailPath, searchParams }: Props) {
	const query = await searchParams
	const value = query.id ?? query.post_id
	const postId = (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
	const firstValue = (queryValue: string | string[] | undefined) =>
		(Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? ''
	const listQuery = new URLSearchParams()
	const searchType = firstValue(query.search_condition || query.searchType)
	const keyword = firstValue(query.search_keyword || query.keyword)
	const category = firstValue(query.category)
	const pageValue = Number(firstValue(query.page))
	if (searchType === 'title' || searchType === 'content') listQuery.set('search_condition', searchType)
	if (keyword) listQuery.set('search_keyword', keyword)
	if (category) listQuery.set('category', category)
	if (Number.isInteger(pageValue) && pageValue > 1) listQuery.set('page', String(pageValue))
	const listHref = listQuery.size > 0 ? `${listPath}?${listQuery.toString()}` : listPath
	const initialPost = postId
		? await getPublicBoardPostServer(boardId, postId).catch(() => undefined)
		: undefined

	return (
		<NewsBoardDetail
			boardId={boardId}
			listHref={listHref}
			detailPath={detailPath}
			postId={postId}
			initialPost={initialPost}
		/>
	)
}

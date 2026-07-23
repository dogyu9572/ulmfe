import FaqBoard from './FaqBoard'
import type { PageSearchParams } from '@/content/pageRegistry'
import type { BoardListParams } from '@/lib/publicApi'
import { getPublicBoardCategoriesServer, getPublicBoardPostsServer } from '@/lib/publicApiServer'

type Props = { searchParams: PageSearchParams }

function firstValue(value: string | string[] | undefined): string {
	return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

export default async function FaqBoardPage({ searchParams }: Props) {
	const query = await searchParams
	const pageValue = Number(firstValue(query.page))
	const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
	const searchTypeValue = firstValue(query.search_condition || query.searchType)
	const searchType: NonNullable<BoardListParams['searchType']> =
		searchTypeValue === 'title' || searchTypeValue === 'content' ? searchTypeValue : 'all'
	const keyword = firstValue(query.search_keyword || query.keyword)
	const category = firstValue(query.category)
	const [initialResult, categories] = await Promise.all([
		getPublicBoardPostsServer('FAQ01', { page, size: 10, searchType, keyword, category }).catch(() => undefined),
		getPublicBoardCategoriesServer('FAQ01').catch(() => [])
	])

	return (
		<FaqBoard
			initialResult={initialResult}
			categories={categories}
			initialSearchType={searchType}
			initialKeyword={keyword}
			initialCategory={category}
		/>
	)
}

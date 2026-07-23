import NewsBoardList from './NewsBoardList'
import type { PageSearchParams } from '@/content/pageRegistry'
import type { BoardListParams, PublicBoardId } from '@/lib/publicApi'
import { getPublicBoardPostsServer } from '@/lib/publicApiServer'

type Props = {
	boardId: PublicBoardId
	title: string
	detailPath: string
	variant: 'notice' | 'gallery-large' | 'gallery-small'
	searchParams: PageSearchParams
	programType?: 'EXPLORE' | 'MISSION'
	showLearningTypeFilter?: boolean
}

function firstValue(value: string | string[] | undefined): string {
	return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

export default async function NewsBoardListPage({ boardId, title, detailPath, variant, searchParams, programType, showLearningTypeFilter }: Props) {
	const query = await searchParams
	const pageValue = Number(firstValue(query.page))
	const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
	const searchTypeValue = firstValue(query.search_condition || query.searchType)
	const searchType: NonNullable<BoardListParams['searchType']> =
		searchTypeValue === 'title' || searchTypeValue === 'content' ? searchTypeValue : 'all'
	const keyword = firstValue(query.search_keyword || query.keyword)
	const category = firstValue(query.category)
	const size = variant === 'notice' ? 10 : 6
	const initialResult = await getPublicBoardPostsServer(boardId, {
		page,
		size,
		searchType,
		keyword,
		category,
		programType
	}).catch(() => undefined)

	return (
		<NewsBoardList
			boardId={boardId}
			title={title}
			detailPath={detailPath}
			variant={variant}
			initialResult={initialResult}
			initialSearchType={searchType}
			initialKeyword={keyword}
			initialCategory={category}
			programType={programType}
			showLearningTypeFilter={showLearningTypeFilter}
		/>
	)
}

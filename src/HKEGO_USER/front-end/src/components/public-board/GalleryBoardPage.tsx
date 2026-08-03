import GalleryBoard from './GalleryBoard'
import type { PageSearchParams } from '@/content/pageRegistry'
import { getPublicBoardPostServer, getPublicBoardPostsServer } from '@/lib/publicApiServer'

type Props = { searchParams: PageSearchParams }

function firstValue(value: string | string[] | undefined): string {
	return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

export default async function GalleryBoardPage({ searchParams }: Props) {
	const query = await searchParams
	const pageValue = Number(firstValue(query.page))
	const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
	const searchType = 'title' as const
	const keyword = firstValue(query.search_keyword || query.keyword)
	const postId = firstValue(query.post_id)
	const mediaValue = Number(firstValue(query.media))
	const mediaIndex = Number.isInteger(mediaValue) && mediaValue >= 0 ? mediaValue : 0
	const [initialResult, initialSelectedPost] = await Promise.all([
		getPublicBoardPostsServer('GALRY', {
			page,
			size: 6,
			searchType,
			keyword
		}).catch(() => undefined),
		postId ? getPublicBoardPostServer('GALRY', postId).catch(() => undefined) : Promise.resolve(undefined)
	])

	return (
		<GalleryBoard
			initialResult={initialResult}
			initialSelectedPost={initialSelectedPost}
			initialMediaIndex={mediaIndex}
			initialSearchType={searchType}
			initialKeyword={keyword}
		/>
	)
}

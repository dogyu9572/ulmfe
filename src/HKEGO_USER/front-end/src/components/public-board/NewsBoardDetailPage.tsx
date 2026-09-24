'use client'

import { useSearchParams } from 'next/navigation'
import NewsBoardDetail from './NewsBoardDetail'
import type { PublicBoardId } from '@/lib/publicApi'

type Props = {
	boardId: PublicBoardId
	listPath: string
	detailPath: string
}

export default function NewsBoardDetailPage({ boardId, listPath, detailPath }: Props) {
	const query = useSearchParams()
	const postId = (query.get('id') ?? query.get('post_id') ?? '').trim()
	const listQuery = new URLSearchParams()
	const searchType = (query.get('search_condition') || query.get('searchType') || '').trim()
	const keyword = (query.get('search_keyword') || query.get('keyword') || '').trim()
	const category = (query.get('category') || '').trim()
	const pageValue = Number(query.get('page'))
	if (searchType === 'title' || searchType === 'content') listQuery.set('search_condition', searchType)
	if (keyword) listQuery.set('search_keyword', keyword)
	if (category) listQuery.set('category', category)
	if (Number.isInteger(pageValue) && pageValue > 1) listQuery.set('page', String(pageValue))
	const listHref = listQuery.size > 0 ? `${listPath}?${listQuery.toString()}` : listPath

	return (
		<NewsBoardDetail
			boardId={boardId}
			listHref={listHref}
			detailPath={detailPath}
			postId={postId}
		/>
	)
}

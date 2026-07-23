'use client'

import BoardPagination from './BoardPagination'
import BoardSearchForm from './BoardSearchForm'
import { usePublicBoardList, type SearchType } from './usePublicBoardList'
import type { PublicBoardCategory, PublicBoardPost, PublicPageResult } from '@/lib/publicApi'

type Props = {
	initialResult?: PublicPageResult<PublicBoardPost>
	categories: PublicBoardCategory[]
	initialSearchType: SearchType
	initialKeyword: string
	initialCategory: string
}

export default function FaqBoard({
	initialResult,
	categories,
	initialSearchType,
	initialKeyword,
	initialCategory
}: Props) {
	const board = usePublicBoardList('FAQ01', 10, initialResult, initialSearchType, initialKeyword, initialCategory)
	const { result } = board
	const emptyMessage = board.error || (!board.loading && result.list.length === 0 ? '등록된 FAQ가 없습니다.' : '')

	return (
		<section className="board_wrap inner" aria-labelledby="page-title" aria-busy={board.loading}>
			<h1 id="page-title" className="subtitle">FAQ</h1>
			<div className="board_top">
				<div className="flex left">
					<div className="total">총 <strong>{result.totalCount}</strong>건</div>
					<label htmlFor="faq-category" className="sound_only">FAQ 분류</label>
					<select
						id="faq-category"
						className="text"
						value={board.draftCategory}
						onChange={(event) => board.selectCategory(event.target.value)}
					>
						<option value="">분류</option>
						{categories.map((category) => (
							<option key={category.categoryCode} value={category.categoryCode}>
								{category.categoryName || category.categoryCode}
							</option>
						))}
					</select>
				</div>
				<BoardSearchForm
					idPrefix="faq"
					searchType={board.draftSearchType}
					keyword={board.draftKeyword}
					onSearchTypeChange={board.setDraftSearchType}
					onKeywordChange={board.setDraftKeyword}
					onSubmit={board.submitSearch}
				/>
			</div>
			<div className="faq_wrap">
				{result.list.map((post) => {
					const category = (post.categoryName || post.categoryCode || '').trim()
					return (
						<details className="box" key={post.postId}>
							<summary className="question">
								{category ? <span>{category}</span> : null}
								{post.title}
								<i aria-hidden="true" />
							</summary>
							<div
								id={`faq-answer-${post.postId}`}
								className="answer"
								dangerouslySetInnerHTML={{ __html: post.content || '' }}
							/>
						</details>
					)
				})}
				{emptyMessage ? <p role="status">{emptyMessage}</p> : null}
			</div>
			<div className="board_bottom">
				<BoardPagination page={result.page} totalPages={result.totalPages} buildHref={board.buildHref} />
			</div>
		</section>
	)
}

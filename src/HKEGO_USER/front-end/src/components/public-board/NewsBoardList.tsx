'use client'
import { withBasePath } from '@/lib/basePath'

import BoardPagination from './BoardPagination'
import BoardSearchForm from './BoardSearchForm'
import { usePublicBoardList, type SearchType } from './usePublicBoardList'
import type { PublicBoardId, PublicBoardPost, PublicPageResult } from '@/lib/publicApi'
import { resolvePublicMediaUrl } from '@/lib/publicApi'

type Props = {
	boardId: PublicBoardId
	title: string
	detailPath: string
	variant: 'notice' | 'gallery-large' | 'gallery-small'
	initialResult?: PublicPageResult<PublicBoardPost>
	initialSearchType?: SearchType
	initialKeyword?: string
	initialCategory?: string
	programType?: 'EXPLORE' | 'MISSION'
	categoryFilter?: CategoryFilter
}

export type CategoryFilter = {
	label: string
	options: Array<{ value: string; label: string }>
	queryKey?: 'category' | 'zone'
	display?: 'select' | 'tabs'
}

const formatDate = (value: string | null) => value ? value.replaceAll('-', '.') : '-'

const getLearningTypeClass = (category: string) => {
	switch (category.trim()) {
		case '사전학습': return 'type1'
		case '본학습': return 'type2'
		case '사후학습': return 'type3'
		default: return ''
	}
}

function NoticeRows({ posts, totalCount, page, size, detailPath, emptyMessage, listHref, showLearningType }: {
	posts: PublicBoardPost[]
	totalCount: number
	page: number
	size: number
	detailPath: string
	emptyMessage: string
	listHref: string
	showLearningType: boolean
}) {
	if (posts.length === 0) {
		return <tr><td colSpan={showLearningType ? 6 : 5}>{emptyMessage || '등록된 게시물이 없습니다.'}</td></tr>
	}
	return posts.map((post, index) => {
		const number = Math.max(1, totalCount - (page - 1) * size - index)
		const category = (post.categoryName || post.categoryCode || '').trim()
		// 학습 유형에만 배지 스타일이 정의되어 있어, 그 밖의 분류는 평문으로 표시한다.
		const categoryClass = getLearningTypeClass(category)
		const rowClassName = [post.newYn === 'Y' ? 'new' : '', post.pinnedYn === 'Y' ? 'notice' : '']
			.filter(Boolean).join(' ') || undefined
		const detailQuery = new URLSearchParams(listHref.split('?')[1] || '')
		detailQuery.set('id', post.postId)
		return (
			<tr key={post.postId} className={rowClassName}>
				<td className="board_num">{number}</td>
				{showLearningType ? (
					<td className={`board_edu_type ${categoryClass}`.trim()}>
						{category ? (categoryClass ? <span>{category}</span> : category) : null}
					</td>
				) : null}
				<td className="board_tit">
					<a href={withBasePath(`${detailPath}?${detailQuery.toString()}`)}>
						{post.newYn === 'Y' && <span className="sound_only">[새 글]</span>}
						{post.title}
					</a>
				</td>
				<td className="board_file">
					<span className="sound_only">첨부파일:</span>
					{post.attachmentFileId && <i className="file" />}
				</td>
				<td className="board_date"><span className="sound_only">작성일:</span>{formatDate(post.publishedDate)}</td>
				<td className="board_hit"><span className="sound_only">조회수:</span>{post.viewCount ?? 0}</td>
			</tr>
		)
	})
}

function GalleryItems({ posts, detailPath, listHref }: { posts: PublicBoardPost[]; detailPath: string; listHref: string }) {
	if (posts.length === 0) return null
	return posts.map((post) => {
		const detailQuery = new URLSearchParams(listHref.split('?')[1] || '')
		detailQuery.set('id', post.postId)
		return (
			<li key={post.postId}>
				<a href={withBasePath(`${detailPath}?${detailQuery.toString()}`)}>
					<span className="imgfit">
						<img src={resolvePublicMediaUrl(post.thumbnailUrl) || withBasePath('/pub/images/no_image.svg')} alt="" />
					</span>
					<span className="txt">
						<h3 className="tit">{post.title}</h3>
						<span className="date"><span className="sound_only">작성일:</span>{formatDate(post.publishedDate)}</span>
					</span>
				</a>
			</li>
		)
	})
}

export default function NewsBoardList({
	boardId,
	title,
	detailPath,
	variant,
	initialResult,
	initialSearchType = 'all',
	initialKeyword = '',
	initialCategory = '',
	programType,
	categoryFilter
}: Props) {
	const showCategory = Boolean(categoryFilter)
	const pageSize = variant === 'notice' ? 10 : 6
	const board = usePublicBoardList(boardId, pageSize, initialResult, initialSearchType, initialKeyword, initialCategory, programType, undefined, categoryFilter?.queryKey)
	const { result } = board
	const listHref = board.buildHref(result.page)
	const emptyMessage = board.error || (!board.loading && result.list.length === 0 ? (board.filtered ? '검색 결과가 없습니다.' : '등록된 게시물이 없습니다.') : '')
	return (
		<section className="board_wrap inner" aria-labelledby="page-title" aria-busy={board.loading}>
			<h1 id="page-title" className="subtitle">{title}</h1>
			<div className="board_top">
				<div className="flex left">
					<div className="total">총 <strong>{result.totalCount}</strong>건</div>
					{categoryFilter?.display === 'tabs' ? (
						<div className="board_category_tabs" role="tablist" aria-label={categoryFilter.label}>
							<button type="button" role="tab" aria-selected={!board.draftCategory} className={!board.draftCategory ? 'active' : ''} onClick={() => board.selectCategory('')}>전체</button>
							{categoryFilter.options.map((option) => (
								<button type="button" role="tab" aria-selected={board.draftCategory === option.value} className={board.draftCategory === option.value ? 'active' : ''} key={option.value} onClick={() => board.selectCategory(option.value)}>{option.label}</button>
							))}
						</div>
					) : categoryFilter ? (
						<>
							<label htmlFor={`${boardId.toLowerCase()}-category`} className="sound_only">{categoryFilter.label}</label>
							<select
								id={`${boardId.toLowerCase()}-category`}
								className="text"
								value={board.draftCategory}
								onChange={(event) => board.selectCategory(event.target.value)}
							>
								<option value="">{categoryFilter.label}</option>
								{categoryFilter.options.map((option) => (
									<option key={option.value} value={option.value}>{option.label}</option>
								))}
							</select>
						</>
					) : null}
				</div>
				<BoardSearchForm
					idPrefix={boardId.toLowerCase()}
					searchType={board.draftSearchType}
					keyword={board.draftKeyword}
					onSearchTypeChange={board.setDraftSearchType}
					onKeywordChange={board.setDraftKeyword}
					onSubmit={board.submitSearch}
				/>
			</div>
			{variant === 'notice' ? (
				<div className="board_basic">
					<table>
						<caption className="sound_only">게시판 목록으로 번호, 제목, 작성일 정보를 제공합니다.</caption>
						<colgroup>
							<col className="board_num" />
							{showCategory ? <col className="board_edu_type" /> : null}
							<col className="board_tit" />
							<col className="board_file" /><col className="board_date" /><col className="board_hit" />
						</colgroup>
						<thead>
							<tr>
								<th scope="col">번호</th>
								{categoryFilter ? <th scope="col">{categoryFilter.label}</th> : null}
								<th scope="col">제목</th>
								<th scope="col">첨부파일</th>
								<th scope="col">등록일</th>
								<th scope="col">조회수</th>
							</tr>
						</thead>
						<tbody>
							<NoticeRows
								posts={result.list}
								totalCount={result.totalCount}
								page={result.page}
								size={result.size}
								detailPath={detailPath}
								emptyMessage={emptyMessage}
								listHref={listHref}
								showLearningType={showCategory}
							/>
						</tbody>
					</table>
				</div>
			) : (
				<>
					<ul className={`gallery_basic ${variant === 'gallery-large' ? 'type_large' : 'type_small'}`}>
						<GalleryItems posts={result.list} detailPath={detailPath} listHref={listHref} />
					</ul>
					{emptyMessage && <p role="status" className="no_content">{emptyMessage}</p>}
				</>
			)}
			<div className="board_bottom">
				<BoardPagination page={result.page} totalPages={result.totalPages} buildHref={board.buildHref} />
			</div>
		</section>
	)
}

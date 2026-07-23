import BoardPagination from '@/components/public-board/BoardPagination'
import LibraryBookCard from '@/components/public-library/LibraryBookCard'
import type { PageContentProps } from '@/content/pageRegistry'
import type { LibraryBookListParams } from '@/lib/publicApi'
import { getPublicLibraryBooksServer } from '@/lib/publicApiServer'

const singleValue = (value: string | string[] | undefined) => Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

export default async function LibrarySearchListContent({ searchParams }: PageContentProps) {
	const params = await searchParams
	const requestedPage = Number(singleValue(params.page))
	const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
	const requestedSearchType = singleValue(params.search_condition)
	const searchType: LibraryBookListParams['searchType'] = requestedSearchType === 'title' || requestedSearchType === 'content'
		? requestedSearchType
		: 'all'
	const keyword = singleValue(params.search_keyword).trim().slice(0, 100)
	const newOnly = singleValue(params.new_only).toUpperCase() === 'Y'
	const result = await getPublicLibraryBooksServer({ page, size: 8, searchType, keyword, newOnly }).catch(() => null)
	const books = result?.list ?? []
	const totalCount = result?.totalCount ?? 0
	const totalPages = result?.totalPages ?? 1
	const buildHref = (targetPage: number) => {
		const query = new URLSearchParams()
		if (targetPage > 1) query.set('page', String(targetPage))
		if (searchType !== 'all') query.set('search_condition', searchType)
		if (keyword) query.set('search_keyword', keyword)
		if (newOnly) query.set('new_only', 'Y')
		const value = query.toString()
		return `/library/search_list${value ? `?${value}` : ''}`
	}

	return (
		<section className="library_wrap inner" aria-labelledby="page-title">
			<h1 id="page-title" className="subtitle">자료검색</h1>
			<div className="board_top center_type">
				<form action="/library/search_list" method="get" className="search_wrap">
					<fieldset>
						<legend className="sound_only">게시글 검색</legend>
						<label htmlFor="search-condition" className="sound_only">검색 조건 선택</label>
						<select name="search_condition" id="search-condition" defaultValue={searchType}>
							<option value="all">전체</option>
							<option value="title">제목</option>
							<option value="content">내용</option>
						</select>
						<div className="search_area">
							<label htmlFor="search-keyword" className="sound_only">검색어 입력</label>
							<input type="text" id="search-keyword" name="search_keyword" placeholder="검색어를 입력해주세요." defaultValue={keyword} />
							<button type="submit" className="btn">검색</button>
						</div>
					</fieldset>
				</form>
			</div>
			<div className="board_top">
				<div className="total w100p"><strong>{keyword || '전체'}</strong>에 대한 검색결과 총 <strong>{totalCount}</strong>건</div>
			</div>
			{books.length > 0 ? (
				<ul className="flex book_list">{books.map((book) => <LibraryBookCard key={book.bookId} book={book} />)}</ul>
			) : (
				<div className="no_content">검색된 내용이 없습니다.</div>
			)}
			<div className="board_bottom">
				<BoardPagination page={page} totalPages={totalPages} buildHref={buildHref} />
			</div>
		</section>
	)
}

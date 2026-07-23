import BoardPagination from '@/components/public-board/BoardPagination'
import LibraryBookCard from '@/components/public-library/LibraryBookCard'
import type { PageContentProps } from '@/content/pageRegistry'
import type { LibraryBookListParams } from '@/lib/publicApi'
import { getPublicLibraryBookCategoriesServer, getPublicLibraryBooksServer } from '@/lib/publicApiServer'
import Link from 'next/link'

type Props = PageContentProps & {
	mode: 'recommend' | 'new'
}

const singleValue = (value: string | string[] | undefined) => Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

const recommendationIntro = (
	<div className="page_top_box library_recommend_top">
		<h2>사서 추천도서란?</h2>
		<p>
			<strong>울산광역시미래교육관 도서관 사서추천도서</strong>는, 울산광역시미래교육관 도서관 사서들이 <br className="pc_vw" />
			지속가능발전(ESD)을 주제로 한 신간 도서 중에서 학생과 시민의 눈높이에 맞는 도서를 엄선하여, <br className="pc_vw" />
			책 내용과 함께 누리집에 정기적으로 공개합니다.
		</p>
	</div>
)

export default async function LibraryBookListPage({ mode, searchParams }: Props) {
	const params = await searchParams
	const route = mode === 'recommend' ? '/library/recommend' : '/library/new'
	const detailPath = mode === 'recommend' ? '/library/recommend_view' : '/library/new_view'
	const title = mode === 'recommend' ? '사서 추천도서' : '새로 들어온 도서'
	const requestedPage = Number(singleValue(params.page))
	const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
	const requestedSearchType = singleValue(params.search_condition)
	const searchType: LibraryBookListParams['searchType'] = requestedSearchType === 'title' || requestedSearchType === 'content'
		? requestedSearchType
		: 'all'
	const keyword = singleValue(params.search_keyword).trim().slice(0, 100)
	const category = singleValue(params.category).trim()
	const now = new Date()
	const requestedYear = Number(singleValue(params.year))
	const requestedMonth = Number(singleValue(params.month))
	const year = Number.isInteger(requestedYear) && requestedYear >= 1900 && requestedYear <= 2100 ? requestedYear : now.getUTCFullYear()
	const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth : now.getUTCMonth() + 1
	const listParams: LibraryBookListParams = {
		page,
		size: 8,
		searchType,
		keyword,
		category,
		...(mode === 'recommend'
			? { recommendedYn: 'Y' as const }
			: { newOnly: true, newBookYear: String(year), newBookMonth: String(month).padStart(2, '0') })
	}
	const [result, categories] = await Promise.all([
		getPublicLibraryBooksServer(listParams).catch(() => null),
		getPublicLibraryBookCategoriesServer().catch(() => [])
	])
	const books = result?.list ?? []
	const totalCount = result?.totalCount ?? 0
	const totalPages = result?.totalPages ?? 1

	const buildHref = (overrides: Record<string, string | number | null | undefined> = {}) => {
		const query = new URLSearchParams()
		const values = {
			page,
			search_condition: searchType,
			search_keyword: keyword,
			category,
			year: mode === 'new' ? year : undefined,
			month: mode === 'new' ? month : undefined,
			...overrides
		}
		if (Number(values.page) > 1) query.set('page', String(values.page))
		if (values.search_condition && values.search_condition !== 'all') query.set('search_condition', String(values.search_condition))
		if (values.search_keyword) query.set('search_keyword', String(values.search_keyword))
		if (values.category) query.set('category', String(values.category))
		if (values.year) query.set('year', String(values.year))
		if (values.month) query.set('month', String(values.month).padStart(2, '0'))
		const value = query.toString()
		return `${route}${value ? `?${value}` : ''}`
	}
	const adjacentMonthHref = (offset: number) => {
		const date = new Date(Date.UTC(year, month - 1 + offset, 1))
		return buildHref({ page: 1, year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 })
	}

	return (
		<section className="library_wrap inner" aria-labelledby="page-title">
			<h1 id="page-title" className="subtitle">{title}</h1>
			{recommendationIntro}
			{mode === 'new' ? (
				<div className="month_select">
					<strong>{year}. {String(month).padStart(2, '0')}</strong>
					<Link href={adjacentMonthHref(-1)} className="arrow prev" scroll={false}>이전달</Link>
					<Link href={adjacentMonthHref(1)} className="arrow next" scroll={false}>다음달</Link>
				</div>
			) : null}
			<ul className="tabs_library">
				<li className={!category ? 'on' : undefined}>
					<Link href={buildHref({ page: 1, category: null })} scroll={false}>전체</Link>
				</li>
				{categories.map((item) => (
					<li key={item.categoryCode} className={category === item.categoryCode ? 'on' : undefined}>
						<Link href={buildHref({ page: 1, category: item.categoryCode })} scroll={false}>{item.categoryName}</Link>
					</li>
				))}
			</ul>
			<div className="board_top">
				<div className="flex left"><div className="total">총 <strong>{totalCount}</strong>건</div></div>
				<form action={route} method="get" className="search_wrap">
					{mode === 'new' ? <><input type="hidden" name="year" value={year} /><input type="hidden" name="month" value={String(month).padStart(2, '0')} /></> : null}
					{category ? <input type="hidden" name="category" value={category} /> : null}
					<fieldset>
						<legend className="sound_only">게시글 검색</legend>
						<label htmlFor={`${mode}-search-condition`} className="sound_only">검색 조건 선택</label>
						<select name="search_condition" id={`${mode}-search-condition`} defaultValue={searchType}>
							<option value="all">전체</option>
							<option value="title">제목</option>
							<option value="content">내용</option>
						</select>
						<div className="search_area">
							<label htmlFor={`${mode}-search-keyword`} className="sound_only">검색어 입력</label>
							<input type="text" id={`${mode}-search-keyword`} name="search_keyword" placeholder="검색어를 입력해주세요." defaultValue={keyword} />
							<button type="submit" className="btn">검색</button>
						</div>
					</fieldset>
				</form>
			</div>
			{books.length > 0 ? (
				<ul className="flex book_list">{books.map((book) => <LibraryBookCard key={book.bookId} book={book} detailPath={detailPath} />)}</ul>
			) : (
				<div className="no_content">등록된 도서가 없습니다.</div>
			)}
			<div className="board_bottom">
				<BoardPagination page={page} totalPages={totalPages} buildHref={(targetPage) => buildHref({ page: targetPage })} />
			</div>
		</section>
	)
}

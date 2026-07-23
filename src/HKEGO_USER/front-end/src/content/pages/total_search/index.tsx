import type { PageContentProps } from '@/content/pageRegistry'
import type { PublicSearchPage } from '@/lib/publicApi'
import { getPublicSearchPagesServer } from '@/lib/publicApiServer'

const SEARCH_CATEGORIES = [
	'울산광역시미래교육관 소개',
	'전시소개',
	'교육프로그램 소개',
	'학습지원 자료실',
	'소식',
	'고객지원',
	'갤러리',
	'도서관'
] as const

const normalizeCategoryName = (value: string) => value.replace(/\s+/g, '')

const stripHtml = (value: string) => value
	.replace(/<[^>]*>/g, ' ')
	.replace(/&nbsp;/gi, ' ')
	.replace(/&amp;/gi, '&')
	.replace(/&lt;/gi, '<')
	.replace(/&gt;/gi, '>')
	.replace(/\s+/g, ' ')
	.trim()

const safePageHref = (value: string) => {
	const href = value.trim()
	if (href.startsWith('/') && !href.startsWith('//')) return href
	if (/^https?:\/\//i.test(href)) return href
	return '#'
}

const singleQueryValue = (value: string | string[] | undefined) =>
	Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

function SearchResultBox({ category, results, index }: {
	category: string
	results: PublicSearchPage[]
	index: number
}) {
	return (
		<div className="box" id={`total-search-category-${index}`}>
			<div className="stit large">
				<h2>{category}</h2>
				<span className="count"><strong className="c_blue">{results.length}</strong>건의 검색결과</span>
				<a href={`#total-search-category-${index}`} className="btn_more" data-tab-index={index + 1}>더보기</a>
			</div>
			{results.length > 0 ? (
				<ul className="search_list">
					{results.map((result) => (
						<li key={result.searchPageId}>
							<a href={safePageHref(result.pageUrl)}>
								<h3>{result.title}</h3>
								<p>{stripHtml(result.content)}</p>
								<span className="location">
									<span>{result.menu1DepthName}</span>
									{result.menu2DepthName ? <span>{result.menu2DepthName}</span> : null}
									{result.menu3DepthName ? <span>{result.menu3DepthName}</span> : null}
								</span>
							</a>
						</li>
					))}
				</ul>
			) : (
				<div className="no_content">검색된 내용이 없습니다.</div>
			)}
		</div>
	)
}

export default async function TotalSearchIndexContent({ searchParams }: PageContentProps) {
	const params = await searchParams
	const keyword = singleQueryValue(params.search_keyword).trim().slice(0, 100)
	const results = keyword ? await getPublicSearchPagesServer(keyword).catch(() => []) : []
	const knownCategoryNames = new Set(SEARCH_CATEGORIES.map(normalizeCategoryName))
	const extraCategories = results
		.map((result) => result.menu1DepthName)
		.filter((category, index, categories) =>
			Boolean(category) &&
			!knownCategoryNames.has(normalizeCategoryName(category)) &&
			categories.indexOf(category) === index
		)
	const categories = [...SEARCH_CATEGORIES, ...extraCategories]
	const groupedResults = categories.map((category) => ({
		category,
		results: results.filter((result) => normalizeCategoryName(result.menu1DepthName) === normalizeCategoryName(category))
	}))

	return (
		<section className="total_search_wrap inner" aria-labelledby="total-search-title">
			<h1 id="total-search-title" className="subtitle">통합검색</h1>
			<div className="board_top center_type">
				<form action="/total_search/index" method="get" className="search_wrap">
					<fieldset>
						<legend className="sound_only">게시글 검색</legend>
						<div className="search_area wlong">
							<label htmlFor="search-keyword" className="sound_only">검색어 입력</label>
							<input type="text" id="search-keyword" name="search_keyword" placeholder="검색어를 입력해주세요." defaultValue={keyword} />
							<button type="submit" className="btn">검색</button>
						</div>
					</fieldset>
				</form>
			</div>
			<ul className="tabs_round tabs_total_search">
				<li className="on"><button type="button">전체({results.length})</button></li>
				{groupedResults.map(({ category, results: categoryResults }) => (
					<li key={category}><button type="button">{category}({categoryResults.length})</button></li>
				))}
			</ul>
			<div className="total_search_contents">
				{groupedResults.map(({ category, results: categoryResults }, index) => (
					<SearchResultBox key={category} category={category} results={categoryResults} index={index} />
				))}
			</div>
		</section>
	)
}

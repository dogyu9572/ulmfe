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

type SearchCategory = typeof SEARCH_CATEGORIES[number]

const normalizeCategoryName = (value: string) => value.replace(/\s+/g, '')

const CATEGORY_BY_NAME = new Map<string, SearchCategory>(
	SEARCH_CATEGORIES.map((category) => [normalizeCategoryName(category), category])
)

CATEGORY_BY_NAME.set(normalizeCategoryName('울산미래교육관'), SEARCH_CATEGORIES[0])
CATEGORY_BY_NAME.set(normalizeCategoryName('울산광역시미래교육관'), SEARCH_CATEGORIES[0])

const CATEGORY_BY_PATH_PREFIX: Array<[string, SearchCategory]> = [
	['/about/', SEARCH_CATEGORIES[0]],
	['/exhibit/', SEARCH_CATEGORIES[1]],
	['/exhibition/', SEARCH_CATEGORIES[1]],
	['/program/', SEARCH_CATEGORIES[2]],
	['/archive/', SEARCH_CATEGORIES[3]],
	['/resource/', SEARCH_CATEGORIES[3]],
	['/news/', SEARCH_CATEGORIES[4]],
	['/support/', SEARCH_CATEGORIES[5]],
	['/gallery/', SEARCH_CATEGORIES[6]],
	['/library/', SEARCH_CATEGORIES[7]]
]

const PAGE_PATH_ALIASES = new Map([
	['/exhibition/floor1', '/exhibit/floor_1f'],
	['/exhibition/floor2', '/exhibit/floor_2f'],
	['/exhibition/floor3', '/exhibit/floor_3f'],
	['/exhibition/annex', '/exhibit/annex'],
	['/exhibition/outdoor', '/exhibit/outdoor'],
	['/program/esd-pbl', '/program/esd_pbl'],
	['/program/exploration', '/program/elementary'],
	['/program/reservation', '/program/reserve'],
	['/resource/exploration', '/archive/elementary'],
	['/resource/mission', '/archive/mission'],
	['/news/exhibition', '/news/exhibit'],
	['/gallery/photo', '/gallery/index']
])

const pagePath = (value: string) => {
	try {
		return new URL(value, 'https://ulmfe-user.hk-test.co.kr').pathname
	} catch {
		return ''
	}
}

const resultCategory = (result: PublicSearchPage) => {
	const path = pagePath(result.pageUrl)
	const pathCategory = CATEGORY_BY_PATH_PREFIX.find(([prefix]) => path.startsWith(prefix))?.[1]
	return pathCategory ?? CATEGORY_BY_NAME.get(normalizeCategoryName(result.menu1DepthName)) ?? null
}

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
	try {
		if (href.startsWith('/') && !href.startsWith('//')) {
			const url = new URL(href, 'https://ulmfe-user.hk-test.co.kr')
			return `${PAGE_PATH_ALIASES.get(url.pathname) ?? url.pathname}${url.search}${url.hash}`
		}
		if (/^https?:\/\//i.test(href)) {
			const url = new URL(href)
			if (url.hostname === 'ulmfe-user.hk-test.co.kr') {
				url.pathname = PAGE_PATH_ALIASES.get(url.pathname) ?? url.pathname
			}
			return url.toString()
		}
	} catch {
		return '#'
	}
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
	const groupedResults = SEARCH_CATEGORIES.map((category) => ({
		category,
		results: results.filter((result) => resultCategory(result) === category)
	}))
	const visibleResultCount = groupedResults.reduce((count, group) => count + group.results.length, 0)

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
				<li className="on"><button type="button">전체({visibleResultCount})</button></li>
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

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SITE_MENUS } from '@/components/siteNavigation'
import type { PublicSearchPage } from '@/lib/publicApi'
import { getPublicSearchPages } from '@/lib/publicApi'
import { BASE_PATH, withBasePath } from '@/lib/basePath'

/** 검색 결과 탭은 대메뉴와 같은 이름·같은 순서를 쓴다. */
const SEARCH_CATEGORIES = SITE_MENUS.map((menu) => menu.label)

const CATEGORY_BY_SECTION = new Map(SITE_MENUS.map((menu) => [menu.section, menu.label]))

/** 개편 전 주소로 저장된 검색 페이지를 현재 섹션으로 옮겨 읽는다. */
const LEGACY_SECTION_ALIASES = new Map([
	['exhibition', 'exhibit'],
	['resource', 'archive'],
	['support', 'news'],
	['gallery', 'news']
])

const normalizeCategoryName = (value: string) => value.replace(/\s+/g, '')

const CATEGORY_BY_NAME = new Map<string, string>(
	SEARCH_CATEGORIES.map((category) => [normalizeCategoryName(category), category])
)

CATEGORY_BY_NAME.set(normalizeCategoryName('울산미래교육관'), SEARCH_CATEGORIES[0])
CATEGORY_BY_NAME.set(normalizeCategoryName('울산광역시미래교육관'), SEARCH_CATEGORIES[0])

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
	['/support/faq', '/news/faq'],
	['/gallery/photo', '/news/gallery'],
	['/gallery/index', '/news/gallery']
])

const pagePath = (value: string) => {
	try {
		let pathname = new URL(value, 'https://use.go.kr').pathname
		if (BASE_PATH && (pathname === BASE_PATH || pathname.startsWith(`${BASE_PATH}/`))) {
			pathname = pathname.slice(BASE_PATH.length) || '/'
		}
		return pathname
	} catch {
		return ''
	}
}

const resultCategory = (result: PublicSearchPage) => {
	const section = pagePath(result.pageUrl).split('/')[1] ?? ''
	const pathCategory = CATEGORY_BY_SECTION.get(LEGACY_SECTION_ALIASES.get(section) ?? section)
	return pathCategory ?? CATEGORY_BY_NAME.get(normalizeCategoryName(result.menu1DepthName)) ?? null
}

const KNOWN_SITE_HOSTS = new Set([
	'ulmfe-user.hk-test.co.kr',
	'use.go.kr',
	'dev.use.go.kr',
	'localhost',
	'127.0.0.1'
])

const normalizeAppPath = (pathname: string) => {
	let path = pathname || '/'
	if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
		path = path.slice(BASE_PATH.length) || '/'
	}
	return PAGE_PATH_ALIASES.get(path) ?? path
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
		// DB 에 절대 URL(https://ulmfe-user.hk-test.co.kr/...) 이 들어 있어도
		// 현재 호스트(localhost / use.go.kr/usfec) 기준으로 상대 경로로 바꾼다.
		if (href.startsWith('/') && !href.startsWith('//')) {
			const url = new URL(href, 'https://use.go.kr')
			return withBasePath(`${normalizeAppPath(url.pathname)}${url.search}${url.hash}`)
		}
		if (/^https?:\/\//i.test(href)) {
			const url = new URL(href)
			if (KNOWN_SITE_HOSTS.has(url.hostname)) {
				return withBasePath(`${normalizeAppPath(url.pathname)}${url.search}${url.hash}`)
			}
			return url.toString()
		}
	} catch {
		return '#'
	}
	return '#'
}

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
						<li key={`${result.searchPageId}:${result.pageUrl}`}>
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

export default function TotalSearchIndexContent() {
	const params = useSearchParams()
	const keyword = (params.get('search_keyword') ?? '').trim().slice(0, 100)
	const [results, setResults] = useState<PublicSearchPage[]>([])

	useEffect(() => {
		let cancelled = false
		if (!keyword) {
			setResults([])
			return
		}
		void getPublicSearchPages(keyword)
			.then((data) => {
				if (!cancelled) setResults(data)
			})
			.catch(() => {
				if (!cancelled) setResults([])
			})
		return () => {
			cancelled = true
		}
	}, [keyword])

	const groupedResults = useMemo(() => SEARCH_CATEGORIES.map((category) => ({
		category,
		results: results.filter((result) => resultCategory(result) === category)
	})), [results])
	const visibleResultCount = groupedResults.reduce((count, group) => count + group.results.length, 0)

	return (
		<section className="total_search_wrap inner" aria-labelledby="total-search-title">
			<h1 id="total-search-title" className="subtitle">통합검색</h1>
			<div className="board_top center_type">
				<form action={withBasePath('/total_search/index')} method="get" className="search_wrap">
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


'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
	getPublicBoardPosts,
	type PublicBoardId,
	type PublicBoardPost,
	type PublicPageResult
} from '@/lib/publicApi'

export type SearchType = 'all' | 'title' | 'content'

const EMPTY_RESULT: PublicPageResult<PublicBoardPost> = {
	list: [],
	totalCount: 0,
	page: 1,
	size: 10,
	totalPages: 1
}

function positiveInteger(value: string | null, fallback: number) {
	const parsed = Number(value)
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function searchTypeValue(value: string | null): SearchType {
	return value === 'title' || value === 'content' ? value : 'all'
}

export function usePublicBoardList(
	boardId: PublicBoardId,
	pageSize: number,
	initialResult?: PublicPageResult<PublicBoardPost>,
	initialSearchType: SearchType = 'all',
	initialKeyword = '',
	initialCategory = '',
	programType?: 'EXPLORE' | 'MISSION',
	fixedSearchType?: SearchType
) {
	const router = useRouter()
	const pathname = usePathname()
	const effectiveInitialSearchType = fixedSearchType ?? initialSearchType
	const [page, setPage] = useState(initialResult?.page ?? 1)
	const [searchType, setSearchType] = useState<SearchType>(effectiveInitialSearchType)
	const [keyword, setKeyword] = useState(initialKeyword)
	const [category, setCategory] = useState(initialCategory)
	const [queryReady, setQueryReady] = useState(false)
	const [draftSearchType, setDraftSearchType] = useState<SearchType>(effectiveInitialSearchType)
	const [draftKeyword, setDraftKeyword] = useState(initialKeyword)
	const [draftCategory, setDraftCategory] = useState(initialCategory)
	const [result, setResult] = useState<PublicPageResult<PublicBoardPost>>(
		initialResult ?? { ...EMPTY_RESULT, size: pageSize }
	)
	const [loading, setLoading] = useState(!initialResult)
	const [error, setError] = useState('')

	useEffect(() => {
		const syncQuery = () => {
			const query = new URLSearchParams(window.location.search)
			const nextPage = positiveInteger(query.get('page'), 1)
			const nextSearchType = fixedSearchType
				?? searchTypeValue(query.get('search_condition') ?? query.get('searchType'))
			const nextKeyword = (query.get('search_keyword') ?? query.get('keyword'))?.trim() ?? ''
			const nextCategory = query.get('category')?.trim() ?? ''
			setPage(nextPage)
			setSearchType(nextSearchType)
			setKeyword(nextKeyword)
			setDraftSearchType(nextSearchType)
			setDraftKeyword(nextKeyword)
			setCategory(nextCategory)
			setDraftCategory(nextCategory)
			setQueryReady(true)
		}
		syncQuery()
		window.addEventListener('popstate', syncQuery)
		return () => window.removeEventListener('popstate', syncQuery)
	}, [fixedSearchType, pathname])

	useEffect(() => {
		if (!queryReady) return
		let cancelled = false
		let retryTimer: ReturnType<typeof setTimeout> | undefined
		const load = () => {
			setLoading(true)
			setError('')
			void getPublicBoardPosts(boardId, { page, size: pageSize, searchType, keyword, category, programType })
				.then((data) => {
					if (cancelled) return
					setResult(data)
					setLoading(false)
				})
				.catch((reason: unknown) => {
					if (cancelled) return
					setResult({ ...EMPTY_RESULT, page, size: pageSize })
					setError(reason instanceof Error ? reason.message : '게시글을 불러오지 못했습니다.')
					setLoading(false)
					retryTimer = setTimeout(load, 3000)
				})
		}
		load()
		return () => {
			cancelled = true
			if (retryTimer) clearTimeout(retryTimer)
		}
	}, [boardId, page, pageSize, programType, queryReady, searchType, keyword, category])

	const buildHref = useCallback((targetPage: number) => {
		const query = new URLSearchParams()
		if (searchType !== 'all') query.set('search_condition', searchType)
		if (keyword) query.set('search_keyword', keyword)
		if (category) query.set('category', category)
		if (targetPage > 1) query.set('page', String(targetPage))
		const value = query.toString()
		return value ? `${pathname}?${value}` : pathname
	}, [category, keyword, pathname, searchType])

	const submitSearch = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const nextKeyword = draftKeyword.trim()
		const nextSearchType = fixedSearchType ?? draftSearchType
		const query = new URLSearchParams()
		if (nextSearchType !== 'all') query.set('search_condition', nextSearchType)
		if (nextKeyword) query.set('search_keyword', nextKeyword)
		if (draftCategory) query.set('category', draftCategory)
		setPage(1)
		setSearchType(nextSearchType)
		setDraftSearchType(nextSearchType)
		setKeyword(nextKeyword)
		const value = query.toString()
		router.push(value ? `${pathname}?${value}` : pathname)
	}, [draftCategory, draftKeyword, draftSearchType, fixedSearchType, pathname, router])

	const selectCategory = useCallback((nextCategory: string) => {
		const query = new URLSearchParams()
		if (searchType !== 'all') query.set('search_condition', searchType)
		if (keyword) query.set('search_keyword', keyword)
		if (nextCategory) query.set('category', nextCategory)
		setPage(1)
		setCategory(nextCategory)
		setDraftCategory(nextCategory)
		const value = query.toString()
		router.push(value ? `${pathname}?${value}` : pathname)
	}, [keyword, pathname, router, searchType])

	return useMemo(() => ({
		result,
		loading,
		error,
		draftSearchType,
		draftKeyword,
		draftCategory,
		setDraftSearchType,
		setDraftKeyword,
		selectCategory,
		submitSearch,
		buildHref
	}), [result, loading, error, draftSearchType, draftKeyword, draftCategory, selectCategory, submitSearch, buildHref])
}

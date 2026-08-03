'use client'

import type { FormEvent } from 'react'

export type BoardSearchType = 'all' | 'title' | 'content' | 'writer'

const SEARCH_TYPE_LABELS: Record<BoardSearchType, string> = {
	all: '전체',
	title: '제목',
	content: '내용',
	writer: '작성자'
}

const DEFAULT_SEARCH_TYPES = ['all', 'title', 'content'] as const

type Props<T extends BoardSearchType> = {
	idPrefix: string
	searchType: T
	keyword: string
	onSearchTypeChange: (value: T) => void
	onKeywordChange: (value: string) => void
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
	searchTypes?: readonly T[]
}

export default function BoardSearchForm<T extends BoardSearchType>({
	idPrefix,
	searchType,
	keyword,
	onSearchTypeChange,
	onKeywordChange,
	onSubmit,
	searchTypes
}: Props<T>) {
	const conditionId = `${idPrefix}-search-condition`
	const keywordId = `${idPrefix}-search-keyword`
	const visibleSearchTypes: readonly BoardSearchType[] = searchTypes ?? DEFAULT_SEARCH_TYPES
	return (
		<form className="search_wrap" onSubmit={onSubmit}>
			<fieldset>
				<legend className="sound_only">게시글 검색</legend>
				<label htmlFor={conditionId} className="sound_only">검색 조건 선택</label>
				<select
					name="search_condition"
					id={conditionId}
					value={searchType}
					onChange={(event) => onSearchTypeChange(event.target.value as T)}
				>
					{visibleSearchTypes.map((type) => (
						<option key={type} value={type}>{SEARCH_TYPE_LABELS[type]}</option>
					))}
				</select>
				<div className="search_area">
					<label htmlFor={keywordId} className="sound_only">검색어 입력</label>
					<input
						type="text"
						id={keywordId}
						name="search_keyword"
						placeholder="검색어를 입력해주세요."
						value={keyword}
						onChange={(event) => onKeywordChange(event.target.value)}
					/>
					<button type="submit" className="btn">검색</button>
				</div>
			</fieldset>
		</form>
	)
}

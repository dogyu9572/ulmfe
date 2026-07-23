'use client'

import type { FormEvent } from 'react'

type SearchType = 'all' | 'title' | 'content'

type Props = {
	idPrefix: string
	searchType: SearchType
	keyword: string
	onSearchTypeChange: (value: SearchType) => void
	onKeywordChange: (value: string) => void
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function BoardSearchForm({
	idPrefix,
	searchType,
	keyword,
	onSearchTypeChange,
	onKeywordChange,
	onSubmit
}: Props) {
	const conditionId = `${idPrefix}-search-condition`
	const keywordId = `${idPrefix}-search-keyword`
	return (
		<form className="search_wrap" onSubmit={onSubmit}>
			<fieldset>
				<legend className="sound_only">게시글 검색</legend>
				<label htmlFor={conditionId} className="sound_only">검색 조건 선택</label>
				<select
					name="search_condition"
					id={conditionId}
					value={searchType}
					onChange={(event) => onSearchTypeChange(event.target.value as SearchType)}
				>
					<option value="all">전체</option>
					<option value="title">제목</option>
					<option value="content">내용</option>
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

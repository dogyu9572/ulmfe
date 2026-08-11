'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import BoardPagination from '@/components/public-board/BoardPagination'
import BoardSearchForm from '@/components/public-board/BoardSearchForm'
import {
	getPublicQnaList,
	verifyPublicQna,
	type PublicQnaSummary,
	type QnaSearchType
} from '@/lib/publicQnaApi'
import { QNA_LIST_RETURN_KEY, qnaListHref, qnaListQuery, qnaPageHref } from './qnaNavigation'

const PAGE_SIZE = 10

function positivePage(value: string | null) {
	const parsed = Number(value)
	return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function searchType(value: string | null): QnaSearchType {
	return value === 'title' || value === 'content' || value === 'writer' ? value : 'all'
}

function formatDate(value: string | null) {
	return value ? value.slice(0, 10).replaceAll('-', '.') : ''
}

function isAnswerDone(status: string | null) {
	return ['DONE', 'COMPLETE', 'COMPLETED', 'ANSWERED', 'Y'].includes((status || '').toUpperCase())
}

export default function QnaBoard() {
	const router = useRouter()
	const pathname = usePathname()
	const params = useSearchParams()
	const page = positivePage(params.get('page'))
	const activeSearchType = searchType(params.get('search_condition') ?? params.get('searchType'))
	const activeKeyword = (params.get('search_keyword') ?? params.get('keyword') ?? '').trim()
	const [draftSearchType, setDraftSearchType] = useState<QnaSearchType>(activeSearchType)
	const [draftKeyword, setDraftKeyword] = useState(activeKeyword)
	const [list, setList] = useState<PublicQnaSummary[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedPost, setSelectedPost] = useState<PublicQnaSummary | null>(null)
	const [password, setPassword] = useState('')
	const [verifyError, setVerifyError] = useState('')
	const [verifying, setVerifying] = useState(false)
	const passwordRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		setDraftSearchType(activeSearchType)
		setDraftKeyword(activeKeyword)
	}, [activeKeyword, activeSearchType])

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		setError('')
		void getPublicQnaList({ page, size: PAGE_SIZE, searchType: activeSearchType, keyword: activeKeyword })
			.then((result) => {
				if (cancelled) return
				setList(result.list || [])
				setTotalCount(result.totalCount || 0)
				setTotalPages(Math.max(1, result.totalPages || 1))
			})
			.catch((reason: unknown) => {
				if (cancelled) return
				setList([])
				setTotalCount(0)
				setTotalPages(1)
				setError(reason instanceof Error ? reason.message : '문의 목록을 불러오지 못했습니다.')
			})
			.finally(() => { if (!cancelled) setLoading(false) })
		return () => { cancelled = true }
	}, [activeKeyword, activeSearchType, page])

	useEffect(() => {
		if (!selectedPost) return
		passwordRef.current?.focus()
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closePopup()
		}
		window.addEventListener('keydown', closeOnEscape)
		return () => window.removeEventListener('keydown', closeOnEscape)
	}, [selectedPost])

	const currentListQuery = useMemo(() => qnaListQuery(new URLSearchParams(params.toString())), [params])

	const buildHref = (targetPage: number) => {
		const query = new URLSearchParams(currentListQuery)
		if (targetPage > 1) query.set('page', String(targetPage))
		else query.delete('page')
		const value = query.toString()
		return value ? `${pathname}?${value}` : pathname
	}

	const submitSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const query = new URLSearchParams()
		if (draftSearchType !== 'all') query.set('search_condition', draftSearchType)
		if (draftKeyword.trim()) query.set('search_keyword', draftKeyword.trim())
		const value = query.toString()
		router.push(value ? `${pathname}?${value}` : pathname)
	}

	const navigateToPost = (postId: string) => {
		const listParams = new URLSearchParams(params.toString())
		window.sessionStorage.setItem(QNA_LIST_RETURN_KEY, qnaListHref(listParams))
		router.push(qnaPageHref('/support/qna_view', postId, listParams))
	}

	const openPost = (post: PublicQnaSummary) => {
		if (!post.passwordProtected) return navigateToPost(post.postId)
		setPassword('')
		setVerifyError('')
		setSelectedPost(post)
	}

	const closePopup = () => {
		if (verifying) return
		setSelectedPost(null)
		setPassword('')
		setVerifyError('')
	}

	const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!selectedPost || verifying) return
		if (!password) {
			setVerifyError('비밀번호를 입력해주세요.')
			passwordRef.current?.focus()
			return
		}
		setVerifying(true)
		setVerifyError('')
		try {
			await verifyPublicQna(selectedPost.postId, password)
			const postId = selectedPost.postId
			setSelectedPost(null)
			setPassword('')
			navigateToPost(postId)
		} catch (reason) {
			setVerifyError(reason instanceof Error ? reason.message : '비밀번호를 확인하지 못했습니다.')
			passwordRef.current?.select()
		} finally {
			setVerifying(false)
		}
	}

	return (
		<>
			<section className="board_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">1:1문의</h1>
				<div className="board_top">
					<div className="flex left"><div className="total">총 <strong>{totalCount}</strong>건</div></div>
					<BoardSearchForm
						idPrefix="qna"
						searchType={draftSearchType}
						keyword={draftKeyword}
						onSearchTypeChange={setDraftSearchType}
						onKeywordChange={setDraftKeyword}
						onSubmit={submitSearch}
						searchTypes={['all', 'title', 'content', 'writer']}
					/>
				</div>
				<div className="board_basic border_qna">
					<table>
						<caption className="sound_only">게시판 목록으로 번호, 제목, 작성일 정보를 제공합니다.</caption>
						<colgroup><col className="board_num" /><col className="board_tit" /><col className="board_writer small" /><col className="board_date" /><col className="board_review" /></colgroup>
						<thead><tr><th scope="col">번호</th><th scope="col">제목</th><th scope="col">작성자</th><th scope="col">등록일</th><th scope="col">답변상태</th></tr></thead>
						<tbody>
							{list.map((post, index) => {
								const done = isAnswerDone(post.answerStatus)
								const rowNumber = post.rowNumber ?? Math.max(1, totalCount - (page - 1) * PAGE_SIZE - index)
								return (
									<tr key={post.postId} className={post.passwordProtected ? 'lock' : undefined}>
										<td className="board_num">{rowNumber}</td>
										<td className="board_tit"><a href={qnaPageHref('/support/qna_view', post.postId, new URLSearchParams(params.toString()))} onClick={(event) => { event.preventDefault(); openPost(post) }}>{post.newYn === 'Y' && <span className="sound_only">[새 글]</span>}{post.title}</a></td>
										<td className="board_writer"><span className="sound_only">작성자:</span>{post.writerNameMasked || ''}</td>
										<td className="board_date"><span className="sound_only">등록일:</span>{formatDate(post.registeredAt)}</td>
										<td className="board_review"><span className="sound_only">답변상태</span><span className={`review ${done ? 'end' : 'ing'}`}>{done ? '답변완료' : '답변대기'}</span></td>
									</tr>
								)
							})}
							{!loading && list.length === 0 && <tr><td colSpan={5}><div className="no_content">{error || '등록된 문의가 없습니다.'}</div></td></tr>}
							{loading && list.length === 0 && <tr><td colSpan={5}>문의 목록을 불러오는 중입니다.</td></tr>}
						</tbody>
					</table>
				</div>
				<div className="board_bottom">
					<a href={qnaPageHref('/support/qna_write', '', new URLSearchParams(params.toString()))} className="btn btn_wbb btn_abso btn_writer">글쓰기</a>
					<BoardPagination page={page} totalPages={totalPages} buildHref={buildHref} />
				</div>
			</section>
			<div className={`popup pop_password${selectedPost ? ' open' : ''}`} id="pop_password" aria-hidden={!selectedPost}>
				<div className="dm" onClick={closePopup}></div>
				<div className="inbox" role="dialog" aria-modal="true" aria-labelledby="qna-password-title">
					<button type="button" className="btn_close" onClick={closePopup}>팝업 닫기</button>
					<h2 className="tit" id="qna-password-title">비밀번호 입력</h2>
					<form className="con" onSubmit={submitPassword}>
						<div className="input_password">
							<p>게시글 등록 시 설정한 비밀번호를 입력해주세요.</p>
							<input ref={passwordRef} type="password" className="text w100p" placeholder="비밀번호를 입력해주세요." value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
							{verifyError && <span role="alert" className="tac" style={{ color: '#e5484d' }}>{verifyError}</span>}
						</div>
						<div className="btns_btm"><button type="submit" className="btn btn_small btn_wbb" disabled={verifying}>{verifying ? '확인 중' : '확인'}</button></div>
					</form>
				</div>
			</div>
		</>
	)
}

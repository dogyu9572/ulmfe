'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { deletePublicQna, getPublicQna, type PublicQnaDetail } from '@/lib/publicQnaApi'
import { qnaListHref, qnaPageHref } from './qnaNavigation'

function formatDate(value: string | null) {
	return value ? value.slice(0, 10).replaceAll('-', '.') : ''
}

function answerDone(status: string | null) {
	return ['DONE', 'COMPLETE', 'COMPLETED', 'ANSWERED', 'Y'].includes((status || '').toUpperCase())
}

export default function QnaDetail() {
	const router = useRouter()
	const params = useSearchParams()
	const postId = params.get('post_id') || params.get('id') || ''
	const paramsSnapshot = useMemo(() => new URLSearchParams(params.toString()), [params])
	const [post, setPost] = useState<PublicQnaDetail | null>(null)
	const [error, setError] = useState(postId ? '' : '문의 정보가 없습니다.')
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		if (!postId) return
		let cancelled = false
		setError('')
		const viewKey = `ulmfe-qna-view:${postId}`
		const increaseViewCount = window.sessionStorage.getItem(viewKey) !== 'Y'
		if (increaseViewCount) window.sessionStorage.setItem(viewKey, 'Y')
		void getPublicQna(postId, increaseViewCount)
			.then((data) => { if (!cancelled) setPost(data) })
			.catch((reason: unknown) => {
				if (increaseViewCount) window.sessionStorage.removeItem(viewKey)
				if (!cancelled) {
					setPost(null)
					setError(reason instanceof Error ? reason.message : '문의 내용을 불러오지 못했습니다.')
				}
			})
		return () => { cancelled = true }
	}, [postId])

	const remove = async () => {
		if (!postId || deleting || !window.confirm('문의 글을 삭제하시겠습니까?')) return
		setDeleting(true)
		setError('')
		try {
			await deletePublicQna(postId)
			router.push(qnaListHref(paramsSnapshot))
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : '문의 글을 삭제하지 못했습니다.')
			setDeleting(false)
		}
	}

	const done = answerDone(post?.answerStatus ?? null)
	const hasAnswer = Boolean(done && post?.answerContent?.trim())
	const canManage = Boolean(post?.passwordProtected)
	return (
		<section className="board_wrap inner" aria-labelledby="page-title">
			<div className="board_view">
				<div className="tit_area">
					{post && <div className={`state review ${done ? 'end' : 'ing'}`}>{done ? '답변완료' : '답변대기'}</div>}
					<h1 className="tit" id="page-title">{post?.title || error || '문의 내용을 불러오는 중입니다.'}</h1>
					<ul className="info">
						<li><strong>등록일</strong><p>{formatDate(post?.registeredAt ?? null)}</p></li>
						<li><strong>조회수</strong><p>{post?.viewCount ?? 0}</p></li>
					</ul>
				</div>
				<div className="cont" style={{ whiteSpace: 'pre-wrap' }}>{post?.content || ''}</div>
				{canManage && (
					<div className="btns_writer" style={!hasAnswer ? { borderBottom: 'none' } : undefined}>
						<a href={qnaPageHref('/support/qna_modify', postId, paramsSnapshot)} className="btn btn_modify">수정</a>
						<button type="button" className="btn btn_del" onClick={remove} disabled={deleting}>{deleting ? '삭제 중' : '삭제'}</button>
					</div>
				)}
				{hasAnswer && post?.answerContent && (
					<div className="reply_area">
						<div className="top">
							<div className="writer"><span>A</span>{post.answererName || '울산광역시미래교육관'}</div>
							<div className="date"><strong>등록일</strong><span>{formatDate(post.answerDate)}</span></div>
						</div>
						<div className="con" dangerouslySetInnerHTML={{ __html: post.answerContent }} />
					</div>
				)}
			</div>
			{error && post && <p role="alert" className="tac" style={{ color: '#e5484d' }}>{error}</p>}
			<div className="board_bottom flex_center"><a href={qnaListHref(paramsSnapshot)} className="btn btn_wbb btn_large">목록</a></div>
		</section>
	)
}

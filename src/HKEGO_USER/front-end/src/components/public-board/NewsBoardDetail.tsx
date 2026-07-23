'use client'

import { useEffect, useState } from 'react'
import {
	getPublicBoardPost,
	getPublicFileDownloadUrl,
	type PublicBoardId,
	type PublicBoardPost
} from '@/lib/publicApi'

type Props = {
	boardId: PublicBoardId
	listHref: string
	detailPath: string
	postId: string
	initialPost?: PublicBoardPost
}

const formatDate = (value: string | null) => value ? value.replaceAll('-', '.') : '-'

export default function NewsBoardDetail({ boardId, listHref, detailPath, postId, initialPost }: Props) {
	const [post, setPost] = useState<PublicBoardPost | null>(initialPost ?? null)
	const [error, setError] = useState(postId ? '' : '게시글 정보가 없습니다.')

	useEffect(() => {
		let cancelled = false
		if (!postId) {
			setPost(null)
			setError('게시글 정보가 없습니다.')
			return
		}
		setError('')
		const viewKey = `ulmfe-board-view:${boardId}:${postId}`
		const increaseViewCount = window.sessionStorage.getItem(viewKey) !== 'Y'
		if (increaseViewCount) window.sessionStorage.setItem(viewKey, 'Y')
		void getPublicBoardPost(boardId, postId, increaseViewCount)
			.then((data) => {
				if (!cancelled) setPost(data)
			})
			.catch((reason: unknown) => {
				if (increaseViewCount) window.sessionStorage.removeItem(viewKey)
				if (!cancelled) {
					if (!initialPost) setPost(null)
					setError(reason instanceof Error ? reason.message : '게시글을 불러오지 못했습니다.')
				}
			})
		return () => {
			cancelled = true
		}
	}, [boardId, initialPost, postId])

	const detailHref = (targetPostId: string) => {
		const detailQuery = new URLSearchParams(listHref.split('?')[1] || '')
		detailQuery.set('id', targetPostId)
		return `${detailPath}?${detailQuery.toString()}`
	}
	const previousHref = post?.previousPostId
		? detailHref(post.previousPostId)
		: '#this'
	const nextHref = post?.nextPostId
		? detailHref(post.nextPostId)
		: '#this'
	return (
		<section className="board_wrap inner" aria-labelledby="page-title">
			<div className="board_view">
				<div className="tit_area">
					<h1 className="tit" id="page-title">{post?.title || error || '게시글을 불러오는 중입니다.'}</h1>
					<ul className="info">
						<li><strong>등록일</strong><p>{formatDate(post?.publishedDate ?? null)}</p></li>
						<li><strong>조회수</strong><p>{post?.viewCount ?? 0}</p></li>
					</ul>
				</div>
				<div className="cont" dangerouslySetInnerHTML={{ __html: post?.content || '' }} />
				<div className="file_area">
					{post?.attachments.map((file) => (
						<a key={`${file.fileId}-${file.fileSeq}`} href={getPublicFileDownloadUrl(file)} download>
							<span>{file.originalFileName}</span><i className="btn_download flex_center">다운로드</i>
						</a>
					))}
				</div>
			</div>
			<div className="board_bottom flex_center">
				<div className="prev_next">
					<a href={previousHref} className="prev" aria-disabled={!post?.previousPostId} onClick={(event) => { if (!post?.previousPostId) event.preventDefault() }}>
						<strong>이전 글</strong><p>{post?.previousPostTitle || '이전 글이 없습니다.'}</p>
					</a>
					<a href={nextHref} className="next" aria-disabled={!post?.nextPostId} onClick={(event) => { if (!post?.nextPostId) event.preventDefault() }}>
						<strong>다음 글</strong><p>{post?.nextPostTitle || '다음 글이 없습니다.'}</p>
					</a>
				</div>
				<a href={listHref} className="btn btn_wbb btn_large">목록</a>
			</div>
		</section>
	)
}

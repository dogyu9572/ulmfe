'use client'

import BoardPagination from './BoardPagination'
import BoardSearchForm from './BoardSearchForm'
import { usePublicBoardList, type SearchType } from './usePublicBoardList'
import type { PublicBoardPost, PublicPageResult } from '@/lib/publicApi'

type Props = {
	initialResult?: PublicPageResult<PublicBoardPost>
	initialSelectedPost?: PublicBoardPost
	initialMediaIndex?: number
	initialSearchType: SearchType
	initialKeyword: string
}

const formatDate = (value: string | null) => value ? value.replaceAll('-', '.') : '-'

function isVideoPost(post: PublicBoardPost) {
	const type = `${post.categoryName || ''} ${post.categoryCode || ''}`.toLowerCase()
	return type.includes('동영상') || type.includes('영상') || type.includes('video') || Boolean(post.videoUrl || post.linkUrl)
}

function videoEmbedUrl(value: string | null) {
	if (!value) return ''
	try {
		const url = new URL(value)
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
		if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
			const videoId = url.searchParams.get('v')
			return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : ''
		}
		if (url.hostname === 'youtu.be') {
			const videoId = url.pathname.replace(/^\//, '')
			return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : ''
		}
		return url.toString()
	} catch {
		return ''
	}
}

function imageUrls(post: PublicBoardPost) {
	return Array.from(new Set(
		post.attachments
			.filter((file) => file.contentType?.startsWith('image/'))
			.map((file) => file.fileUrl)
			.filter(Boolean)
	))
}

export default function GalleryBoard({
	initialResult,
	initialSelectedPost,
	initialMediaIndex = 0,
	initialSearchType,
	initialKeyword
}: Props) {
	const board = usePublicBoardList('GALRY', 6, initialResult, initialSearchType, initialKeyword)
	const selectedPost = initialSelectedPost ?? null
	const { result } = board
	const listHref = board.buildHref(result.page)
	const emptyMessage = board.error || (!board.loading && result.list.length === 0 ? '등록된 갤러리가 없습니다.' : '')

	const popupImages = selectedPost ? imageUrls(selectedPost) : []
	const popupIsVideo = selectedPost ? isVideoPost(selectedPost) : false
	const embedUrl = selectedPost ? videoEmbedUrl(selectedPost.linkUrl) : ''

	return (
		<>
			<section className="board_wrap inner" aria-labelledby="page-title" aria-busy={board.loading}>
				<h1 id="page-title" className="subtitle">갤러리</h1>
				<div className="board_top">
					<div className="flex left"><div className="total">총 <strong>{result.totalCount}</strong>건</div></div>
					<BoardSearchForm
						idPrefix="gallery"
						searchType={board.draftSearchType}
						keyword={board.draftKeyword}
						onSearchTypeChange={board.setDraftSearchType}
						onKeywordChange={board.setDraftKeyword}
						onSubmit={board.submitSearch}
					/>
				</div>
				<ul className="gallery_basic type_gallery">
					{result.list.map((post) => {
						const video = isVideoPost(post)
						const typeLabel = (post.categoryName || post.categoryCode || '').trim() || (video ? '동영상' : '사진')
						const popupQuery = new URLSearchParams(listHref.split('?')[1] || '')
						popupQuery.set('post_id', post.postId)
						const popupHref = `${listHref.split('?')[0]}?${popupQuery.toString()}`
						return (
							<li key={post.postId}>
								<a
									href={popupHref}
									className="btn_popup"
								>
									<span className="imgarea">
										<span className={`type ${video ? 'video' : 'photo'}`}><i aria-hidden="true" />{typeLabel}</span>
										<span className="imgfit"><img src={post.thumbnailUrl || '/pub/images/no_image.svg'} alt="" /></span>
									</span>
									<span className="txt">
										<h3 className="tit">{post.title}</h3>
										<span className="date"><span className="sound_only">작성일:</span>{formatDate(post.publishedDate)}</span>
									</span>
								</a>
							</li>
						)
					})}
				</ul>
				{emptyMessage ? <p role="status">{emptyMessage}</p> : null}
				<div className="board_bottom">
					<BoardPagination page={result.page} totalPages={result.totalPages} buildHref={board.buildHref} />
				</div>
			</section>

			{selectedPost ? (
				<div className="popup pop_gallery open" id="pop_gallery" role="dialog" aria-modal="true" aria-labelledby="gallery-popup-title">
					<a href={listHref} className="dm" aria-label="팝업 닫기" />
					<div className="inbox">
						<a href={listHref} className="btn_close">팝업 닫기</a>
						<h2 className="tit" id="gallery-popup-title">{selectedPost.title}</h2>
						<div className="con">
							<div className="gallery_for swiper-container">
								{popupIsVideo && selectedPost.videoUrl ? (
									<video className="media_frame" src={selectedPost.videoUrl} controls />
								) : popupIsVideo && embedUrl ? (
									<iframe className="media_frame" src={embedUrl} title={selectedPost.title} allowFullScreen />
								) : popupImages.length > 0 ? (
									<>
										<div className="swiper-wrapper">
											{popupImages.map((url) => (
												<div className="swiper-slide" key={url}><img src={url} alt="" /></div>
											))}
										</div>
										<div className="pagination" />
									</>
								) : (
									<p>등록된 미디어가 없습니다.</p>
								)}
							</div>
							{popupImages.length > 1 && !popupIsVideo ? (
								<div className="gallery_nav">
									<div className="swiper-wrapper">
										{popupImages.map((url) => (
											<div className="swiper-slide" key={url}>
												<img src={url} alt="" />
											</div>
										))}
									</div>
								</div>
							) : null}
							<div className="btns_btm">
								<a href={listHref} className="btn btn_small btn_wbb btn_clo">확인</a>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</>
	)
}

'use client'

import { useEffect, useState } from 'react'
import { withBasePath } from '@/lib/basePath'
import { getPublicLibraryBooks, resolvePublicMediaUrl, type PublicLibraryBook } from '@/lib/publicApi'

export default function LibrarySearchContent() {
	const [recommendedBooks, setRecommendedBooks] = useState<PublicLibraryBook[]>([])

	useEffect(() => {
		let cancelled = false
		void getPublicLibraryBooks({ recommendedYn: 'Y', page: 1, size: 20 })
			.then((result) => {
				if (!cancelled) setRecommendedBooks(result.list)
			})
			.catch(() => {
				if (!cancelled) setRecommendedBooks([])
			})
		return () => {
			cancelled = true
		}
	}, [])

	const primaryBook = recommendedBooks[0]
	const recommendedSlides = recommendedBooks.slice(1)

	return (
		<section className="library_wrap inner" aria-labelledby="page-title">
			<h1 id="page-title" className="subtitle">자료검색</h1>
			<div className="board_top center_type">
				<form action={withBasePath('/library/search_list')} method="get" className="search_wrap">
					<fieldset>
						<legend className="sound_only">게시글 검색</legend>
						<label htmlFor="search-condition" className="sound_only">검색 조건 선택</label>
						<select name="search_condition" id="search-condition" defaultValue="all">
							<option value="all">전체</option>
							<option value="title">제목</option>
							<option value="author">저자</option>
						</select>
						<div className="search_area">
							<label htmlFor="search-keyword" className="sound_only">검색어 입력</label>
							<input type="text" id="search-keyword" name="search_keyword" placeholder="검색어를 입력해주세요." />
							<button type="submit" className="btn">검색</button>
						</div>
					</fieldset>
				</form>
			</div>
			<h2 className="ctit mb0">사서 추천도서</h2>
			{primaryBook ? (
				<div className="librarian_books_area">
					<div className="left">
						<div className="imgfit">
							{primaryBook.imageUrl ? <img src={resolvePublicMediaUrl(primaryBook.imageUrl)} alt="" /> : null}
						</div>
						<div className="txt flex colm">
							<div className="top flex colm">
								<h3>{primaryBook.title}</h3>
								<p>{primaryBook.description ?? ''}</p>
							</div>
							<div className="btm flex colm">
								<ul className="writer_info flex colm">
									<li><strong>지은이</strong>{primaryBook.authorName ?? ''}</li>
									<li><strong>출판사</strong>{primaryBook.publisherName ?? ''}</li>
								</ul>
								<a href={withBasePath(`/library/search_view?book_id=${primaryBook.bookId}`)} className="btn_more flex_center btn_wbb">자세히보기</a>
							</div>
						</div>
					</div>
					<div className="right">
						<div className="book_slide">
							<div className="control">
								<button type="button" className="arrow prev">이전</button>
								<button type="button" className="arrow next">다음</button>
								<div className="paging"></div>
							</div>
							<div className="swiper-wrapper">
								{recommendedSlides.map((book) => (
									<div className="swiper-slide" key={book.bookId}>
										<a href={withBasePath(`/library/search_view?book_id=${book.bookId}`)}>
											<span aria-hidden="true" className="imgfit">{book.imageUrl ? <img src={resolvePublicMediaUrl(book.imageUrl)} alt="" /> : null}</span>
											<p>{book.title}</p>
										</a>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="no_content">등록된 추천도서가 없습니다.</div>
			)}
			{/* 새로 들어온 도서 영역은 자료실로 대체 (복구 가능성 있어 주석 유지)
			<div className="ctit">
				<h2>새로 들어온 도서</h2>
				<a href={withBasePath("/library/search_list?new_only=Y")} className="btn_more">더보기</a>
			</div>
			{newBooks.length > 0 ? (
				<div className="new_book_slide book_list">
					<div className="swiper-wrapper">
						{newBooks.map((book) => (
							<div className="swiper-slide" key={book.bookId}>
								<a href={`/library/search_view?book_id=${book.bookId}`}>
									<span aria-hidden="true" className="imgfit">{book.imageUrl ? <img src={resolvePublicMediaUrl(book.imageUrl)} alt="" /> : null}</span>
									<p>{book.title}</p>
								</a>
							</div>
						))}
					</div>
					<div className="control">
						<button type="button" className="arrow prev">이전</button>
						<button type="button" className="arrow next">다음</button>
						<div className="paging"></div>
					</div>
				</div>
			) : (
				<div className="no_content">등록된 신간 도서가 없습니다.</div>
			)}
			*/}
		</section>
	)
}

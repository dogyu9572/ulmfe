'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import LibraryBookCard from '@/components/public-library/LibraryBookCard'
import { getPublicLibraryBook, resolvePublicMediaUrl, type PublicLibraryBook } from '@/lib/publicApi'

function MultilineText({ text }: { text: string }) {
	return text.split(/\r?\n/).map((line, index, lines) => (
		<span key={`${index}-${line}`}>
			{line}
			{index < lines.length - 1 ? <br /> : null}
		</span>
	))
}

export default function LibraryBookDetailPage() {
	const params = useSearchParams()
	const bookId = Number(params.get('book_id'))
	const [book, setBook] = useState<PublicLibraryBook | null>(null)
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		let cancelled = false
		if (!Number.isInteger(bookId) || bookId <= 0) {
			setBook(null)
			setLoaded(true)
			return
		}
		setLoaded(false)
		void getPublicLibraryBook(bookId)
			.then((data) => {
				if (!cancelled) setBook(data)
			})
			.catch(() => {
				if (!cancelled) setBook(null)
			})
			.finally(() => {
				if (!cancelled) setLoaded(true)
			})
		return () => {
			cancelled = true
		}
	}, [bookId])

	if (!loaded) {
		return (
			<section className="library_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">도서 상세</h1>
			</section>
		)
	}

	if (!book) {
		return (
			<section className="library_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">도서 상세</h1>
				<div className="no_content">도서 정보를 찾을 수 없습니다.</div>
			</section>
		)
	}

	const bookInfo = [
		{ label: '지은이', value: book.authorName },
		{ label: '출판사', value: book.publisherName },
		{ label: '발행년도', value: book.publicationYear },
		{ label: '등록번호', value: book.bookManagementNumber },
		{ label: '청구기호', value: book.callNumber },
		{ label: '도서위치', value: book.locationName }
	]
		.map((item) => ({ ...item, value: String(item.value ?? '').trim() }))
		.filter((item) => item.value)

	return (
		<section className="library_wrap inner" aria-labelledby="page-title">
			<div className="library_view_wrap">
				<div className="book_view_top">
					<div aria-hidden="true" className="imgfit">{book.imageUrl ? <img src={resolvePublicMediaUrl(book.imageUrl)} alt="" /> : null}</div>
					<div className="txt">
						<h1 id="page-title" className="tit">{book.title}</h1>
						<ul className="writer_info flex colm">
							{bookInfo.map((item) => <li key={item.label}><strong>{item.label}</strong>{item.value}</li>)}
						</ul>
					</div>
				</div>
				<h2 className="tt">책소개</h2>
				<div className="book_view_about"><MultilineText text={book.description ?? ''} /></div>
			</div>
			<h2 className="stit large">관련 자료</h2>
			{book.relatedBooks.length > 0 ? (
				<ul className="flex book_list">{book.relatedBooks.map((relatedBook) => <LibraryBookCard key={relatedBook.bookId} book={relatedBook} />)}</ul>
			) : (
				<div className="no_content">연결된 관련 자료가 없습니다.</div>
			)}
		</section>
	)
}

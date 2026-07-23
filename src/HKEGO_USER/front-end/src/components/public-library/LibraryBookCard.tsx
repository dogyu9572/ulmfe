import type { PublicLibraryBook } from '@/lib/publicApi'

type Props = {
	book: PublicLibraryBook
	detailPath?: string
}

export default function LibraryBookCard({ book, detailPath = '/library/search_view' }: Props) {
	const description = (book.description ?? '').trim()
	const publisherName = (book.publisherName ?? '').trim()
	const authorName = (book.authorName ?? '').trim()
	const hasWriterInfo = Boolean(publisherName || authorName)

	return (
		<li>
			<a href={`${detailPath}?book_id=${book.bookId}`}>
				<span aria-hidden="true" className="imgfit">
					{book.imageUrl ? <img src={book.imageUrl} alt="" /> : null}
					<span className="hover">
						<span>자세히 보기</span>
						{description ? <p>{description}</p> : null}
						{hasWriterInfo ? (
							<ul className="writer_info flex colm">
								{publisherName ? <li><strong>출판사</strong>{publisherName}</li> : null}
								{authorName ? <li><strong>지은이</strong>{authorName}</li> : null}
							</ul>
						) : null}
					</span>
				</span>
				<p>{book.title}</p>
			</a>
		</li>
	)
}

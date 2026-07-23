type Props = {
	page: number
	totalPages: number
	buildHref: (page: number) => string
}

export default function BoardPagination({ page, totalPages, buildHref }: Props) {
	const safeTotalPages = Math.max(1, totalPages)
	const safePage = Math.min(Math.max(1, page), safeTotalPages)
	const groupStart = Math.floor((safePage - 1) / 5) * 5 + 1
	const pages = Array.from(
		{ length: Math.min(5, safeTotalPages - groupStart + 1) },
		(_, index) => groupStart + index
	)
	return (
		<nav className="paging" aria-label="게시판 페이지 이동">
			<a href={buildHref(1)} className="arrow two first" aria-label="첫 페이지로 이동">처음</a>
			<a href={buildHref(Math.max(1, safePage - 5))} className="arrow one prev" aria-label="5페이지 이전으로 이동">이전</a>
			{pages.map((targetPage) => (
				<a
					key={targetPage}
					href={buildHref(targetPage)}
					className={targetPage === safePage ? 'on' : undefined}
					aria-current={targetPage === safePage ? 'page' : undefined}
					aria-label={targetPage === safePage ? `현재 ${targetPage}페이지` : `${targetPage}페이지로 이동`}
				>
					{targetPage}
				</a>
			))}
			<a href={buildHref(Math.min(safeTotalPages, safePage + 5))} className="arrow one next" aria-label="5페이지 다음으로 이동">다음</a>
			<a href={buildHref(safeTotalPages)} className="arrow two last" aria-label="마지막 페이지로 이동">맨끝</a>
		</nav>
	)
}

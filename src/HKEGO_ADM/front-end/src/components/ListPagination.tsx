import React from 'react'

type ListPaginationProps = {
	page: number
	totalPages: number
	disabled?: boolean
	onPageChange: (page: number) => void
}

export function buildPaginationPages(page: number, totalPages: number, delta = 2): number[] {
	const left = Math.max(1, page - delta)
	const right = Math.min(totalPages, page + delta)
	const pages: number[] = []
	for (let i = left; i <= right; i++) pages.push(i)
	if (left > 2) pages.unshift(1)
	if (right < totalPages - 1) pages.push(totalPages)
	return [...new Set(pages)].sort((a, b) => a - b)
}

export const ListPagination: React.FC<ListPaginationProps> = ({
	page,
	totalPages,
	disabled = false,
	onPageChange,
}) => {
	if (totalPages <= 1) return null

	const pages = buildPaginationPages(page, totalPages)

	return (
		<div className="pagination-wrap">
			<nav className="pagination" aria-label="페이지 네비게이션">
				<button
					type="button"
					className="pagination-btn pagination-prev"
					disabled={disabled || page <= 1}
					onClick={() => onPageChange(1)}
					aria-label="처음"
				>
					‹‹
				</button>
				<button
					type="button"
					className="pagination-btn pagination-prev"
					disabled={disabled || page <= 1}
					onClick={() => onPageChange(page - 1)}
					aria-label="이전"
				>
					‹
				</button>
				<ul className="pagination-list">
					{pages.map((p, i, arr) => (
						<React.Fragment key={p}>
							{i > 0 && arr[i - 1] !== p - 1 && (
								<li className="pagination-ellipsis">…</li>
							)}
							<li>
								<button
									type="button"
									className={`pagination-btn pagination-num ${page === p ? 'active' : ''}`}
									disabled={disabled}
									onClick={() => onPageChange(p)}
									aria-current={page === p ? 'page' : undefined}
								>
									{p}
								</button>
							</li>
						</React.Fragment>
					))}
				</ul>
				<button
					type="button"
					className="pagination-btn pagination-next"
					disabled={disabled || page >= totalPages}
					onClick={() => onPageChange(page + 1)}
					aria-label="다음"
				>
					›
				</button>
				<button
					type="button"
					className="pagination-btn pagination-next"
					disabled={disabled || page >= totalPages}
					onClick={() => onPageChange(totalPages)}
					aria-label="마지막"
				>
					››
				</button>
			</nav>
		</div>
	)
}

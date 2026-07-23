import NewsBoardDetailPage from '@/components/public-board/NewsBoardDetailPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function ArchiveElementaryViewContent({ searchParams }: PageContentProps) {
	return (
		<NewsBoardDetailPage
			boardId="LRNSUP"
			listPath="/archive/elementary"
			detailPath="/archive/elementary_view"
			searchParams={searchParams}
		/>
	)
}

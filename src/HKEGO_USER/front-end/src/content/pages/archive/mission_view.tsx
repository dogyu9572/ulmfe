import NewsBoardDetailPage from '@/components/public-board/NewsBoardDetailPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function ArchiveMissionViewContent({ searchParams }: PageContentProps) {
	return (
		<NewsBoardDetailPage
			boardId="LRNSUP"
			listPath="/archive/mission"
			detailPath="/archive/mission_view"
			searchParams={searchParams}
		/>
	)
}

import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function ArchiveElementaryContent({ searchParams }: PageContentProps) {
	return (
		<NewsBoardListPage
			boardId="LRNSUP"
			title="사건탐구 프로그램"
			detailPath="/archive/elementary_view"
			variant="notice"
			programType="EXPLORE"
			showLearningTypeFilter
			searchParams={searchParams}
		/>
	)
}

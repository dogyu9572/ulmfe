import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function ArchiveMissionContent({ searchParams }: PageContentProps) {
	return (
		<NewsBoardListPage
			boardId="LRNSUP"
			title="미션 프로그램"
			detailPath="/archive/mission_view"
			variant="notice"
			programType="MISSION"
			showLearningTypeFilter
			searchParams={searchParams}
		/>
	)
}

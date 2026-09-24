import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'

export default function ArchiveMissionContent() {
	return (
		<NewsBoardListPage
			boardId="LRNSUP"
			title="학교단위 프로그램"
			detailPath="/archive/mission_view"
			variant="notice"
			programType="MISSION"
			showLearningTypeFilter
		/>
	)
}

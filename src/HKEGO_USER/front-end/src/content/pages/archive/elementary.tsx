import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'

export default function ArchiveElementaryContent() {
	return (
		<NewsBoardListPage
			boardId="LRNSUP"
			title="ESD 체험터"
			detailPath="/archive/elementary_view"
			variant="notice"
			programType="EXPLORE"
			showEsdZoneFilter
		/>
	)
}

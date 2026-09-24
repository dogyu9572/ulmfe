import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'

export default function NewsEventContent() {
	return <NewsBoardListPage boardId="EVENT" title="이벤트" detailPath="/news/event_view" variant="gallery-small" />
}

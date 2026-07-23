import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function NewsEventContent({ searchParams }: PageContentProps) {
	return <NewsBoardListPage boardId="EVENT" title="이벤트" detailPath="/news/event_view" variant="gallery-small" searchParams={searchParams} />
}

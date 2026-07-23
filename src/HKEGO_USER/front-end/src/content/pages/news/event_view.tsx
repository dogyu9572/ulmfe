import NewsBoardDetailPage from '@/components/public-board/NewsBoardDetailPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function NewsEventViewContent({ searchParams }: PageContentProps) {
	return <NewsBoardDetailPage boardId="EVENT" listPath="/news/event" detailPath="/news/event_view" searchParams={searchParams} />
}

import NewsBoardDetailPage from '@/components/public-board/NewsBoardDetailPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function NewsExhibitViewContent({ searchParams }: PageContentProps) {
	return <NewsBoardDetailPage boardId="EXHBT" listPath="/news/exhibit" detailPath="/news/exhibit_view" searchParams={searchParams} />
}

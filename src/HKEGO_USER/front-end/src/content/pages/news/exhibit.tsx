import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function NewsExhibitContent({ searchParams }: PageContentProps) {
	return <NewsBoardListPage boardId="EXHBT" title="기획전" detailPath="/news/exhibit_view" variant="gallery-large" searchParams={searchParams} />
}

import NewsBoardDetailPage from '@/components/public-board/NewsBoardDetailPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default async function NewsNoticeViewContent({ searchParams }: PageContentProps) {
	return <NewsBoardDetailPage boardId="ZEHSB" listPath="/news/notice" detailPath="/news/notice_view" searchParams={searchParams} />
}

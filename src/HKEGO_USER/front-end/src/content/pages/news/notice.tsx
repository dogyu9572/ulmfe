import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function NewsNoticeContent({ searchParams }: PageContentProps) {
	return <NewsBoardListPage boardId="ZEHSB" title="공지사항" detailPath="/news/notice_view" variant="notice" searchParams={searchParams} />
}

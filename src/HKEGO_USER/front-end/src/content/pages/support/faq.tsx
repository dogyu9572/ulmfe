import FaqBoardPage from '@/components/public-board/FaqBoardPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function SupportFaqContent({ searchParams }: PageContentProps) {
	return <FaqBoardPage searchParams={searchParams} />
}

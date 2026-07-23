import GalleryBoardPage from '@/components/public-board/GalleryBoardPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function GalleryIndexContent({ searchParams }: PageContentProps) {
	return <GalleryBoardPage searchParams={searchParams} />
}

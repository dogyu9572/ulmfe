import LibraryBookListPage from '@/components/public-library/LibraryBookListPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function LibraryRecommendContent(props: PageContentProps) {
	return <LibraryBookListPage {...props} mode="recommend" />
}

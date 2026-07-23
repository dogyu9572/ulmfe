import LibraryBookListPage from '@/components/public-library/LibraryBookListPage'
import type { PageContentProps } from '@/content/pageRegistry'

export default function LibraryNewContent(props: PageContentProps) {
	return <LibraryBookListPage {...props} mode="new" />
}

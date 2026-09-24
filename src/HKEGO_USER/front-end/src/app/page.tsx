import { withBasePath } from '@/lib/basePath'
import HomePageClient from '@/components/HomePageClient'
import type { Metadata } from 'next'
import { buildPageMetadata, SITE_DESCRIPTION, SITE_NAME } from '@/lib/siteMeta'

export async function generateMetadata(): Promise<Metadata> {
	return buildPageMetadata({
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		path: '/',
		appendSiteName: false,
		siteName: SITE_NAME
	})
}

export default function HomePage() {
	return (
		<>
			<link rel="stylesheet" href={withBasePath('/pub/css/swiper.css')} precedence="base-styles" />
			<HomePageClient />
		</>
	)
}

import type { Metadata } from 'next'
import PageBehavior from '@/components/PageBehavior'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import SubpageAside from '@/components/SubpageAside'
import { getPageDefinition, type PageSearchParams } from '@/content/pageRegistry'

type PageProps = { searchParams: PageSearchParams }

const page = getPageDefinition('gallery', 'index')!

export const metadata: Metadata = {
	title: `${page.title} | 울산광역시미래교육관`,
	description: page.description || page.title
}

export default function GalleryPage({ searchParams }: PageProps) {
	return (
		<>
			<link rel="stylesheet" href="/pub/css/swiper.css" precedence="subpage-styles" />
			{page.styles.map((href) => <link rel="stylesheet" href={href} precedence="subpage-styles" key={href} />)}
			<SiteHeader />
			<main className={page.mainClassName} id="mainContent">
				{page.menuIndex !== null && page.description ? (
					<SubpageAside
						menuIndex={page.menuIndex}
						currentHref="/gallery/index"
						title={page.title}
						description={page.description}
					/>
				) : null}
				<page.Content searchParams={searchParams} />
			</main>
			<PageBehavior behavior={page.behavior} />
			<SiteFooter />
		</>
	)
}

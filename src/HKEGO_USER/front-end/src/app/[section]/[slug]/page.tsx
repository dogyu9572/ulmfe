import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageBehavior from '@/components/PageBehavior'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import SubpageAside from '@/components/SubpageAside'
import { getPageDefinition, PAGE_DEFINITIONS, type PageSearchParams } from '@/content/pageRegistry'

type PageProps = {
	params: Promise<{ section: string; slug: string }>
	searchParams: PageSearchParams
}

export const dynamicParams = false

export function generateStaticParams() {
	return PAGE_DEFINITIONS.map(({ section, slug }) => ({ section, slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { section, slug } = await params
	const page = getPageDefinition(section, slug)
	return page ? { title: `${page.title} | 울산광역시미래교육관`, description: page.description || page.title } : {}
}

export default async function Subpage({ params, searchParams }: PageProps) {
	const { section, slug } = await params
	const page = getPageDefinition(section, slug)
	if (!page) notFound()
	const currentHref = page.activeHref || `/${section}/${slug}`

	return (
		<>
			{page.styles.map((href) => <link rel="stylesheet" href={href} precedence="subpage-styles" key={href} />)}
			{page.behavior === 'library-sliders' || page.behavior === 'program-slider' || page.behavior === 'popup' ? (
				<link rel="stylesheet" href="/pub/css/swiper.css" precedence="subpage-styles" />
			) : null}
			<SiteHeader />
			<main className={page.mainClassName} id="mainContent">
				{page.menuIndex !== null && page.description ? (
					<SubpageAside menuIndex={page.menuIndex} currentHref={currentHref} title={page.title} description={page.description} />
				) : null}
				<page.Content searchParams={searchParams} />
			</main>
			<PageBehavior behavior={page.behavior} />
			<SiteFooter />
		</>
	)
}

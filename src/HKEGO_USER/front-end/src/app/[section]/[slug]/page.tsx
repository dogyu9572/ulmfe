import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LegacyPageEffects from '@/components/LegacyPageEffects'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import SubpageAside from '@/components/SubpageAside'
import { getLegacyPage, LEGACY_PAGE_DEFINITIONS } from '@/lib/legacyPages'

type PageProps = { params: Promise<{ section: string; slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
	return LEGACY_PAGE_DEFINITIONS.map(({ section, slug }) => ({ section, slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { section, slug } = await params
	const page = getLegacyPage(section, slug)
	return page ? { title: `${page.title} | 울산광역시미래교육관`, description: page.description || page.title } : {}
}

export default async function LegacyStaticPage({ params }: PageProps) {
	const { section, slug } = await params
	const page = getLegacyPage(section, slug)
	if (!page) notFound()
	const currentHref = page.activeHref || `/${section}/${slug}`

	return (
		<>
			{page.styles.map((href) => <link rel="stylesheet" href={href} precedence="legacy-subpage" key={href} />)}
			{page.effect === 'library-sliders' || page.effect === 'program-slider' || page.effect === 'popup' ? (
				<link rel="stylesheet" href="/pub/css/swiper.css" precedence="legacy-subpage" />
			) : null}
			{page.effect === 'library-sliders' || page.effect === 'library-month' ? (
				<script src="/pub/js/legacy-library.js" defer />
			) : null}
			{page.effect === 'total-search-tabs' ? <script src="/pub/js/legacy-total-search.js" defer /> : null}
			<SiteHeader />
			<main className={page.mainClassName} id="mainContent">
				{page.menuIndex !== null && page.description ? (
					<SubpageAside menuIndex={page.menuIndex} currentHref={currentHref} title={page.title} description={page.description} />
				) : null}
				<div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
			</main>
			<LegacyPageEffects effect={page.effect} />
			<SiteFooter />
		</>
	)
}

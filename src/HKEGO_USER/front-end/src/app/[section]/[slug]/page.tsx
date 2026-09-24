import { withBasePath } from '@/lib/basePath'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import JsonLd from '@/components/JsonLd'
import PageBehavior from '@/components/PageBehavior'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import SubpageAside from '@/components/SubpageAside'
import { getPageDefinition, PAGE_DEFINITIONS } from '@/content/pageRegistry'
import {
	breadcrumbJsonLd,
	buildPageMetadata,
	hasFixedCanonical,
	isIndexablePage,
	menuHrefByIndex,
	menuLabelByIndex,
	SITE_NAME,
	type BreadcrumbItem
} from '@/lib/siteMeta'

type PageProps = {
	params: Promise<{ section: string; slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
	return PAGE_DEFINITIONS.map(({ section, slug }) => ({ section, slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { section, slug } = await params
	const page = getPageDefinition(section, slug)
	if (!page) return {}

	return buildPageMetadata({
		title: page.title,
		description: page.metaDescription || page.description || page.title,
		path: `/${section}/${slug}`,
		indexable: isIndexablePage(section, slug),
		withCanonical: hasFixedCanonical(slug),
		siteName: SITE_NAME
	})
}

/** 대메뉴가 있으면 홈 > 대메뉴 > 현재 페이지, 없으면 홈 > 현재 페이지로 구성한다. */
function buildBreadcrumb(section: string, slug: string, title: string, menuIndex: number | null): BreadcrumbItem[] {
	const menuLabel = menuLabelByIndex(menuIndex)
	const menuHref = menuHrefByIndex(menuIndex)
	const current: BreadcrumbItem = { name: title, path: `/${section}/${slug}` }
	return menuLabel && menuHref ? [{ name: menuLabel, path: menuHref }, current] : [current]
}

export default async function Subpage({ params }: PageProps) {
	const { section, slug } = await params
	const page = getPageDefinition(section, slug)
	if (!page) notFound()
	const currentHref = page.activeHref || `/${section}/${slug}`

	return (
		<>
			{page.styles.map((href) => <link rel="stylesheet" href={href} precedence="subpage-styles" key={href} />)}
			<JsonLd data={breadcrumbJsonLd(buildBreadcrumb(section, slug, page.title, page.menuIndex))} />
			{page.behavior === 'library-sliders' || page.behavior === 'program-slider' || page.behavior === 'popup' ? (
				<link rel="stylesheet" href={withBasePath('/pub/css/swiper.css')} precedence="subpage-styles" />
			) : null}
			<SiteHeader />
			<main className={page.mainClassName} id="mainContent">
				{page.menuIndex !== null && page.description ? (
					<SubpageAside menuIndex={page.menuIndex} currentHref={currentHref} title={page.title} description={page.description} />
				) : null}
				<Suspense fallback={null}>
					<page.Content />
					{/* 본문과 같은 Suspense 경계에 둔다. 밖에 두면 본문이 스트리밍으로 도착하기 전에
					    useEffect 가 돌아 슬라이더를 초기화하고, 뒤늦은 hydration 이 그 DOM 을 갈아치운다. */}
					<PageBehavior behavior={page.behavior} />
				</Suspense>
			</main>
			<SiteFooter />
		</>
	)
}

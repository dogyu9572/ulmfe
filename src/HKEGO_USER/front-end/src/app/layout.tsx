import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'
import './globals.css'
import UserAccessLogger from './UserAccessLogger'
import JsonLd from '@/components/JsonLd'
import ScrollToTop from '@/components/ScrollToTop'
import { withBasePath } from '@/lib/basePath'
import {
    absoluteAssetUrl,
    FAVICON_ICO_PATH,
    FAVICON_PATH,
    OG_IMAGE_PATH,
    OG_IMAGE_SIZE,
    organizationJsonLd,
    SITE_DESCRIPTION,
    SITE_KEYWORDS,
    SITE_NAME,
    SITE_URL,
    webSiteJsonLd
} from '@/lib/siteMeta'

const ogImages = OG_IMAGE_PATH ? [{ url: absoluteAssetUrl(OG_IMAGE_PATH), ...OG_IMAGE_SIZE, alt: SITE_NAME }] : undefined
const faviconPath = absoluteAssetUrl(FAVICON_PATH)
const faviconIcoPath = absoluteAssetUrl(FAVICON_ICO_PATH)
const pretendard = localFont({
	src: '../../public/pub/css/font/PretendardVariable.woff2',
	weight: '45 920',
	display: 'swap',
	preload: true
})

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`
	},
	description: SITE_DESCRIPTION,
	keywords: SITE_KEYWORDS,
	authors: [{ name: SITE_NAME, url: `${SITE_URL}/` }],
	creator: SITE_NAME,
	publisher: SITE_NAME,
	applicationName: SITE_NAME,
	generator: 'Next.js',
	category: 'education',
	alternates: {
		canonical: '/',
		languages: { 'ko-KR': '/' }
	},
	icons: {
		icon: [{ url: faviconPath, type: 'image/svg+xml' }],
		shortcut: faviconIcoPath,
		apple: faviconPath
	},
	openGraph: {
		type: 'website',
		siteName: SITE_NAME,
		locale: 'ko_KR',
		url: '/',
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		images: ogImages
	},
	twitter: {
		card: ogImages ? 'summary_large_image' : 'summary',
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		images: ogImages?.map((image) => image.url)
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1
		}
	},
	formatDetection: { telephone: false, email: false, address: false },
	other: {
		subject: SITE_NAME,
		copyright: SITE_NAME
	}
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
    viewportFit: 'cover'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ko">
            <head>
                <link rel="stylesheet" href={withBasePath('/pub/css/styles.css')} precedence="base-styles" />
                <link rel="stylesheet" href={withBasePath('/pub/css/styles_main.css')} precedence="base-styles" />
                <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
            </head>
			<body className={pretendard.className}>
                <div className="blind_link"><a href="#mainContent">본문 바로가기</a></div>
                <UserAccessLogger />
                <ScrollToTop />
                {children}
                <Script src={withBasePath('/pub/js/swiper.js')} strategy="afterInteractive" />
            </body>
        </html>
    )
}
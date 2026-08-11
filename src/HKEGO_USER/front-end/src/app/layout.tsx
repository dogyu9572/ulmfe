import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import UserAccessLogger from './UserAccessLogger'
import ScrollToTop from '@/components/ScrollToTop'

export const metadata: Metadata = {
    metadataBase: new URL('https://ulmfe-user.hk-test.co.kr'),
    title: '울산광역시미래교육관',
    description: '울산광역시미래교육관',
    icons: { icon: '/pub/images/favicon.svg' },
    openGraph: {
        title: '울산광역시미래교육관',
        description: '울산광역시미래교육관',
        type: 'website'
    },
    robots: { index: true, follow: true }
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
                <link rel="preload" href="/pub/css/font/Pretendard-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="/pub/css/font/Pretendard-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="stylesheet" href="/pub/css/font.css" precedence="base-styles" />
                <link rel="stylesheet" href="/pub/css/styles.css" precedence="base-styles" />
                <link rel="stylesheet" href="/pub/css/styles_main.css" precedence="base-styles" />
            </head>
            <body>
                <div className="blind_link"><a href="#mainContent">본문 바로가기</a></div>
                <UserAccessLogger />
                <ScrollToTop />
                {children}
                <Script src="/pub/js/swiper.js" strategy="afterInteractive" />
            </body>
        </html>
    )
}
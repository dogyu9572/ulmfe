import HomePageClient from '@/components/HomePageClient'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import {
	getPublicBoardPostsServer,
	getPublicMainBannersServer,
	getPublicPopupsServer
} from '@/lib/publicApiServer'

export const metadata: Metadata = {
    title: '울산광역시미래교육관',
    description: '울산광역시미래교육관 메인 페이지입니다',
    alternates: {
        canonical: '/'
    }
}

export default async function HomePage() {
	const [banners, exhibits, notices, galleryItems, events, popups] = await Promise.all([
		getPublicMainBannersServer().catch(() => []),
		getPublicBoardPostsServer('EXHBT', { page: 1, size: 4 }).then((result) => result.list).catch(() => []),
		getPublicBoardPostsServer('ZEHSB', { page: 1, size: 3 }).then((result) => result.list).catch(() => []),
		getPublicBoardPostsServer('GALRY', { page: 1, size: 3 }).then((result) => result.list).catch(() => []),
		getPublicBoardPostsServer('EVENT', { page: 1, size: 2 }).then((result) => result.list).catch(() => []),
		getPublicPopupsServer().catch(() => [])
	])
	const popupClosedToday = (await cookies()).get('ulmfeMainPopupClosed')?.value === 'Y'
	return (
		<>
			<link rel="stylesheet" href="/pub/css/swiper.css" precedence="base-styles" />
			<HomePageClient
				initialBanners={banners}
				initialExhibits={exhibits}
				initialNotices={notices}
				initialGalleryItems={galleryItems}
				initialEvents={events}
				initialPopups={popups}
				initialPopupOpen={popups.length > 0 && !popupClosedToday}
			/>
		</>
	)
}

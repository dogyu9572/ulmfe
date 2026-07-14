import type { Metadata } from 'next'
import './globals.css'
import UserAccessLogger from './UserAccessLogger'

export const metadata: Metadata = {
	title: 'HKEGO 사용자 포털',
	description: 'HKEGO 사용자 서비스 메인 페이지'
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="ko">
			<body>
				<UserAccessLogger />
				{children}
			</body>
		</html>
	)
}

import styles from './page.module.css'

type MainApiData = {
	siteName: string
	title: string
	description: string
	serverTime: string
}

type MainApiResponse = {
	success: boolean
	message: string
	data: MainApiData | null
}

function resolveApiBase(): string {
	if (process.env.API_BASE_URL) {
		return process.env.API_BASE_URL
	}
	if (process.env.NEXT_PUBLIC_API_BASE_URL) {
		return process.env.NEXT_PUBLIC_API_BASE_URL
	}
	// dev: SSR fetch는 next.config rewrites를 타지 않으므로 백엔드 직접 호출
	if (process.env.NODE_ENV === 'development') {
		return 'http://127.0.0.1:9032'
	}
	// prod: Spring Boot 단일 포트 서빙 시 상대 경로
	return ''
}

async function fetchMainInfo(): Promise<MainApiData | null> {
	try {
		const apiBase = resolveApiBase()
		const response = await fetch(`${apiBase}/api/user/main`, {
			cache: 'no-store'
		})

		if (!response.ok) {
			return null
		}

		const body = (await response.json()) as MainApiResponse
		return body.success ? body.data : null
	} catch {
		return null
	}
}

export default async function HomePage() {
	const mainInfo = await fetchMainInfo()

	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<p className={styles.badge}>HKEGO USER</p>
				<h1 className={styles.title}>
					{mainInfo?.title ?? 'HKEGO 사용자 포털'}
				</h1>
				<p className={styles.description}>
					{mainInfo?.description ?? '사용자 서비스 메인 페이지입니다.'}
				</p>
				<div className={styles.meta}>
					<span>사이트: {mainInfo?.siteName ?? 'HKEGO'}</span>
					<span>
						서버 시간: {mainInfo?.serverTime ?? '백엔드 연결 대기 중'}
					</span>
				</div>
			</section>

			<section className={styles.cards}>
				<article className={styles.card}>
					<h2>공지사항</h2>
					<p>곧 사용자 공지 게시판이 연결됩니다.</p>
				</article>
				<article className={styles.card}>
					<h2>마이페이지</h2>
					<p>회원 로그인 및 개인정보 관리 기능을 준비 중입니다.</p>
				</article>
				<article className={styles.card}>
					<h2>고객센터</h2>
					<p>문의 및 FAQ 서비스가 이후 단계에서 추가됩니다.</p>
				</article>
			</section>
		</main>
	)
}

'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN'

function readCsrfToken(): string {
	const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`))
	return match ? decodeURIComponent(match[1]) : ''
}

async function recordAccess(pathname: string): Promise<void> {
	let csrfToken = readCsrfToken()
	if (!csrfToken) {
		const tokenResponse = await fetch('/api/user/main', { credentials: 'include' })
		csrfToken = tokenResponse.headers.get(CSRF_HEADER_NAME) || readCsrfToken()
	}

	if (!csrfToken) return

	await fetch('/api/user/main', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			[CSRF_HEADER_NAME]: csrfToken
		},
		body: JSON.stringify({
			requestUri: `${pathname}${window.location.search}`,
			accessType: pathname === '/' ? 'MAIN' : 'PAGE'
		}),
		keepalive: true
	})
}

export default function UserAccessLogger() {
	const pathname = usePathname()
	const lastLoggedPath = useRef<string | null>(null)

	useEffect(() => {
		if (!pathname || lastLoggedPath.current === pathname) return
		lastLoggedPath.current = pathname
		void recordAccess(pathname).catch(() => undefined)
	}, [pathname])

	return null
}

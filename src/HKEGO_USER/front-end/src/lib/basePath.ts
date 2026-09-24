/** 운영 path prefix. next.config basePath 와 동일해야 한다. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? '/usfec').replace(/\/+$/, '')

/**
 * 공개 사이트 절대 경로에 basePath(/usfec) 를 붙인다.
 * next/link 의 href 는 Next 가 자동으로 붙이므로 이 함수를 쓰지 않는다.
 * /api, /uploads 도 path 배포에서는 /usfec/api, /usfec/uploads 로 붙인다.
 * (Ingress 는 /usfec/api|/uploads → Spring 의 /api|/uploads 로 rewrite)
 */
export function withBasePath(path: string): string {
	if (!path) return path
	if (
		path.startsWith('http://')
		|| path.startsWith('https://')
		|| path.startsWith('data:')
		|| path.startsWith('blob:')
		|| path.startsWith('mailto:')
		|| path.startsWith('tel:')
		|| path.startsWith('#')
		|| path.startsWith('//')
	) {
		return path
	}
	if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) {
		return path
	}
	if (path.startsWith('/')) {
		return `${BASE_PATH}${path}`
	}
	return `${BASE_PATH}/${path}`
}

const LIST_QUERY_KEYS = ['page', 'search_condition', 'search_keyword'] as const

export const QNA_LIST_RETURN_KEY = 'ulmfe-qna-list-return'

export function qnaListQuery(params: URLSearchParams) {
	const query = new URLSearchParams()
	LIST_QUERY_KEYS.forEach((key) => {
		const value = params.get(key)
		if (value) query.set(key, value)
	})
	return query
}

/** 앱 경로(basePath 제외). router.push 용. <a href> 에는 withBasePath 를 씌운다. */
export function qnaListHref(params: URLSearchParams) {
	const value = qnaListQuery(params).toString()
	return value ? `/support/qna?${value}` : '/support/qna'
}

/** 앱 경로(basePath 제외). router.push 용. <a href> 에는 withBasePath 를 씌운다. */
export function qnaPageHref(path: string, postId: string, params: URLSearchParams) {
	const query = qnaListQuery(params)
	if (postId) query.set('post_id', postId)
	const value = query.toString()
	return value ? `${path}?${value}` : path
}

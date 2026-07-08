export const youtubeVideoId = (videoUrl?: string) => {
	if (!videoUrl) return ''
	try {
		const url = new URL(videoUrl)
		const host = url.hostname.replace(/^www\./, '')
		let videoId = ''
		if (host === 'youtu.be') {
			videoId = url.pathname.split('/').filter(Boolean)[0] || ''
		} else if (host.endsWith('youtube.com')) {
			videoId = url.searchParams.get('v') || ''
			if (!videoId) {
				const parts = url.pathname.split('/').filter(Boolean)
				const keywordIndex = parts.findIndex((part) => part === 'embed' || part === 'shorts')
				videoId = keywordIndex >= 0 ? parts[keywordIndex + 1] || '' : ''
			}
		}
		return videoId
	} catch {
		return ''
	}
}

export const youtubeThumbnailUrls = (videoUrl?: string) => {
	const videoId = youtubeVideoId(videoUrl)
	return {
		videoId,
		primary: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
		fallback: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ''
	}
}

export const youtubeEmbedUrl = (videoUrl?: string) => {
	const videoId = youtubeVideoId(videoUrl)
	return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1` : ''
}

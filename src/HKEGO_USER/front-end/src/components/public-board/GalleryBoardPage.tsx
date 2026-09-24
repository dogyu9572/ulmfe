'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import GalleryBoard from './GalleryBoard'
import { getPublicBoardPost, type PublicBoardPost } from '@/lib/publicApi'

export default function GalleryBoardPage() {
	const query = useSearchParams()
	const postId = (query.get('post_id') || '').trim()
	const mediaValue = Number(query.get('media'))
	const mediaIndex = Number.isInteger(mediaValue) && mediaValue >= 0 ? mediaValue : 0
	const [selectedPost, setSelectedPost] = useState<PublicBoardPost | undefined>(undefined)

	useEffect(() => {
		let cancelled = false
		if (!postId) {
			setSelectedPost(undefined)
			return
		}
		void getPublicBoardPost('GALRY', postId, false)
			.then((data) => {
				if (!cancelled) setSelectedPost(data)
			})
			.catch(() => {
				if (!cancelled) setSelectedPost(undefined)
			})
		return () => {
			cancelled = true
		}
	}, [postId])

	return (
		<GalleryBoard
			initialSelectedPost={selectedPost}
			initialMediaIndex={mediaIndex}
			initialSearchType="title"
			initialKeyword=""
		/>
	)
}

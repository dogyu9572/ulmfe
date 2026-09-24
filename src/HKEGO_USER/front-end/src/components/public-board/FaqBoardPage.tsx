'use client'

import { useEffect, useState } from 'react'
import FaqBoard from './FaqBoard'
import { getPublicBoardCategories, type PublicBoardCategory } from '@/lib/publicApi'

export default function FaqBoardPage() {
	const [categories, setCategories] = useState<PublicBoardCategory[]>([])

	useEffect(() => {
		let cancelled = false
		void getPublicBoardCategories('FAQ01')
			.then((data) => {
				if (!cancelled) setCategories(data)
			})
			.catch(() => {
				if (!cancelled) setCategories([])
			})
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<FaqBoard
			categories={categories}
			initialSearchType="all"
			initialKeyword=""
			initialCategory=""
		/>
	)
}

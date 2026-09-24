'use client'

import { useEffect, useState } from 'react'
import NewsBoardListPage from '@/components/public-board/NewsBoardListPage'
import { getPublicBoardCategories, type PublicBoardCategory } from '@/lib/publicApi'

export default function LibraryArchiveContent() {
	const [categories, setCategories] = useState<PublicBoardCategory[]>([])

	useEffect(() => {
		let cancelled = false
		void getPublicBoardCategories('LBARC')
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
		<NewsBoardListPage
			boardId="LBARC"
			title="자료실"
			detailPath="/library/archive_view"
			variant="notice"
			categoryFilter={{
				label: '분류',
				options: categories.map((item) => ({ value: item.categoryCode, label: item.categoryName }))
			}}
		/>
	)
}

import { useEffect, useState } from 'react'

export const useTabletSidebarToggle = () => {
	const [collapsed, setCollapsed] = useState(false)

	useEffect(() => {
		const container = document.getElementById('mainContent')
		if (!container) return
		container.classList.toggle('off', collapsed)
		return () => container.classList.remove('off')
	}, [collapsed])

	return {
		collapsed,
		toggleSidebar: () => setCollapsed((value) => !value)
	}
}

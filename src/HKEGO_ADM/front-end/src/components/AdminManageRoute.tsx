import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type SessionInfo = {
	valid: boolean
	canManageAdmin: boolean
}

type AdminManageRouteProps = {
	children: React.ReactElement
}

export const AdminManageRoute: React.FC<AdminManageRouteProps> = ({ children }) => {
	const location = useLocation()
	const [loading, setLoading] = useState(true)
	const [allowed, setAllowed] = useState(false)

	useEffect(() => {
		let mounted = true

		const checkPermission = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/api/admin/auth/session`, {
					credentials: 'include'
				})
				const result: ApiResponse<SessionInfo> = await res.json()
				if (!mounted) return
				const isAllowed = Boolean(result.success && result.data?.valid && result.data?.canManageAdmin)
				setAllowed(isAllowed)
			} catch {
				if (!mounted) return
				setAllowed(false)
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}

		checkPermission()
		return () => {
			mounted = false
		}
	}, [location.pathname])

	if (loading) {
		return null
	}

	if (!allowed) {
		return <Navigate to="/admin/forbidden" replace />
	}

	return children
}

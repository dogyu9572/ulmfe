import { useEffect, useMemo, useState } from 'react'
import { fetchTabletAuthSession } from '../api/tabletApi'

const parseLimitSeconds = (limitMin?: number | string | null) => {
	const minutes = typeof limitMin === 'string' ? parseFloat(limitMin) : Number(limitMin)
	return Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : 0
}

const formatSeconds = (seconds: number) => {
	const safeSeconds = Math.max(0, seconds)
	const minutes = Math.floor(safeSeconds / 60)
	const restSeconds = safeSeconds % 60
	if (minutes > 0) return `${minutes}분${restSeconds}초`
	return `${restSeconds}초`
}

export const useQuestTimeLimit = (storageKey: string, limitMin?: number | string | null) => {
	const limitSeconds = useMemo(() => parseLimitSeconds(limitMin), [limitMin])
	const [now, setNow] = useState(() => Date.now())
	const [adminId, setAdminId] = useState(() => typeof window === 'undefined' ? '' : window.sessionStorage.getItem('hkegoTabletAdminId') || '')
	const isTimeLimitBypassed = adminId.trim().toLowerCase() === 'admin2'

	const startedAt = useMemo(() => {
		if (typeof window === 'undefined' || !storageKey || limitSeconds <= 0) return Date.now()
		const storedValue = window.sessionStorage.getItem(storageKey)
		const storedStartedAt = storedValue ? Number(storedValue) : NaN
		if (Number.isFinite(storedStartedAt) && storedStartedAt > 0) return storedStartedAt
		const nextStartedAt = Date.now()
		window.sessionStorage.setItem(storageKey, String(nextStartedAt))
		return nextStartedAt
	}, [limitSeconds, storageKey])

	useEffect(() => {
		if (limitSeconds <= 0) return
		const timer = window.setInterval(() => setNow(Date.now()), 1000)
		return () => window.clearInterval(timer)
	}, [limitSeconds])

	useEffect(() => {
		let canceled = false
		void fetchTabletAuthSession()
			.then((session) => {
				if (!canceled) {
					const nextAdminId = session.adminId || ''
					setAdminId(nextAdminId)
					if (nextAdminId) window.sessionStorage.setItem('hkegoTabletAdminId', nextAdminId)
					else window.sessionStorage.removeItem('hkegoTabletAdminId')
				}
			})
			.catch(() => {
				if (!canceled) {
					setAdminId('')
					window.sessionStorage.removeItem('hkegoTabletAdminId')
				}
			})
		return () => {
			canceled = true
		}
	}, [])

	const elapsedSeconds = limitSeconds <= 0 ? limitSeconds : Math.floor((now - startedAt) / 1000)
	const remainingSeconds = Math.max(0, limitSeconds - elapsedSeconds)

	useEffect(() => {
		if (isTimeLimitBypassed) return
		if (typeof window === 'undefined' || !storageKey || limitSeconds <= 300) return
		if (remainingSeconds <= 0 || remainingSeconds > 300) return

		const alertStorageKey = `${storageKey}:fiveMinuteAlerted`
		if (window.sessionStorage.getItem(alertStorageKey) === 'Y') return
		window.sessionStorage.setItem(alertStorageKey, 'Y')
		window.alert('5분 남았습니다.')
	}, [isTimeLimitBypassed, limitSeconds, remainingSeconds, storageKey])

	return {
		limitSeconds,
		remainingSeconds,
		isTimeLimitMet: isTimeLimitBypassed || limitSeconds <= 0 || remainingSeconds <= 0,
		remainingLabel: formatSeconds(remainingSeconds)
	}
}

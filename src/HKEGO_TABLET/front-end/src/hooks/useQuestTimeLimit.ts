import { useCallback, useEffect, useMemo, useState } from 'react'
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

	// 제한 시간이 없는 단계도 소요시간을 재야 하므로 시작 시각은 항상 남긴다.
	const startedAt = useMemo(() => {
		if (typeof window === 'undefined' || !storageKey) return Date.now()
		const storedValue = window.sessionStorage.getItem(storageKey)
		const storedStartedAt = storedValue ? Number(storedValue) : NaN
		if (Number.isFinite(storedStartedAt) && storedStartedAt > 0) return storedStartedAt
		const nextStartedAt = Date.now()
		window.sessionStorage.setItem(storageKey, String(nextStartedAt))
		return nextStartedAt
	}, [storageKey])

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

	const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000))
	const remainingSeconds = limitSeconds <= 0 ? 0 : Math.max(0, limitSeconds - elapsedSeconds)

	/**
	 * 제출 시점의 경과 시간을 초로 돌려준다.
	 * 렌더 시점의 elapsedSeconds 는 타이머가 도는 단계에서만 갱신되므로,
	 * 저장할 때는 이 함수로 그 순간을 다시 계산한다.
	 */
	const getElapsedSeconds = useCallback(() => Math.max(0, Math.floor((Date.now() - startedAt) / 1000)), [startedAt])

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
		elapsedSeconds,
		getElapsedSeconds,
		isTimeLimitMet: isTimeLimitBypassed || limitSeconds <= 0 || remainingSeconds <= 0,
		remainingLabel: formatSeconds(remainingSeconds)
	}
}

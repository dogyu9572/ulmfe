type AndroidPushBridge = {
	registerContext: (contextJson: string) => void
	unregisterContext: () => void
	getDeviceId: () => string
}

declare global {
	interface Window {
		AndroidPush?: AndroidPushBridge
	}
}

export const registerAndroidPushContext = (role: 'TEACHER' | 'STUDENT', rsvtSn: number, studentSns: number[] = []) => {
	if (!Number.isFinite(rsvtSn) || rsvtSn <= 0) return
	window.AndroidPush?.registerContext(JSON.stringify({ role, rsvtSn, studentSns }))
}

export const unregisterAndroidPushContext = () => {
	window.AndroidPush?.unregisterContext()
}

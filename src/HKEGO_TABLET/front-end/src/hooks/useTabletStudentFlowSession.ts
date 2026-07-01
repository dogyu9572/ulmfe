import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTabletSession } from '../api/tabletApi'
import { readTabletStudentFlowSession, saveTabletStudentFlowSession, TabletStudentFlowSession } from '../state/tabletStudentFlowSession'

export const useTabletStudentFlowSession = () => {
	const [flowSession, setFlowSession] = useState<TabletStudentFlowSession | null | undefined>(undefined)

	useEffect(() => {
		const storedSession = readTabletStudentFlowSession()
		if (!storedSession) {
			setFlowSession(null)
			return
		}
		const selectedStudentSns = storedSession.selectedStudents.map((student) => student.stdntSn)
		void fetchTabletSession()
			.then((session) => {
				if (!session.reservation || session.reservation.rsvtSn !== storedSession.rsvtSn) {
					setFlowSession(storedSession)
					return
				}
				const refreshed = saveTabletStudentFlowSession(session, selectedStudentSns)
				setFlowSession(refreshed ?? storedSession)
			})
			.catch((error) => {
				window.alert(error instanceof Error ? error.message : '최신 프로그램 정보를 조회하지 못했습니다.')
				setFlowSession(storedSession)
			})
	}, [])

	return flowSession
}

export const useRequiredTabletStudentFlowSession = () => {
	const navigate = useNavigate()
	const alertedRef = useRef(false)
	const flowSession = useTabletStudentFlowSession()

	useEffect(() => {
		if (flowSession !== null || alertedRef.current) return
		alertedRef.current = true
		window.alert('출석 학생을 선택해주세요.')
		navigate('/student/attendance', { replace: true })
	}, [flowSession, navigate])

	return flowSession
}

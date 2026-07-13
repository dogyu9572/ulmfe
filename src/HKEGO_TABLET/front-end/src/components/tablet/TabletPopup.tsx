import { useEffect, useState } from 'react'
import { createTabletTeacherCall, fetchUnreadTabletTeacherMessages, markTabletTeacherMessageRead, TabletTeacherMessage } from '../../api/tabletApi'
import { readTabletStudentFlowSession, studentFlowMissionQuestByRouteIndex } from '../../state/tabletStudentFlowSession'

const currentPlaceName = () => {
	const session = readTabletStudentFlowSession()
	if (!session) return ''
	const match = window.location.pathname.match(/\/student\/mission(\d{2})(?:_end)?$/)
	if (match) {
		const routeIndex = Number(match[1]) - 3
		const quest = studentFlowMissionQuestByRouteIndex(session, routeIndex)
		return quest?.place || quest?.name || session.prgrmNm
	}
	return session.prgrmNm
}

export const TeacherCallPopup = () => {
	const [open, setOpen] = useState(false)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		const handleOpen = (event: MouseEvent) => {
			const target = event.target as HTMLElement | null
			const button = target?.closest<HTMLButtonElement>('.btn_open[data-target="pop_teacher_call"]')
			if (!button) return
			event.preventDefault()
			setOpen(true)
		}
		document.addEventListener('click', handleOpen)
		return () => document.removeEventListener('click', handleOpen)
	}, [])

	const close = () => {
		if (!saving) setOpen(false)
	}

	const submit = async () => {
		const session = readTabletStudentFlowSession()
		if (!session) {
			window.alert('학생 선택 정보가 없습니다.')
			return
		}
		const studentSns = session.selectedStudents.map((student) => student.stdntSn)
		if (studentSns.length === 0) {
			window.alert('학생 선택 정보가 없습니다.')
			return
		}
		try {
			setSaving(true)
			await createTabletTeacherCall(session.rsvtSn, { studentSns, placeNm: currentPlaceName() })
			window.alert('선생님 호출을 보냈습니다.')
			setOpen(false)
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
	<div className={`popup pop_teacher_call${open ? ' is-active' : ''}`} id="pop_teacher_call">
		<div className="dm" onClick={close}></div>
		<div className="inbox">
			<button type="button" className="btn_close" onClick={close}>닫기</button>
			<div className="tit">선생님 호출</div>
			<div className="con scroll_wrap">
				<div className="scroll">
					<div className="tt">선생님을 호출하시겠습니까?</div>
					<p>호출하면 선생님께 알림이 전송됩니다.</p>
					<div className="btns_btm">
						<button type="button" className="btn btn_kwg btn_clo" onClick={close}>이전</button>
						<button type="button" className="btn btn_wbb" onClick={submit} disabled={saving}>{saving ? '전송 중' : '호출'}</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	)
}

export const TeacherMessagePopup = () => {
	const [messages, setMessages] = useState<TabletTeacherMessage[]>([])
	const [dismissedMessageSn, setDismissedMessageSn] = useState<number | null>(null)
	const [saving, setSaving] = useState(false)
	const currentMessage = messages[0] ?? null
	const open = Boolean(currentMessage && currentMessage.msgSn !== dismissedMessageSn)

	const loadMessages = async () => {
		const session = readTabletStudentFlowSession()
		if (!session) return
		const studentSns = session.selectedStudents.map((student) => student.stdntSn)
		if (studentSns.length === 0) return
		try {
			const items = await fetchUnreadTabletTeacherMessages(session.rsvtSn, studentSns)
			setMessages(items)
			if (items.length > 0 && items[0].msgSn !== dismissedMessageSn) setDismissedMessageSn(null)
		} catch {
			// 학생 활동을 방해하지 않도록 다음 조회 주기에 다시 시도합니다.
		}
	}

	useEffect(() => {
		void loadMessages()
		const timer = window.setInterval(() => void loadMessages(), 10000)
		return () => window.clearInterval(timer)
	}, [])

	const close = () => {
		if (!saving && currentMessage) setDismissedMessageSn(currentMessage.msgSn)
	}

	const confirm = async () => {
		const session = readTabletStudentFlowSession()
		if (!session || !currentMessage) return
		try {
			setSaving(true)
			await markTabletTeacherMessageRead(currentMessage.msgSn, session.selectedStudents.map((student) => student.stdntSn))
			setMessages((prev) => prev.filter((item) => item.msgSn !== currentMessage.msgSn))
			setDismissedMessageSn(null)
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '메시지 확인 처리에 실패했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className={`popup pop_teacher_maseage${open ? ' is-active' : ''}`} id="pop_teacher_maseage">
			<div className="dm" onClick={close}></div>
			<div className="inbox">
				<button type="button" className="btn_close" onClick={close}>닫기</button>
				<div className="tit">선생님 메시지</div>
				<div className="con scroll_wrap">
					<div className="scroll">
						<div className="textarea">
							<textarea name="" id="" cols={30} rows={10} className="text w100p" value={currentMessage?.messageCn ?? ''} readOnly></textarea>
						</div>
						<div className="btns_btm">
							<button type="button" className="btn btn_wbb" onClick={confirm} disabled={saving}>{saving ? '처리 중' : '확인했어요'}</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export const StudentPopups = () => (
	<>
		<TeacherCallPopup />
		<TeacherMessagePopup />
	</>
)

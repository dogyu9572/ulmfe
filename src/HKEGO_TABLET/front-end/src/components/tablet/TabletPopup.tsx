import { useEffect, useState } from 'react'
import { createTabletTeacherCall } from '../../api/tabletApi'
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

export const TeacherMessagePopup = () => (
	<div className="popup pop_teacher_maseage" id="pop_teacher_maseage">
		<div className="dm"></div>
		<div className="inbox">
			<button type="button" className="btn_close">닫기</button>
			<div className="tit">선생님 메시지</div>
			<div className="con scroll_wrap">
				<div className="scroll">
					<div className="textarea">
						<textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="다음 존으로 이동해주세요. 5분 남았습니다!"></textarea>
					</div>
					<div className="btns_btm">
						<button type="button" className="btn btn_wbb">확인했어요</button>
					</div>
				</div>
			</div>
		</div>
	</div>
)

export const StudentPopups = () => (
	<>
		<TeacherCallPopup />
		<TeacherMessagePopup />
	</>
)

import { useEffect, useMemo, useState } from 'react'
import { createTabletTeacherMessage, fetchTabletSession, fetchTabletTeacherMessages, TabletSession, TabletStudent, TabletTeacherMessage } from '../../api/tabletApi'
import { TeacherShell } from './teacherShared'

const quickTexts = [
	'다음 존으로 이동해주세요. 5분 남았습니다!',
	'입력한 내용을 저장 버튼을 눌러 꼭 저장해주세요.',
	'QR 코드를 다시 스캔해주세요.',
	'잘 하고 있어요! 계속 진행해주세요.',
	'모든 활동을 완료한 학생은 자리에서 기다려주세요.'
]

const normalizeTeamName = (value?: string | null) => {
	const name = (value || '').trim()
	if (!name) return '팀 정보 없음'
	return name.endsWith('팀') ? name : `${name}팀`
}

const groupByTeam = (students: TabletStudent[]) => {
	const grouped = new Map<string, TabletStudent[]>()
	students.forEach((student) => {
		const teamName = normalizeTeamName(student.teamNm)
		grouped.set(teamName, [...(grouped.get(teamName) ?? []), student])
	})
	return Array.from(grouped.entries()).map(([teamName, teamStudents]) => ({ teamName, students: teamStudents }))
}

export const TeacherMessageSendingPage = () => {
	const [session, setSession] = useState<TabletSession | null>(null)
	const [loaded, setLoaded] = useState(false)
	const [selectedTeams, setSelectedTeams] = useState<string[]>([])
	const [message, setMessage] = useState('')
	const [messages, setMessages] = useState<TabletTeacherMessage[]>([])
	const [sending, setSending] = useState(false)
	const students = session?.students ?? []
	const teams = useMemo(() => groupByTeam(students), [students])
	const selectAll = selectedTeams.length === 0
	const selectedCount = selectAll
		? students.length
		: teams.filter((team) => selectedTeams.includes(team.teamName)).reduce((sum, team) => sum + team.students.length, 0)

	useEffect(() => {
		let alive = true
		void fetchTabletSession()
			.then((nextSession) => {
				if (!alive) return
				setSession(nextSession)
				if (nextSession.reservation) {
					void fetchTabletTeacherMessages(nextSession.reservation.rsvtSn).then((items) => {
						if (alive) setMessages(items)
					})
				}
			})
			.catch((error) => window.alert(error instanceof Error ? error.message : '예약 정보를 조회하지 못했습니다.'))
			.finally(() => {
				if (alive) setLoaded(true)
			})
		return () => {
			alive = false
		}
	}, [])

	const toggleTeam = (team: string) => {
		setSelectedTeams((prev) => {
			const next = prev.includes(team) ? prev.filter((item) => item !== team) : [...prev, team]
			return next.length === 0 || next.length === teams.length ? [] : next
		})
	}

	const sendMessage = async () => {
		if (!message.trim()) {
			window.alert('메시지를 입력해주세요.')
			return
		}
		const reservation = session?.reservation
		if (!reservation) {
			window.alert('예약 정보가 없습니다.')
			return
		}
		const studentSns = selectAll
			? students.map((student) => student.stdntSn)
			: teams.filter((team) => selectedTeams.includes(team.teamName)).flatMap((team) => team.students.map((student) => student.stdntSn))
		if (studentSns.length === 0) {
			window.alert('메시지를 받을 학생을 선택해주세요.')
			return
		}
		try {
			setSending(true)
			await createTabletTeacherMessage(reservation.rsvtSn, { studentSns, messageCn: message.trim() })
			setMessages(await fetchTabletTeacherMessages(reservation.rsvtSn))
			setMessage('')
			window.alert('메시지를 발송했습니다.')
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '메시지 발송에 실패했습니다.')
		} finally {
			setSending(false)
		}
	}

	return (
		<TeacherShell title="메시지 발송" info="학생 태블릿으로 메시지 전송">
			<div className="page_scroll">
				<div className="flex message_sending_wrap">
					<div className="wbox left">
						<h2 className="stit slim mt0">메세지 발송</h2>
						<div className="select_area">
							<div className="select_check"><input type="checkbox" id="selectAll" name="selectAll" checked={selectAll} onChange={() => setSelectedTeams([])} /><label htmlFor="selectAll"><span>전체({selectedCount}명)</span></label></div>
							{teams.map((team) => {
								const id = `select${team.teamName.replace(/\s/g, '')}`
								return <div className="select_check" key={team.teamName}><input type="checkbox" id={id} name={id} className="team" checked={selectedTeams.includes(team.teamName)} onChange={() => toggleTeam(team.teamName)} /><label htmlFor={id}><span>{team.teamName}({team.students.length}명)</span></label></div>
							})}
							{loaded && teams.length === 0 && <div className="select_check"><span>등록된 팀 정보가 없습니다.</span></div>}
						</div>
						<div className="input_area"><textarea name="" id="" cols={30} rows={10} placeholder="학생들에게 보낼 메시지를 입력하세요." value={message} onChange={(event) => setMessage(event.target.value)}></textarea><div className="btns"><button type="button" className="btn btn_reset btn_kwg" onClick={() => setMessage('')}>초기화</button><button type="button" className="btn btn_reset btn_wbb" onClick={sendMessage} disabled={sending}>{sending ? '발송 중' : '발송하기'}</button></div></div>
						<h2 className="stit slim">빠른 템플릿</h2>
						<ul className="quick_text">{quickTexts.map((text) => <li key={text}><button type="button" onClick={() => setMessage(text)}>{text}</button></li>)}</ul>
					</div>
					<div className="wbox right">
						<h2 className="stit slim mt0">발송 내역</h2>
						<ul className="send_list">
							{messages.map((item) => <li key={item.msgSn}><div className="to">{item.targetNm || '-'}</div><div className="con"><div className="text">{item.messageCn}</div><div className="day"><span>발송일시</span><span>{item.regDt || '-'}</span></div></div></li>)}
							{loaded && messages.length === 0 && <li><div className="to">-</div><div className="con"><div className="text">발송 내역이 없습니다.</div><div className="day"><span>발송일시</span><span>-</span></div></div></li>}
						</ul>
					</div>
				</div>
			</div>
		</TeacherShell>
	)
}

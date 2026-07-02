import { useEffect, useState } from 'react'
import { fetchTabletSession, fetchTabletTeacherCalls, markAllTabletTeacherCallsRead, markTabletTeacherCallRead, TabletTeacherCall } from '../../api/tabletApi'
import { TeacherShell } from './teacherShared'

const teamClassName = (teamNm?: string) => {
	const team = (teamNm || '').replace(/\s/g, '').toUpperCase()
	if (team.includes('B')) return 'team_b'
	if (team.includes('C')) return 'team_c'
	if (team.includes('D')) return 'team_d'
	return 'team_a'
}

const displayTime = (value?: string) => {
	if (!value) return ''
	const date = new Date(value.replace(' ', 'T'))
	if (Number.isNaN(date.getTime())) return value.slice(11) || value
	return date.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export const TeacherCallHistoryPage = () => {
	const [rsvtSn, setRsvtSn] = useState<number | null>(null)
	const [callItems, setCallItems] = useState<TabletTeacherCall[]>([])
	const [loading, setLoading] = useState(true)

	const loadCalls = async (nextRsvtSn?: number) => {
		const targetRsvtSn = nextRsvtSn ?? rsvtSn
		if (!targetRsvtSn) return
		const calls = await fetchTabletTeacherCalls(targetRsvtSn)
		setCallItems(calls)
	}

	useEffect(() => {
		let mounted = true
		const load = async () => {
			try {
				const session = await fetchTabletSession()
				const nextRsvtSn = session.reservation?.rsvtSn ?? null
				if (!mounted) return
				setRsvtSn(nextRsvtSn)
				if (nextRsvtSn) {
					setCallItems(await fetchTabletTeacherCalls(nextRsvtSn))
				} else {
					setCallItems([])
				}
			} catch (error) {
				if (mounted) window.alert(error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.')
			} finally {
				if (mounted) setLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	useEffect(() => {
		if (!rsvtSn) return
		const timer = window.setInterval(() => {
			loadCalls(rsvtSn).catch(() => undefined)
		}, 10000)
		return () => window.clearInterval(timer)
	}, [rsvtSn])

	const markRead = async (callSn: number) => {
		try {
			await markTabletTeacherCallRead(callSn)
			await loadCalls()
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.')
		}
	}

	const markAllRead = async () => {
		if (!rsvtSn) return
		try {
			await markAllTabletTeacherCallsRead(rsvtSn)
			await loadCalls(rsvtSn)
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.')
		}
	}

	return (
		<TeacherShell
			title="호출 내역"
			info="학생이 요청한 호출 내역"
			subtitleExtra={<button type="button" id="checkAll" className="btn btn_wbb btn_right" onClick={markAllRead}>모두 읽음 처리</button>}
		>
			<div className="page_scroll">
				<h2 className="sound_only">호출내역 목록</h2>
				{loading ? <div className="wbox">불러오는 중입니다.</div> : callItems.length === 0 ? <div className="wbox">호출 내역이 없습니다.</div> : (
					<ul className="call_history_wrap">
						{callItems.map((item) => <li className={item.callSttsCd === 'READ' ? 'read' : undefined} key={item.callSn}>
							<div className="left"><div className="tit"><span className={teamClassName(item.teamNm)}>{item.teamNm || '-'}</span>{item.placeNm || '-'}</div><div className="con">{item.callCn || '선생님을 호출했어요.'}</div><p>{item.studentNames || ''}</p></div>
							<div className="right"><time className="time">{displayTime(item.regDt)}</time><button type="button" className="btn btn_wbb" onClick={() => markRead(item.callSn)} disabled={item.callSttsCd === 'READ'}>{item.callSttsCd === 'READ' ? '읽음' : '읽음'}</button></div>
						</li>)}
					</ul>
				)}
			</div>
		</TeacherShell>
	)
}

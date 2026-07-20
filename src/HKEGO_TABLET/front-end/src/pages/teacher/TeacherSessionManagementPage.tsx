import { useEffect, useMemo, useState } from 'react'
import { fetchTabletSession, TabletSession, TabletStudent } from '../../api/tabletApi'
import { TeacherShell } from './teacherShared'
import { stripEmphasisMarkers } from '../../utils/emphasisText'

const formatReservationDateTime = (session: TabletSession | null) => {
	const reservation = session?.reservation
	if (!reservation?.rsvtYmd) return '-'
	return `${reservation.rsvtYmd.replace(/-/g, '.')} ${reservation.vstHm || ''}`.trim()
}

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

const averageProgress = (students: TabletStudent[]) => {
	if (students.length === 0) return 0
	return Math.round(students.reduce((sum, student) => sum + (Number(student.prgrsRt) || 0), 0) / students.length)
}

export const TeacherSessionManagementPage = () => {
	const [session, setSession] = useState<TabletSession | null>(null)
	const [loaded, setLoaded] = useState(false)
	const students = session?.students ?? []
	const teams = useMemo(() => groupByTeam(students), [students])
	const attendedCount = students.filter((student) => student.atndYn === 'Y').length
	const completedCount = students.filter((student) => (Number(student.prgrsRt) || 0) >= 100).length
	const totalCount = students.length || session?.reservation?.stdntCnt || 0

	useEffect(() => {
		let alive = true
		void fetchTabletSession()
			.then((nextSession) => {
				if (alive) setSession(nextSession)
			})
			.catch((error) => window.alert(error instanceof Error ? error.message : '예약 정보를 조회하지 못했습니다.'))
			.finally(() => {
				if (alive) setLoaded(true)
			})
		return () => {
			alive = false
		}
	}, [])

	return (
		<TeacherShell title="세션 관리" info="">
			<div className="page_scroll">
				<div className="monitoring_top"><h2 className="sound_only">세션 요약</h2><ul><li className="i1"><h3>전체 학생</h3><p><strong>{totalCount}</strong>명</p></li><li className="i2"><h3>출석 완료</h3><p><strong>{attendedCount}</strong>명</p></li><li className="i3"><h3>평균 진척률</h3><p><strong>{averageProgress(students)}</strong>%</p></li><li className="i4"><h3>완료 학생</h3><p><strong>{completedCount}</strong>명</p></li></ul></div>
				<div className="participation_student wbox">
					<div className="board_list">
						<table>
							<caption>현재 세션 정보</caption>
							<colgroup><col className="w180" /><col /></colgroup>
							<tbody>
								<tr><th scope="row">예약 일시</th><td>{formatReservationDateTime(session)}</td></tr>
								<tr><th scope="row">학교/학년</th><td>{session?.reservation ? `${session.reservation.schlNm || '-'} / ${session.reservation.scyrNm || '-'}` : '-'}</td></tr>
								<tr><th scope="row">프로그램</th><td>{session?.reservation ? `${session.reservation.prgrmTypeNm || '-'} - ${stripEmphasisMarkers(session.reservation.prgrmNm) || '-'}` : '-'}</td></tr>
								<tr><th scope="row">학습상태</th><td>{session?.reservation?.lrnSttsNm || '-'}</td></tr>
							</tbody>
						</table>
					</div>
				</div>
				<h2 className="stit">팀 현황</h2>
				<div className="participation_student wbox">
					<div className="board_list">
						<table>
							<caption>팀 현황</caption>
							<colgroup><col className="w120" /><col className="w120" /><col className="w120" /><col /></colgroup>
							<thead><tr><th scope="col">팀</th><th scope="col">인원</th><th scope="col">평균 진척률</th><th scope="col">학생</th></tr></thead>
							<tbody>
								{teams.map((team) => <tr key={team.teamName}><td>{team.teamName}</td><td>{team.students.length}명</td><td>{averageProgress(team.students)}%</td><td>{team.students.map((student) => student.stdntNm).filter(Boolean).join(', ') || '-'}</td></tr>)}
								{loaded && teams.length === 0 && <tr><td colSpan={4}>등록된 팀 정보가 없습니다.</td></tr>}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</TeacherShell>
	)
}

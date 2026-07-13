import { useEffect, useMemo, useState } from 'react'
import { fetchTabletSession, TabletSession, TabletStudent } from '../../api/tabletApi'
import { TeacherShell } from './teacherShared'

const teamClasses = ['team_a', 'team_b', 'team_c', 'team_d']

const normalizeTeamName = (value?: string | null) => {
	const name = (value || '').trim()
	if (!name) return '팀 정보 없음'
	return name.endsWith('팀') ? name : `${name}팀`
}

const teamClassName = (teamName: string, index: number) => {
	const key = teamName.replace(/\s/g, '').toUpperCase()
	if (key.includes('A')) return 'team_a'
	if (key.includes('B')) return 'team_b'
	if (key.includes('C')) return 'team_c'
	if (key.includes('D')) return 'team_d'
	return teamClasses[index % teamClasses.length]
}

const locationPointClass = (place: string) => {
	const text = place.replace(/\s/g, '')
	if (text.includes('사회')) return 'p1'
	if (text.includes('미래') || text.includes('미디어')) return 'p2'
	if (text.includes('도입')) return 'p3'
	if (text.includes('지구')) return 'p4'
	if (text.includes('놀이터') || text.includes('목공')) return 'p5'
	if (text.includes('공작')) return 'p6'
	return 'p7'
}

const teamPlace = (students: TabletStudent[]) =>
	students.map((student) => student.routeCn || student.asgnNm || '').find((value) => value.trim()) || '-'

const routePlaces = (session: TabletSession | null) => {
	if (!session) return []
	const places = session.students
		.map((student) => student.routeCn || student.asgnNm || '')
		.flatMap((value) => value.split(/\s*(?:->|→|,|，|>|\/)\s*/g))
		.map((value) => value.trim())
		.filter(Boolean)
	return Array.from(new Set(places))
}

export const TeacherRealTimeLocationPage = () => {
	const [session, setSession] = useState<TabletSession | null>(null)
	const [loaded, setLoaded] = useState(false)

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

	const teamSummaries = useMemo(() => {
		const grouped = new Map<string, TabletStudent[]>()
		;(session?.students ?? []).forEach((student) => {
			const teamName = normalizeTeamName(student.teamNm)
			grouped.set(teamName, [...(grouped.get(teamName) ?? []), student])
		})
		return Array.from(grouped.entries()).map(([teamName, students], index) => ({
			teamName,
			students,
			place: teamPlace(students),
			className: teamClassName(teamName, index)
		}))
	}, [session])
	const places = useMemo(() => routePlaces(session), [session])

	return (
		<TeacherShell title="실시간 위치" info="QR 스캔 기반 공간별 학생 위치 현황">
			<div className="page_scroll">
				<div className="current_location_map">
					<h2 className="sound_only">실시간 위치 지도</h2>
					<div className="box f2"><div className="mapbox"><img src="/pub/images/img_current_location_map01.webp" alt="" aria-hidden="true" /><ul className="map_point"><li className="p1">디지털창작실</li><li className="p2">미디어실</li><li className="p3">아이디어실 3, 4, 5</li><li className="p4">조리체험실</li><li className="p5">목공실</li><li className="p6">공작실 1, 2</li><li className="p7">아이디어실 1, 2</li></ul><ul className="team_point">{teamSummaries.filter((team) => locationPointClass(team.place) !== 'p1' && locationPointClass(team.place) !== 'p2' && locationPointClass(team.place) !== 'p3' && locationPointClass(team.place) !== 'p4').map((team) => <li className={`${team.className} ${locationPointClass(team.place)}`} key={team.teamName}><span><h3>{team.teamName}</h3><strong>{team.students.length}명</strong></span></li>)}</ul></div><p>본관 2층 : ESD배움터</p></div>
					<div className="box f1"><div className="mapbox"><img src="/pub/images/img_current_location_map02.webp" alt="" aria-hidden="true" /><ul className="map_point"><li className="p1">사회존</li><li className="p2">미래존</li><li className="p3">도입존</li><li className="p4">지구존</li><li className="p5">ESD놀이터</li></ul><ul className="team_point">{teamSummaries.filter((team) => ['p1', 'p2', 'p3', 'p4'].includes(locationPointClass(team.place))).map((team) => <li className={`${team.className} ${locationPointClass(team.place)}`} key={team.teamName}><span><h3>{team.teamName}</h3><strong>{team.students.length}명</strong></span></li>)}</ul></div><p>본관 1층 : ESD체험터</p></div>
				</div>
				<div className="flex_half">
					<div className="box"><h2 className="stit mt0">최근 QR 인증</h2><ul className="qr_list">{teamSummaries.map((team) => <li className={team.className} key={team.teamName}><h3>{team.teamName}</h3><span><strong>{team.place}</strong><p>{team.students.length}명</p></span><div className="time">최근 입장 시간<time>-</time></div></li>)}{loaded && teamSummaries.length === 0 && <li><h3>-</h3><span><strong>표시할 팀 정보가 없습니다.</strong><p>0명</p></span><div className="time">최근 입장 시간<time>-</time></div></li>}</ul></div>
					<div className="box"><h2 className="stit mt0">장소별 활동 참고</h2><ul className="location_info">{places.map((place) => <li key={place}><div className="tit">{place}</div><ul className="dots_list"><li>관리자에 등록된 활동 장소</li></ul></li>)}{loaded && places.length === 0 && <li><div className="tit">장소 정보 없음</div><ul className="dots_list"><li>관리자에 등록된 활동 장소가 없습니다.</li></ul></li>}</ul></div>
				</div>
			</div>
		</TeacherShell>
	)
}

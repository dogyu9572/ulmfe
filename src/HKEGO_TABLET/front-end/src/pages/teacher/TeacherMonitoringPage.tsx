import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchTabletSession, TabletProgressLog, TabletSession, TabletStudent } from '../../api/tabletApi'
import { TeacherShell } from './teacherShared'

const teamCardClasses = ['c1', 'c2', 'c3', 'c4']
const teamTextClasses = ['team1', 'team2', 'team3', 'team4']
const routeSeparators = /\s*(?:->|→|,|，|>|\/)\s*/g

type ProgressState = 'end' | 'ing' | 'before'

type TeamSummary = {
	name: string
	className: string
	students: TabletStudent[]
	averageProgress: number
	place: string
	bars: number[]
}

const normalizeTeamName = (value?: string | null) => {
	const normalized = (value || '').trim()
	if (!normalized) return '팀 정보 없음'
	return normalized.endsWith('팀') ? normalized : `${normalized}팀`
}

const averageProgress = (students: TabletStudent[]) => {
	if (students.length === 0) return 0
	return Math.round(students.reduce((sum, student) => sum + (Number(student.prgrsRt) || 0), 0) / students.length)
}

const parseRouteJsonSteps = (value?: string | null) => {
	if (!value) return []
	try {
		const parsed = JSON.parse(value) as { steps?: unknown }[]
		if (!Array.isArray(parsed)) return []
		const firstSteps = parsed.find((row) => Array.isArray(row.steps))?.steps
		return Array.isArray(firstSteps) ? firstSteps.map((step) => String(step).trim()).filter(Boolean) : []
	} catch {
		return []
	}
}

const routeItemsFromSession = (session: TabletSession | null) => {
	const jsonSteps = parseRouteJsonSteps(session?.reservation?.routeJson)
	if (jsonSteps.length > 0) return jsonSteps.slice(0, 4)
	const routeText = session?.students.map((student) => student.routeCn || '').find((value) => value.trim())
	if (!routeText) return ['Q1', 'Q2', 'Q3', 'Q4']
	const items = routeText.split(routeSeparators).map((item) => item.trim()).filter(Boolean)
	return items.length > 0 ? items.slice(0, 4) : ['Q1', 'Q2', 'Q3', 'Q4']
}

const progressLogsForStudent = (logs: TabletProgressLog[], studentSn: number) =>
	logs.filter((log) => log.stdntSn === studentSn)

const hasDoneLog = (logs: TabletProgressLog[], patterns: RegExp[]) =>
	logs.some((log) => patterns.some((pattern) => pattern.test(log.stepCd || '') || pattern.test(log.actvtNm || '')))

const stepStateByProgress = (progressRate: number, stepNumber: number, logs: TabletProgressLog[]): ProgressState => {
	const stepPatterns = [
		[/^STEP1$/i],
		[/^STEP2$/i, /^(QUEST|MISSION)0?1$/i, /^(QUEST|MISSION)0?2$/i, /^(QUEST|MISSION)0?3$/i, /^(QUEST|MISSION)0?4$/i],
		[/^STEP3$/i],
		[/^STEP4$/i]
	][stepNumber - 1] ?? []
	if (hasDoneLog(logs, stepPatterns)) return 'end'
	const doneThreshold = stepNumber * 25
	const startThreshold = (stepNumber - 1) * 25
	if (progressRate >= doneThreshold) return 'end'
	if (progressRate > startThreshold) return 'ing'
	return 'before'
}

const routeItemState = (student: TabletStudent, logs: TabletProgressLog[], routeItem: string, index: number, routeCount: number): ProgressState => {
	const routeNumber = index + 1
	const routePatterns = [
		new RegExp(`^(QUEST|MISSION)0?${routeNumber}$`, 'i'),
		new RegExp(routeItem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
	]
	if (hasDoneLog(logs, routePatterns)) return 'end'
	const progressRate = Number(student.prgrsRt) || 0
	if (progressRate <= 25) return index === 0 && progressRate > 0 ? 'ing' : 'before'
	const routeProgress = Math.max(0, Math.min(100, ((progressRate - 25) / 50) * 100))
	const doneThreshold = ((index + 1) / Math.max(routeCount, 1)) * 100
	const startThreshold = (index / Math.max(routeCount, 1)) * 100
	if (routeProgress >= doneThreshold) return 'end'
	if (routeProgress > startThreshold) return 'ing'
	return 'before'
}

const stateText = (state: ProgressState) => state === 'end' ? '완료' : state === 'ing' ? '진행중' : '진행전'

const displayNo = (student: TabletStudent, index: number) => student.stdntNo || String(index + 1)

export const TeacherMonitoringPage = () => {
	const [session, setSession] = useState<TabletSession | null>(null)
	const [loaded, setLoaded] = useState(false)
	const [selectedTeam, setSelectedTeam] = useState('')
	const [selectedState, setSelectedState] = useState('')
	const [sortOrder, setSortOrder] = useState('number')
	const [searchKeyword, setSearchKeyword] = useState('')
	const loadedRef = useRef(false)

	useEffect(() => {
		if (loadedRef.current) return
		loadedRef.current = true
		void fetchTabletSession()
			.then(setSession)
			.catch((error) => window.alert(error instanceof Error ? error.message : '예약 정보를 조회하지 못했습니다.'))
			.finally(() => setLoaded(true))
	}, [])

	const students = useMemo(() => session?.students ?? [], [session])
	const logs = useMemo(() => session?.progressLogs ?? [], [session])
	const routeItems = useMemo(() => routeItemsFromSession(session), [session])
	const teamNames = useMemo(() => Array.from(new Set(students.map((student) => normalizeTeamName(student.teamNm)))), [students])
	const teamClassMap = useMemo(() => new Map(teamNames.map((team, index) => [team, teamTextClasses[index] || `team${index + 1}`])), [teamNames])
	const totalStudents = students.length || session?.reservation?.stdntCnt || 0
	const totalAverageProgress = averageProgress(students)
	const completedStudents = students.filter((student) => (Number(student.prgrsRt) || 0) >= 100).length

	const teamSummaries = useMemo<TeamSummary[]>(() => teamNames.map((teamName, index) => {
		const teamStudents = students.filter((student) => normalizeTeamName(student.teamNm) === teamName)
		return {
			name: teamName,
			className: teamCardClasses[index] || teamCardClasses[index % teamCardClasses.length],
			students: teamStudents,
			averageProgress: averageProgress(teamStudents),
			place: teamStudents.map((student) => student.routeCn || student.asgnNm || '').find((value) => value.trim()) || '-',
			bars: [1, 2, 3, 4].map((stepNumber) => {
				if (teamStudents.length === 0) return 0
				const doneCount = teamStudents.filter((student) => stepStateByProgress(Number(student.prgrsRt) || 0, stepNumber, progressLogsForStudent(logs, student.stdntSn)) === 'end').length
				return Math.round((doneCount / teamStudents.length) * 100)
			})
		}
	}), [logs, students, teamNames])

	const filteredStudents = useMemo(() => {
		const keyword = searchKeyword.trim().toLowerCase()
		return students
			.filter((student) => !selectedTeam || normalizeTeamName(student.teamNm) === selectedTeam)
			.filter((student) => {
				if (!selectedState) return true
				const studentLogs = progressLogsForStudent(logs, student.stdntSn)
				return [1, 2, 3, 4].some((stepNumber) => stepStateByProgress(Number(student.prgrsRt) || 0, stepNumber, studentLogs) === selectedState)
			})
			.filter((student) => {
				if (!keyword) return true
				return [student.stdntNo, student.stdntNm, student.teamNm].some((value) => (value || '').toLowerCase().includes(keyword))
			})
			.sort((a, b) => {
				if (sortOrder === 'name') return (a.stdntNm || '').localeCompare(b.stdntNm || '', 'ko')
				const aNo = Number(a.stdntNo)
				const bNo = Number(b.stdntNo)
				if (Number.isFinite(aNo) && Number.isFinite(bNo)) return aNo - bNo
				return (a.stdntNo || '').localeCompare(b.stdntNo || '', 'ko')
			})
	}, [logs, searchKeyword, selectedState, selectedTeam, sortOrder, students])

	return (
		<TeacherShell title="모니터링" info="학생 참여 현황 및 팀 확인">
			<div className="page_scroll">
				<div className="monitoring_top"><h2 className="sound_only">간소화된 정보</h2><ul><li className="i1"><h3>전체 학생</h3><p><strong>{totalStudents}</strong>명</p></li><li className="i2"><h3>활동 진척률(전체평균)</h3><p><strong>{totalAverageProgress}</strong>%</p></li><li className="i3"><h3>STEP별 소요시간(전체평균)</h3><p><strong>-</strong>분</p></li><li className="i4"><h3>진척률 100%</h3><p><strong>{completedStudents}</strong>명</p></li></ul></div>
				<h2 className="stit">팀 참여 현황</h2>
				<ul className="participation_teams">
					{teamSummaries.map((team) => <li className={team.className} key={team.name}><div className="tit_area"><h3>{team.name}</h3><p><span>{team.students.length}명</span><span>{team.place}</span></p><div className="pct"><strong>{team.averageProgress}</strong>%</div></div><ul className="chart">{team.bars.map((bar, index) => <li className={`step${index + 1}`} key={index}><div className="line"><div className="bar" style={{ width: `${bar}%` }}></div></div><p><span>{bar}</span>%</p></li>)}</ul></li>)}
					{loaded && teamSummaries.length === 0 && <li className="c1"><div className="tit_area"><h3>팀 정보 없음</h3><p><span>0명</span><span>-</span></p><div className="pct"><strong>0</strong>%</div></div><ul className="chart">{[0, 0, 0, 0].map((bar, index) => <li className={`step${index + 1}`} key={index}><div className="line"><div className="bar" style={{ width: `${bar}%` }}></div></div><p><span>{bar}</span>%</p></li>)}</ul></li>}
				</ul>
				<div className="stit">학생 참여 현황</div>
				<div className="participation_student wbox">
					<form className="board_top" onSubmit={(event) => event.preventDefault()}><div className="left"><select name="" id="" className="w120" value={selectedTeam} onChange={(event) => setSelectedTeam(event.currentTarget.value)}><option value="">팀 별</option>{teamNames.map((team) => <option key={team} value={team}>{team}</option>)}</select><select name="" id="" className="w180" value={selectedState} onChange={(event) => setSelectedState(event.currentTarget.value)}><option value="">STEP별 활동상태</option><option value="end">완료</option><option value="ing">진행중</option><option value="before">진행전</option></select></div><div className="right"><select name="" id="" className="w120" value={sortOrder} onChange={(event) => setSortOrder(event.currentTarget.value)}><option value="number">번호순</option><option value="name">이름순</option></select><div className="search_area"><input type="text" placeholder="학생 이름 또는 번호를 검색하세요." value={searchKeyword} onChange={(event) => setSearchKeyword(event.currentTarget.value)} /><button type="button" className="btn_search">검색</button></div></div></form>
					<div className="over_scroll"><div className="scroll"><div className="board_list"><table className="student-status-table"><caption>학생 참여 현황</caption><colgroup><col className="w58" /><col className="w70" /><col className="w70" /><col className="w94" /><col /><col className="w94" /><col className="w94" /><col className="w90" /></colgroup><thead><tr><th scope="col">번호</th><th scope="col">이름</th><th scope="col">팀</th><th scope="col">STEP 01</th><th scope="col">STEP 02</th><th scope="col">STEP 03</th><th scope="col">STEP 04</th><th scope="col">진척률</th></tr></thead><tbody>{filteredStudents.map((student, index) => {
						const studentLogs = progressLogsForStudent(logs, student.stdntSn)
						const progressRate = Number(student.prgrsRt) || 0
						const step1 = stepStateByProgress(progressRate, 1, studentLogs)
						const step3 = stepStateByProgress(progressRate, 3, studentLogs)
						const step4 = stepStateByProgress(progressRate, 4, studentLogs)
						const teamName = normalizeTeamName(student.teamNm)
						return <tr key={student.stdntSn}><td>{displayNo(student, index)}</td><td><strong>{student.stdntNm || '-'}</strong></td><td><strong className={teamClassMap.get(teamName) || 'team1'}>{teamName}</strong></td><td><strong className={`state ${step1}`}>{stateText(step1)}</strong></td><td><ul className="step">{routeItems.map((item, routeIndex) => {
							const itemState = routeItemState(student, studentLogs, item, routeIndex, routeItems.length)
							return <li className={itemState} key={`${student.stdntSn}_${item}_${routeIndex}`}><span>{item || `Q${routeIndex + 1}`}</span>{stateText(itemState)}</li>
						})}</ul></td><td><strong className={`state ${step3}`}>{stateText(step3)}</strong></td><td><strong className={`state ${step4}`}>{stateText(step4)}</strong></td><td><div className="chart"><strong>{progressRate}</strong>%</div></td></tr>
					})}{loaded && filteredStudents.length === 0 && <tr><td colSpan={8}>학생 참여 현황이 없습니다.</td></tr>}</tbody></table></div></div></div>
				</div>
			</div>
		</TeacherShell>
	)
}

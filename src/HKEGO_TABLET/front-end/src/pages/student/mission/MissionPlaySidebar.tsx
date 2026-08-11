import { Link } from 'react-router-dom'
import { StudentPopups } from '../../../components/tablet/TabletPopup'
import { useTabletSidebarToggle } from '../../../hooks/useTabletSidebarToggle'
import type { MissionProgramPuzzles } from '../../../state/missionPuzzleData'
import { studentFlowClassName, studentFlowTeamName, type TabletStudentFlowSession } from '../../../state/tabletStudentFlowSession'
import { stripEmphasisMarkers } from '../../../utils/emphasisText'
import { missionRouteIconSrc } from './missionShared'

const progressClassName = (progress: number) => {
	if (progress >= 67) return 'line_area pct_step3'
	if (progress >= 34) return 'line_area pct_step2'
	return 'line_area pct_step1'
}

export const MissionPlaySidebar = ({ flowSession, program, sceneNames, scene, stickers }: { flowSession: TabletStudentFlowSession; program: MissionProgramPuzzles; sceneNames: string[]; scene: number; stickers: number }) => {
	const { collapsed, toggleSidebar } = useTabletSidebarToggle()
	const progress = sceneNames.length > 1 ? Math.round((scene / (sceneNames.length - 1)) * 100) : 0
	const stickerTotal = program.stickerCount
	const teamName = studentFlowTeamName(flowSession)

	return (
	<>
		<header className={`header student_header mission_header${collapsed ? ' off' : ''}`}>
			<h2 className="sound_only">메인메뉴 영역</h2>
			<div className="inbox_scroll">
				<div className="student_info">
					<div className="flex">
						<div className="img" aria-hidden="true"></div>
						<div className="txt">
							<div className="school_class">{studentFlowClassName(flowSession)}</div>
							<div className="people">총 {flowSession.totalStudentCount}명</div>
						</div>
					</div>
					<div className="btns">
						<Link to="/student/mission_resource_center" className="btn btn_kgg">자료실</Link>
						<button type="button" className="btn btn_kgg btn_open" data-target="pop_teacher_call">선생님 호출</button>
					</div>
				</div>
				<div className="area">
					<div className="team_area"><div className="team">{teamName}</div><span>{stripEmphasisMarkers(flowSession.prgrmNm) || program.name}</span></div>
				</div>
				<div className="area">
					<div className="tit"><h3>전체 진척률</h3></div>
					<div className={progressClassName(progress)}>
						<div className="pct"><strong>{progress}</strong>%</div>
						<div className="bar" style={{ width: `${Math.max(progress, 1)}%` }}><div className="pct"><strong>{progress}</strong>%</div></div>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>활동 순서</h3></div>
					<div className="step_list">
						<ul>
							{sceneNames.map((name, index) => {
								const className = [`step${index}`, index === scene ? 'on' : '', index < scene ? 'end' : ''].filter(Boolean).join(' ')
								return <li className={className} key={`${name}-${index}`}><i aria-hidden="true"><img src={missionRouteIconSrc(name)} alt="" /></i><strong>{name}</strong></li>
							})}
						</ul>
					</div>
				</div>
				{stickerTotal > 0 && (
					<div className="area">
						<div className="tit"><h3>스티커 수첩</h3></div>
						<div className="mproto_stk" aria-label={`스티커 ${stickers} / ${stickerTotal}`}>
							{Array.from({ length: stickerTotal }, (_, index) => <i className={index < stickers ? 'got' : ''} key={index}></i>)}
						</div>
					</div>
				)}
			</div>
			<button type="button" className="btn_menu" onClick={toggleSidebar}>{collapsed ? '메뉴 열기' : '메뉴 닫기'}</button>
		</header>
		<StudentPopups teacherCallPlaceName={sceneNames[scene]} />
	</>
	)
}

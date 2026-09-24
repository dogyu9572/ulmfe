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

export const MissionPlaySidebar = ({ flowSession, program, sceneNames, scene, stickers, stickerTotal: stickerTotalProp }: { flowSession: TabletStudentFlowSession; program: MissionProgramPuzzles; sceneNames: string[]; scene: number; stickers: number; stickerTotal?: number }) => {
	const { collapsed, toggleSidebar } = useTabletSidebarToggle()
	const progress = sceneNames.length > 1 ? Math.round((scene / (sceneNames.length - 1)) * 100) : 0
	// 스티커 총계는 이 예약이 실제로 도는 존 수를 따른다.
	// 프로그램 정의의 stickerCount 는 만점 기준이라, 동선이 짧은 예약에서는 칸이 남아 돈다.
	const stickerTotal = stickerTotalProp ?? program.stickerCount
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
				<div className="area">
					<div className="tit"><h3>획득한 스티커</h3></div>
					<ul className="stamp_area type_sticker1" aria-label={`미션 스티커 ${Math.min(stickers, 3)} / 3`}>
						<li className={`i1${stickers >= 1 ? ' on' : ''}`}>미션1 스티커</li>
						<li className={`i2${stickers >= 2 ? ' on' : ''}`}>미션2 스티커</li>
						<li className={`i3${stickers >= 3 ? ' on' : ''}`}>미션3 스티커</li>
					</ul>
				</div>
				<div className="area">
					<div className="tit"><h3>보너스 스티커</h3></div>
					<ul className="stamp_area type_sticker2" aria-label={`보너스 스티커 ${stickers >= stickerTotal ? 4 : 0} / 4`}>
						<li className={`i1${stickers >= stickerTotal ? ' on' : ''}`}>보너스1 스티커</li>
						<li className={`i2${stickers >= stickerTotal ? ' on' : ''}`}>보너스2 스티커</li>
						<li className={`i3${stickers >= stickerTotal ? ' on' : ''}`}>보너스3 스티커</li>
						<li className={`i4${stickers >= stickerTotal ? ' on' : ''}`}>보너스4 스티커</li>
					</ul>
				</div>
			</div>
			<button type="button" className="btn_menu" onClick={toggleSidebar}>{collapsed ? '메뉴 열기' : '메뉴 닫기'}</button>
		</header>
		<StudentPopups teacherCallPlaceName={sceneNames[scene]} />
	</>
	)
}

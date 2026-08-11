// 미션 프로토타입 좌측 사이드바 — 기존 student_header/mission_header 클래스를 차용해 진척률·활동순서·스티커를 프로토 상태로 렌더
import { useTabletSidebarToggle } from '../../../../hooks/useTabletSidebarToggle'
import type { MissionProgramPuzzles } from '../../../../state/missionPuzzleData'
import { missionRouteIconSrc } from '../missionShared'

const progressClassName = (progress: number) => {
	if (progress >= 67) return 'line_area pct_step3'
	if (progress >= 34) return 'line_area pct_step2'
	return 'line_area pct_step1'
}

export const MissionProtoSidebar = ({ program, sceneNames, scene, stickers }: { program: MissionProgramPuzzles; sceneNames: string[]; scene: number; stickers: number }) => {
	const { collapsed, toggleSidebar } = useTabletSidebarToggle()
	const progress = Math.round((scene / (sceneNames.length - 1)) * 100)
	const stickerTotal = program.stickerCount

	return (
		<header className={`header student_header mission_header${collapsed ? ' off' : ''}`}>
			<h2 className="sound_only">메인메뉴 영역</h2>
			<div className="inbox_scroll">
				<div className="student_info"><div className="flex"><div className="img" aria-hidden="true"></div><div className="txt"><div className="school_class">울산중학교 1학년 2반</div><div className="people">총 60명</div></div></div><div className="btns"><button type="button" className="btn btn_kgg">자료실</button><button type="button" className="btn btn_kgg">선생님 호출</button></div></div>
				<div className="area"><div className="team_area">{program.story.team && <div className="team">{program.story.team.label}</div>}<span>{program.name}</span></div></div>
				<div className="area"><div className="tit"><h3>전체 진척률</h3></div><div className={progressClassName(progress)}><div className="pct"><strong>{progress}</strong>%</div><div className="bar" style={{ width: `${Math.max(progress, 1)}%` }}><div className="pct"><strong>{progress}</strong>%</div></div></div></div>
				<div className="area"><div className="tit"><h3>활동 순서</h3></div><div className="step_list"><ul>{sceneNames.map((name, index) => { const className = [`step${index}`, index === scene ? 'on' : '', index < scene ? 'end' : ''].filter(Boolean).join(' '); return <li className={className} key={`${name}-${index}`}><i aria-hidden="true"><img src={missionRouteIconSrc(name)} alt="" /></i><strong>{name}</strong></li> })}</ul></div></div>
				{stickerTotal > 0 && <div className="area"><div className="tit"><h3>스티커 수첩</h3></div><div className="mproto_stk" aria-label={`스티커 ${stickers} / ${stickerTotal}`}>{Array.from({ length: stickerTotal }, (_, index) => <i className={index < stickers ? 'got' : ''} key={index}></i>)}</div></div>}
			</div>
			<button type="button" className="btn_menu" onClick={toggleSidebar}>{collapsed ? '메뉴 열기' : '메뉴 닫기'}</button>
		</header>
	)
}

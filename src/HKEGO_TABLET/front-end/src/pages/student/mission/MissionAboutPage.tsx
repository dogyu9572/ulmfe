import { pubUrl } from '../../../config'
import { Link } from 'react-router-dom'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { missionProgramForName } from '../../../state/missionPuzzleData'
import { studentFlowTeamName } from '../../../state/tabletStudentFlowSession'
import { EmphasisText, stripEmphasisMarkers } from '../../../utils/emphasisText'

export const MissionAboutPage = () => {
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	const teamName = studentFlowTeamName(flowSession)
	const program = missionProgramForName(flowSession.prgrmNm)
	// 관리자 시작 안내(startExpln)가 비어 있으면 미션별 스토리 문구 → 간단 설명 순으로 대체한다
	const toLines = (value: string | undefined) => (value || '').split('\n').map((line) => line.trim()).filter(Boolean)
	const programLines = program ? [...program.story.paragraphs, ...(program.story.notice ? [program.story.notice] : [])] : []
	const descriptionLines = [toLines(flowSession.startExpln), programLines, toLines(flowSession.simpleExpln)].find((lines) => lines.length > 0) || []
	// 제목 아래 한 줄 소개 — 관리자 간단설명이 비어 있으면 미션별 고정 문구(summary)를 쓴다
	const summaryText = stripEmphasisMarkers(flowSession.simpleExpln).trim() || program?.summary || ''
	const displayProgramName = flowSession.prgrmNm.replace(/^미션\d+\s*·\s*/, '')
	const missionTypeClass = {
		m1: 'mission_type1',
		m2: 'mission_type2',
		m3: 'mission_type3'
	}[program?.key || ''] || ''

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">미션 프로그램 안내</h1>
			<section className="full_box_wrap case_investigation_wrap mission_wrap">
				<div className="inbox">
					<div className="case_investigation_top">
						<div className="logo" aria-hidden="true"><img src={pubUrl("/pub/images/logo.svg")} alt="" /></div>
						<div className="team_info team_a"><h2>{teamName}</h2><ul>{flowSession.selectedStudents.map((student, index) => <li key={student.stdntSn}>{index === 0 ? <strong>{student.stdntNm}(나)</strong> : student.stdntNm}</li>)}</ul></div>
					</div>
					<div className={`case_investigation_btm type2 ${missionTypeClass}`}>
						<div className="left"><div className="tit"><EmphasisText text={displayProgramName.replace('소비습관구출작전', '*소비습관*구출작전')} emphasisClassName="c_iden"/></div><p>{summaryText}</p></div>
						<div className="right">
							<div className="blue_box">
								{descriptionLines.length > 0 ? descriptionLines.map((line, index) => <p key={`${line}-${index}`}><EmphasisText text={line} /></p>) : <p>시작 전 안내가 아직 준비되지 않았습니다.</p>}
							</div>
							<Link to="/student/mission_play" className="btn_link"><strong>미션 출발하기</strong><p>첫번째 활동으로 떠나볼까요?<img src={pubUrl("/pub/images/btn_link_search.webp")} alt="" aria-hidden="true" /></p></Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

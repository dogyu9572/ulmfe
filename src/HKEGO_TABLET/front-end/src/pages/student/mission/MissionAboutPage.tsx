import { Link } from 'react-router-dom'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { studentFlowTeamName } from '../../../state/tabletStudentFlowSession'
import { EmphasisText, stripEmphasisMarkers } from '../../../utils/emphasisText'

export const MissionAboutPage = () => {
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	const teamName = studentFlowTeamName(flowSession)
	const descriptionLines = (flowSession.startExpln || '').split('\n').map((line) => line.trim()).filter(Boolean)

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">번호를 선택해주세요</h1>
			<section className="full_box_wrap case_investigation_wrap mission_wrap">
				<div className="inbox">
					<div className="case_investigation_top">
						<div className="logo" aria-hidden="true"><img src="/pub/images/logo.svg" alt="" /></div>
						<div className="team_info team_a"><h2>{teamName}</h2><ul>{flowSession.selectedStudents.map((student, index) => <li key={student.stdntSn}>{index === 0 ? <strong>{student.stdntNm}(나)</strong> : student.stdntNm}</li>)}</ul></div>
					</div>
					<div className="case_investigation_btm type2">
						<div className="left"><div className="tit"><EmphasisText text={flowSession.prgrmNm} emphasisClassName="c_iden" /></div><p>{stripEmphasisMarkers(flowSession.simpleExpln)}</p></div>
						<div className="right">
							<div className="blue_box">
								{descriptionLines.length > 0 ? descriptionLines.map((line, index) => <p key={`${line}-${index}`}><EmphasisText text={line} /></p>) : <p>관리자에 등록된 시작 전 설명이 없습니다.</p>}
							</div>
							<Link to="/student/mission01" className="btn_link"><strong>미션 출발하기</strong><p>첫번째 활동으로 떠나볼까요?<img src="/pub/images/btn_link_search.webp" alt="" aria-hidden="true" /></p></Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

import { StudentPopups } from './TabletPopup'
import { useTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { studentFlowClassName, studentFlowTeamName } from '../../state/tabletStudentFlowSession'

export const StudentMissionHeader = () => {
	const flowSession = useTabletStudentFlowSession()
	if (!flowSession) return null

	const teamName = studentFlowTeamName(flowSession)
	const selectedCount = flowSession.selectedStudents.length

	return (
	<>
		<header className="header student_header mission_header">
			<h2 className="sound_only">메인메뉴 영역</h2>
			<div className="inbox_scroll">
				<div className="student_info">
					<div className="flex">
						<div className="img" aria-hidden="true"></div>
						<div className="txt">
							<div className="school_class">{studentFlowClassName(flowSession)}</div>
							<div className="people">총 {selectedCount}명</div>
						</div>
					</div>
					<div className="btns">
						<a href="/student/mission_resource_center" className="btn btn_kgg">자료실</a>
						<button type="button" className="btn btn_kgg btn_open" data-target="pop_teacher_call">선생님 호출</button>
					</div>
				</div>
				<div className="area">
					<div className="team_area"><div className="team">{teamName}</div><span>{flowSession.prgrmNm}</span></div>
				</div>
				<div className="area">
					<div className="tit"><h3>전체 진척률</h3></div>
					<div className="line_area">
						<div className="pct"><strong>0</strong>%</div>
						<div className="bar"></div>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>활동 순서</h3></div>
					<div className="step_list">
						<ul>
							<li className="step0"><i aria-hidden="true"><img src="/pub/images/icon_activity_order01.webp" alt="" /></i><strong>스토리 제시</strong><p><span>영상 1개 시청</span><span>10분</span></p></li>
							<li className="step1"><i aria-hidden="true"><img src="/pub/images/icon_activity_mission02.webp" alt="" /></i><strong>미션 탐색</strong><p><span>미션 열어보기, 동선안내</span><span>20분</span></p></li>
							<li className="step2"><i aria-hidden="true"><img src="/pub/images/icon_activity_mission03.webp" alt="" /></i><strong>지구존</strong><p><span>모두의 자원과 에너지</span><span>25분</span></p></li>
							<li className="step3"><i aria-hidden="true"><img src="/pub/images/icon_activity_mission04.webp" alt="" /></i><strong>미래존</strong><p><span>먹거리</span><span>25분</span></p></li>
							<li className="step4"><i aria-hidden="true"><img src="/pub/images/icon_activity_mission05.webp" alt="" /></i><strong>사회존</strong><p><span>함께 살기</span><span>25분</span></p></li>
							<li className="step5"><i aria-hidden="true"><img src="/pub/images/icon_activity_mission_book.webp" alt="" /></i><strong>도서관</strong><p><span>개방형 열람식</span><span>25분</span></p></li>
							<li className="step6"><i aria-hidden="true"><img src="/pub/images/icon_activity_mission_end.webp" alt="" /></i><strong>실천력 부여</strong><p><span>SDGs 히어로 완성·평가/설문</span><span>10분</span></p></li>
						</ul>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>획득한 스티커</h3></div>
					<ul className="stamp_area type_sticker1">
						<li className="i1">미션1 스티커</li>
						<li className="i2">미션2 스티커</li>
						<li className="i3">미션3 스티커</li>
					</ul>
				</div>
				<div className="area">
					<div className="tit"><h3>보너스 스티커</h3></div>
					<ul className="stamp_area type_sticker2">
						<li className="i1">보너스1 스티커</li>
						<li className="i2">보너스2 스티커</li>
						<li className="i3">보너스3 스티커</li>
						<li className="i4">보너스4 스티커</li>
					</ul>
				</div>
			</div>
			<button type="button" className="btn_menu">메뉴 닫기</button>
		</header>
		<StudentPopups />
	</>
	)
}

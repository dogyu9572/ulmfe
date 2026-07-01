import { StudentPopups } from './TabletPopup'
import { useTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { studentFlowClassName, studentFlowTeamName } from '../../state/tabletStudentFlowSession'

export const StudentCaseHeader = () => {
	const flowSession = useTabletStudentFlowSession()
	if (!flowSession) return null

	const teamName = studentFlowTeamName(flowSession)
	const selectedStudents = flowSession.selectedStudents
	const teamCount = selectedStudents.length

	return (
	<>
		<header className="header student_header">
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
						<a href="/student/resource_center" className="btn btn_kgg">자료실</a>
						<button type="button" className="btn btn_kgg btn_open" data-target="pop_teacher_call">선생님 호출</button>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>{teamName} 정보</h3><div className="people">{teamCount}명</div></div>
					<ul className="people_list">
						{selectedStudents.map((student, index) => (
							<li key={student.stdntSn}>{index === 0 ? <strong>{student.stdntNm}(나)</strong> : student.stdntNm}</li>
						))}
					</ul>
				</div>
				<div className="area">
					<div className="tit"><h3>전체 진척률</h3></div>
					<div className="line_area">
						<div className="pct"><strong>50</strong>%</div>
						<div className="bar"></div>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>활동 순서</h3></div>
					<div className="step_list">
						<ul>
							<li className="step0"><i aria-hidden="true"><img src="/pub/images/icon_activity_order01.webp" alt="" /></i><strong>사건제시</strong><p><span>영상 3개 시청</span><span>10분</span></p></li>
							<li className="step1"><i aria-hidden="true"><img src="/pub/images/icon_activity_order02.webp" alt="" /></i><strong>퀘스트1</strong><p><span>살기 좋은 곳</span><span>25분</span></p></li>
							<li className="step2"><i aria-hidden="true"><img src="/pub/images/icon_activity_order03.webp" alt="" /></i><strong>퀘스트2</strong><p><span>재미있는 울산</span><span>25분</span></p></li>
							<li className="step3"><i aria-hidden="true"><img src="/pub/images/icon_activity_order04.webp" alt="" /></i><strong>퀘스트3</strong><p><span>행복한 울산</span><span>25분</span></p></li>
							<li className="step4"><i aria-hidden="true"><img src="/pub/images/icon_activity_order05.webp" alt="" /></i><strong>퀘스트4</strong><p><span>미래 울산</span><span>25분</span></p></li>
							<li className="step5"><i aria-hidden="true"><img src="/pub/images/icon_activity_order_make.webp" alt="" /></i><strong>메이커 활동</strong><p><span>연필꽂이 제작</span><span>60분</span></p></li>
							<li className="step6"><i aria-hidden="true"><img src="/pub/images/icon_activity_order06.webp" alt="" /></i><strong>정리 및 일반화</strong><p><span>마무리</span><span>20분</span></p></li>
						</ul>
					</div>
				</div>
				<div className="area">
					<div className="tit"><h3>획득한 도장</h3></div>
					<ul className="stamp_area type_stamp">
						<li className="i1">퀘스트1 도장</li>
						<li className="i2">퀘스트2 도장</li>
						<li className="i3">퀘스트3 도장</li>
						<li className="i4">퀘스트4 도장</li>
					</ul>
				</div>
			</div>
			<button type="button" className="btn_menu">메뉴 닫기</button>
		</header>
		<StudentPopups />
	</>
	)
}

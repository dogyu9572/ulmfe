import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitTabletMissionFinal } from '../../../api/tabletApi'
import { StudentProgramCompletionPopup } from '../../../components/tablet/StudentProgramCompletionPopup'
import { StudentMissionHeader } from '../../../components/tablet/StudentMissionHeader'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { studentFlowDisplayName, studentFlowMissionBonusStickerCount, studentFlowMissionQuestByRouteIndex, studentFlowMissionRegularStickerCount, studentFlowRouteItems } from '../../../state/tabletStudentFlowSession'

export const Mission06EndPage = () => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	const [completedOpen, setCompletedOpen] = useState(false)
	const [saving, setSaving] = useState(false)
	if (!flowSession) return null
	const quest = studentFlowMissionQuestByRouteIndex(flowSession, 3)
	const zoneName = quest?.name || '도서관'
	const title = `${zoneName} 미션 수행 완료!`
	const regularStickerCount = studentFlowMissionRegularStickerCount(flowSession)
	const bonusStickerCount = studentFlowMissionBonusStickerCount(flowSession)
	const largeStickerImages = Array.from({ length: Math.min(3, regularStickerCount) }, (_, index) => `/pub/images/icon_sticker_a${String(index + 1).padStart(2, '0')}_large.svg`)

	const finishMission = async () => {
		if (saving) return
		try {
			setSaving(true)
			await submitTabletMissionFinal(flowSession.rsvtSn, {
				studentSns: flowSession.selectedStudents.map((student) => student.stdntSn),
				heroName: '',
				updateHero: false,
				updateEvaluation: false,
				updateSurvey: false,
				complete: true,
				evaluationAnswers: [],
				surveyAnswers: []
			})
			setCompletedOpen(true)
		} catch (error) {
			window.alert(error instanceof Error ? error.message : '미션 완료 처리 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">{title}</h1>
			<StudentMissionHeader />
			<section className="basic_board">
				<div className="page_end quest_end04">
					<div className="tit_area flex_center colm"><h2 className="end_tit">{title}</h2><p>SDGs12 약속과 실천 방법을 직접 찾아 기록했어요.<br /><strong>4개 구역 미션을 모두 완료했어요!</strong></p></div>
					<div className="stamp_box">
						<h3 className="tit">획득한 스티커</h3>
						<div className="large flex" aria-hidden="true">{largeStickerImages.map((image) => <img src={image} alt="" key={image} />)}</div>
						<div className="stamp_area">
							<ul className="flex type_sticker1">
								<li className={`i1${regularStickerCount >= 1 ? ' on' : ''}`}>미션 스티커1 도장</li>
								<li className={`i2${regularStickerCount >= 2 ? ' on' : ''}`}>미션 스티커2 도장</li>
								<li className={`i3${regularStickerCount >= 3 ? ' on' : ''}`}>미션 스티커3 도장</li>
							</ul>
							<span className="plus"></span>
							<ul className="flex type_sticker2">
								<li className={`i1${bonusStickerCount >= 1 ? ' on' : ''}`}>미션 보너스 스티커1 도장</li>
								<li className={`i2${bonusStickerCount >= 2 ? ' on' : ''}`}>미션 보너스 스티커2 도장</li>
								<li className={`i3${bonusStickerCount >= 3 ? ' on' : ''}`}>미션 보너스 스티커3 도장</li>
								<li className={`i4${bonusStickerCount >= 4 ? ' on' : ''}`}>미션 보너스 스티커4 도장</li>
							</ul>
						</div>
					</div>
					<div className="next_page_qr"><h3 className="tit">미션 완료</h3><p>오늘의 미션 활동을 마무리하세요.</p><button className="btn_after flex_center" onClick={() => void finishMission()} disabled={saving}>{saving ? '처리 중' : '이동하기'}</button></div>
				</div>
			</section>
			<StudentProgramCompletionPopup open={completedOpen} variant="mission" displayName={studentFlowDisplayName(flowSession)} missionAreaCount={studentFlowRouteItems(flowSession).length} onClose={() => setCompletedOpen(false)} onComplete={() => navigate('/select-user')} />
		</main>
	)
}

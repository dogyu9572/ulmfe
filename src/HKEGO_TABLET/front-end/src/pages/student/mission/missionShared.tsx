import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentMissionHeader } from '../../../components/tablet/StudentMissionHeader'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import {
	studentFlowMissionBonusStickerCount,
	studentFlowMissionQuestByRouteIndex,
	studentFlowMissionRegularStickerCount,
	studentFlowNextMissionLabelAfterRouteIndex,
	studentFlowNextMissionPathAfterRouteIndex
} from '../../../state/tabletStudentFlowSession'

export const agreement = ['매우 그렇다', '그렇다', '보통이다', '아니다', '매우 아니다']

export const evaluationQuestions = [
	'1-1. 지속가능발전교육(ESD)이 무엇인지 이해했나요?',
	'1-2. ESD에서 다루는 주제들은 서로 연결되어 있음을 이해했나요?',
	'2-1. 도시 재생 사례를 설명할 수 있나요?',
	'2-2. 울산의 자원들에 대해 설명할 수 있나요?',
	'2-3. 행복한 도시의 조건들을 제시할 수 있나요?',
	'2-4. 학습 내용이 학교 교육에 도움이 되는 내용을 담고 있나요?',
	'2-5. 학습 내용이 실제 생활에 도움이 되는 내용을 담고 있나요?',
	'3-1. 학습한 내용을 실제 생활에 실천하시겠습니까?',
	'3-2. 학습한 내용을 주변에 알리고 실천에 동참하도록 하시겠습니까?'
]

export const questionnaireQuestions = [
	'1-1. 교육 프로그램이 지속가능발전교육에 부합하는 내용입니까?',
	'1-2. 주제와 내용이 학교 교육에 도움이 되는 내용을 담고 있습니까?',
	'1-3. 주제와 내용이 실제 생활에 도움이 되는 내용을 담고 있습니까?',
	'1-4. 교육 프로그램 운영시간은 적절하게 배정되었습니까?',
	'2-1. 교육 프로그램은 매끄럽게 운영되었습니까?',
	'2-2. 교육관의 교육 프로그램 운영 장소는 사용이 편리하셨습니까?',
	'2-3. 교육관의 편의시설은 사용이 편리하셨습니까?',
	'3-1. 본 교육 프로그램을 다른 분에게 추천하실 의향이 있으십니까?',
	'3-2. 본 교육 프로그램 전반에 대해 만족하셨습니까?',
	'3-3. 본 교육 프로그램의 발전을 위해 유익했던 점과 보완점을 적어주시기 바랍니다.'
]

export const missionRouteIconSrc = (label: string) => {
	if (label.includes('미래')) return '/pub/images/icon_activity_mission04.webp'
	if (label.includes('사회')) return '/pub/images/icon_activity_mission05.webp'
	if (label.includes('도서') || label.includes('열람')) return '/pub/images/icon_activity_mission_book.webp'
	if (label.includes('정리') || label.includes('일반화')) return '/pub/images/icon_activity_order06.webp'
	if (label.includes('탐색')) return '/pub/images/icon_activity_mission02.webp'
	if (label.includes('사건') || label.includes('제시')) return '/pub/images/icon_activity_order01.webp'
	return '/pub/images/icon_activity_mission03.webp'
}

export const MissionTitle = ({ step, subtitle, location }: { step: string; subtitle: string; location: string }) => (
	<div className="student_title">
		<div className="step">{step}</div>
		<div className="subtitle"><strong>{subtitle}</strong></div>
		<div className="location">{location}</div>
	</div>
)

export const MissionShell = ({ title, step, subtitle, location, children }: { title: string; step: string; subtitle: string; location: string; children: ReactNode }) => {
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{title}</h1>
			<StudentMissionHeader />
			<section className="basic_board mission_wrap">
				<MissionTitle step={step} subtitle={subtitle} location={location} />
				{children}
			</section>
		</main>
	)
}

export const CheckboxList = ({ name, items, setClassName = '', checkedItems = [], mode = 'MULTI' }: { name: string; items: string[]; setClassName?: string; checkedItems?: string[]; mode?: 'SINGLE' | 'MULTI' }) => {
	const visibleCheckedItems = mode === 'SINGLE' ? checkedItems.slice(0, 1) : checkedItems
	return (
		<div className={`checkradio_select${setClassName ? ` ${setClassName}` : ''}`}>
			{items.map((item, index) => {
				const id = `${name}${String(index + 1).padStart(2, '0')}`
				return <div className="box w100p" key={id}><input type={mode === 'SINGLE' ? 'radio' : 'checkbox'} name={name} id={id} defaultChecked={visibleCheckedItems.includes(item)} /><label htmlFor={id}><span><i></i>{item}</span></label></div>
			})}
		</div>
	)
}

export const RatingGroup = ({ name }: { name: string }) => (
	<ul className="checkradio_select set5">
		{agreement.map((label, index) => {
			const id = `${name}${index + 1}`
			return <li className="box" key={id}><input type="radio" name={name} id={id} /><label htmlFor={id}><span><i></i>{label}</span></label></li>
		})}
	</ul>
)

export const MissionEndSticker = ({ title, text, image, onClass, nextTitle, nextText, nextButton, nextPath, routeIndex }: { title: string; text: ReactNode; image: string; onClass: string[]; nextTitle: string; nextText: string; nextButton: string; nextPath: string; routeIndex?: number }) => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null
	const hasDynamicNext = typeof routeIndex === 'number'
	const dynamicNextPath = hasDynamicNext ? studentFlowNextMissionPathAfterRouteIndex(flowSession, routeIndex) : nextPath
	const currentQuest = hasDynamicNext ? studentFlowMissionQuestByRouteIndex(flowSession, routeIndex) : null
	const currentLabel = currentQuest?.name || ''
	const dynamicTitle = currentLabel ? `${currentLabel} 미션 수행 완료!` : title
	const dynamicText = hasDynamicNext ? <>미션을 완료했어요.<br /><strong>다음 활동으로 이동해 주세요.</strong></> : text
	const dynamicNextLabel = hasDynamicNext ? studentFlowNextMissionLabelAfterRouteIndex(flowSession, routeIndex) : nextTitle
	const dynamicNextQuest = hasDynamicNext ? studentFlowMissionQuestByRouteIndex(flowSession, routeIndex + 1) : null
	const dynamicNextText = dynamicNextPath === '/student/mission_end'
		? '오늘의 미션을 정리하고 실천력을 부여받으세요.'
		: `${dynamicNextQuest?.place || dynamicNextLabel}로 이동하세요.`
	const dynamicNextButton = dynamicNextPath === '/student/mission_end' ? '실천력 부여로 이동하기' : `${dynamicNextLabel}으로 이동하기`
	const regularStickerCount = hasDynamicNext ? studentFlowMissionRegularStickerCount(flowSession) : onClass.length
	const bonusStickerCount = hasDynamicNext ? studentFlowMissionBonusStickerCount(flowSession) : 0
	const regularStickerClasses = Array.from({ length: Math.min(3, regularStickerCount) }, (_, index) => `i${index + 1}`)
	const bonusStickerClasses = Array.from({ length: Math.min(4, bonusStickerCount) }, (_, index) => `i${index + 1}`)
	const largeStickerImages = regularStickerClasses.length > 0
		? regularStickerClasses.map((className) => `/pub/images/icon_sticker_a${className.slice(1).padStart(2, '0')}_large.svg`)
		: [image]
	const endClassNumber = hasDynamicNext ? Math.max(1, Math.min(4, (routeIndex ?? 0) + 1)) : Math.max(1, Math.min(4, onClass.length))

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">{dynamicTitle}</h1>
			<StudentMissionHeader />
			<section className="basic_board">
				<div className={`page_end quest_end0${endClassNumber}`}>
					<div className="tit_area flex_center colm"><h2 className="end_tit">{dynamicTitle}</h2><p>{dynamicText}</p></div>
					<div className="stamp_box">
						<h3 className="tit">{hasDynamicNext ? '스티커 획득!' : onClass.length === 1 ? '과소비 퇴치장갑 획득!' : onClass.length === 2 ? '날씨 도사 스티커 획득!' : '편지 스티커 획득!'}</h3>
						<p>{hasDynamicNext ? <>콘텐츠 스티커와 보너스 스티커를 획득했어요!</> : onClass.length === 1 ? <>재활용과 착한 소비를 실천하는<br />과소비 퇴치창갑 스티커를 획득했어요!</> : onClass.length === 2 ? <>세계와 연결된 나의 식생활을 생각하는<br />날씨 도사 스티커를 획득했어요!</> : <>공정한 소비를 실천하는<br />2025 편지 스티커를 획득했어요!</>}</p>
						<div className={`large${largeStickerImages.length > 1 ? ' flex' : ''}`} aria-hidden="true">
							{largeStickerImages.map((stickerImage) => <img src={stickerImage} alt="" key={stickerImage} />)}
						</div>
						<div className="stamp_area">
							<ul className="flex type_sticker1">
								<li className={`i1${regularStickerClasses.includes('i1') ? ' on' : ''}`}>미션 스티커1 도장</li>
								<li className={`i2${regularStickerClasses.includes('i2') ? ' on' : ''}`}>미션 스티커2 도장</li>
								<li className={`i3${regularStickerClasses.includes('i3') ? ' on' : ''}`}>미션 스티커3 도장</li>
							</ul>
							<span className="plus"></span>
							<ul className="flex type_sticker2">
								<li className={`i1${bonusStickerClasses.includes('i1') ? ' on' : ''}`}>미션 보너스 스티커1 도장</li>
								<li className={`i2${bonusStickerClasses.includes('i2') ? ' on' : ''}`}>미션 보너스 스티커2 도장</li>
								<li className={`i3${bonusStickerClasses.includes('i3') ? ' on' : ''}`}>미션 보너스 스티커3 도장</li>
								<li className={`i4${bonusStickerClasses.includes('i4') ? ' on' : ''}`}>미션 보너스 스티커4 도장</li>
							</ul>
						</div>
					</div>
					<div className="next_page_qr"><h3 className="tit">{dynamicNextLabel || nextTitle}</h3><p>{hasDynamicNext ? dynamicNextText : nextText}</p><button className="btn_after flex_center" onClick={() => navigate(dynamicNextPath)}>{hasDynamicNext ? dynamicNextButton : nextButton}</button></div>
				</div>
			</section>
		</main>
	)
}

export const MissionQuestionnairePopup = ({ id, title, questions, open, onClose }: { id: string; title: string; questions: string[]; open: boolean; onClose: () => void }) => (
	<div className={`popup pop_questionnaire${open ? ' is-active' : ''}`} id={id}>
		<div className="dm" onClick={onClose}></div>
		<div className="inbox">
			<button type="button" className="btn_close" onClick={onClose}>닫기</button>
			<div className="tit">{title}</div>
			<div className="con scroll_wrap">
				<div className="scroll">
					<ul className="list">
						{questions.map((question, index) => <li key={question}><div className="tt">{question}</div><RatingGroup name={`${id}_${index + 1}`} />{(question.startsWith('3-1.') || question.startsWith('3-2.')) && <textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="‘아니다’, ‘매우 아니다’를 선택하셨다면 그 이유를 적어주시기 바랍니다."></textarea>}{question.startsWith('3-3.') && <><textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="유익했던 점을 입력해주세요."></textarea><textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="보완점을 입력해주세요."></textarea></>}</li>)}
					</ul>
					<div className="btns_btm"><button type="button" className="btn btn_kwg btn_clo" onClick={onClose}>이전</button><button type="button" className="btn btn_wbb btn_end" onClick={onClose}>저장</button></div>
				</div>
			</div>
		</div>
	</div>
)

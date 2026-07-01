import { useNavigate } from 'react-router-dom'
import { TabletContentQuestion } from '../../../api/tabletApi'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { studentFlowMissionQuestByRouteIndex, studentFlowMissionQuestContents } from '../../../state/tabletStudentFlowSession'
import { CheckboxList, MissionShell } from './missionShared'

type QuestionOption = {
	select?: { choiceMode?: string; items?: string[] }
	data?: { inputType?: string; placeholder?: string; subItems?: { name?: string; inputType?: string; placeholder?: string }[] }
	photo?: { itemCount?: number; labels?: string[] }
	sentence?: { sentenceText?: string; items?: string[] }
}

const parseQuestionOption = (value?: string): QuestionOption => {
	if (!value) return {}
	try {
		const parsed = JSON.parse(value) as QuestionOption
		return parsed && typeof parsed === 'object' ? parsed : {}
	} catch {
		return {}
	}
}

const questionTypes = (question: TabletContentQuestion) => (question.qstnTypeCd || '').split(',').map((type) => type.trim()).filter(Boolean)

const renderDataInputs = (question: TabletContentQuestion, options: QuestionOption, baseId: string) => {
	const subItems = options.data?.subItems?.filter((item) => item.name || item.placeholder) ?? []
	if (subItems.length > 0) {
		return <ul className="input_list half_list">{subItems.map((item, index) => {
			const id = `${baseId}_data_${index + 1}`
			return <li key={id}><label htmlFor={id} className="tt">{item.name || `입력 ${index + 1}`}</label><input type="text" id={id} className="text w100p" placeholder={item.placeholder || `${item.name || '내용'}을 입력해주세요.`} /></li>
		})}</ul>
	}
	const id = `${baseId}_data`
	return <ul className="input_list"><li><label htmlFor={id} className="tt">{question.qstnNm}</label><input type="text" id={id} className="text w100p" placeholder={options.data?.placeholder || '내용을 입력해주세요.'} /></li></ul>
}

const renderQuestionControl = (question: TabletContentQuestion, index: number, pageKey: string) => {
	const options = parseQuestionOption(question.optnCn)
	const types = questionTypes(question)
	const baseId = `${pageKey}_${question.cntnQstnSn || index + 1}`
	const selectItems = options.select?.items?.filter(Boolean) ?? []
	const sentenceItems = options.sentence?.items?.filter(Boolean) ?? []
	const photoLabels = options.photo?.labels?.filter(Boolean) ?? []

	if (types.includes('SELECT') && selectItems.length > 0) {
		return <CheckboxList name={`${baseId}_select`} items={selectItems} />
	}
	if (types.includes('DATA')) {
		return renderDataInputs(question, options, baseId)
	}
	if (types.includes('SENTENCE')) {
		return <ul className="input_list">{(sentenceItems.length > 0 ? sentenceItems : ['']).map((item, itemIndex) => {
			const id = `${baseId}_sentence_${itemIndex + 1}`
			return <li key={id}><label htmlFor={id} className="tt">{item || question.qstnNm}</label><input type="text" id={id} className="text w100p" placeholder="문장을 완성해주세요." /></li>
		})}</ul>
	}
	if (types.includes('PHOTO')) {
		const count = Math.max(Number(options.photo?.itemCount) || photoLabels.length || 1, 1)
		return <ul className="input_list">{Array.from({ length: count }).map((_, itemIndex) => {
			const id = `${baseId}_photo_${itemIndex + 1}`
			return <li key={id}><label htmlFor={id} className="tt">{photoLabels[itemIndex] || `사진 ${itemIndex + 1}`}</label><input type="file" id={id} className="text w100p" accept="image/*" /></li>
		})}</ul>
	}
	return <ul className="input_list"><li><label htmlFor={`${baseId}_text`} className="tt">{question.qstnNm}</label><input type="text" id={`${baseId}_text`} className="text w100p" placeholder="내용을 입력해주세요." /></li></ul>
}

export const MissionStepQuestPage = ({ routeIndex, submitPath, pageKey }: { routeIndex: number; submitPath: string; pageKey: string }) => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	const quest = studentFlowMissionQuestByRouteIndex(flowSession, routeIndex)
	const contents = studentFlowMissionQuestContents(flowSession, routeIndex)
	const dynamicQuestions = contents.flatMap((content) => {
		const questions = content.questions.length > 0
			? content.questions
			: [{ cntnQstnSn: content.cntnSn, cntnSn: content.cntnSn, qstnTypeCd: content.cntnTypeCd, qstnNm: content.cntnCn || content.cntnTtl }] as TabletContentQuestion[]
		return questions.map((question) => ({ content, question }))
	})
	const zoneName = quest?.name || ''
	const title = quest?.title || ''
	const location = quest?.place || ''

	return (
		<MissionShell title={title || 'STEP 3 미션수행'} step={`STEP 3 미션수행${zoneName ? ` - ${zoneName}` : ''}`} subtitle={title} location={location}>
			<div className="page_quest">
				{dynamicQuestions.length > 0 ? dynamicQuestions.map(({ content, question }, index) => (
					<div className="wbox a_card_box" key={`${content.cntnSn}_${question.cntnQstnSn || index}`}>
						<div className="card_top">문항풀이 #{index + 1}</div>
						<h3 className="tit">{question.qstnNm}</h3>
						<div className="con">{renderQuestionControl(question, index, pageKey)}</div>
					</div>
				)) : <div className="wbox a_card_box">
					<h3 className="tit">관리자에 연결된 콘텐츠가 없습니다.</h3>
				</div>}
				<div className="btns_btm"><button type="button" className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button type="button" className="btn btn_wbb" onClick={() => navigate(submitPath)}>제출</button></div>
			</div>
		</MissionShell>
	)
}

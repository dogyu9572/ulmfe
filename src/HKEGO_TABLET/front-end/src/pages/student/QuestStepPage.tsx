import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { fetchTabletSession, submitTabletMission, submitTabletMissionFiles, TabletContentQuestion, TabletMissionAnswer } from '../../api/tabletApi'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { useQuestTimeLimit } from '../../hooks/useQuestTimeLimit'
import {
	saveTabletStudentFlowSession,
	studentFlowExploreQuestByRouteIndex,
	studentFlowExploreQuestContents,
	studentFlowExploreSavedAnswersByQuestion,
	studentFlowExploreStepCode,
	studentFlowRouteItems
} from '../../state/tabletStudentFlowSession'
import { CheckboxList } from './mission/missionShared'

type QuestionOption = {
	select?: { choiceMode?: string; items?: string[] }
	data?: { inputType?: string; placeholder?: string; subItems?: { name?: string; inputType?: string; placeholder?: string }[] }
	photo?: { itemCount?: number; labels?: string[] }
	sentence?: { sentenceText?: string; items?: string[] }
}

type CollectedCardAnswer = {
	ansCn: string
	files: NonNullable<TabletMissionAnswer['files']>
	fileMap: Record<string, File>
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
const parseSavedAnswerLines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean)

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

const renderQuestionControl = (question: TabletContentQuestion, index: number, pageKey: string, savedAnswer = '') => {
	const options = parseQuestionOption(question.optnCn)
	const types = questionTypes(question)
	const baseId = `${pageKey}_${question.cntnQstnSn || index + 1}`
	const selectItems = options.select?.items?.filter(Boolean) ?? []
	const selectedItems = parseSavedAnswerLines(savedAnswer)
	const sentenceItems = options.sentence?.items?.filter(Boolean) ?? []
	const photoLabels = options.photo?.labels?.filter(Boolean) ?? []

	if (types.includes('SELECT') && selectItems.length > 0) {
		return <CheckboxList name={`${baseId}_select`} items={selectItems} checkedItems={selectedItems} mode={options.select?.choiceMode === 'SINGLE' ? 'SINGLE' : 'MULTI'} />
	}
	if (types.includes('DATA')) return renderDataInputs(question, options, baseId)
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

const collectCardAnswer = (card: HTMLElement, answerIndex = 0): CollectedCardAnswer => {
	const values: string[] = []
	const answerFiles: NonNullable<TabletMissionAnswer['files']> = []
	const fileMap: Record<string, File> = {}
	card.querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]').forEach((input) => {
		if (!input.checked) return
		const label = input.closest('.box')?.textContent?.trim() || input.value
		if (label) values.push(label)
	})
	card.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], textarea').forEach((input) => {
		const value = input.value.trim()
		if (!value) return
		const label = input.closest('li')?.querySelector('label')?.textContent?.trim()
		values.push(label ? `${label}: ${value}` : value)
	})
	card.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input, fileInputIndex) => {
		const files = Array.from(input.files ?? [])
		if (files.length === 0) return
		const label = input.closest('li')?.querySelector('label')?.textContent?.trim()
		files.forEach((file, fileIndex) => {
			const fieldName = `answer_${answerIndex}_file_${fileInputIndex}_${fileIndex}`
			fileMap[fieldName] = file
			answerFiles.push({ label: label || '', fileName: file.name, fieldName })
			values.push(label ? `${label}: ${file.name}` : file.name)
		})
	})
	return { ansCn: values.join('\n'), files: answerFiles, fileMap }
}

const restoreCardAnswer = (card: HTMLElement, answer: string) => {
	const lines = parseSavedAnswerLines(answer)
	if (lines.length === 0) return
	card.querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]').forEach((input) => {
		const label = input.closest('.box')?.textContent?.trim() || input.value
		input.checked = Boolean(label && lines.includes(label))
	})
	const textControls = Array.from(card.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], textarea'))
	textControls.forEach((input) => {
		const label = input.closest('li')?.querySelector('label')?.textContent?.trim()
		if (label) {
			const matchedLine = lines.find((line) => line.startsWith(`${label}:`))
			if (matchedLine) input.value = matchedLine.slice(label.length + 1).trim()
			return
		}
		if (textControls.length === 1) input.value = answer
	})
}

const readDraftAnswers = (storageKey: string) => {
	if (typeof window === 'undefined') return new Map<string, string>()
	try {
		const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) || '{}') as Record<string, string>
		return new Map(Object.entries(parsed).filter(([, value]) => typeof value === 'string'))
	} catch {
		return new Map<string, string>()
	}
}

const writeDraftAnswers = (storageKey: string, answers: Map<string, string>) => {
	if (typeof window === 'undefined') return
	window.sessionStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(answers)))
}

const answerKeysForQuestion = (contentSn: number | undefined, question: TabletContentQuestion) => {
	const contentId = contentSn || 0
	return [
		`${contentId}:${question.cntnQstnSn || 0}`,
		`${contentId}:${question.qstnNm || ''}`,
		`${contentId}:0`
	]
}

const answerForQuestion = (answers: Map<string, string>, contentSn: number | undefined, question: TabletContentQuestion) =>
	answerKeysForQuestion(contentSn, question).map((key) => answers.get(key)).find((value) => typeof value === 'string')

export const QuestStepPage = ({ routeIndex, submitPath, pageKey }: { routeIndex: number; submitPath: string; pageKey: string }) => {
	const navigate = useNavigate()
	const pageRef = useRef<HTMLDivElement>(null)
	const [saving, setSaving] = useState(false)
	const flowSession = useRequiredTabletStudentFlowSession()
	const selectedStudentKey = useMemo(
		() => (flowSession?.selectedStudents ?? []).map((student) => student.stdntSn).sort((a, b) => a - b).join(','),
		[flowSession]
	)
	const draftStorageKey = flowSession ? `hkegoTabletQuestAnswers:${flowSession.rsvtSn}:${selectedStudentKey}:${routeIndex}` : ''
	const quest = flowSession ? studentFlowExploreQuestByRouteIndex(flowSession, routeIndex) : null
	const contents = flowSession ? studentFlowExploreQuestContents(flowSession, routeIndex) : []
	const routeItems = flowSession ? studentFlowRouteItems(flowSession) : []
	const savedAnswersByQuestion = useMemo(() => flowSession ? studentFlowExploreSavedAnswersByQuestion(flowSession, routeIndex) : new Map<string, string>(), [flowSession, routeIndex])
	const draftAnswersByQuestion = useMemo(() => draftStorageKey ? readDraftAnswers(draftStorageKey) : new Map<string, string>(), [draftStorageKey])
	const visibleAnswersByQuestion = useMemo(() => {
		const answers = new Map(savedAnswersByQuestion)
		draftAnswersByQuestion.forEach((value, key) => answers.set(key, value))
		return answers
	}, [draftAnswersByQuestion, savedAnswersByQuestion])
	const dynamicQuestions = useMemo(() => contents.flatMap((content) => {
		const questions = content.questions.length > 0
			? content.questions
			: [{ cntnQstnSn: content.cntnSn, cntnSn: content.cntnSn, qstnTypeCd: content.cntnTypeCd, qstnNm: content.cntnCn || content.cntnTtl }] as TabletContentQuestion[]
		return questions.map((question) => ({ content, question }))
	}), [contents])
	const questName = quest?.name || ''
	const title = quest?.title || questName || '퀘스트'
	const location = quest?.place || ''
	const timerStorageKey = flowSession ? `hkegoTabletQuestTimer:${flowSession.rsvtSn}:${selectedStudentKey}:${routeIndex}` : ''
	const { isTimeLimitMet, remainingLabel } = useQuestTimeLimit(timerStorageKey, quest?.limitMin)

	useEffect(() => {
		if (!draftStorageKey) return
		const cards = Array.from(pageRef.current?.querySelectorAll<HTMLElement>('.a_card_box[data-question-index]') ?? [])
		cards.forEach((card) => {
			const index = Number(card.dataset.questionIndex)
			const item = dynamicQuestions[index]
			if (!item) return
			const savedAnswer = answerForQuestion(visibleAnswersByQuestion, item.content.cntnSn, item.question)
			if (savedAnswer) restoreCardAnswer(card, savedAnswer)
		})
	}, [draftStorageKey, dynamicQuestions, visibleAnswersByQuestion])

	useEffect(() => {
		if (!draftStorageKey) return
		const root = pageRef.current
		if (!root) return
		const saveDraft = () => {
			const nextAnswers = new Map<string, string>()
			const cards = Array.from(root.querySelectorAll<HTMLElement>('.a_card_box[data-question-index]'))
			cards.forEach((card) => {
				const index = Number(card.dataset.questionIndex)
				const item = dynamicQuestions[index]
				if (!item) return
				const { ansCn: answer } = collectCardAnswer(card)
				const answerKey = answerKeysForQuestion(item.content.cntnSn, item.question)[0]
				if (answer.trim()) nextAnswers.set(answerKey, answer)
			})
			writeDraftAnswers(draftStorageKey, nextAnswers)
		}
		root.addEventListener('change', saveDraft)
		root.addEventListener('input', saveDraft)
		return () => {
			root.removeEventListener('change', saveDraft)
			root.removeEventListener('input', saveDraft)
		}
	}, [draftStorageKey, dynamicQuestions])

	if (!flowSession) return null

	const handleSubmit = async () => {
		if (saving) return
		if (!isTimeLimitMet) {
			alert(`${remainingLabel} 후 다음 학습으로 이동할 수 있습니다.`)
			return
		}
		if (!quest) {
			alert('저장할 퀘스트 정보가 없습니다.')
			return
		}
		const cards = Array.from(pageRef.current?.querySelectorAll<HTMLElement>('.a_card_box[data-question-index]') ?? [])
		const filesByFieldName: Record<string, File> = {}
		const answers = cards.reduce<TabletMissionAnswer[]>((acc, card, cardIndex) => {
			const index = Number(card.dataset.questionIndex)
			const item = dynamicQuestions[index]
			if (!item) return acc
			const collected = collectCardAnswer(card, cardIndex)
			if (!collected.ansCn.trim() && collected.files.length === 0) return acc
			Object.assign(filesByFieldName, collected.fileMap)
			acc.push({
				cntnSn: item.content.cntnSn,
				qstnSn: item.question.cntnQstnSn,
				qstnCn: item.question.qstnNm,
				ansCn: collected.ansCn,
				cardClsfCd: item.content.cardClsfCd,
				files: collected.files
			})
			return acc
		}, [])
		try {
			setSaving(true)
			const payload = {
				studentSns: flowSession.selectedStudents.map((student) => student.stdntSn),
				routeIndex,
				routeName: questName,
				stepCd: studentFlowExploreStepCode(routeIndex),
				totalRouteCount: routeItems.length,
				answers
			}
			if (Object.keys(filesByFieldName).length > 0) {
				await submitTabletMissionFiles(flowSession.rsvtSn, payload, filesByFieldName)
			} else {
				await submitTabletMission(flowSession.rsvtSn, payload)
			}
			const nextSession = await fetchTabletSession()
			saveTabletStudentFlowSession(nextSession, flowSession.selectedStudents.map((student) => student.stdntSn))
			const savedDraft = new Map<string, string>()
			answers.forEach((answer) => {
				savedDraft.set(`${answer.cntnSn || 0}:${answer.qstnSn || 0}`, answer.ansCn)
				if (answer.qstnCn) savedDraft.set(`${answer.cntnSn || 0}:${answer.qstnCn}`, answer.ansCn)
			})
			writeDraftAnswers(draftStorageKey, savedDraft)
			navigate(submitPath)
		} catch (error) {
			alert(error instanceof Error ? error.message : '퀘스트 저장 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{title}</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 2 사건탐구{questName ? ` - ${questName}` : ''}</div>
					<div className="subtitle"><strong>{title}</strong></div>
					<div className="location">{location}</div>
				</div>
				<div className="page_quest" ref={pageRef}>
					{dynamicQuestions.length > 0 ? dynamicQuestions.map(({ content, question }, index) => (
						<div className="wbox a_card_box" key={`${content.cntnSn}_${question.cntnQstnSn || index}`} data-question-index={index}>
							<div className="card_top">문항풀이 #{index + 1}</div>
							<h3 className="tit">{question.qstnNm}</h3>
							<div className="con">{renderQuestionControl(question, index, pageKey, answerForQuestion(visibleAnswersByQuestion, content.cntnSn, question) || '')}</div>
						</div>
					)) : <div className="wbox a_card_box"><h3 className="tit">관리자에 연결된 콘텐츠가 없습니다.</h3></div>}
					<div className="btns_btm"><button type="button" className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button type="button" className="btn btn_wbb" onClick={handleSubmit} disabled={saving}>{saving ? '저장 중' : '제출'}</button></div>
				</div>
			</section>
		</main>
	)
}

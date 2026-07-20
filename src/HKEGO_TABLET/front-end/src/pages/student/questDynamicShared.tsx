import { ChangeEvent, Fragment, ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { fetchTabletSession, submitTabletMission, submitTabletMissionFiles, TabletContent, TabletContentQuestion, TabletMissionAnswer } from '../../api/tabletApi'
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

type SavedWorksheetFile = {
	label: string
	fileName: string
	fileUrl: string
}

type SavedWorksheetAnswer = {
	answer: string
	files: SavedWorksheetFile[]
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

const parseSavedWorksheetAnswer = (value?: string): SavedWorksheetAnswer => {
	const fallback = { answer: value || '', files: [] }
	if (!value) return fallback
	try {
		const parsed = JSON.parse(value) as { type?: string; answer?: string; files?: Partial<SavedWorksheetFile>[] }
		if (parsed?.type !== 'WORKSHEET_FILES') return fallback
		return {
			answer: typeof parsed.answer === 'string' ? parsed.answer : '',
			files: Array.isArray(parsed.files)
				? parsed.files.map((file) => ({
					label: typeof file.label === 'string' ? file.label : '',
					fileName: typeof file.fileName === 'string' ? file.fileName : '',
					fileUrl: typeof file.fileUrl === 'string' ? file.fileUrl : ''
				})).filter((file) => file.fileUrl)
				: []
		}
	} catch {
		return fallback
	}
}

const questionTypes = (question: TabletContentQuestion) => (question.qstnTypeCd || '').split(',').map((type) => type.trim()).filter(Boolean)
const parseAnswerLines = (value = '') => value.split('\n').map((line) => line.trim()).filter(Boolean)
const nl2br = (value: string) => value.split('\n').map((line, index, rows) => <span key={`${line}-${index}`}>{line}{index < rows.length - 1 && <br />}</span>)
const savedValueForLabel = (answer: string | undefined, label: string) => {
	if (!answer || !label) return ''
	const matchedLine = parseAnswerLines(answer).find((line) => line.startsWith(`${label}:`))
	return matchedLine ? matchedLine.slice(label.length + 1).trim() : ''
}

const savedAnswerForQuestion = (savedAnswers: Map<string, string>, content: TabletContent, question: TabletContentQuestion) => {
	const contentId = content.cntnSn || 0
	const keys = [
		`${contentId}:${question.cntnQstnSn || 0}`,
		`${contentId}:${question.qstnNm || ''}`,
		`${contentId}:0`
	]
	return keys.map((key) => savedAnswers.get(key)).find((value) => typeof value === 'string')
}

type CollectedCardAnswer = {
	ansCn: string
	files: NonNullable<TabletMissionAnswer['files']>
	fileMap: Record<string, File>
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
		const label = input.closest('li')?.querySelector('label')?.textContent?.trim()
		if (files.length === 0) {
			const fileUrl = input.dataset.existingFileUrl || ''
			const fileName = input.dataset.existingFileName || ''
			if (!fileUrl) return
			answerFiles.push({ label: label || '', fileName, fieldName: '', fileUrl })
			values.push(label ? `${label}: ${fileName}` : fileName)
			return
		}
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
	const restoredAnswer = parseSavedWorksheetAnswer(answer).answer
	const lines = parseAnswerLines(restoredAnswer)
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
		if (textControls.length === 1) input.value = restoredAnswer
	})
}

export const useQuestDynamicPage = (routeIndex: number, contentIndex: number) => {
	const flowSession = useRequiredTabletStudentFlowSession()
	const quest = flowSession ? studentFlowExploreQuestByRouteIndex(flowSession, routeIndex) : null
	const contents = flowSession ? studentFlowExploreQuestContents(flowSession, routeIndex) : []
	const content = contents[contentIndex] ?? null
	const savedAnswers = useMemo(() => flowSession ? studentFlowExploreSavedAnswersByQuestion(flowSession, routeIndex) : new Map<string, string>(), [flowSession, routeIndex])
	const questions = content?.questions ?? []
	return {
		flowSession,
		quest,
		contents,
		content,
		questions,
		savedAnswers,
		title: quest?.title || content?.cntnTtl || '',
		location: quest?.place || '',
		stepLabel: `STEP 2 사건탐구 - ${quest?.name || `퀘스트${routeIndex + 1}`}`
	}
}

export const useQuestSubmit = ({ routeIndex, nextPath, canSubmit = true, blockedMessage = '' }: { routeIndex: number; nextPath: string; canSubmit?: boolean; blockedMessage?: string }) => {
	const navigate = useNavigate()
	const pageRef = useRef<HTMLDivElement>(null)
	const [saving, setSaving] = useState(false)
	const flowSession = useRequiredTabletStudentFlowSession()
	const quest = flowSession ? studentFlowExploreQuestByRouteIndex(flowSession, routeIndex) : null
	const routeItems = flowSession ? studentFlowRouteItems(flowSession) : []

	const restoreSavedAnswers = useCallback((savedAnswers: Map<string, string>) => {
		const cards = Array.from(pageRef.current?.querySelectorAll<HTMLElement>('.a_card_box[data-cntn-sn][data-qstn-sn]') ?? [])
		cards.forEach((card) => {
			const answer = savedAnswers.get(`${card.dataset.cntnSn || 0}:${card.dataset.qstnSn || 0}`)
			if (answer) restoreCardAnswer(card, answer)
		})
	}, [])

	const submit = async () => {
		if (!flowSession || !quest || saving) return
		if (!canSubmit) {
			if (blockedMessage) alert(blockedMessage)
			return
		}
		const cards = Array.from(pageRef.current?.querySelectorAll<HTMLElement>('.a_card_box[data-cntn-sn][data-qstn-sn]') ?? [])
		const filesByFieldName: Record<string, File> = {}
		const answers = cards.reduce<TabletMissionAnswer[]>((acc, card, cardIndex) => {
			const collected = collectCardAnswer(card, cardIndex)
			if (!collected.ansCn.trim() && collected.files.length === 0) return acc
			Object.assign(filesByFieldName, collected.fileMap)
			acc.push({
				cntnSn: Number(card.dataset.cntnSn) || undefined,
				qstnSn: Number(card.dataset.qstnSn) || undefined,
				qstnCn: card.dataset.qstnCn || '',
				cardClsfCd: card.dataset.cardClsfCd || undefined,
				ansCn: collected.ansCn,
				files: collected.files
			})
			return acc
		}, [])
		try {
			setSaving(true)
			const payload = {
				studentSns: flowSession.selectedStudents.map((student) => student.stdntSn),
				routeIndex,
				routeName: quest.name,
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
			navigate(nextPath)
		} catch (error) {
			alert(error instanceof Error ? error.message : '퀘스트 저장 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return { pageRef, submit, saving, restoreSavedAnswers }
}

export const DynamicQuestCard = ({ content, cardTypeClass, emptyMessage = '관리자에 연결된 콘텐츠가 없습니다.' }: { content: TabletContent | null; cardTypeClass: string; emptyMessage?: string }) => (
	<div className={`wbox q_card_box ${cardTypeClass}`}>
		<div className="card_top">{content?.cardClsfNm || '콘텐츠'}</div>
		{content ? <>
			<h2 className="btit">{content.cntnTtl}</h2>
			{content.cntnCn && <p>{nl2br(content.cntnCn)}</p>}
			{content.videoUrlAddr && <div className="video_thum"><div className="video imgfit">{content.videoThmbAtchFileId ? null : null}</div><div className="txt"><h3 className="tit">{content.videoTtl || content.cntnTtl}</h3><a href={content.videoUrlAddr} target="_blank" rel="noreferrer" className="btn_link">동영상 바로가기</a></div></div>}
		</> : <h2 className="btit">{emptyMessage}</h2>}
	</div>
)

const DataInputs = ({ question, options, baseId, savedAnswer }: { question: TabletContentQuestion; options: QuestionOption; baseId: string; savedAnswer?: string }) => {
	const subItems = options.data?.subItems?.filter((item) => item.name || item.placeholder) ?? []
	if (subItems.length > 0) {
		return <ul className="input_list half_list">{subItems.map((item, index) => {
			const id = `${baseId}_data_${index + 1}`
			const label = item.name || `입력 ${index + 1}`
			return <li key={id}><label htmlFor={id} className="tt">{label}</label><input type="text" id={id} className="text w100p" placeholder={item.placeholder || `${item.name || '내용'}을 입력해주세요.`} defaultValue={savedValueForLabel(savedAnswer, label)} /></li>
		})}</ul>
	}
	return <input type="text" className="text w100p" placeholder={options.data?.placeholder || '입력해주세요.'} defaultValue={savedAnswer || ''} />
}

const DynamicQuestionControl = ({ question, baseId, savedAnswer }: { question: TabletContentQuestion; baseId: string; savedAnswer?: string }) => {
	const options = parseQuestionOption(question.optnCn)
	const savedWorksheetAnswer = useMemo(() => parseSavedWorksheetAnswer(savedAnswer), [savedAnswer])
	const types = questionTypes(question)
	const selectItems = options.select?.items?.filter(Boolean) ?? []
	const sentenceItems = options.sentence?.items?.filter(Boolean) ?? []
	const photoLabels = options.photo?.labels?.filter(Boolean) ?? []
	const checkedItems = parseAnswerLines(savedWorksheetAnswer.answer)
	const [photoPreviews, setPhotoPreviews] = useState<Record<string, { url: string; fileName: string; existing: boolean }>>(() =>
		Object.fromEntries(savedWorksheetAnswer.files.map((file, index) => [
			`${baseId}_photo_${index + 1}`,
			{ url: file.fileUrl, fileName: file.fileName, existing: true }
		]))
	)

	useEffect(() => () => {
		Object.values(photoPreviews).forEach((preview) => {
			if (!preview.existing) URL.revokeObjectURL(preview.url)
		})
	}, [photoPreviews])

	const handlePhotoChange = (id: string, event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		setPhotoPreviews((previous) => {
			const current = previous[id]
			if (current && !current.existing) URL.revokeObjectURL(current.url)
			if (!file) {
				const next = { ...previous }
				delete next[id]
				return next
			}
			return { ...previous, [id]: { url: URL.createObjectURL(file), fileName: file.name, existing: false } }
		})
	}

	if (types.includes('SELECT') && selectItems.length > 0) return <CheckboxList name={`${baseId}_select`} items={selectItems} checkedItems={checkedItems} mode={options.select?.choiceMode === 'SINGLE' ? 'SINGLE' : 'MULTI'} />
	if (types.includes('DATA')) return <DataInputs question={question} options={options} baseId={baseId} savedAnswer={savedWorksheetAnswer.answer} />
	if (types.includes('SENTENCE')) {
		return <ul className="input_list">{(sentenceItems.length > 0 ? sentenceItems : ['']).map((item, index) => {
			const id = `${baseId}_sentence_${index + 1}`
			const label = item || question.qstnNm
			return <li key={id}><label htmlFor={id} className="tt">{label}</label><input type="text" id={id} className="text w100p" placeholder="문장을 완성해주세요." defaultValue={savedValueForLabel(savedWorksheetAnswer.answer, label)} /></li>
		})}</ul>
	}
	if (types.includes('PHOTO')) {
		const count = Math.max(Number(options.photo?.itemCount) || photoLabels.length || savedWorksheetAnswer.files.length || 1, 1)
		return <ul className="photo_inputs">{Array.from({ length: count }).map((_, index) => {
			const id = `${baseId}_photo_${index + 1}`
			const label = photoLabels[index] || `사진 ${index + 1}`
			const preview = photoPreviews[id]
			return <li key={id} className={preview ? 'in_image in_file' : ''}><input type="file" name="photo" id={id} accept="image/*" data-existing-file-url={preview?.existing ? preview.url : undefined} data-existing-file-name={preview?.existing ? preview.fileName : undefined} onChange={(event) => handlePhotoChange(id, event)} /><label htmlFor={id}><span className="imgarea"><span className="thema">{label}</span><span className="imgfit">{preview && <img src={preview.url} alt={`${label} 미리보기`} />}</span></span></label></li>
		})}</ul>
	}
	return <input type="text" className="text w100p" placeholder="입력해주세요." />
}

export const DynamicQuestionCards = ({ content, questions, savedAnswers, emptyMessage = '관리자에 연결된 문항이 없습니다.', startIndex = 0 }: {
	content: TabletContent | null
	questions: TabletContentQuestion[]
	savedAnswers: Map<string, string>
	emptyMessage?: string
	startIndex?: number
}) => {
	if (!content || questions.length === 0) return <div className="wbox a_card_box"><h3 className="tit">{emptyMessage}</h3></div>
	return <>
		{questions.map((question, index) => {
			const answerKey = `${content.cntnSn || 0}:${question.cntnQstnSn || 0}`
			const savedAnswer = savedAnswerForQuestion(savedAnswers, content, question)
			return (
				<div className="wbox a_card_box" key={answerKey} data-cntn-sn={content.cntnSn} data-qstn-sn={question.cntnQstnSn} data-qstn-cn={question.qstnNm} data-card-clsf-cd={content.cardClsfCd || ''}>
					<div className="card_top">문항풀이 #{startIndex + index + 1}</div>
					<h3 className="tit">{question.qstnNm}</h3>
					<div className="con"><DynamicQuestionControl key={`${answerKey}:${savedAnswer || ''}`} question={question} baseId={`quest_${content.cntnSn}_${question.cntnQstnSn || 0}`} savedAnswer={savedAnswer} /></div>
				</div>
			)
		})}
	</>
}

export const DynamicQuestContentSections = ({ contents, savedAnswers, cardTypeClasses = ['type1', 'type2', 'type3'] }: {
	contents: TabletContent[]
	savedAnswers: Map<string, string>
	cardTypeClasses?: string[]
}) => {
	if (contents.length === 0) return <>
		<DynamicQuestCard content={null} cardTypeClass={cardTypeClasses[0] || 'type1'} />
		<DynamicQuestionCards content={null} questions={[]} savedAnswers={savedAnswers} />
	</>

	let questionOffset = 0
	return <>
		{contents.map((content, index) => {
			const currentOffset = questionOffset
			questionOffset += content.questions.length
			return (
				<Fragment key={content.cntnSn || `${content.cntnTtl}-${index}`}>
					<DynamicQuestCard content={content} cardTypeClass={cardTypeClasses[index % cardTypeClasses.length] || 'type1'} />
					<DynamicQuestionCards content={content} questions={content.questions} savedAnswers={savedAnswers} startIndex={currentOffset} />
				</Fragment>
			)
		})}
	</>
}

export const QuestPageShell = ({ title, step, location, children, pageRef }: { title: string; step: string; location: string; children: ReactNode; pageRef: RefObject<HTMLDivElement> }) => (
	<>
		<div className="student_title">
			<div className="step">{step}</div>
			<div className="subtitle"><strong>{title}</strong></div>
			<div className="location">{location}</div>
		</div>
		<div className="page_quest" ref={pageRef}>{children}</div>
	</>
)

const questContentPath = (routeIndex: number, contentIndex: number) => {
	const questNo = String(routeIndex + 1).padStart(2, '0')
	return contentIndex === 0 ? `/student/quest${questNo}` : `/student/quest${questNo}_${contentIndex + 1}`
}

export const QuestDynamicContentPage = ({ routeIndex, contentIndex }: { routeIndex: number; contentIndex: number }) => {
	const navigate = useNavigate()
	const { flowSession, quest, contents, content, questions, savedAnswers, title, location, stepLabel } = useQuestDynamicPage(routeIndex, contentIndex)
	const nextPath = contentIndex + 1 < contents.length
		? questContentPath(routeIndex, contentIndex + 1)
		: `/student/quest${String(routeIndex + 1).padStart(2, '0')}_end`
	const selectedStudentKey = useMemo(
		() => (flowSession?.selectedStudents ?? []).map((student) => student.stdntSn).sort((a, b) => a - b).join(','),
		[flowSession]
	)
	const timerStorageKey = flowSession ? `hkegoTabletQuestTimer:${flowSession.rsvtSn}:${selectedStudentKey}:${routeIndex}` : ''
	const { isTimeLimitMet, remainingLabel } = useQuestTimeLimit(timerStorageKey, quest?.limitMin)
	const { pageRef, submit, saving, restoreSavedAnswers } = useQuestSubmit({
		routeIndex,
		nextPath,
		canSubmit: isTimeLimitMet,
		blockedMessage: `${remainingLabel} 후 다음 학습으로 이동할 수 있습니다.`
	})

	useEffect(() => restoreSavedAnswers(savedAnswers), [restoreSavedAnswers, savedAnswers])

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{title || stepLabel}</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<QuestPageShell title={title} step={stepLabel} location={location} pageRef={pageRef}>
					<DynamicQuestCard content={content} cardTypeClass={['type1', 'type2', 'type3'][contentIndex % 3]} />
					<DynamicQuestionCards content={content} questions={questions} savedAnswers={savedAnswers} />
					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={submit} disabled={saving}>{saving ? '저장 중' : '다음'}</button>
					</div>
				</QuestPageShell>
			</section>
		</main>
	)
}

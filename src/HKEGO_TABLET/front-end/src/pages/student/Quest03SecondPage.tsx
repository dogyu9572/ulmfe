import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { DynamicQuestCard, DynamicQuestionCards, QuestPageShell, useQuestDynamicPage, useQuestSubmit } from './questDynamicShared'

export const Quest03SecondPage = () => {
	const navigate = useNavigate()
	const { content, questions, savedAnswers, title, location, stepLabel } = useQuestDynamicPage(2, 1)
	const { pageRef, submit, saving, restoreSavedAnswers } = useQuestSubmit({ routeIndex: 2, nextPath: '/student/quest03_end' })
	useEffect(() => restoreSavedAnswers(savedAnswers), [restoreSavedAnswers, savedAnswers])

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{title || stepLabel}</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<QuestPageShell title={title} step={stepLabel} location={location} pageRef={pageRef}>
					<DynamicQuestCard content={content} cardTypeClass="type3" />
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

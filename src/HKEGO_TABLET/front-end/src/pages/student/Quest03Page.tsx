import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { DynamicQuestContentSections, QuestPageShell, useQuestDynamicPage, useQuestSubmit } from './questDynamicShared'

export const Quest03Page = () => {
	const navigate = useNavigate()
	const { contents, savedAnswers, title, location } = useQuestDynamicPage(2, 0)
	const { pageRef, submit, saving, restoreSavedAnswers } = useQuestSubmit({ routeIndex: 2, nextPath: '/student/quest03_end' })
	useEffect(() => restoreSavedAnswers(savedAnswers), [restoreSavedAnswers, savedAnswers])

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{title || '퀘스트3'}</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<QuestPageShell title={title} step="STEP 2 사건탐색 - 퀘스트3" location={location} pageRef={pageRef}>
					<DynamicQuestContentSections contents={contents} savedAnswers={savedAnswers} />
					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={submit} disabled={saving}>{saving ? '저장 중' : '다음'}</button>
					</div>
				</QuestPageShell>
			</section>
		</main>
	)
}

import { ChangeEvent, KeyboardEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTabletSession, submitTabletMaker } from '../../api/tabletApi'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { saveTabletStudentFlowSession, studentFlowExploreStepByCode } from '../../state/tabletStudentFlowSession'

const splitTextRows = (value: string) => value
	.split(/\r?\n/)
	.map((row) => row.trim())
	.filter(Boolean)

export const Quest05Page = () => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	const [activeTab, setActiveTab] = useState(0)
	const [previews, setPreviews] = useState<Record<number, string>>({})
	const [descriptions, setDescriptions] = useState<Record<number, string>>({})
	const [files, setFiles] = useState<Record<number, File>>({})
	const [saving, setSaving] = useState(false)

	const makerStep = studentFlowExploreStepByCode(flowSession ?? null, 'STEP3')
	const students = flowSession?.selectedStudents.map((student) => student.stdntNm) ?? []
	const safetyRules = (makerStep?.safetyRules ?? []).flatMap((rule) => splitTextRows(rule.text))
	const checklists = (makerStep?.checklists ?? []).flatMap((item) => splitTextRows(item.text))
	const title = makerStep?.title || ''
	const location = makerStep?.place || ''

	if (!flowSession) return null

	const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
		const file = event.target.files?.[0]
		if (!file || !file.type.startsWith('image/')) {
			setPreviews((prev) => {
				const next = { ...prev }
				delete next[index]
				return next
			})
			setFiles((prev) => {
				const next = { ...prev }
				delete next[index]
				return next
			})
			return
		}

		setFiles((prev) => ({ ...prev, [index]: file }))
		const reader = new FileReader()
		reader.onload = () => {
			if (typeof reader.result === 'string') setPreviews((prev) => ({ ...prev, [index]: reader.result as string }))
		}
		reader.readAsDataURL(file)
	}

	const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
		let targetIndex: number | null = null
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') targetIndex = index + 1 >= students.length ? 0 : index + 1
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') targetIndex = index - 1 < 0 ? students.length - 1 : index - 1
		if (event.key === 'Home') targetIndex = 0
		if (event.key === 'End') targetIndex = students.length - 1
		if (targetIndex === null) return
		event.preventDefault()
		setActiveTab(targetIndex)
	}

	const submitMaker = async () => {
		if (!flowSession || saving) return
		try {
			setSaving(true)
			await submitTabletMaker(flowSession.rsvtSn, flowSession.selectedStudents.map((student, index) => ({
				studentSn: student.stdntSn,
				description: descriptions[index] ?? '',
				file: files[index] ?? null
			})))
			const nextSession = await fetchTabletSession()
			saveTabletStudentFlowSession(nextSession, flowSession.selectedStudents.map((student) => student.stdntSn))
			navigate('/student/quest_end')
		} catch (error) {
			alert(error instanceof Error ? error.message : '메이커 활동지 저장 중 오류가 발생했습니다.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">{title || '사건해결'}</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 3 사건해결</div>
					<div className="subtitle"><strong>{title}</strong></div>
					<div className="location">{location}</div>
				</div>

				<div className="page_quest">
					<ul className="make_check_area">
						<li className="c1"><div className="tit">안전수칙! 꼭 읽어요!</div>
							<div className="con">
								<ul className="list">
									{safetyRules.length > 0 ? safetyRules.map((rule) => <li key={rule}>{rule}</li>) : <li>관리자에 등록된 안전수칙이 없습니다.</li>}
								</ul>
							</div>
						</li>
						<li className="c2"><div className="tit">제작 체크리스트</div>
							<div className="con">
								<ul className="list">
									{checklists.length > 0 ? checklists.map((item) => <li key={item}>{item}</li>) : <li>관리자에 등록된 제작 체크리스트가 없습니다.</li>}
								</ul>
							</div>
						</li>
					</ul>

					<div className="stit icon_maker">내가 만든 울산을 알리는 나만의 연필꽂이는?</div>
					<div className="script_tabs_wrap">
						<ul className="tabs_area" role="tablist">
							{students.length > 0 ? students.map((student, index) => {
								const isEnd = Boolean(previews[index] && descriptions[index]?.trim())
								return (
									<li key={student} className={`${activeTab === index ? 'on' : ''}${isEnd ? ' end' : ''}`.trim()}>
										<button type="button" id={`tab_btn_${index + 1}`} role="tab" aria-controls={`tab_panel_${index + 1}`} aria-selected={activeTab === index} tabIndex={activeTab === index ? 0 : -1} onClick={() => setActiveTab(index)} onKeyDown={(event) => handleTabKeyDown(event, index)}>{student}</button>
									</li>
								)
							}) : <li><button type="button">학생 정보 없음</button></li>}
						</ul>
						<div className="cont_area">
							{students.map((student, index) => {
								const inputId = `inputFile${index + 1}`
								const isEnd = Boolean(previews[index] && descriptions[index]?.trim())
								return (
									<div className={`${activeTab === index ? 'cont on' : 'cont'}${isEnd ? ' end' : ''}`} id={`tab_panel_${index + 1}`} role="tabpanel" aria-labelledby={`tab_btn_${index + 1}`} key={student}>
										<div className="flex">
											<div className={`photo_inputs${previews[index] ? ' in_image in_file' : ''}`}>
												<input type="file" name="photo" id={inputId} accept="image/*" onChange={(event) => handlePhotoChange(event, index)} />
												<label htmlFor={inputId}><span className="imgarea"><span className="imgfit">{previews[index] && <img src={previews[index]} alt="미리보기 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</span></span></label>
											</div>
											<div className="text_input"><textarea name="" id="" cols={30} rows={10} className="GangwonEdu" placeholder="내가 만든 연필꽂이의 설명을 입력해주세요." value={descriptions[index] ?? ''} onChange={(event) => setDescriptions((prev) => ({ ...prev, [index]: event.target.value }))}></textarea></div>
										</div>
									</div>
								)
							})}
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={submitMaker} disabled={saving}>{saving ? '저장 중' : '다음'}</button>
					</div>
				</div>
			</section>
		</main>
	)
}

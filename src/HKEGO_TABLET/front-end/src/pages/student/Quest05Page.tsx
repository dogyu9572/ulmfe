import { ChangeEvent, KeyboardEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

const students = ['김민준', '나서윤', '박하윤', '이서준', '최하준', '한서연']

export const Quest05Page = () => {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState(0)
	const [previews, setPreviews] = useState<Record<number, string>>({})
	const [descriptions, setDescriptions] = useState<Record<number, string>>({})

	const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
		const file = event.target.files?.[0]
		if (!file || !file.type.startsWith('image/')) {
			setPreviews((prev) => {
				const next = { ...prev }
				delete next[index]
				return next
			})
			return
		}

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

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">울산을 알리는 연필꽂이 만들기</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 3 사건해결</div>
					<div className="subtitle"><strong>울산을 알리는 연필꽂이 만들기</strong></div>
					<div className="location">2층 목공실</div>
				</div>

				<div className="page_quest">
					<ul className="make_check_area">
						<li className="c1"><div className="tit">안전수칙! 꼭 읽어요!</div>
							<div className="con">
								<ul className="list">
									<li>선생님 없이 혼자 <strong>공구 사용 금지</strong></li>
									<li>날카로운 공구는 <strong>보호 장갑 착용</strong></li>
									<li>접착제 · 페인트 사용시 <strong>창문 열기</strong></li>
									<li>글씨 새기기는 <strong>선생님이 도와줘요</strong></li>
								</ul>
							</div>
						</li>
						<li className="c2"><div className="tit">제작 체크리스트</div>
							<div className="con">
								<ul className="list">
									<li>연필꽂이 모양 선택</li>
									<li>울산 12경 액세서리 4가지 획득 (퀘스트 2~3)</li>
									<li>연필꽂이 문구 1가지 선택</li>
								</ul>
							</div>
						</li>
					</ul>

					<div className="stit icon_maker">내가 만든 울산을 알리는 나만의 연필꽂이는?</div>
					<div className="script_tabs_wrap">
						<ul className="tabs_area" role="tablist">
							{students.map((student, index) => {
								const isEnd = Boolean(previews[index] && descriptions[index]?.trim())
								return (
									<li key={student} className={`${activeTab === index ? 'on' : ''}${isEnd ? ' end' : ''}`.trim()}>
										<button type="button" id={`tab_btn_${index + 1}`} role="tab" aria-controls={`tab_panel_${index + 1}`} aria-selected={activeTab === index} tabIndex={activeTab === index ? 0 : -1} onClick={() => setActiveTab(index)} onKeyDown={(event) => handleTabKeyDown(event, index)}>{student}</button>
									</li>
								)
							})}
						</ul>
						<div className="cont_area">
							{students.map((student, index) => {
								const inputId = `inputFile${index + 1}`
								const isEnd = Boolean(previews[index] && descriptions[index]?.trim())
								return (
									<div className={`${activeTab === index ? 'cont on' : 'cont'}${isEnd ? ' end' : ''}`} id={`tab_panel_${index + 1}`} role="tabpanel" aria-labelledby={`tab_btn_${index + 1}`} key={student}>
										<div className="flex">
											<div className={`photo_inputs${previews[index] ? ' in_image in_file' : ''}`}>
												<input type="file" name="photo" id={inputId} onChange={(event) => handlePhotoChange(event, index)} />
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
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest_end')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

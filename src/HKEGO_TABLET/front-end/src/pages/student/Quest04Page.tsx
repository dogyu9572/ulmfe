import { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

export const Quest04Page = () => {
	const navigate = useNavigate()
	const [preview, setPreview] = useState('')

	const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file || !file.type.startsWith('image/')) {
			setPreview('')
			return
		}

		const reader = new FileReader()
		reader.onload = () => {
			if (typeof reader.result === 'string') setPreview(reader.result)
		}
		reader.readAsDataURL(file)
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">나도 크고, 너도 크는 울산</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 2 사건탐색 - 퀘스트4</div>
					<div className="subtitle"><strong>나도 크고, 너도 크는 울산</strong></div>
					<div className="location">1층 ESD체험터 미디어실</div>
				</div>

				<div className="page_quest">
					<div className="wbox q_card_box type2">
						<div className="card_top">미션카드</div>
						<h2 className="btit">50년 뒤의 울산은 어떤 모습일까요?</h2>
						<p>우리의 염원을 담아 울산이 어떻게 발전되었으면 좋겠는지 작성해봐요.<br />
							그리고 여러분의 염원이 담긴 미래 울산의 모습을 그림으로 표현하여, 그림 사진을 첨부해주세요.
						</p>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #1</div>
						<h3 className="tit">우리 울산에도 드디어 <span className="GangwonEdu c_iden">지하철</span> 이(가) 생겼어요!!</h3>
						<div className="con">
							<ul className="input_flex">
								<li>우리 울산에도 드디어 <input type="text" className="text" placeholder="들어갈 단어를 입력해주세요." />이(가) 생겼어요!!</li>
								<li>우리 울산에도 드디어 <input type="text" className="text" placeholder="들어갈 단어를 입력해주세요." />이(가) 생겼어요!!</li>
								<li>우리 울산에도 드디어 <input type="text" className="text" placeholder="들어갈 단어를 입력해주세요." />이(가) 생겼어요!!</li>
							</ul>
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #2</div>
						<h3 className="tit">미래 울산의 모습을 그림으로 표현해봅시다.</h3>
						<div className="con">
							<ul className="photo_inputs">
								<li className={preview ? 'in_image' : undefined}>
									<input type="file" name="photo" id="inputFile1" onChange={handlePhotoChange} />
									<label htmlFor="inputFile1"><span className="imgarea"><span className="imgfit">{preview && <img src={preview} alt="미리보기 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</span></span></label>
								</li>
							</ul>
							<p className="excl">탭하면 사진을 바꿀 수 있어요.</p>
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest04_2')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

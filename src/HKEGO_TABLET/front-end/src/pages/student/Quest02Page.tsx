import { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

const countryInfoItems = [
	{
		image: '/pub/images/img_country_info01.webp',
		title: '산업과 경제',
		text: '조선소, 자동차, 석유화학, 철강'
	},
	{
		image: '/pub/images/img_country_info02.webp',
		title: '자연과 생태',
		text: '태화강, 간절곶, 대왕암공원, 무거천, 반구대'
	},
	{
		image: '/pub/images/img_country_info03.webp',
		title: '역사',
		text: '반구대 암각화, 외고산 옹기마을, 고래 전시관'
	},
	{
		image: '/pub/images/img_country_info04.webp',
		title: '문화',
		text: '고래축제, 처용문화제, 태화강 빛축제 등'
	}
]

const photoInputs = [
	{ id: 'inputFile1', thema: '테마1', title: '산업과 경제' },
	{ id: 'inputFile2', thema: '테마2', title: '자연과 생태' },
	{ id: 'inputFile3', thema: '테마3', title: '해양과 문화' },
	{ id: 'inputFile4', thema: '테마4', title: '미래 스마트 도시' }
]

export const Quest02Page = () => {
	const navigate = useNavigate()
	const [previews, setPreviews] = useState<Record<string, string>>({})

	const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>, inputId: string) => {
		const file = event.target.files?.[0]

		if (!file || !file.type.startsWith('image/')) {
			setPreviews((prev) => {
				const next = { ...prev }
				delete next[inputId]
				return next
			})
			return
		}

		const reader = new FileReader()
		reader.onload = () => {
			if (typeof reader.result !== 'string') return
			setPreviews((prev) => ({ ...prev, [inputId]: reader.result as string }))
		}
		reader.readAsDataURL(file)
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">알고보면 재미있는 울산</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 2 사건탐색 - 퀘스트2</div>
					<div className="subtitle"><strong>알고보면 재미있는 울산</strong></div>
					<div className="location">1층 ESD체험터 사회존</div>
				</div>

				<div className="page_quest">
					<div className="wbox q_card_box type2">
						<div className="card_top">미션카드</div>
						<h2 className="btit">울산과 함께 사진 찍기!</h2>
						<p>아래는 울산의 대표적인 산업과 경제, 자연환경, 역사와 문화입니다. <br />
							이를 참고하여 울산의 대표 자원을 배경으로 하여 울산 상징 소품을 활용한 4컷 사진을 찍어 봅시다. <br />
							사진은 개인 계정과 체험터 내 디스플레이로 전송 가능합니다.
						</p>
						<div className="country_info">
							<h3 className="tit">울산의 소중한 대표 자원</h3>
							<ul className="list">
								{countryInfoItems.map((item) => (
									<li key={item.title}><div className="imgfit"><img src={item.image} alt="" /></div><div className="txt"><h4>{item.title}</h4><p>{item.text}</p></div></li>
								))}
							</ul>
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #1</div>
						<h3 className="tit">울산의 대표 자원을 배경으로 4컷 사진 찍기</h3>
						<div className="con">
							<ul className="photo_inputs">
								{photoInputs.map((item) => (
									<li key={item.id} className={previews[item.id] ? 'in_image' : undefined}>
										<input type="file" name="photo" id={item.id} onChange={(event) => handlePhotoChange(event, item.id)} />
										<label htmlFor={item.id}>
											<span className="imgarea">
												<span className="thema">{item.thema}</span>
												<span className="imgfit">
													{previews[item.id] && <img src={previews[item.id]} alt="미리보기 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
												</span>
											</span>
											<h4>{item.title}</h4>
										</label>
									</li>
								))}
							</ul>
							<p className="excl">탭하면 사진을 바꿀 수 있어요.</p>
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest02_2')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

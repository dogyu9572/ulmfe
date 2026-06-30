import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

const weatherItems = [
	{ image: '/pub/images/img_select_weather01.svg', alt: '맑음' },
	{ image: '/pub/images/img_select_weather02.svg', alt: '구름 조금' },
	{ image: '/pub/images/img_select_weather03.svg', alt: '흐림' },
	{ image: '/pub/images/img_select_weather04.svg', alt: '바람 많이 붐' },
	{ image: '/pub/images/img_select_weather05.svg', alt: '비' },
	{ image: '/pub/images/img_select_weather06.svg', alt: '눈' }
]

export const Quest04SecondPage = () => {
	const navigate = useNavigate()
	const [selectedWeather, setSelectedWeather] = useState('')

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
						<h2 className="btit">2075년의 울산 일기를 작성해봐요.</h2>
						<p>여러분은 50년 뒤에 살고 있는 울산의 시민입니다.<br />
							모둠 친구들과 각자 역할을 하나씩 맡아서 50년 뒤 울산에서는 해당 역할들의 삶의 모습이 어떻게 달라졌을지 <br />
							여러분이 바라는 미래의 모습을 바탕으로 일기를 작성해 봅시다.
						</p>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #1</div>
						<h3 className="tit">2075년의 울산 일기</h3>
						<div className="con">
							<div className="diary_area">
								<div className="tit_box">
									<ul className="today">
										<li><span className="GangwonEdu">2075</span>년</li>
										<li><span className="GangwonEdu">6</span>월</li>
										<li><span className="GangwonEdu">5</span>일</li>
									</ul>
									<ul className="weather">
										{weatherItems.map((item) => (
											<li key={item.alt} className={selectedWeather === item.alt ? 'on' : undefined}>
												<button type="button" onClick={() => setSelectedWeather(item.alt)}><img src={item.image} alt={item.alt} /></button>
											</li>
										))}
									</ul>
								</div>
								<div className="inputbox">
									<textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="오늘 울산에서 있었던 일을 써봐요. (예시. 오늘은 하늘을 나는 버스를 타고 학교에 갔다.)"></textarea>
								</div>
							</div>
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest04_end')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

export const Quest01SecondPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">살기 좋은 곳 IN THE WORLD</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 1 사건탐색 - 퀘스트1</div>
					<div className="subtitle"><strong>살기 좋은 곳 IN THE WORLD</strong></div>
					<div className="location">2층 ESD 배움터 아이디어실</div>
				</div>

				<div className="page_quest">
					<div className="wbox q_card_box type2">
						<div className="card_top">미션카드</div>
						<h2 className="btit">도시 재생으로 다시 살아난 세계적 도시는? </h2>
						<p>도시를 새롭게 디자인해서 큰 변화를 이룬 세계적인 도시들이 많습니다.<br />
							이런 도시들은 기존 문제를 해결하고 미래를 준비하기 위하여 환경, 교통, 주거, 문화 등을 재설계 하였어요.<br />
							이 중에서 독일의 &lt;프랑크 푸르트&gt;라는 도시에 관한 영상을 보고 학습지에 답해봅시다.
						</p>
						<div className="video_thum">
							<div className="video imgfit"><img src="/pub/images/img_video_country.webp" alt="" /></div>
							<div className="txt">
								<h3 className="tit">독일-프랑크 푸르트</h3>
								<a href="/student/quest_video.html" className="btn_link" onClick={(event) => {
									event.preventDefault()
									navigate('/student/quest_video')
								}}>동영상 바로가기</a>
							</div>
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #1</div>
						<h3 className="tit">프랑크푸르트는 어떤 에너지를 사용하나요?</h3>
						<div className="con">
							<input type="text" className="text w100p" placeholder="입력해주세요." />
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #2</div>
						<h3 className="tit">프랑크푸르트는 독일의 어떤 수도라고 불리나요?</h3>
						<div className="con">
							<input type="text" className="text w100p" placeholder="입력해주세요." />
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #3</div>
						<h3 className="tit">프랑크푸르트는 왜 독일에서 가장 살고 싶은 도시로 손꼽히는 것 같나요?</h3>
						<div className="con">
							<input type="text" className="text w100p" placeholder="입력해주세요." />
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest01_3')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

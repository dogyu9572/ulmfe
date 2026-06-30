import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

const landmarks = [
	'미국 - 자유의 여신상',
	'프랑스 - 에펠탑',
	'영국 - 빅벤',
	'중국 - 만리장성',
	'인도 - 타지마할',
	'일본 - 도쿄타워',
	'이집트 - 피라미드',
	'이탈리아 -콜로세움',
	'호주 - 오페라하우스',
	'영국 - 타워브릿지',
	'이집트 - 스핑크스',
	'이탈리아 – 피사의 사탑',
	'러시아 -성 바실리 성당',
	'대한민국 – 경복궁',
	'대한민국 - 남산타워'
]

export const Quest01ThirdPage = () => {
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
					<div className="wbox q_card_box type3">
						<div className="card_top">세계의 랜드마크 속으로</div>
						<h2 className="btit">세계의 랜드마크 속으로</h2>
						<p>세계의 대표적인 랜드마크(landmark)는 각 나라의 상징적인 건축물, 자연경관, 문화유산 등을 말해요. <br />
							매직큐브 만들기 영상을 참고하여 아래에 제시된 각 국가들의 대표적인 랜드마크 스티커를 매직큐브에 붙여봅시다.
						</p>
						<div className="video_thum">
							<div className="video imgfit"><img src="/pub/images/img_video_make.webp" alt="" /></div>
							<div className="txt">
								<h3 className="tit">매직큐브 만들기 영상</h3>
								<a href="/student/quest_video.html" className="btn_link" onClick={(event) => {
									event.preventDefault()
									navigate('/student/quest_video')
								}}>동영상 바로가기</a>
							</div>
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #1</div>
						<h3 className="tit">랜드마크 스티커를 매직큐브에 붙여보세요.</h3>
						<div className="con">
							<div className="checkradio_select set4">
								{landmarks.map((landmark, index) => {
									const id = `landmark${String(index + 1).padStart(2, '0')}`
									return (
										<div className="box" key={id}>
											<input type="checkbox" name="country" id={id} />
											<label htmlFor={id}><span><i></i>{landmark}</span></label>
										</div>
									)
								})}
							</div>
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest01_end')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

export const Quest03SecondPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">함께 만드는 행복한 울산</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 2 사건탐색 - 퀘스트3</div>
					<div className="subtitle"><strong>함께 만드는 행복한 울산</strong></div>
					<div className="location">1층 ESD체험터 사회존</div>
				</div>

				<div className="page_quest">
					<div className="wbox q_card_box type3">
						<div className="card_top">체험카드</div>
						<h2 className="btit">우리 손으로 꾸미는 울산 어드벤처!</h2>
						<p>‘행복 마을 카드’에 대해 모둠 친구들과 의논한 부분을 바탕으로 <br />
							ESD체험터의 체험 모형을 활용하여 우리 모둠이 원하는 울산의 모습을 만들어볼까요?
						</p>
						<div className="photo_area imgfit" aria-hidden="true">
							<img src="/pub/images/img_quest3_photo2.webp" alt="" />
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #1</div>
						<h3 className="tit">우리 팀이 만든 울산의 모습에 대해 간략한 설명을 입력해주세요.</h3>
						<div className="con">
							<textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="설명을 입력해주세요."></textarea>
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest03_end')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

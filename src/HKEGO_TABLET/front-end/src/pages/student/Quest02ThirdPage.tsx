import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

export const Quest02ThirdPage = () => {
	const navigate = useNavigate()

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
					<div className="wbox q_card_box type3">
						<div className="card_top">체험카드</div>
						<h2 className="btit">우리 울산, 특별한 지도 만들기</h2>
						<p>우리가 만든 울산의 재미있는 아이디어는 실제 울산의 어디쯤에서 펼쳐질 수 있을까요? <br />
							우리 조의 KNOW잼 아이디어가 펼쳐질 장소를 ESD 체험터- 평화로운 사회존의 ‘우리 동네 특별한 지도 만들기’에 표시하고, <br />
							친구들의 아이디어도 함께 모아 ‘다시 그린 KNOW잼 울산 지도’를 완성해봅니다
						</p>
						<div className="country_info">
							<h3 className="tit">활동 방법</h3>
							<div className="con">
								<img src="/pub/images/img_country_info_use_info.webp" alt="" aria-hidden="true" />
								<ul className="info_list num_list">
									<li><span>1</span>KNOW잼 아이디어가 펼쳐질 장소를 ‘우리 동네 특별한 지도  만들기’에 디자인하기</li>
									<li><span>2</span>위치 정보를 입력해 울산지도로 전송하기</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest02_end')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

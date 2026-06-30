import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

const countries = ['대한민국', '핀란드', '독일', '싱가포르', '뉴질랜드', '직접입력']

export const Quest01Page = () => {
	const navigate = useNavigate()
	const [selectedCountry, setSelectedCountry] = useState('')
	const isDirect = selectedCountry === '직접입력'

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
					<div className="wbox q_card_box type1">
						<div className="card_top">탐구카드</div>
						<h2 className="btit">우리 팀이 선택한 가장 살고 싶은 나라는?</h2>
						<p>가장 살고 싶은 나라는 사람마다 다르지만, 삶의 질이 높고 안전하며 행복하게 살고 싶은 나라들이 보통 인기가 많아요.<br />
							다음은 가장 안전한 나라, 1인당 GDP가 높은 나라, 세계 행복 점수가 높은 나라의 순위입니다.<br />
							자료를 참고하여 내가 가장 살고 싶은 나라를 멘티미터에 적어봅시다!
						</p>
						<ul className="country_rankings_wrap">
							<li className="type1">
								<div className="tit"><span>1</span>가장 안전한 나라 순위</div>
								<div className="txt">
									<ul className="country_list">
										<li className="rank1"><i aria-hidden="true"><img src="/pub/images/icon_country_a01.png" alt="" /></i><strong>1위</strong><span>안도라</span></li>
										<li className="rank2"><i aria-hidden="true"><img src="/pub/images/icon_country_a02.png" alt="" /></i><strong>2위</strong><span>아랍에미리트</span></li>
										<li className="rank3"><i aria-hidden="true"><img src="/pub/images/icon_country_a03.png" alt="" /></i><strong>3위</strong><span>카타르</span></li>
										<li className="dots"></li>
										<li className="rank_korea"><i aria-hidden="true"></i><strong>16위</strong><span>대한민국</span></li>
									</ul>
									<a href="#this" target="_blank" className="btn_outlink">참고 사이트 바로가기</a>
								</div>
							</li>
							<li className="type2">
								<div className="tit"><span>2</span>1인당 GDP 높은 순위</div>
								<div className="txt">
									<ul className="country_list">
										<li className="rank1"><i aria-hidden="true"><img src="/pub/images/icon_country_b01.png" alt="" /></i><strong>1위</strong><span>미국</span></li>
										<li className="rank2"><i aria-hidden="true"><img src="/pub/images/icon_country_b02.png" alt="" /></i><strong>2위</strong><span>중국</span></li>
										<li className="rank3"><i aria-hidden="true"><img src="/pub/images/icon_country_b03.png" alt="" /></i><strong>3위</strong><span>독일</span></li>
										<li className="dots"></li>
										<li className="rank_korea"><i aria-hidden="true"></i><strong>16위</strong><span>대한민국</span></li>
									</ul>
									<a href="#this" target="_blank" className="btn_outlink">참고 사이트 바로가기</a>
								</div>
							</li>
							<li className="type3">
								<div className="tit"><span>3</span>세계 행복 점수 순위</div>
								<div className="txt">
									<ul className="country_list">
										<li className="rank1"><i aria-hidden="true"><img src="/pub/images/icon_country_c01.png" alt="" /></i><strong>1위</strong><span>핀란드</span></li>
										<li className="rank2"><i aria-hidden="true"><img src="/pub/images/icon_country_c02.png" alt="" /></i><strong>2위</strong><span>덴마크</span></li>
										<li className="rank3"><i aria-hidden="true"><img src="/pub/images/icon_country_c03.png" alt="" /></i><strong>3위</strong><span>아이슬란드</span></li>
										<li className="dots"></li>
										<li className="rank_korea"><i aria-hidden="true"></i><strong>16위</strong><span>대한민국</span></li>
									</ul>
									<a href="#this" target="_blank" className="btn_outlink">참고 사이트 바로가기</a>
								</div>
							</li>
						</ul>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #1</div>
						<h3 className="tit">여러분이 가장 살고 싶은 나라는 어디인가요?</h3>
						<div className="con">
							<div className="checkradio_select">
								{countries.map((country, index) => {
									const id = `country${String(index + 1).padStart(2, '0')}`
									return (
										<div className="box" key={id}>
											<input type="radio" name="country" id={id} checked={selectedCountry === country} onChange={() => setSelectedCountry(country)} />
											<label htmlFor={id}><span><i></i>{country}</span></label>
										</div>
									)
								})}
							</div>
							<div className={`direct_input${isDirect ? ' on' : ''}`}>
								<h4 className="tt">가장 살고 싶은 나라를 직접 입력해주세요.</h4>
								<input type="text" className="text w100p" disabled={!isDirect} />
							</div>
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #2</div>
						<h3 className="tit">해당 국가에서 유명한 것을 2가지 입력해주세요. <span>예시. 랜드마크, 문화, 인물, 역사 등</span></h3>
						<div className="con">
							<input type="text" className="text w100p" placeholder="입력해주세요." />
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest01_2')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

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

export const Quest02SecondPage = () => {
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
					<div className="wbox q_card_box type2">
						<div className="card_top">미션카드</div>
						<h2 className="btit">Know잼 울산 아이디어!</h2>
						<p>울산에는 산업, 자연, 역사, 축제 같은 다양한 자원이 있어요.<br />
							우리 함께 울산을 ‘놀러 오고 싶은 도시’로 바꿀 수 있는 기발한 아이디어를 생각하여 아래 빈칸에 입력해주세요.<br />
							여러분들의 아이디어는 울산을 NO잼 도시에서 KNOW잼 도시로 바꿔줄 수 있을 거예요!
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
						<h3 className="tit">울산의 자원 + 나의 상상력 = KNOW잼 울산 아이디어</h3>
						<div className="con">
							<h4 className="tt">산업 + 체험 아이디어를 입력해주세요.</h4>
							<input type="text" className="text w100p" placeholder="예시. 조선소 탐험 체험관+ 배를 조립해보는 놀이" />
							<h4 className="tt">자연 + 예술 아이디어를 입력해주세요.</h4>
							<input type="text" className="text w100p" placeholder="예시. 무거천 생태 미술 놀이터 + 자연 재료로 만들기 체험" />
							<h4 className="tt">자연 + 힐링 아이디어를 입력해주세요.</h4>
							<input type="text" className="text w100p" placeholder="예시. 태화강 요가 페스티벌 + 강변 요가 체험" />
							<h4 className="tt">역사/문화 + 게임 아이디어를 입력해주세요.</h4>
							<input type="text" className="text w100p" placeholder="예시. 반구대 암각화 보물찾기 AR+ 암각화 속 동물 AR 수집 미션" />
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest02_3')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

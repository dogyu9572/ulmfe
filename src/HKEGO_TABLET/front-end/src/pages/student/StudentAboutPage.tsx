import { useNavigate } from 'react-router-dom'

export const StudentAboutPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">번호를 선택해주세요</h1>

			<section className="full_box_wrap case_investigation_wrap">
				<div className="inbox">
					<div className="case_investigation_top">
						<div className="logo" aria-hidden="true"><img src="/pub/images/logo.svg" alt="" /></div>
						<div className="team_info team_a">
							<h2>A팀</h2>
							<ul>
								<li>김민준</li>
								<li><strong>박서윤(나)</strong></li>
								<li>박하윤</li>
								<li>이서준</li>
								<li>최하준</li>
								<li>한서연</li>
							</ul>
						</div>
					</div>
					<div className="case_investigation_btm type1">
						<div className="left">
							<div className="tit">살고 싶은 곳, <strong className="c_iden">울산</strong></div>
							<p>내가 살고 싶은 미래 도시를 설계해봐요.</p>
						</div>
						<div className="right">
							<div className="blue_box">
								<p>우리가 무심코 지나쳤던 도시의 모습들이 새롭게 보이기 시작했어요! <br />
									살기 좋은 곳은 어떤 조건을 가지고 있을까요? <br />
									그리고 우리가 사랑하는 울산은 어떻게 변화해야 할까요?
								</p>
								<p>도시의 문제를 해결하고 더 나은 미래를 만들기 위해서는 <br className="pc_vw" />
								먼저 세계와 우리 주변을 깊이 들여다보는 '탐색'이 필요해요.</p>
								<p>지금부터 세계 여러 나라와 울산의 숨겨진 매력을 발견하고, <br className="pc_vw" />
								우리 동네를 행복하게 만들 4가지 퀘스트를 완수하세요!</p>
								<p><strong>퀘스트를 모두 수행하면 멋진 '미래 마을 디자이너'가 될 수 있습니다!</strong></p>
							</div>
							<a href="/student/quest00.html" className="btn_link" onClick={(event) => {
								event.preventDefault()
								navigate('/student/quest00')
							}}><strong>사건탐구 시작하기</strong><p>첫번째 활동으로 떠나볼까요?<img src="/pub/images/btn_link_search.webp" alt="" aria-hidden="true" /></p></a>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

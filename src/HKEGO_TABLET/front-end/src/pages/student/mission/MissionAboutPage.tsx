export const MissionAboutPage = () => (
	<main className="container flex_center" id="mainContent">
		<h1 className="sound_only">번호를 선택해주세요</h1>
		<section className="full_box_wrap case_investigation_wrap mission_wrap">
			<div className="inbox">
				<div className="case_investigation_top">
					<div className="logo" aria-hidden="true"><img src="/pub/images/logo.svg" alt="" /></div>
					<div className="team_info team_a"><h2>A팀</h2><ul><li>김민준</li><li><strong>박서윤(나)</strong></li><li>박하윤</li><li>이서준</li><li>최하준</li><li>한서연</li></ul></div>
				</div>
				<div className="case_investigation_btm type2">
					<div className="left"><div className="tit">소비습관 <strong className="c_iden">구출 작전</strong></div><p>괴물의 탄생을 막아라!</p></div>
					<div className="right">
						<div className="blue_box">
							<p>방에 쌓인 쓰레기들이 모여 괴물이 되었어요! <br />무심코 사고, 버린 물건들이 모여 괴물이 된 거예요.<br />과소비와 낭비, 한 번 쓰고 버리는 습관이 이 괴물을 키우고 있답니다.</p>
							<p>괴물을 잠재우려면, 나의 소비 선택 방법을 찾아야 해요.<br />그리고 다른 소비 선택 방법도 찾아 이 문제를 해결하세요.</p>
							<p>지금부터 괴물을 퇴치하는 방법을 배우고, <br />전국 '슬기로운 소비생활'을 시작하세요! 미래교육관에서<br />숨긴 힌트를 찾아 이 문제를 풀고 스티커를 획득하세요.</p>
							<p><strong>미션을 수행하면 “울산SDGs 히어로즈”가 될 수 있습니다!</strong></p>
						</div>
						<a href="/student/mission01" className="btn_link"><strong>미션 출발하기</strong><p>첫번째 활동으로 떠나볼까요?<img src="/pub/images/btn_link_search.webp" alt="" aria-hidden="true" /></p></a>
					</div>
				</div>
			</div>
		</section>
	</main>
)

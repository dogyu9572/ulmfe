import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

export const QuestIntroPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">도입 영상 시청하기</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 1 사건제시</div>
					<div className="subtitle"><strong>도입 영상 시청하기</strong></div>
					<div className="location">2층 ESD 배움터 아이디어실</div>
				</div>

				<div className="page_quest">
					<h2 className="sound_only">영상 목록</h2>
					<ul className="start_video_area">
						<li className="c1 video_end">
							<a href="/student/quest_video.html" onClick={(event) => {
								event.preventDefault()
								navigate('/student/quest_video')
							}}>
								<div className="type">스토리</div>
								<div className="img" aria-hidden="true"><img src="/pub/images/img_start_video01.webp" alt="" /></div>
								<div className="txt">
									<div className="time">5분</div>
									<h3 className="tit">살고 싶은 곳, 울산</h3>
									<div className="line_area">
										<div className="pct"><strong>100</strong>%</div>
										<div className="bar" style={{ width: '100%' }}><div className="pct" aria-hidden="true"><strong>0</strong>%</div></div>
									</div>
								</div>
							</a>
						</li>
						<li className="c2">
							<a href="/student/quest_video.html" onClick={(event) => {
								event.preventDefault()
								navigate('/student/quest_video')
							}}>
								<div className="type">콘셉트</div>
								<div className="img" aria-hidden="true"><img src="/pub/images/img_start_video02.webp" alt="" /></div>
								<div className="txt">
									<div className="time">3분</div>
									<h3 className="tit">울산을 바꾸는 마을 디자이너</h3>
									<div className="line_area">
										<div className="pct"><strong>50</strong>%</div>
										<div className="bar" style={{ width: '50%' }}><div className="pct" aria-hidden="true"><strong>0</strong>%</div></div>
									</div>
								</div>
							</a>
						</li>
						<li className="c3">
							<a href="/student/quest_video.html" onClick={(event) => {
								event.preventDefault()
								navigate('/student/quest_video')
							}}>
								<div className="type">러닝맵</div>
								<div className="img" aria-hidden="true"><img src="/pub/images/img_start_video03.webp" alt="" /></div>
								<div className="txt">
									<div className="time">2분</div>
									<h3 className="tit">마을 디자이너가 되기 위한 과정 마을 디자이너가 되기 위한 과정</h3>
									<div className="line_area">
										<div className="pct"><strong>20</strong>%</div>
										<div className="bar" style={{ width: '20%' }}><div className="pct" aria-hidden="true"><strong>0</strong>%</div></div>
									</div>
								</div>
							</a>
						</li>
					</ul>

					<div className="stit icon_think">생각해봐요!</div>
					<ul className="think_list">
						<li><span>현재 울산에 대한 <br /><strong>사람들의 인식</strong>은 어떨까?</span><i aria-hidden="true"></i></li>
						<li><span><strong>내가 만들고 싶은 울산</strong>은 <br />어떤 모습일까?</span><i aria-hidden="true"></i></li>
						<li><span><strong>내가 만들고 싶은 울산</strong>은 <br />어떤 모습일까?</span><i aria-hidden="true"></i></li>
					</ul>

					<div className="video_check">
						<p>영상을 모두 시청하면 다음 순서로 이동할 수 있어요!</p>
						<ul>
							<li className="on">첫 번째 영상</li>
							<li>두 번째 영상</li>
							<li>세 번째 영상</li>
						</ul>
					</div>
					<a href="/student/quest01.html" className="btn btn_wbb flex_center btn_next_page" onClick={(event) => {
						event.preventDefault()
						navigate('/student/quest01')
					}}>사건 탐구 시작하기</a>
				</div>
			</section>
		</main>
	)
}

import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

export const Quest01EndPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">살기 좋은 곳 IN THE WORLD</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<div className="page_end quest_end01">
					<div className="tit_area flex_center colm">
						<h2 className="end_tit">퀘스트1 수행 완료!</h2>
						<p>우리 모둠 친구들이 함께 고른 <strong>'가장 살기 좋은 나라'</strong>는 어디인가요?<br />세계 여러 나라의 살기 좋은 조건들을 탐구해보았어요.</p>
					</div>
					<div className="stamp_box">
						<h3 className="tit">퀘스트1 도장 획득 !</h3>
						<div className="large" aria-hidden="true"><img src="/pub/images/icon_stamp01_large.svg" alt="" /></div>
						<ul className="stamp_area"><li className="i1 on">퀘스트1 도장</li><li className="i2">퀘스트2 도장</li><li className="i3">퀘스트3 도장</li><li className="i4">퀘스트4 도장</li></ul>
					</div>
					<div className="next_page_qr">
						<h3 className="tit">1층 ESD체험터 사회존</h3>
						<p>다음 이동 장소로 이동하여 QR을 스캔하세요.</p>
						<button className="btn_qr flex_center" onClick={() => navigate('/student/quest02')}>QR 스캔하기</button>
						<input type="file" id="camera-input" accept="image/*" capture="environment" style={{ display: 'none' }} />
					</div>
				</div>
			</section>
		</main>
	)
}

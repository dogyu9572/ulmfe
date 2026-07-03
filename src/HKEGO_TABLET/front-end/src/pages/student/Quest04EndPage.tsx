import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

export const Quest04EndPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">살기 좋은 곳 IN THE WORLD</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<div className="page_end quest_end04">
					<div className="tit_area flex_center colm">
						<h2 className="end_tit">퀘스트4 수행 완료!</h2>
						<p>시간이 흘러 더욱 멋지게 성장하고 변화해 있을<br /><strong>50년 뒤 미래의 울산 모습</strong>을 자유롭게 상상해 보았어요.</p>
					</div>
					<div className="stamp_box">
						<h3 className="tit">퀘스트4 도장 획득 !</h3>
						<div className="large" aria-hidden="true"><img src="/pub/images/icon_stamp04_large.svg" alt="" /></div>
						<ul className="stamp_area"><li className="i1 on">퀘스트1 도장</li><li className="i2 on">퀘스트2 도장</li><li className="i3 on">퀘스트3 도장</li><li className="i4 on">퀘스트4 도장</li></ul>
					</div>
					<div className="next_page_qr">
						<h3 className="tit">목공실</h3>
						<p>다음 이동 장소로 이동하여 QR을 스캔하세요.</p>
						<button className="btn_qr flex_center" onClick={() => navigate('/student/quest05')}>QR 스캔하기</button>
						<input type="file" id="camera-input" accept="image/*" capture="environment" style={{ display: 'none' }} />
					</div>
				</div>
			</section>
		</main>
	)
}

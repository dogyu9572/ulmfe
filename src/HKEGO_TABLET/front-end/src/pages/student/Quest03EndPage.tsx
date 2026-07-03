import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

export const Quest03EndPage = () => {
	const navigate = useNavigate()

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">살기 좋은 곳 IN THE WORLD</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<div className="page_end quest_end03">
					<div className="tit_area flex_center colm">
						<h2 className="end_tit">퀘스트3 수행 완료!</h2>
						<p>깨끗한 환경, 편리한 교통, 양질의 일자리 등<br /><strong>행복한 마을과 도시가 되기 위해 필요한 조건</strong>들을 고민해 보았어요.</p>
					</div>
					<div className="stamp_box">
						<h3 className="tit">퀘스트3 도장 획득 !</h3>
						<div className="large" aria-hidden="true"><img src="/pub/images/icon_stamp03_large.svg" alt="" /></div>
						<ul className="stamp_area"><li className="i1 on">퀘스트1 도장</li><li className="i2 on">퀘스트2 도장</li><li className="i3 on">퀘스트3 도장</li><li className="i4">퀘스트4 도장</li></ul>
					</div>
					<div className="next_page_qr">
						<h3 className="tit">1층 ESD체험터 미디어실</h3>
						<p>다음 이동 장소로 이동하여 QR을 스캔하세요.</p>
						<button className="btn_qr flex_center" onClick={() => navigate('/student/quest04')}>QR 스캔하기</button>
						<input type="file" id="camera-input" accept="image/*" capture="environment" style={{ display: 'none' }} />
					</div>
				</div>
			</section>
		</main>
	)
}

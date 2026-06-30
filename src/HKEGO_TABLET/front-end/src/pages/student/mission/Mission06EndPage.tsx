import { useNavigate } from 'react-router-dom'
import { StudentMissionHeader } from '../../../components/tablet/StudentMissionHeader'

export const Mission06EndPage = () => {
	const navigate = useNavigate()
	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">사회존 미션 수행 완료!</h1>
			<StudentMissionHeader />
			<section className="basic_board">
				<div className="page_end quest_end04">
					<div className="tit_area flex_center colm"><h2 className="end_tit">도서관 미션 수행 완료!</h2><p>SDGs12 약속과 실천 방법을 직접 찾아 기록했어요.<br /><strong>4개 구역 미션을 모두 완료했어요!</strong></p></div>
					<div className="stamp_box">
						<h3 className="tit">획득한 스티커</h3>
						<div className="large flex" aria-hidden="true"><img src="/pub/images/icon_sticker_a01_large.svg" alt="" /><img src="/pub/images/icon_sticker_a02_large.svg" alt="" /><img src="/pub/images/icon_sticker_a03_large.svg" alt="" /></div>
						<div className="stamp_area"><ul className="flex type_sticker2"><li className="i1 on">미션 보너스 스티커1 도장</li><li className="i2 on">미션 보너스 스티커2 도장</li><li className="i3 on">미션 보너스 스티커3 도장</li><li className="i4 on">미션 보너스 스티커3 도장</li></ul></div>
					</div>
					<div className="next_page_qr"><h3 className="tit">실천력 부여</h3><p>별관 1~2층 개방형 열람실로 이동하세요.</p><button className="btn_after flex_center" onClick={() => navigate('/student/mission_end')}>실천력 부여로 이동하기</button></div>
				</div>
			</section>
		</main>
	)
}

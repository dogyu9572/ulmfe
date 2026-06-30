import { MissionShell } from './missionShared'

export const Mission01Page = () => (
	<MissionShell title="도입 영상 시청하기" step="STEP 1 스토리 제시" subtitle="도입 영상 시청하기" location="별관 (러닝도서관) 1층 무대 열람석">
		<div className="page_quest">
			<h2 className="sound_only">영상</h2>
			<ul className="start_video_area"><li className="w100p"><a href="/student/quest_video"><div className="img" aria-hidden="true"><img src="/pub/images/img_start_vission_video.webp" alt="" /></div></a></li></ul>
			<div className="stit icon_think">생각해봐요!</div>
			<ul className="think_list">
				<li><span>내 방안의 물건들이 <br /><strong>괴물로 변한 이유</strong>는 무엇일까?</span><i aria-hidden="true"></i></li>
				<li><span>2050년의 누군가가 <br /><strong>지금의 나에게</strong> <br /><strong>보내온 메시지</strong>는 무엇일까?</span><i aria-hidden="true"></i></li>
				<li><span>지구의 미래를 지키는 <br /><strong>'울산 SDGs 히어로즈'가 되기 위해</strong> <br />내가 할 수 있는 일은 무엇일까?</span><i aria-hidden="true"></i></li>
			</ul>
			<a href="/student/mission02" className="btn btn_wbb flex_center btn_next_page mt">다음 미션으로 이동하기</a>
		</div>
	</MissionShell>
)

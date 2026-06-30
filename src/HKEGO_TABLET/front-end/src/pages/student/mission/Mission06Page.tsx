import { useNavigate } from 'react-router-dom'
import { MissionShell } from './missionShared'

export const Mission06Page = () => {
	const navigate = useNavigate()
	return (
		<MissionShell title="개방형 열람실" step="STEP 3 미션수행 - 도서관" subtitle="개방형 열람실" location="별관 (러닝도서관) 1~2층">
			<div className="page_quest">
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #1</div><h3 className="tit">도서관에서 '우리모두 SDGs' 책을 찾아보세요. 책 속에서 질문의 답을 찾아주세요.</h3><div className="con"><ul className="input_list"><li><label htmlFor="formMissionA01" className="tt">SDGs 12번째 약속은 무엇인가요? 책에서 찾은 내용을 입력해주세요.</label><input type="text" id="formMissionA01" className="text w100p" placeholder="책에서 찾은 내용을 입력해주세요." /></li><li><label htmlFor="formMissionA02" className="tt">이 약속을 지키기 위한 실천 내용 3가지를 기록해보세요.</label><textarea name="" id="formMissionA02" cols={30} rows={5} className="text w100p short" placeholder="세가지 실천 내용을 입력해주세요."></textarea></li></ul></div></div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #2</div><h3 className="tit">소비 습관을 변화시키는 데 도움이 되는 책들을 찾아보고,<br />가장 관심이 가는 책 제목을 기록해주세요.</h3><div className="con"><ul className="input_list"><li><label htmlFor="formMissionB01" className="tt">선택한 책 제목을 입력해주세요.</label><input type="text" id="formMissionB01" className="text w100p" placeholder="선택한 책 제목을 입력해주세요." /></li><li><label htmlFor="formMissionB02" className="tt">왜 이 책에 관심이 갔나요? 이 책을 선택한 이유를 입력해주세요.</label><textarea name="" id="formMissionB02" cols={30} rows={5} className="text w100p short" placeholder="이 책을 선택한 이유를 입력해주세요."></textarea></li></ul></div></div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #3</div><h3 className="tit">4곳의 미션을 모두 돌아보고, 오늘 내가 느낀 것을 정리해보세요.</h3><div className="con"><ul className="input_list"><li><label htmlFor="formMissionC01" className="tt">오늘 미션에서 가장 놀랐거나 새롭게 알게 된 것은?</label><input type="text" id="formMissionC01" className="text w100p" placeholder="예시) 내가 먹다 남긴 음식이 세계 어딘가의 아이에게 영향을 줄 수 있다는 걸 몰랐어요." /></li><li><label htmlFor="formMissionC02" className="tt">오늘 이후 내가 바꿀 소비 습관 한 가지</label><input type="text" id="formMissionC02" className="text w100p" placeholder="예시) 앞으로는 물건을 살 때 누가 어떻게 만들었는지 한 번은 생각해볼게요." /></li></ul></div></div>
				<div className="btns_btm"><button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button className="btn btn_wbb" onClick={() => navigate('/student/mission06_end')}>제출</button></div>
			</div>
		</MissionShell>
	)
}

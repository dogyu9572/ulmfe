import { useNavigate } from 'react-router-dom'
import { CheckboxList, MissionShell } from './missionShared'

export const Mission05Page = () => {
	const navigate = useNavigate()
	return (
		<MissionShell title="함께 살기" step="STEP 3 미션수행 - 사회존" subtitle="함께 살기" location="별관 (러닝도서관) 1층 무대 열람석">
			<div className="page_quest">
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #1</div><h3 className="tit">방에 있는 축구공, 초콜릿, 옷, 핸드폰은 누가 만들고 있었나요?</h3><div className="con"><div className="checkradio_select set3">{['어른', '어린이와 청소년', '노인'].map((item, index) => <div className="box" key={item}><input type="radio" name="importance" id={`formMissionA0${index + 1}`} /><label htmlFor={`formMissionA0${index + 1}`}><span><i></i>{item}</span></label></div>)}</div></div></div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #2</div><h3 className="tit">왜 어린이와 청소년들이 일하고 있었을까요? 해당된다고 생각하는 것을 모두 선택하세요.</h3><div className="con"><CheckboxList name="formMissionB" items={['가족 경제에 보탬이 되려고', '어른보다 어린이에게 적은 돈을 주고 일 시킬 수 있어서', '학교가 없거나 멀어서', '회사가 싸게 물건을 많이 팔기 위해서', '소비자는 ‘누가 어떻게 만들었는지’ 생각하지 않기 때문에']} /></div></div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #3</div><h3 className="tit">우리는 그동안 어떤 소비를 했을까요? 친구들과 대화를 나누고 나의 경험을 써보세요.</h3><div className="con"><ul className="flex_txt"><li className="w100p"><strong>나는 올해</strong> <input type="text" className="text wauto" placeholder="물건 이름" /><strong>을(를) 그냥 샀어요.</strong></li></ul><div className="flex_select"><strong>그 물건을, 누가, 어떻게 만들었는지 생각해본 적은</strong><div className="checkradio_select flex"><div className="box"><input type="radio" name="importance" id="formMissionC01" /><label htmlFor="formMissionC01"><span><i></i>있어요</span></label></div><div className="box"><input type="radio" name="importance" id="formMissionC02" /><label htmlFor="formMissionC02"><span><i></i>없어요</span></label></div></div></div></div></div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #4</div><h3 className="tit">그동안 구매했던 물건을 다시 사야 한다면 어떤 것을 선택할까요?</h3><div className="con"><CheckboxList name="formMissionD" items={['오래 쓸 수 있는 걸 선택할래요.', '공정하게 생산된 제품인지 알아보고 구입할게요.', '갖고 있는 것을 수선해서 쓸래요.', '만든사람과 환경을 생각하고 살래요.']} /><h4 className="ptit">왜 그렇게 생각하는지 이유를 적어주세요.</h4><input type="text" className="text w100p" placeholder="왜 그렇게 생각하는지 이유를 적어주세요." /></div></div>
				<div className="btns_btm"><button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button className="btn btn_wbb" onClick={() => navigate('/student/mission05_end')}>제출</button></div>
			</div>
		</MissionShell>
	)
}

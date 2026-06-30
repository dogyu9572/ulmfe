import { useNavigate } from 'react-router-dom'
import { CheckboxList, MissionShell } from './missionShared'

export const Mission04Page = () => {
	const navigate = useNavigate()
	return (
		<MissionShell title="먹거리" step="STEP 3 미션수행 - 미래존" subtitle="먹거리" location="별관 (러닝도서관) 1~2층">
			<div className="page_quest">
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #1</div><h3 className="tit">헝거맵라이브로 세계의 빈곤 상황을 살펴보세요. 기아 상태가 심각한 지역 3곳을 기록하세요.</h3><div className="con"><ul className="input_list">{[1, 2, 3].map((num) => <li key={num}><label htmlFor={`formMissionA0${num}`} className="tt">기아 심각 지역 {num}</label><input type="text" id={`formMissionA0${num}`} className="text w100p" placeholder={`기아 심각 지역 ${num}을(를) 입력해주세요.`} /></li>)}</ul></div></div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #2</div><h3 className="tit">어제 먹은 음식 중 남긴 것을 서로 말해보세요. 그 음식은 왜 남겼나요?</h3><div className="con"><CheckboxList name="formMissionB" items={['양이 많아서', '맛이 없어서', '습관적으로', '다른 것을 먹으려고']} /></div></div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #3</div><h3 className="tit">식량이 부족한 지역과 나의 소비 습관은 어떻게 연결될까요? 문장을 완성하세요.</h3><div className="con"><ul className="flex_txt"><li><strong>나는</strong> <input type="text" className="text" placeholder="남긴 이유" /></li><li><strong>때문에,</strong> <input type="text" className="text" placeholder="음식 이름" /></li><li><strong>을 남겼지만,</strong> <input type="text" className="text" placeholder="지역/국가명" /></li><li><strong>에서는 식량이 부족해요.</strong></li></ul></div></div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #4</div><h3 className="tit">음식 소비 습관 중 내가 실천할 수 있는 행동을 선택하세요.</h3><div className="con"><CheckboxList name="formMissionD" items={['필요한 만큼만 식재료와 음식을 살래요.', '먹을 양만큼만 덜어먹을래요.', '편식하지 않고 골고루 남기지 않고 먹을래요.', '음식 양이 많으면 친구, 이웃과 나눠 먹을래요.', '계획적으로 음식이나 재료를 구매할래요.']} /></div></div>
				<div className="btns_btm"><button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button className="btn btn_wbb" onClick={() => navigate('/student/mission04_end')}>제출</button></div>
			</div>
		</MissionShell>
	)
}

import { useNavigate } from 'react-router-dom'
import { CheckboxList, MissionShell } from './missionShared'

export const Mission03Page = () => {
	const navigate = useNavigate()
	return (
		<MissionShell title="모두의 자원과 에너지" step="STEP 3 미션수행 - 지구존" subtitle="모두의 자원과 에너지" location="별관 (러닝도서관) 1~2층">
			<div className="page_quest">
				<div className="wbox a_card_box">
					<div className="card_top">문항풀이 #1</div>
					<h3 className="tit">목장갑, 가방, 수선된 옷에 대한 전시를 보고 <br />이 물건들과 관련된 과거 모습이나 사물을 찾아 주세요.</h3>
					<div className="con"><ul className="input_list half_list">{['목장갑', '트럭 방수포', '가방', '티셔츠', '점퍼', '미싱'].map((item, index) => <li key={item}><label htmlFor={`formMissionA0${index + 1}`} className="tt">{item} → 연결되는 것</label><input type="text" id={`formMissionA0${index + 1}`} className="text w100p" placeholder={`${item}과 연결되는 것을 입력해주세요.`} /></li>)}</ul></div>
				</div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #2</div><h3 className="tit">친구들과 전시에 대한 이야기를 나누고 내가 실천할 수 있는 행동을 선택하세요.</h3><div className="con"><CheckboxList name="formMissionB" items={['옷을 수선해서 오래 입을래요', '재활용 방법과 제품에 관심을 가질래요.', '물건을 아껴 쓰고 나눠 쓸래요.']} /></div></div>
				<div className="wbox a_card_box">
					<div className="card_top">문항풀이 #3</div>
					<div className="tit colm"><h3>마트에서 1인당 1개의 상품만을 구입할 수 있습니다. <br />생태발자국을 확인하고 가장 큰 제품과 작은 제품은? 왜 차이가 날지 생각해보세요.</h3>
						<ul className="wbox item_list">{[['img_mission_item01.webp', '티셔츠', '8.2gha'], ['img_mission_item02.webp', '스마트폰', '16.4gha'], ['img_mission_item03.webp', '운동화', '11.7gha'], ['img_mission_item04.webp', '가방', '6.8gha'], ['img_mission_item05.webp', '책', '3.1gha'], ['img_mission_item06.webp', '샴푸', '4.5gha']].map(([image, title, text]) => <li key={title}><i aria-hidden="true"><img src={`/pub/images/${image}`} alt="" /></i><strong>{title}</strong><p>생태발자국 <br />{text}</p></li>)}</ul>
					</div>
					<div className="con"><ul className="input_list">
						<li><label htmlFor="formMissionC01" className="tt">생태발자국이 가장 큰 제품은?</label><input type="text" id="formMissionC01" className="text w100p" placeholder="생태발자국이 가장 큰 제품을 입력해주세요." /></li>
						<li><label htmlFor="formMissionC02" className="tt">생태발자국이 가장 작은 제품은?</label><input type="text" id="formMissionC02" className="text w100p" placeholder="생태발자국이 가장 작은 제품을 입력해주세요." /></li>
						<li><label htmlFor="formMissionC03" className="tt">차이 이유를 적어보세요.</label><input type="text" id="formMissionC03" className="text w100p" placeholder="차이 이유를 입력해주세요." /></li>
					</ul></div>
				</div>
				<div className="wbox a_card_box"><div className="card_top">문항풀이 #4</div><h3 className="tit">마트에서 물건을 구입할 때 달라질 행동을 선택해주세요.</h3><div className="con"><CheckboxList name="formMissionD" items={['포장이 적은 제품을 선택할래요.', '가까운 지역에서 생산된 제품을 소비할래요.', '재사용/리필 가능한 제품을 이용할래요.']} /></div></div>
				<div className="btns_btm"><button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button><button className="btn btn_wbb" onClick={() => navigate('/student/mission03_end')}>제출</button></div>
			</div>
		</MissionShell>
	)
}

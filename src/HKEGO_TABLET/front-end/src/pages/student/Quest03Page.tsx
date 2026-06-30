import { ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

const importanceItems = [
	'깨끗한 환경',
	'좋은 이웃',
	'양질의 일자리',
	'편리한 교통',
	'안전한 거리',
	'멋진 자연 경관',
	'우수한 교육 환경',
	'저렴한 집값',
	'모두가 존중받는 곳'
]

export const Quest03Page = () => {
	const navigate = useNavigate()
	const [checkedItems, setCheckedItems] = useState<string[]>([])

	const handleImportanceChange = (event: ChangeEvent<HTMLInputElement>, item: string) => {
		if (!event.target.checked) {
			setCheckedItems((prev) => prev.filter((value) => value !== item))
			return
		}

		if (checkedItems.length >= 3) {
			alert('최대 3개까지만 선택할 수 있습니다.')
			return
		}

		setCheckedItems((prev) => [...prev, item])
	}

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">함께 만드는 행복한 울산</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 2 사건탐색 - 퀘스트3</div>
					<div className="subtitle"><strong>함께 만드는 행복한 울산</strong></div>
					<div className="location">1층 ESD체험터 사회존</div>
				</div>

				<div className="page_quest">
					<div className="wbox q_card_box type2">
						<div className="card_top">미션카드</div>
						<h2 className="btit">우리 동네 행복 우선순위 투표소</h2>
						<p>다정한 마을에는 다양한 사회 구성원이 서로에 대한 존중을 바탕으로 함께 어울려 살고 있습니다. <br />
							ESD체험터에서 다정한 마을은 어떤 모습일까에 대한 소개를 들어보고, <br />
							이를 바탕으로 여러분이 생각하는 살기 좋은 곳은 어떤 조건들을 갖추어야 하는지<br />
							10가지의 ‘행복 마을 카드’를 보며 모둠 친구들과 함께 중요한 조건 3가지를 선정해 봅시다.
						</p>
						<div className="photo_area imgfit" aria-hidden="true">
							<img src="/pub/images/img_quest3_photo.webp" alt="" />
						</div>
					</div>

					<div className="wbox a_card_box">
						<div className="card_top">문항풀이 #1</div>
						<h3 className="tit">행복한 도시의 조건! 가장 중요한 것을 3가지 골라봐요</h3>
						<div className="con">
							<div className="checkradio_select set4">
								{importanceItems.map((item, index) => {
									const id = `importance${String(index + 1).padStart(2, '0')}`
									return (
										<div className="box" key={id}>
											<input type="checkbox" name="importance" id={id} checked={checkedItems.includes(item)} onChange={(event) => handleImportanceChange(event, item)} />
											<label htmlFor={id}><span><i></i>{item}</span></label>
										</div>
									)
								})}
							</div>
						</div>
					</div>

					<div className="btns_btm">
						<button className="btn btn_kwg" onClick={() => navigate(-1)}>이전</button>
						<button className="btn btn_wbb" onClick={() => navigate('/student/quest03_2')}>다음</button>
					</div>
				</div>
			</section>
		</main>
	)
}

import { withBasePath } from '@/lib/basePath'
export default function AboutGreetingContent() {
	return (
		<>
			<section className="about_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"인사말"}
				</h1>
				<div className="page_top_box about_top mb0">
					<div className="dda">
						{"지속가능한 미래, 학생들이 직접 만들어갑니다"}
					</div>
					<p>
						{"울산광역시미래교육관 누리집을 찾아주신 여러분을 환영합니다."}
					</p>
				</div>
				<div className="about_area">
					<div className="tit">
						<p>
							{"울산광역시미래교육관은 UN 지속가능발전목표(SDGs)를 기반으로,"}
							<br className="pc_vw" />
							{"학생들이 사회·환경·경제 문제를 스스로 탐구하고 해결책을 찾아가는 지속가능발전교육(ESD) 학생 체험 기관입니다."}
							<br className="pc_vw" />
							{"프로젝트 중심 체험활동, 도서관, 메이커실 등 다양한 교육 공간을 통해 학생들은 미래 사회를 이끌어 갈 역량을 기르고,"}
							<br className="pc_vw" />
							{"지구와 이웃을 함께 생각하는 세계시민으로 성장해 나갑니다."}
							<br />
						</p>
					</div>
					<ul className="ibox">
						<li className="i1">
							{"울산의 문제에서 출발해 세계의 미래를 "}
							<br className="pc_vw" />
							{"함께 고민하는 공간이 되겠습니다."}
						</li>
						<li className="i2">
							{"학생 한 명 한명이 지속가능한 삶의 주체로 "}
							<br className="pc_vw" />
							{"성장할 수 있도록 함께 걸어가겠습니다."}
						</li>
						<li className="i3">
							{"학교 · 가정 · 지역사회와 손잡고, "}
							<br className="pc_vw" />
							{"울산 미래교육의 든든한 파트너가 되겠습니다."}
						</li>
					</ul>
					<div className="btm">
						<p>
							{"울산광역시미래교육관은 학생 한 명 한 명이 지속가능한 미래를 설계하는 주인공이 될 수 있도록 앞으로도 최선을 다하겠습니다."}
							<br />
							{"감사합니다."}
						</p>
						<div className="sign">
							{"울산광역시미래교육관 직원 일동"}
							{/* <img src={withBasePath('/pub/images/img_sign.webp')} alt="홍길동" title="홍길동" /> */}
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

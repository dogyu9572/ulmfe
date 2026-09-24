import { withBasePath } from '@/lib/basePath'
export default function AboutVisionContent() {
	return (
		<>
			<section className="about_wrap" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"미션 및 비전"}
				</h1>
				{/* <div className="mission_vision01">
					<div className="inner">
						<div className="inbox">
							<h2 className="ctit">
								{"울산광역시미래교육관이 나아가는 방향을 소개합니다"}
							</h2>
							<div className="flex_center">
								<div className="tit">
									{"지속가능성을 위한 전방위적 박물관 접근"}
								</div>
							</div>
							<div className="chart_area">
								<h3 className="center flex_center">
									{"지속가능성에 대한 질문과 탐색이 실천으로 이어지는 전시게임"}
								</h3>
								<ul>
									<li className="i1 left">
										<span>
											{"01"}
										</span>
										<h4>
											{"이야기형 콘텐츠"}
										</h4>
										<p>
											{"지속가능성을 위한 행동으로 "}
											<br className="pc_vw" />
											{"이끄는 스토리텔링"}
										</p>
									</li>
									<li className="i2 left">
										<span>
											{"02"}
										</span>
										<h4>
											{"확장형 콘텐츠"}
										</h4>
										<p>
											{"지역에서 전지구적 문제로 "}
											<br className="pc_vw" />
											{"확장되는 테마"}
										</p>
									</li>
									<li className="i3 left">
										<span>
											{"03"}
										</span>
										<h4>
											{"통합형 콘텐츠"}
										</h4>
										<p>
											{"지역, 국가, 환경, 세대, 계층의 "}
											<br className="pc_vw" />
											{"다양한 관점 반영"}
										</p>
									</li>
									<li className="i4 right">
										<span>
											{"04"}
										</span>
										<h4>
											{"지속가능한 전시"}
										</h4>
										<p>
											{"지속가능성의 가치를 "}
											<br className="pc_vw" />
											{"재료와 마감으로 연출"}
										</p>
									</li>
									<li className="i5 right">
										<span>
											{"05"}
										</span>
										<h4>
											{"상호작용형 콘텐츠"}
										</h4>
										<p>
											{"체험자의 선택과 반응에 따라 "}
											<br className="pc_vw" />
											{"전개가 달라지는 참여형 전시"}
										</p>
									</li>
									<li className="i6 right">
										<span>
											{"06"}
										</span>
										<h4>
											{"패턴형 콘텐츠"}
										</h4>
										<p>
											{"질문 · 탐색 · 실천으로 "}
											<br className="pc_vw" />
											{"이어지는 체험 구성"}
										</p>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div> */}
				<div className="mission_vision02 gbox">
					<div className="inner">
						<h2 className="ctit">
							{/* {"미션 & 비전"} */}
						</h2>
						<ul className="missvis">
							<li className="i1">
								<div className="imgfit" aria-hidden="true">
									<img src={withBasePath('/pub/images/img_mission_vision03_01.webp')} alt="" />
								</div>
								<div className="txt">
									<div className="tit">
										<h3>
											{"비전"}
										</h3>
									</div>
									<p>
										{"지속가능한 삶을 누리는 미래 시민 양성"}
									</p>
								</div>
							</li>
							<li className="i2">
								<div className="imgfit" aria-hidden="true">
									<img src={withBasePath('/pub/images/img_mission_vision03_02.webp')} alt="" />
								</div>
								<div className="txt">
									<div className="tit">
										<h3>
											{"지향가치"}
										</h3>
									</div>
									<p>
										{"지속가능성을 꿈꾸며 내일을 열다."}
										<br />
										{"Dreaming of sustainability, Opening the future"}
									</p>
								</div>
							</li>
							<li className="i3">
								<div className="imgfit" aria-hidden="true">
									<img src={withBasePath('/pub/images/img_mission_vision03_03.webp')} alt="" />
								</div>
								<div className="txt">
									<div className="tit">
										<h3>
											{"목표"}
										</h3>
									</div>
									<p>
										{"지속가능성을 이해하고 함께 실천하는 문화 확산"}
									</p>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<div className="mission_vision03">
					<div className="inner">
						<h2 className="ctit">
							{"핵심 가치"}
						</h2>
						<ul className="flex core_values">
							<li className="i1">
								<span>
									{"학생 중심"}
								</span>
								<h3>
									{"교육과정연계 & 프로그램 운영"}
								</h3>
								<p>
									{"학교단위 지속가능발전교육 프로그램 운영"}
									<br className="pc_vw" />
									{"지속가능 진로교육 프로그램 운영"}
									<br className="pc_vw" />
									{"학생주도 지속가능발전교육 프로그램 운영"}
								</p>
							</li>
							<li className="i2">
								<span>
									{"가족 중심"}
								</span>
								<h3>
									{"지속가능실천력 함양 & 프로그램 운영"}
								</h3>
								<p>
									{"지속가능발전교육 가족프로그램 운영"}
									<br className="pc_vw" />
									{"지속가능생태체험 가족프로그램 운영"}
								</p>
							</li>
							<li className="i3">
								<span>
									{"교육공동체중심"}
								</span>
								<h3>
									{"협력적 지속가능발전교육 & 프로그램 운영"}
								</h3>
								<p>
									{"지속가능발전 공연ㆍ전시체험 운영"}
									<br className="pc_vw" />
									{"지속가능 미래문화 확산 프로그램 운영"}
								</p>
							</li>
						</ul>
						{/* <h2 className="ctit">
							{"운영방향"}
						</h2>
						<ul className="flex operational_direction">
							<li className="i1">
								{"울산 미래교육의 가치를 "}
								<br className="pc_vw" />
								{"실현하는 공간"}
							</li>
							<li className="i2">
								{"지속가능발전교육(ESD)의 "}
								<br className="pc_vw" />
								{"가치를 인식하고 실천할 수 있는 공간"}
							</li>
							<li className="i3">
								{"융합 프로젝트 학습 기반 교육으로 "}
								<br className="pc_vw" />
								{"학교 교육 과정 연계 지원"}
							</li>
							<li className="i4">
								{"지역사회가 참여하는 "}
								<br className="pc_vw" />
								{"학습지원 네트워크 구축 및 연계 교육"}
							</li>
						</ul> */}
						<h2 className="ctit">
							{"공간 구성"}
						</h2>
						<div className="tbl">
							<table>
								<colgroup>
									<col className="w160" />
									<col className="w160" />
									<col />
								</colgroup>
								<tbody>
									<tr>
										<th>
											{"개요"}
										</th>
										<td className="tal" colSpan={2}>
											{"(건축면적) 9,446㎡, (연면적) 11,218㎡, 지상3층, 지하1층, 별관"}
										</td>
									</tr>
									<tr>
										<th>
											{"4F"}
										</th>
										<td className="tal" colSpan={2}>
											{"달빛마루, 별빛마루, 유포석보전망대, 바다전망대"}
										</td>
									</tr>
									<tr>
										<th>
											{"3F"}
										</th>
										<th>
											{"모험 DO"}
										</th>
										<td className="tal">
											<strong>
												{"놀이와 교육이 혼합된 모험형 체험 공간"}
											</strong>
											<br />
											{"ESD모험터, 휴게실, 사무공간"}
										</td>
									</tr>
									<tr>
										<th>
											{"2F"}
										</th>
										<th>
											{"탐구 DO"}
										</th>
										<td className="tal">
											<strong>
												{"생각을 나누고 자유롭게 창작하는 프로젝트 공간"}
											</strong>
											<br />
											{"곰곰랩, 뚝딱, 조물, 보글, 상상제작, 미디어제작"}
										</td>
									</tr>
									<tr>
										<th>
											{"1F"}
										</th>
										<th>
											{"질문 DO"}
										</th>
										<td className="tal">
											<strong>
												{"지속가능성을 체험하고 생각을 촉진하는 체험 공간"}
											</strong>
											<br />
											{"ESD 체험터, 기획전시, ESD 놀이터, 이야기터"}
										</td>
									</tr>
									<tr>
										<th>
											{"별관"}
										</th>
										<th>
											{"생각 DO"}
										</th>
										<td className="tal">
											<strong>
												{"자료수집 및 정보를 공유하는 탐색 공간"}
											</strong>
											<br />
											{"미래도서관, 회의실, 강동초기억실"}
										</td>
									</tr>
									<tr>
										<th>
											{"야외"}
										</th>
										<th>
											{"놀이 DO"}
										</th>
										<td className="tal">
											<strong>
												{"쉼, 숲, 놀이가 어우러진 친환경 생태 공간"}
											</strong>
											<br />
											{"고래마당, 모래마당, 습지정원, 곤충호텔"}
										</td>
									</tr>
									<tr>
										<th>
											{"B1"}
										</th>
										<td className="tal" colSpan={2}>
											{"수장고, 재활용창고, 전기실, 기계실, 발전기실"}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

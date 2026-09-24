import { withBasePath } from '@/lib/basePath'
export default function LibraryInfoContent() {
	return (
		<>
			<section className="library_wrap" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"도서관 안내"}
				</h1>
				<div className="inner">
					<div className="page_top_box library_top">
						{"울산광역시미래교육관 도서관은 "}
						<br className="pc_vw" />
						{"학생과 시민 모두가 지속가능한 삶의 주인공으로 성장할 수 있도록, "}
						<br className="pc_vw" />
						{"누구나 자유롭게 지식과 정보에 접근할 수 있는 열린 환경을 제공하기 위해 최선을 다하고 있습니다."}
					</div>
				</div>
				<div className="gbox library_info_area">
					<div className="inner">
						<div className="lrbox_area">
							{/* 이용안내 및 이용절차는 개관 전까지 비노출 */}
							{/* <div className="lrbox">
								<h2 className="tit">
									{"이용안내"}
								</h2>
								<div className="con">
									<ul className="user_infobox">
										<li className="c1">
											<h3 className="tt">
												{"운영시간"}
											</h3>
											<span>
												{"개관 후 안내"}
											</span>
										</li>
										<li className="c2">
											<h3 className="tt">
												{"휴관일"}
											</h3>
											<span>
												{"매주 수요일 / 공휴일"}
											</span>
										</li>
										<li className="c3">
											<h3 className="tt">
												{"문의"}
											</h3>
											<span>
												{"052-###-####"}
											</span>
										</li>
									</ul>
								</div>
							</div> */}
							{/* <div className="lrbox">
								<h2 className="tit">
									{"이용절차"}
								</h2>
								<div className="con">
									<div className="stit">
										<h3>
											{"일반방문"}
										</h3>
										<span>
											{"(자유열람)"}
										</span>
									</div>
									<ol className="info_step type1">
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_a01.svg')} alt="" />
											</i>
											<span>
												{"STEP 01"}
											</span>
											<h4>
												{"입장"}
											</h4>
											<p>
												{"1층 로비 도서분실방지 게이트 통과"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_a02.svg')} alt="" />
											</i>
											<span>
												{"STEP 02"}
											</span>
											<h4>
												{"소지품 보관"}
											</h4>
											<p>
												{"1층 물품보관소 전자개폐식 락커 이용"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_a03.svg')} alt="" />
											</i>
											<span>
												{"STEP 03"}
											</span>
											<h4>
												{"자료 검색"}
											</h4>
											<p>
												{"정보검색대에서 소장 자료 검색 및 위치 출력"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_a04.svg')} alt="" />
											</i>
											<span>
												{"STEP 04"}
											</span>
											<h4>
												{"자유 열람"}
											</h4>
											<p>
												{"1층 또는 2층 개방형 서가 · 열람실에서 자유롭게 열람"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_a05.svg')} alt="" />
											</i>
											<span>
												{"STEP 05"}
											</span>
											<h4>
												{"대출 · 반납"}
											</h4>
											<p>
												{"안내데스크 또는 무인대출반납기 이용"}
											</p>
										</li>
									</ol>
									<div className="stit">
										<h3>
											{"단체방문"}
										</h3>
										<span>
											{"(사건탐구 프로그램 연계 이용 - 사후 심화 자료 탐색)"}
										</span>
									</div>
									<ol className="info_step type2">
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_b01.svg')} alt="" />
											</i>
											<span>
												{"STEP 01"}
											</span>
											<h4>
												{"예약"}
											</h4>
											<p>
												{"교육청 홈페이지 예약 (개관 후 별도 안내)"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_b02.svg')} alt="" />
											</i>
											<span>
												{"STEP 02"}
											</span>
											<h4>
												{"입장 · 오리엔테이션"}
											</h4>
											<p>
												{"1층 무대에서 이용안내 및 OT 진행"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_b03.svg')} alt="" />
											</i>
											<span>
												{"STEP 03"}
											</span>
											<h4>
												{"자료 탐색"}
											</h4>
											<p>
												{"프로젝트 수업 주제 관련 자료 탐색 및 열람"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_b04.svg')} alt="" />
											</i>
											<span>
												{"STEP 04"}
											</span>
											<h4>
												{"심화 활동(선택)"}
											</h4>
											<p>
												{"회의실에서 소그룹 토론 · 탐구 활동"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_b05.svg')} alt="" />
											</i>
											<span>
												{"STEP 05"}
											</span>
											<h4>
												{"마무리"}
											</h4>
											<p>
												{"대출 · 반납 후 퇴장"}
											</p>
										</li>
									</ol>
									<div className="stit">
										<h3>
											{"단체방문"}
										</h3>
										<span>
											{"(미션 프로그램 연계 이용)"}
										</span>
									</div>
									<ol className="info_step type3">
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_c01.svg')} alt="" />
											</i>
											<span>
												{"STEP 01"}
											</span>
											<h4>
												{"1층 무대"}
											</h4>
											<p>
												{"미션 스토리 제시"}
												<br />
												{"영상 관람 (10분)"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_c02.svg')} alt="" />
											</i>
											<span>
												{"STEP 02"}
											</span>
											<h4>
												{"1~2층 열람실"}
											</h4>
											<p>
												{"팀별 미션, 동선 확인"}
												<br />
												{"(20분)"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_c03.svg')} alt="" />
											</i>
											<span>
												{"STEP 03"}
											</span>
											<h4>
												{"ESD체험터 이동"}
											</h4>
											<p>
												{"각 존 미션 수행"}
												<br />
												{"(100분)"}
											</p>
										</li>
										<li>
											<i aria-hidden="true">
												<img src={withBasePath('/pub/images/icon_info_step_c01.svg')} alt="" />
											</i>
											<span>
												{"STEP 04"}
											</span>
											<h4>
												{"1층 무대 복귀"}
											</h4>
											<p>
												{"회의실에서 소그룹"}
												<br className="pc_vw" />
												{"토론 · 탐SDGs 히어로즈 완성 · 마무리 (10분)구 활동"}
											</p>
										</li>
									</ol>
								</div>
							</div> */}
							<div className="lrbox">
								<h2 className="tit">
									{"시설현황"}
								</h2>
								<div className="con facility_status_area">
									<div className="imgbox flex_center">
										<img src={withBasePath('/pub/images/img_facility_status.webp')} alt="" />
									</div>
									<div className="tbl">
										<table>
											<caption>
												{"시설현황 목록"}
											</caption>
											<thead>
												<tr>
													<th scope="col">{"위치"}</th>
													<th scope="col">{"시설"}</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<th scope="row">{"1층"}</th>
													<td className="tal">{"안내데스크, 물품 보관소, 무대"}</td>
												</tr>
												<tr>
													<th scope="row">{"1층 ~ 2층"}</th>
													<td className="tal">{"개방형 서가"}</td>
												</tr>
												<tr>
													<th scope="row">{"2층"}</th>
													<td className="tal">{"강동초 기억실, 회의실 1·2"}</td>
												</tr>
											</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="lrbox">
							<h2 className="tit">
								{"이용안내"}
							</h2>
							<div className="con library_info_excl">
								<ul className="list">
									<li className="i1">
										{"미래도서관 도서는 열람만 가능합니다."}
									</li>
									<li className="i3">
										{"음식물 반입은 삼가 주시기 바랍니다."}
									</li>
									<li className="i5">
										{"회의실 이용은 사전 예약 후 이용 가능합니다."}
									</li>
								</ul>
							</div>
						</div>
						<div className="lrbox">
							<h2 className="tit">
								{"도서현황"}
							</h2>
							<div className="con library_data_status">
								<div className="stit">
									<h3>
										{"도서현황"}
									</h3>
									<span>
										{"(단위 : 권)"}
									</span>
								</div>
								<div className="tbl wide">
									<table>
										<caption>
											{"도서현황 목록"}
										</caption>
										<thead>
											<tr>
												<th>
													{"총류"}
												</th>
												<th>
													{"철학"}
												</th>
												<th>
													{"종교"}
												</th>
												<th>
													{"사회과학"}
												</th>
												<th>
													{"자연과학"}
												</th>
												<th>
													{"기술과학"}
												</th>
												<th>
													{"예술"}
												</th>
												<th>
													{"언어"}
												</th>
												<th>
													{"문학"}
												</th>
												<th>
													{"역사"}
												</th>
												<th>
													{"계"}
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													{"8,300"}
												</td>
												<td>
													{"15,414"}
												</td>
												<td>
													{"8,688"}
												</td>
												<td>
													{"43,201"}
												</td>
												<td>
													{"18,000"}
												</td>
												<td>
													{"17,307"}
												</td>
												<td>
													{"12,327"}
												</td>
												<td>
													{"9,160"}
												</td>
												<td>
													{"110,308"}
												</td>
												<td>
													{"22,903"}
												</td>
												<td>
													{"265,608"}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								
								{/* 비도서현황 및 연속간행물현황은 도서현황 단일 메뉴로 통합되어 노출하지 않습니다.
								<div className="tbl">
									<table>
										<caption>
											{"비도서현황 목록"}
										</caption>
										<thead>
											<tr>
												<th>
													{"DVD"}
												</th>
												<th>
													{"CD"}
												</th>
												<th>
													{"CD-ROM"}
												</th>
												<th>
													{"녹음도서"}
												</th>
												<th>
													{"수화도서"}
												</th>
												<th>
													{"계"}
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													{"12,926"}
												</td>
												<td>
													{"7"}
												</td>
												<td>
													{"100"}
												</td>
												<td>
													{"2,115"}
												</td>
												<td>
													{"72"}
												</td>
												<td>
													{"15,220"}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<div className="stit">
									<h3>
										{"연속간행물현황"}
									</h3>
									<span>
										{"(단위 : 종)"}
									</span>
								</div>
								<div className="tbl">
									<table>
										<caption>
											{"연속간행물현황 목록"}
										</caption>
										<thead>
											<tr>
												<th>
													{"구분"}
												</th>
												<th>
													{"신문"}
												</th>
												<th>
													{"잡지"}
												</th>
												<th>
													{"기타(사보, 학회지 등)"}
												</th>
												<th>
													{"계"}
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<th>
													{"구입"}
												</th>
												<td>
													{"32"}
												</td>
												<td>
													{"100"}
												</td>
												<td>
													{"-"}
												</td>
												<td>
													{"132"}
												</td>
											</tr>
											<tr>
												<th>
													{"기증"}
												</th>
												<td>
													{"15"}
												</td>
												<td>
													{"114"}
												</td>
												<td>
													{"-"}
												</td>
												<td>
													{"129"}
												</td>
											</tr>
											<tr>
												<th>
													{"소계"}
												</th>
												<td>
													{"47"}
												</td>
												<td>
													{"214"}
												</td>
												<td>
													{"-"}
												</td>
												<td>
													{"261"}
												</td>
											</tr>
										</tbody>
									</table>
								</div> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section >
		</>
	)
}

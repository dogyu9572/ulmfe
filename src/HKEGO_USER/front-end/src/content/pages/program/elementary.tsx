export default function ProgramElementaryContent() {
	return (
		<>
			<section className="program_wrap" aria-labelledby="page-title">
				<div className="inner">
					<h1 id="page-title" className="subtitle">
						{"사건탐구 프로그램(초5)"}
					</h1>
					<div className="page_top_box elementary_top">
						{"울산의 문제에서 출발해 세계의 미래를 탐구합니다. "}
						<br />
						{"퀘스트를 수행하며 직접 해결책을 만들어보세요. "}
						<a href="/program/reserve" className="btn_link">
							{"프로그램 예약하기"}
						</a>
					</div>
				</div>
				<div className="gbox pb_last">
					<div className="inner lrbox_area program_area">
						<div className="lrbox">
							<h2 className="tit">
								{"사건탐구 "}
								<br className="pc_vw" />
								{"프로그램이란?"}
							</h2>
							<div className="con">
								<div className="imgfit" aria-hidden="true">
									<img src="/pub/images/img_elementary01.webp" alt="" />
								</div>
								<p>
									{"사건의 원인·결과를 중심으로 탐구하는 지속가능발전교육 기본 교육 프로그램입니다."}
								</p>
							</div>
						</div>
						<div className="lrbox">
							<h2 className="tit">
								{"진행 방식"}
							</h2>
							<div className="con">
								<div className="tbl">
									<table>
										<colgroup>
											<col className="w240" />
											<col className="w240" />
											<col />
										</colgroup>
										<thead>
											<tr>
												<th>
													{"순서"}
												</th>
												<th>
													{"명칭"}
												</th>
												<th>
													{"내용"}
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<th>
													{"STEP1"}
												</th>
												<td>
													{"사건제시"}
												</td>
												<td className="tal">
													{"울산 지역의 사건을 스토리·콘셉트·러닝맵으로 제시받아요."}
													<br />
													{"\"어떤 문제가 일어나고 있을까?\""}
												</td>
											</tr>
											<tr>
												<th>
													{"STEP2"}
												</th>
												<td>
													{"사건탐색"}
												</td>
												<td className="tal">
													{"퀘스트 1~4를 수행하며 사건의 원인과 결과를 "}
													<br className="pc_vw" />
													{"사회·경제·환경·문화적 관점에서 탐구해요."}
												</td>
											</tr>
											<tr>
												<th>
													{"STEP3"}
												</th>
												<td>
													{"사건해결"}
												</td>
												<td className="tal">
													{"체험하기(Experience) → 기획하기(Design) → 만들기(Making) "}
													<br className="pc_vw" />
													{"활동을 통해 직접 해결책을 만들어요."}
												</td>
											</tr>
											<tr>
												<th>
													{"STEP4"}
												</th>
												<td>
													{"정리·일반화"}
												</td>
												<td className="tal">
													{"모둠 발표와 퀴즈로 학습을 정리하고 "}
													<br className="pc_vw" />
													{"생활 속 실천 방법을 찾아봐요."}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="lrbox">
							<h2 className="tit">
								{"사건탐구 "}
								<br className="pc_vw" />
								{"프로그램 목록"}
							</h2>
							<ul className="con program_list program_types">
								<li>
									<div className="imgfit" aria-hidden="true">
										<img src="/pub/images/img_elementary02_1.webp" alt="" />
									</div>
									<div className="txt">
										<h3>
											{"살고 싶은 곳, 울산"}
										</h3>
										<a href="/program/elementary1" className="btn_link">
											{"자세히 보기"}
										</a>
									</div>
								</li>
								<li>
									<div className="imgfit" aria-hidden="true">
										<img src="/pub/images/img_elementary02_2.webp" alt="" />
									</div>
									<div className="txt">
										<h3>
											{"모두를 위한 가게, 나도 사장님"}
										</h3>
										<a href="/program/elementary2" className="btn_link">
											{"자세히 보기"}
										</a>
									</div>
								</li>
								<li>
									<div className="imgfit" aria-hidden="true">
										<img src="/pub/images/img_elementary02_3.webp" alt="" />
									</div>
									<div className="txt">
										<h3>
											{"몽돌이 데굴데굴"}
										</h3>
										<a href="/program/elementary3" className="btn_link">
											{"자세히 보기"}
										</a>
									</div>
								</li>
								<li>
									<div className="imgfit" aria-hidden="true">
										<img src="/pub/images/img_elementary02_4.webp" alt="" />
									</div>
									<div className="txt">
										<h3>
											{"유포석보 복원 프로젝트"}
										</h3>
										<a href="/program/elementary4" className="btn_link">
											{"자세히 보기"}
										</a>
									</div>
								</li>
								<li>
									<div className="imgfit" aria-hidden="true">
										<img src="/pub/images/img_elementary02_5.webp" alt="" />
									</div>
									<div className="txt">
										<h3>
											{"지구를 구하는 요리사"}
										</h3>
										<a href="/program/elementary5" className="btn_link">
											{"자세히 보기"}
										</a>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

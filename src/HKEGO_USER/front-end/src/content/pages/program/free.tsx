import { withBasePath } from '@/lib/basePath'
export default function ProgramFreeContent() {
	return (
		<>
			<section className="program_wrap" aria-labelledby="page-title">
				<div className="inner">
					<h1 id="page-title" className="subtitle">
						{"자유 체험"}
					</h1>
					<div className="page_top_box free_top">
						{"팀과 함께 퀘스트를 수행하며 "}
						<br />
						{"재미와 몰입으로 배우는 대규모 모험 게임입니다."}
					</div>
				</div>
				<div className="gbox pb_last">
					<div className="inner lrbox_area program_area">
						<div className="lrbox">
							<h2 className="tit">
								{"자유 체험 "}
								<br className="pc_vw" />
								{"프로그램이란?"}
							</h2>
							<div className="con">
								<div className="imgfit" aria-hidden="true">
									<img src={withBasePath('/pub/images/img_free01.webp')} alt="" />
								</div>
								<p>
									{"울산광역시미래교육관 3층 모험터에서 운영되는 개인·가족 자유 체험 프로그램입니다."}
									<br />
									{"\r\n\t\t\t\t\t재미와 몰입을 주는 퀴즈·조작·신체 게임을 예약 없이 자유롭게 즐길 수 있습니다. "}
									<br />
									{"\r\n\t\t\t\t\t인류가 직면한 다양한 환경적, 사회적 문제를 게임으로 쉽게 만나보세요."}
									<br />
									{"\r\n\t\t\t\t\t정해진 순서나 시간 없이, 원하는 게임존을 골라 나만의 방식으로 탐험합니다."}
								</p>
							</div>
						</div>
						<div className="lrbox">
							<h2 className="tit">
								{"기본 정보"}
							</h2>
							<div className="con">
								<div className="tbl">
									<table>
										<thead>
											<tr>
												<th>
													{"대상"}
												</th>
												<th>
													{"장소"}
												</th>
												<th>
													{"수용인원"}
												</th>
												<th>
													{"소요시간"}
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													{"전 연령 (개인 · 가족)"}
												</td>
												<td>
													{"본관3층 ESD 모험터"}
												</td>
												<td>
													{"자유 입장 (예약 불필요)"}
												</td>
												<td>
													{"자유 (권장 30~60분)"}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
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
											<col />
											<col className="w320" />
										</colgroup>
										<thead>
											<tr>
												<th>
													{"단계"}
												</th>
												<th>
													{"내용"}
												</th>
												<th>
													{"장소"}
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<th>
													{"입장"}
												</th>
												<td>
													{"운영 안내 확인, 안전 유의사항 숙지"}
												</td>
												<td>
													{"모험터 입구"}
												</td>
											</tr>
											<tr>
												<th>
													{"존 선택"}
												</th>
												<td>
													{"퀴즈·조작·신체 게임존 중 원하는 곳 자유"}
												</td>
												<td>
													{"-"}
												</td>
											</tr>
											<tr>
												<th>
													{"자유 체험"}
												</th>
												<td>
													{"각 게임존 개별 참여, 순서·제한 없음"}
												</td>
												<td>
													{"각 게임존"}
												</td>
											</tr>
											<tr>
												<th>
													{"퇴장"}
												</th>
												<td>
													{"자유롭게 퇴장, 재입장 가능"}
												</td>
												<td>
													{"-"}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

export default function AboutOrganizationContent() {
	return (
		<>
			<section className="about_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"조직도"}
				</h1>
				<div className="organization_chart">
					<div className="flex">
						<p className="excl">
							{"조직도를 클릭하여 부서별 주요 업무와 연락처를 확인해 보세요."}
						</p>
					</div>
					<div className="boss">
						{"관장"}
					</div>
					<ul className="teams">
						<li className="c1">
							{"기획운영팀"}
						</li>
						<li className="c2">
							{"교육팀"}
						</li>
						<li className="c3">
							{"시설팀"}
						</li>
					</ul>
				</div>
				<div className="organization_list">
					<h2 className="sound_only">
						{"직위별 담당업무 및 전화번호"}
					</h2>
					<div className="lrbox_area tit_slim">
						<div className="lrbox">
							<h3 className="tit">
								{"관장"}
							</h3>
							<div className="con tbl">
								<table>
									<colgroup>
										<col className="mo_organization1" />
										<col className="mo_organization2" />
										<col />
									</colgroup>
									<thead>
										<tr>
											<th>
												{"직위"}
											</th>
											<th>
												{"담당업무"}
											</th>
											<th>
												{"전화번호"}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<th>
												{"관장"}
											</th>
											<td>
												{"박물관 업무 총괄"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div className="lrbox">
							<h3 className="tit">
								{"기획운영팀"}
							</h3>
							<div className="con tbl">
								<table>
									<colgroup>
										<col className="mo_organization1" />
										<col className="mo_organization2" />
										<col />
									</colgroup>
									<thead>
										<tr>
											<th>
												{"직위"}
											</th>
											<th>
												{"담당업무"}
											</th>
											<th>
												{"전화번호"}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<th>
												{"팀장"}
											</th>
											<td>
												{"기획운영팀 업무 총괄"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
										<tr>
											<th>
												{"주무관"}
											</th>
											<td>
												{"교육관 행정"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
										<tr>
											<th>
												{"주무관"}
											</th>
											<td>
												{"교육관 홍보 업무"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div className="lrbox">
							<h3 className="tit">
								{"교육팀"}
							</h3>
							<div className="con tbl">
								<table>
									<colgroup>
										<col className="mo_organization1" />
										<col className="mo_organization2" />
										<col />
									</colgroup>
									<thead>
										<tr>
											<th>
												{"직위"}
											</th>
											<th>
												{"담당업무"}
											</th>
											<th>
												{"전화번호"}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<th>
												{"팀장"}
											</th>
											<td>
												{"교육팀 업무 총괄"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
										<tr>
											<th>
												{"주무관"}
											</th>
											<td>
												{"교육관 예약 관리"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
										<tr>
											<th>
												{"주무관"}
											</th>
											<td>
												{"교육관 안내"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						<div className="lrbox">
							<h3 className="tit">
								{"시설팀"}
							</h3>
							<div className="con tbl">
								<table>
									<colgroup>
										<col className="mo_organization1" />
										<col className="mo_organization2" />
										<col />
									</colgroup>
									<thead>
										<tr>
											<th>
												{"직위"}
											</th>
											<th>
												{"담당업무"}
											</th>
											<th>
												{"전화번호"}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<th>
												{"팀장"}
											</th>
											<td>
												{"시설팀 업무 총괄"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
										<tr>
											<th>
												{"주무관"}
											</th>
											<td>
												{"교육관 안전 · 시설관리"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
										<tr>
											<th>
												{"주무관"}
											</th>
											<td>
												{"교육관 안전 · 시설관리"}
											</td>
											<td>
												{"052 - 000 -0000"}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

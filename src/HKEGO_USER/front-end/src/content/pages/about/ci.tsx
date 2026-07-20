export default function AboutCiContent() {
	return (
		<>
			<section className="about_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"CI"}
				</h1>
				<div className="page_top_box ci_top mb0">
					<strong>
						{"울산광역시미래교육관의 CI(Corporate Identity)는 "}
						<br className="pc_vw" />
						{"기관의 정체성과 비전을 담은 통합 이미지 시스템입니다."}
					</strong>
					<p>
						{"각각의 요소가 모여 울산광역시미래교육관만의 고유한 이미지를 만들어냅니다."}
					</p>
					<div className="btns">
						<a href="#this" className="btn btn_wbb btn_download">
							{"CI 다운로드"}
						</a>
						<a href="#this" className="btn btn_wgg btn_download">
							{"CI 소개서 다운로드"}
						</a>
					</div>
				</div>
				<div className="lrbox_area tit_slim ci_wrap">
					<h2 className="sound_only">
						{"심벌마크, 로고타입, 시그니처 양식"}
					</h2>
					<div className="lrbox">
						<h3 className="tit">
							{"심벌마크"}
						</h3>
						<div className="con gbox symbolmark">
							<img src="/pub/images/img_symbol.svg" alt="심벌마크" />
						</div>
					</div>
					<div className="lrbox">
						<h3 className="tit">
							{"로고타입"}
						</h3>
						<ul className="con ci_list">
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type01_01.svg" alt="로고타입 - 국문형" />
								</div>
								<p>
									{"국문형"}
								</p>
							</li>
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type01_02.svg" alt="로고타입 - 영문형 A" />
								</div>
								<p>
									{"영문형 A"}
								</p>
							</li>
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type01_03.svg" alt="로고타입 - 영문형 B" />
								</div>
								<p>
									{"영문형 B"}
								</p>
							</li>
						</ul>
					</div>
					<div className="lrbox">
						<h3 className="tit">
							{"시그니처"}
						</h3>
						<ul className="con ci_list">
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type02_01.svg" alt="시그니처 - 국영문 상하조합" />
								</div>
								<p>
									{"국영문 상하조합"}
								</p>
							</li>
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type02_02.svg" alt="시그니처 - 국문 상하조합" />
								</div>
								<p>
									{"국문 상하조합"}
								</p>
							</li>
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type02_03.svg" alt="시그니처 - 영문 상하조합" />
								</div>
								<p>
									{"영문 상하조합"}
								</p>
							</li>
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type02_04.svg" alt="시그니처 - 국영문 좌우조합" />
								</div>
								<p>
									{"국영문 좌우조합"}
								</p>
							</li>
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type02_05.svg" alt="시그니처 - 국문 좌우조합" />
								</div>
								<p>
									{"국문 좌우조합"}
								</p>
							</li>
							<li>
								<div className="imgfit">
									<img src="/pub/images/img_ci_type02_06.svg" alt="시그니처 - 영문 좌우조합" />
								</div>
								<p>
									{"영문 좌우조합"}
								</p>
							</li>
						</ul>
					</div>
				</div>
			</section>
		</>
	)
}

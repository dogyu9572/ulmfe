export default function TermsNoEmailContent() {
	return (
		<>
			<section className="inner" aria-labelledby="total-search-title">
				<h1 id="total-search-title" className="subtitle">
					{"약관 및 정책"}
				</h1>
				<div className="aside_wrap no_image">
					<nav className="aside">
						<ul className="snb">
							<li>
								<a href="/terms/policy">
									{"이용약관"}
								</a>
							</li>
							<li className="no_before">
								<a href="/terms/privacy">
									<strong>
										{"개인정보처리방침"}
									</strong>
								</a>
							</li>
							<li className="on">
								<a href="/terms/no_email">
									{"이메일 무단수집거부"}
								</a>
							</li>
							<li>
								<a href="/terms/cctv">
									{"영상정보처리기기 운영방침"}
								</a>
							</li>
						</ul>
					</nav>
				</div>
				<div className="gbox terms_box email_box">
					<h2>
						{"이메일 무단수집거부"}
					</h2>
					<p>
						{"본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며 "}
						<br className="pc_vw" />
						{"이를 위반시 정보통신망법에 의해 형사처벌됨을 유념하시길 바랍니다."}
					</p>
				</div>
			</section>
		</>
	)
}

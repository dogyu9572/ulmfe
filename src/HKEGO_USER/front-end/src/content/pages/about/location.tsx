export default function AboutLocationContent() {
	return (
		<>
			<section className="about_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"오시는 길"}
				</h1>
				<div className="map_area" id="map"></div>
				<div className="map_text">
					<h2 className="sound_only">
						{"울산미래교육관 오시는 길 정보"}
					</h2>
					<div className="logo" aria-hidden="true"></div>
					<div className="info">
						<ul>
							<li className="i1">
								<h3>
									{"도로명"}
								</h3>
								<p>
									{"울산광역시 북구 무룡로 1119-6 (울산광역시미래교육관 / 구. 울산인성교육센터)"}
								</p>
							</li>
							<li className="i2">
								<h3>
									{"지번"}
								</h3>
								<p>
									{"울산광역시 북구 정자동 321 (구. 강동초등학교)"}
								</p>
							</li>
							<li className="i3">
								<h3>
									{"TEL"}
								</h3>
								<p>
									{"052 - 000 - 0000"}
								</p>
							</li>
							<li className="i4">
								<h3>
									{"FAX"}
								</h3>
								<p>
									{"052 - 000 - 0000"}
								</p>
							</li>
						</ul>
						<div className="map_links">
							<a href="https://kko.to/8jnytuFNwu" target="_blank" className="btn btn_naver">
								{"네이버지도"}
							</a>
							<a href="https://naver.me/5ECiWuYd" target="_blank" className="btn btn_kakao">
								{"카카오맵"}
							</a>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

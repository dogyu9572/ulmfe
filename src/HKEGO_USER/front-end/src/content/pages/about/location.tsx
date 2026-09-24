export default function AboutLocationContent() {
	return (
		<>
			<section className="about_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"오시는 길"}
				</h1>
				<ul className="tabs_location" role="tablist" aria-label="오시는 길 안내 유형">
					<li className="on">
						<button type="button" role="tab" aria-selected="true" aria-controls="map">
							{"울산광역시미래교육관"}
						</button>
					</li>
					<li>
						<button type="button" role="tab" aria-selected="false" aria-controls="map" data-origin="울산공항">
							{"공항 이용시"}
						</button>
					</li>
					<li>
						<button type="button" role="tab" aria-selected="false" aria-controls="map" data-origin="울산IC">
							{"고속도로 이용시"}
						</button>
					</li>
					<li>
						<button type="button" role="tab" aria-selected="false" aria-controls="map" data-origin="울산역">
							{"KTX 이용시"}
						</button>
					</li>
					<li>
						<button type="button" role="tab" aria-selected="false" aria-controls="map" data-origin="울산고속버스터미널">
							{"터미널 이용시"}
						</button>
					</li>
				</ul>
				<div className="map_area" id="map" role="tabpanel"></div>
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
									{"052 - 231 - 8500"}
								</p>
							</li>
							<li className="i4">
								<h3>
									{"FAX"}
								</h3>
								<p>
									{"052 - 231 - 8559"}
								</p>
							</li>
						</ul>
						<div className="map_links">
							<a href="https://naver.me/5ECiWuYd" target="_blank" rel="noopener noreferrer" className="btn btn_naver" title="네이버지도에서 울산광역시미래교육관 위치 보기">
								{"네이버지도"}
							</a>
							<a href="https://map.kakao.com/link/to/울산광역시미래교육관,35.5975,129.3730" target="_blank" rel="noopener noreferrer" className="btn btn_kakao" title="카카오맵에서 울산광역시미래교육관 길찾기">
								{"카카오맵 길찾기"}
							</a>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

export default function ProgramReserveContent() {
	return (
		<>
			<section className="program_wrap" aria-labelledby="page-title">
				<div className="inner">
					<h1 id="page-title" className="subtitle">
						{"예약 안내"}
					</h1>
					<div className="page_top_box reserve_top">
						{"울산광역시미래교육관 이용 방법과 "}
						<br className="pc_vw" />
						{"교육프로그램 예약 방법을 확인해보세요."}
					</div>
				</div>
				<div className="gbox pb_last">
					<div className="inner lrbox_area program_area reserve_area">
						<div className="lrbox">
							<h2 className="tit">
								{"이용 안내"}
							</h2>
							<div className="con">
								<ul className="use_time">
									<li className="c1">
										<span>
											{"운영시간"}
										</span>
										<strong>
											{"09:00 ~ 18:00"}
										</strong>
									</li>
									<li className="c2">
										<span>
											{"휴관일"}
										</span>
										<strong>
											{"매주 월요일, 공휴일"}
										</strong>
									</li>
									<li className="c3">
										<span>
											{"이용요금"}
										</span>
										<strong>
											{"무료"}
										</strong>
									</li>
								</ul>
							</div>
						</div>
						<div className="lrbox">
							<h2 className="tit">
								{"예약 방법"}
							</h2>
							<div className="con">
								<ul className="flower_dots_list">
									<li>
										{"프로그램 예약은 최소 하루 전 울산광역시교육청 통합예약 홈페이지 https://use.go.kr/booking/index.do 를 통해 사전예약 부탁드립니다."}
									</li>
									<li>
										{"사전예약하지 않은 단체는 입장이 제한될 수 있습니다."}
									</li>
									<li>
										{"예약 취소·변경은 방문 희망일 ○일 전까지 가능합니다."}
									</li>
								</ul>
								<div className="outlink_btns flex">
									<a href="#this" className="btn btn_outlink btn_wbb">
										{"프로그램 예약하기"}
									</a>
									<a href="#this" className="btn btn_outlink btn_wgg">
										{"프로그램 예약조회"}
									</a>
								</div>
							</div>
						</div>
						<div className="lrbox">
							<h2 className="tit">
								{"예약 절차"}
							</h2>
							<div className="con">
								<ul className="reservation_step wbox">
									<li>
										<i aria-hidden="true">
											<img src="/pub/images/icon_reservation_step01.svg" alt="" />
										</i>
										<span>
											{"STEP 01"}
										</span>
										<p>
											{"통합예약 "}
											<br />
											{"홈페이지 접속"}
										</p>
									</li>
									<li>
										<i aria-hidden="true">
											<img src="/pub/images/icon_reservation_step02.svg" alt="" />
										</i>
										<span>
											{"STEP 02"}
										</span>
										<p>
											{"참여하실 "}
											<br />
											{"프로그램 선택"}
										</p>
									</li>
									<li>
										<i aria-hidden="true">
											<img src="/pub/images/icon_reservation_step03.svg" alt="" />
										</i>
										<span>
											{"STEP 03"}
										</span>
										<p>
											{"신청 정보 입력 "}
											<br />
											{"(학교, 학년, 반 등)"}
										</p>
									</li>
									<li>
										<i aria-hidden="true">
											<img src="/pub/images/icon_reservation_step04.svg" alt="" />
										</i>
										<span>
											{"STEP 04"}
										</span>
										<p>
											{"예약 확인"}
										</p>
									</li>
									<li>
										<i aria-hidden="true">
											<img src="/pub/images/icon_reservation_step05.svg" alt="" />
										</i>
										<span>
											{"STEP 05"}
										</span>
										<p>
											{"교육 당일 "}
											<br />
											{"현장 방문"}
										</p>
									</li>
								</ul>
							</div>
						</div>
						<div className="lrbox">
							<h2 className="tit">
								{"유의사항"}
							</h2>
							<div className="con">
								<ul className="excl_list">
									<li className="i1">
										{"지정된 시간에 맞춰 입장해주세요."}
									</li>
									<li className="i2">
										{"안전을 위해 뛰거나 장난치는 행위는 삼가 주세요."}
									</li>
									<li className="i3">
										{"음식물 반입은 식당 · 카페 이외 구역에서 삼가 주세요."}
									</li>
									<li className="i4">
										{"시설물 훼손 시 변상 책임이 따를 수 있습니다."}
									</li>
									<li className="i5">
										{"분실물은 안내데스크로 문의해 주세요."}
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

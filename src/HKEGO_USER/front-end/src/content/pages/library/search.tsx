export default function LibrarySearchContent() {
	return (
		<>
			<section className="library_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"자료검색"}
				</h1>
				<div className="board_top center_type">
					<form action="/library/search_list" method="get" className="search_wrap">
						<fieldset>
							<legend className="sound_only">
								{"게시글 검색"}
							</legend>
							<label htmlFor="search-condition" className="sound_only">
								{"검색 조건 선택"}
							</label>
							<select name="search_condition" id="search-condition">
								<option value="all">
									{"전체"}
								</option>
								<option value="title">
									{"제목"}
								</option>
								<option value="content">
									{"내용"}
								</option>
							</select>
							<div className="search_area">
								<label htmlFor="search-keyword" className="sound_only">
									{"검색어 입력"}
								</label>
								<input type="text" id="search-keyword" name="search_keyword" placeholder="검색어를 입력해주세요." />
								<button type="submit" className="btn">
									{"검색"}
								</button>
							</div>
						</fieldset>
					</form>
				</div>
				<h2 className="ctit mb0">
					{"사서 추천도서"}
				</h2>
				<div className="librarian_books_area">
					<div className="left">
						<div className="imgfit">
							<img src="/pub/images/img_book_about.webp" alt="" />
						</div>
						<div className="txt flex colm">
							<div className="top flex colm">
								<h3>
									{"순례 주택"}
								</h3>
								<p>
									{"“수림아, 어떤 사람이 어른인지 아니?” 자기 힘으로 살아 보려고 애쓰는 사람이야.” 행복해지려고 노력하는 모든 이에게 전하는 유은실의 단.짠.단.짠 위로"}
								</p>
							</div>
							<div className="btm flex colm">
								<ul className="writer_info flex colm">
									<li>
										<strong>
											{"지은이"}
										</strong>
										{"유은실 소설"}
									</li>
									<li>
										<strong>
											{"출판사"}
										</strong>
										{"비룡소"}
									</li>
								</ul>
								<a href="/library/search_list" className="btn_more flex_center btn_wbb">
									{"자세히보기"}
								</a>
							</div>
						</div>
					</div>
					<div className="right">
						<div className="book_slide">
							<div className="control">
								<button type="button" className="arrow prev">
									{"이전"}
								</button>
								<button type="button" className="arrow next">
									{"다음"}
								</button>
								<div className="paging"></div>
							</div>
							<div className="swiper-wrapper">
								<div className="swiper-slide">
									<a href="/library/search_view">
										<span aria-hidden="true" className="imgfit">
											<img src="/pub/images/img_sample_library.webp" alt="" />
										</span>
										<p>
											{"아몬드(청소년)"}
										</p>
									</a>
								</div>
								<div className="swiper-slide">
									<a href="/library/search_view">
										<span aria-hidden="true" className="imgfit">
											<img src="/pub/images/img_sample_library.webp" alt="" />
										</span>
										<p>
											{"5번 레인(Take your marks 에디션)"}
										</p>
									</a>
								</div>
								<div className="swiper-slide">
									<a href="/library/search_view">
										<span aria-hidden="true" className="imgfit">
											<img src="/pub/images/img_sample_library.webp" alt="" />
										</span>
										<p>
											{"아몬드(청소년)"}
										</p>
									</a>
								</div>
								<div className="swiper-slide">
									<a href="/library/search_view">
										<span aria-hidden="true" className="imgfit">
											<img src="/pub/images/img_sample_library.webp" alt="" />
										</span>
										<p>
											{"5번 레인(Take your marks 에디션)"}
										</p>
									</a>
								</div>
								<div className="swiper-slide">
									<a href="/library/search_view">
										<span aria-hidden="true" className="imgfit">
											<img src="/pub/images/img_sample_library.webp" alt="" />
										</span>
										<p>
											{"아몬드(청소년)"}
										</p>
									</a>
								</div>
								<div className="swiper-slide">
									<a href="/library/search_view">
										<span aria-hidden="true" className="imgfit">
											<img src="/pub/images/img_sample_library.webp" alt="" />
										</span>
										<p>
											{"5번 레인(Take your marks 에디션)"}
										</p>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="ctit">
					<h2>
						{"새로 들어온 도서"}
					</h2>
					<a href="/library/search_list" className="btn_more">
						{"더보기"}
					</a>
				</div>
				<div className="new_book_slide book_list">
					<div className="swiper-wrapper">
						<div className="swiper-slide">
							<a href="/library/search_view">
								<span aria-hidden="true" className="imgfit">
									<img src="/pub/images/img_sample_library.webp" alt="" />
								</span>
								<p>
									{"아몬드(청소년)"}
								</p>
							</a>
						</div>
						<div className="swiper-slide">
							<a href="/library/search_view">
								<span aria-hidden="true" className="imgfit">
									<img src="/pub/images/img_sample_library.webp" alt="" />
								</span>
								<p>
									{"5번 레인(Take your marks 에디션)"}
								</p>
							</a>
						</div>
						<div className="swiper-slide">
							<a href="/library/search_view">
								<span aria-hidden="true" className="imgfit">
									<img src="/pub/images/img_sample_library.webp" alt="" />
								</span>
								<p>
									{"아몬드(청소년)"}
								</p>
							</a>
						</div>
						<div className="swiper-slide">
							<a href="/library/search_view">
								<span aria-hidden="true" className="imgfit">
									<img src="/pub/images/img_sample_library.webp" alt="" />
								</span>
								<p>
									{"5번 레인(Take your marks 에디션)"}
								</p>
							</a>
						</div>
						<div className="swiper-slide">
							<a href="/library/search_view">
								<span aria-hidden="true" className="imgfit">
									<img src="/pub/images/img_sample_library.webp" alt="" />
								</span>
								<p>
									{"아몬드(청소년)"}
								</p>
							</a>
						</div>
						<div className="swiper-slide">
							<a href="/library/search_view">
								<span aria-hidden="true" className="imgfit">
									<img src="/pub/images/img_sample_library.webp" alt="" />
								</span>
								<p>
									{"5번 레인(Take your marks 에디션)"}
								</p>
							</a>
						</div>
					</div>
					<div className="control">
						<button type="button" className="arrow prev">
							{"이전"}
						</button>
						<button type="button" className="arrow next">
							{"다음"}
						</button>
						<div className="paging"></div>
					</div>
				</div>
			</section>
		</>
	)
}

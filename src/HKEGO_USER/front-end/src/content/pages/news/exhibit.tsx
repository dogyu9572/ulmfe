export default function NewsExhibitContent() {
	return (
		<>
			<section className="board_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"기획전"}
				</h1>
				<div className="board_top">
					<div className="flex left">
						<div className="total">
							{"총 "}
							<strong>
								{"100"}
							</strong>
							{"건"}
						</div>
					</div>
					<form action="" method="get" className="search_wrap">
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
				<ul className="gallery_basic type_large">
					<li>
						<a href="/news/exhibit_view">
							<span className="imgfit">
								<img src="/pub/images/img_sample_exhibit.webp" alt="" />
							</span>
							<span className="txt">
								<h3 className="tit">
									{"울산미래교육관 기관 상징 공모"}
								</h3>
								<span className="date">
									<span className="sound_only">
										{"작성일:"}
									</span>
									{"YYYY.MM.DD"}
								</span>
							</span>
						</a>
					</li>
					<li>
						<a href="/news/exhibit_view">
							<span className="imgfit">
								<img src="/pub/images/img_sample_exhibit.webp" alt="" />
							</span>
							<span className="txt">
								<h3 className="tit">
									{"울산미래교육관 기관 상징 공모"}
								</h3>
								<span className="date">
									<span className="sound_only">
										{"작성일:"}
									</span>
									{"YYYY.MM.DD"}
								</span>
							</span>
						</a>
					</li>
					<li>
						<a href="/news/exhibit_view">
							<span className="imgfit">
								<img src="/pub/images/img_sample_exhibit.webp" alt="" />
							</span>
							<span className="txt">
								<h3 className="tit">
									{"울산미래교육관 기관 상징 공모"}
								</h3>
								<span className="date">
									<span className="sound_only">
										{"작성일:"}
									</span>
									{"YYYY.MM.DD"}
								</span>
							</span>
						</a>
					</li>
					<li>
						<a href="/news/exhibit_view">
							<span className="imgfit">
								<img src="/pub/images/img_sample_exhibit.webp" alt="" />
							</span>
							<span className="txt">
								<h3 className="tit">
									{"울산미래교육관 기관 상징 공모"}
								</h3>
								<span className="date">
									<span className="sound_only">
										{"작성일:"}
									</span>
									{"YYYY.MM.DD"}
								</span>
							</span>
						</a>
					</li>
					<li>
						<a href="/news/exhibit_view">
							<span className="imgfit">
								<img src="/pub/images/img_sample_exhibit.webp" alt="" />
							</span>
							<span className="txt">
								<h3 className="tit">
									{"울산미래교육관 기관 상징 공모"}
								</h3>
								<span className="date">
									<span className="sound_only">
										{"작성일:"}
									</span>
									{"YYYY.MM.DD"}
								</span>
							</span>
						</a>
					</li>
					<li>
						<a href="/news/exhibit_view">
							<span className="imgfit">
								<img src="/pub/images/img_sample_exhibit.webp" alt="" />
							</span>
							<span className="txt">
								<h3 className="tit">
									{"울산미래교육관 기관 상징 공모"}
								</h3>
								<span className="date">
									<span className="sound_only">
										{"작성일:"}
									</span>
									{"YYYY.MM.DD"}
								</span>
							</span>
						</a>
					</li>
				</ul>
				<div className="board_bottom">
					<nav className="paging" aria-label="게시판 페이지 이동">
						<a href="#this" className="arrow two first" aria-label="첫 페이지로 이동">
							{"처음"}
						</a>
						<a href="#this" className="arrow one prev" aria-label="이전 페이지로 이동">
							{"이전"}
						</a>
						<a href="#this" className="on" aria-current="page" aria-label="현재 1페이지">
							{"1"}
						</a>
						<a href="#this" aria-label="2페이지로 이동">
							{"2"}
						</a>
						<a href="#this" aria-label="3페이지로 이동">
							{"3"}
						</a>
						<a href="#this" aria-label="4페이지로 이동">
							{"4"}
						</a>
						<a href="#this" aria-label="5페이지로 이동">
							{"5"}
						</a>
						<a href="#this" className="arrow one next" aria-label="다음 페이지로 이동">
							{"다음"}
						</a>
						<a href="#this" className="arrow two last" aria-label="마지막 페이지로 이동">
							{"맨끝"}
						</a>
					</nav>
				</div>
			</section>
		</>
	)
}

export default function LibrarySearchListContent() {
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
				<div className="board_top">
					<div className="total w100p">
						<strong>
							{"키워드"}
						</strong>
						{"에 대한 검색결과 총 "}
						<strong>
							{"123"}
						</strong>
						{"건"}
					</div>
				</div>
				<div className="no_content">
					{"검색된 내용이 없습니다."}
				</div>
				<ul className="flex book_list">
					<li>
						<a href="/library/search_view">
							<span aria-hidden="true" className="imgfit">
								<img src="/pub/images/img_sample_library.webp" alt="" />
								<span className="hover">
									<span>
										{"자세히 보기"}
									</span>
									<p>
										{"『빈센트 반 고흐, 세상을 노랗게 물들이다』는 아이들이 빈센트 반 고흐의 삶을 배울 수 있도록 눈높이를 맞춰 소개한 책이다. 살아생전 2000점이 넘는 그림을 그렸지만 단 한 점 밖에 팔리지 않았던 불운한 화가, 동서양을 통틀어 가장 사랑받는 화가인 고흐. 그런 고흐의 삶과 작품 속에 담긴 철학과 예술혼을 자연스럽게 보여준다."}
									</p>
									<ul className="writer_info flex colm">
										<li>
											<strong>
												{"출판사"}
											</strong>
											{"비룡소"}
										</li>
										<li>
											<strong>
												{"지은이"}
											</strong>
											{"유은실 소설"}
										</li>
									</ul>
								</span>
							</span>
							<p>
								{"빈센트 반 고흐, 세상을 노랗게 물들이다"}
							</p>
						</a>
					</li>
					<li>
						<a href="/library/search_view">
							<span aria-hidden="true" className="imgfit">
								<img src="/pub/images/img_sample_library.webp" alt="" />
								<span className="hover">
									<span>
										{"자세히 보기"}
									</span>
									<p>
										{"『빈센트 반 고흐, 세상을 노랗게 물들이다』는 아이들이 빈센트 반 고흐의 삶을 배울 수 있도록 눈높이를 맞춰 소개한 책이다. 살아생전 2000점이 넘는 그림을 그렸지만 단 한 점 밖에 팔리지 않았던 불운한 화가, 동서양을 통틀어 가장 사랑받는 화가인 고흐. 그런 고흐의 삶과 작품 속에 담긴 철학과 예술혼을 자연스럽게 보여준다."}
									</p>
									<ul className="writer_info flex colm">
										<li>
											<strong>
												{"출판사"}
											</strong>
											{"비룡소"}
										</li>
										<li>
											<strong>
												{"지은이"}
											</strong>
											{"유은실 소설"}
										</li>
									</ul>
								</span>
							</span>
							<p>
								{"빈센트 반 고흐, 세상을 노랗게 물들이다"}
							</p>
						</a>
					</li>
					<li>
						<a href="/library/search_view">
							<span aria-hidden="true" className="imgfit">
								<img src="/pub/images/img_sample_library.webp" alt="" />
								<span className="hover">
									<span>
										{"자세히 보기"}
									</span>
									<p>
										{"『빈센트 반 고흐, 세상을 노랗게 물들이다』는 아이들이 빈센트 반 고흐의 삶을 배울 수 있도록 눈높이를 맞춰 소개한 책이다. 살아생전 2000점이 넘는 그림을 그렸지만 단 한 점 밖에 팔리지 않았던 불운한 화가, 동서양을 통틀어 가장 사랑받는 화가인 고흐. 그런 고흐의 삶과 작품 속에 담긴 철학과 예술혼을 자연스럽게 보여준다."}
									</p>
									<ul className="writer_info flex colm">
										<li>
											<strong>
												{"출판사"}
											</strong>
											{"비룡소"}
										</li>
										<li>
											<strong>
												{"지은이"}
											</strong>
											{"유은실 소설"}
										</li>
									</ul>
								</span>
							</span>
							<p>
								{"빈센트 반 고흐, 세상을 노랗게 물들이다"}
							</p>
						</a>
					</li>
					<li>
						<a href="/library/search_view">
							<span aria-hidden="true" className="imgfit">
								<img src="/pub/images/img_sample_library.webp" alt="" />
								<span className="hover">
									<span>
										{"자세히 보기"}
									</span>
									<p>
										{"『빈센트 반 고흐, 세상을 노랗게 물들이다』는 아이들이 빈센트 반 고흐의 삶을 배울 수 있도록 눈높이를 맞춰 소개한 책이다. 살아생전 2000점이 넘는 그림을 그렸지만 단 한 점 밖에 팔리지 않았던 불운한 화가, 동서양을 통틀어 가장 사랑받는 화가인 고흐. 그런 고흐의 삶과 작품 속에 담긴 철학과 예술혼을 자연스럽게 보여준다."}
									</p>
									<ul className="writer_info flex colm">
										<li>
											<strong>
												{"출판사"}
											</strong>
											{"비룡소"}
										</li>
										<li>
											<strong>
												{"지은이"}
											</strong>
											{"유은실 소설"}
										</li>
									</ul>
								</span>
							</span>
							<p>
								{"빈센트 반 고흐, 세상을 노랗게 물들이다"}
							</p>
						</a>
					</li>
					<li>
						<a href="/library/search_view">
							<span aria-hidden="true" className="imgfit">
								<img src="/pub/images/img_sample_library.webp" alt="" />
								<span className="hover">
									<span>
										{"자세히 보기"}
									</span>
									<p>
										{"『빈센트 반 고흐, 세상을 노랗게 물들이다』는 아이들이 빈센트 반 고흐의 삶을 배울 수 있도록 눈높이를 맞춰 소개한 책이다. 살아생전 2000점이 넘는 그림을 그렸지만 단 한 점 밖에 팔리지 않았던 불운한 화가, 동서양을 통틀어 가장 사랑받는 화가인 고흐. 그런 고흐의 삶과 작품 속에 담긴 철학과 예술혼을 자연스럽게 보여준다."}
									</p>
									<ul className="writer_info flex colm">
										<li>
											<strong>
												{"출판사"}
											</strong>
											{"비룡소"}
										</li>
										<li>
											<strong>
												{"지은이"}
											</strong>
											{"유은실 소설"}
										</li>
									</ul>
								</span>
							</span>
							<p>
								{"빈센트 반 고흐, 세상을 노랗게 물들이다"}
							</p>
						</a>
					</li>
					<li>
						<a href="/library/search_view">
							<span aria-hidden="true" className="imgfit">
								<img src="/pub/images/img_sample_library.webp" alt="" />
								<span className="hover">
									<span>
										{"자세히 보기"}
									</span>
									<p>
										{"『빈센트 반 고흐, 세상을 노랗게 물들이다』는 아이들이 빈센트 반 고흐의 삶을 배울 수 있도록 눈높이를 맞춰 소개한 책이다. 살아생전 2000점이 넘는 그림을 그렸지만 단 한 점 밖에 팔리지 않았던 불운한 화가, 동서양을 통틀어 가장 사랑받는 화가인 고흐. 그런 고흐의 삶과 작품 속에 담긴 철학과 예술혼을 자연스럽게 보여준다."}
									</p>
									<ul className="writer_info flex colm">
										<li>
											<strong>
												{"출판사"}
											</strong>
											{"비룡소"}
										</li>
										<li>
											<strong>
												{"지은이"}
											</strong>
											{"유은실 소설"}
										</li>
									</ul>
								</span>
							</span>
							<p>
								{"빈센트 반 고흐, 세상을 노랗게 물들이다"}
							</p>
						</a>
					</li>
					<li>
						<a href="/library/search_view">
							<span aria-hidden="true" className="imgfit">
								<img src="/pub/images/img_sample_library.webp" alt="" />
								<span className="hover">
									<span>
										{"자세히 보기"}
									</span>
									<p>
										{"『빈센트 반 고흐, 세상을 노랗게 물들이다』는 아이들이 빈센트 반 고흐의 삶을 배울 수 있도록 눈높이를 맞춰 소개한 책이다. 살아생전 2000점이 넘는 그림을 그렸지만 단 한 점 밖에 팔리지 않았던 불운한 화가, 동서양을 통틀어 가장 사랑받는 화가인 고흐. 그런 고흐의 삶과 작품 속에 담긴 철학과 예술혼을 자연스럽게 보여준다."}
									</p>
									<ul className="writer_info flex colm">
										<li>
											<strong>
												{"출판사"}
											</strong>
											{"비룡소"}
										</li>
										<li>
											<strong>
												{"지은이"}
											</strong>
											{"유은실 소설"}
										</li>
									</ul>
								</span>
							</span>
							<p>
								{"빈센트 반 고흐, 세상을 노랗게 물들이다"}
							</p>
						</a>
					</li>
					<li>
						<a href="/library/search_view">
							<span aria-hidden="true" className="imgfit">
								<img src="/pub/images/img_sample_library.webp" alt="" />
								<span className="hover">
									<span>
										{"자세히 보기"}
									</span>
									<p>
										{"『빈센트 반 고흐, 세상을 노랗게 물들이다』는 아이들이 빈센트 반 고흐의 삶을 배울 수 있도록 눈높이를 맞춰 소개한 책이다. 살아생전 2000점이 넘는 그림을 그렸지만 단 한 점 밖에 팔리지 않았던 불운한 화가, 동서양을 통틀어 가장 사랑받는 화가인 고흐. 그런 고흐의 삶과 작품 속에 담긴 철학과 예술혼을 자연스럽게 보여준다."}
									</p>
									<ul className="writer_info flex colm">
										<li>
											<strong>
												{"출판사"}
											</strong>
											{"비룡소"}
										</li>
										<li>
											<strong>
												{"지은이"}
											</strong>
											{"유은실 소설"}
										</li>
									</ul>
								</span>
							</span>
							<p>
								{"빈센트 반 고흐, 세상을 노랗게 물들이다"}
							</p>
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

export default function SupportQnaContent() {
	return (
		<>
			<section className="board_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"1:1문의"}
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
				<div className="board_basic border_qna">
					<table>
						<caption className="sound_only">
							{"게시판 목록으로 번호, 제목, 작성일 정보를 제공합니다."}
						</caption>
						<colgroup>
							<col className="board_num" />
							<col className="board_tit" />
							<col className="board_writer small" />
							<col className="board_date" />
							<col className="board_review" />
						</colgroup>
						<thead>
							<tr>
								<th scope="col">
									{"번호"}
								</th>
								<th scope="col">
									{"제목"}
								</th>
								<th scope="col">
									{"작성자"}
								</th>
								<th scope="col">
									{"등록일"}
								</th>
								<th scope="col">
									{"답변상태"}
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="lock">
								<td className="board_num">
									{"10"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review ing">
										{"답변대기"}
									</span>
								</td>
							</tr>
							<tr className="lock">
								<td className="board_num">
									{"9"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review ing">
										{"답변대기"}
									</span>
								</td>
							</tr>
							<tr className="lock">
								<td className="board_num">
									{"8"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review ing">
										{"답변대기"}
									</span>
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"7"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review ing">
										{"답변대기"}
									</span>
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"6"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review ing">
										{"답변대기"}
									</span>
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"5"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review end">
										{"답변완료"}
									</span>
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"4"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review end">
										{"답변완료"}
									</span>
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"3"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review end">
										{"답변완료"}
									</span>
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"2"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review end">
										{"답변완료"}
									</span>
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"1"}
								</td>
								<td className="board_tit">
									<a href="#pop_password" className="btn_popup" data-target="pop_password">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_writer">
									<span className="sound_only">
										{"작성자:"}
									</span>
									{"홍*동"}
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_review">
									<span className="sound_only">
										{"답변상태"}
									</span>
									<span className="review end">
										{"답변완료"}
									</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div className="board_bottom">
					<a href="/support/qna_write" className="btn btn_wbb btn_abso btn_writer">
						{"글쓰기"}
					</a>
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
			<div className="popup pop_password" id="pop_password">
				<div className="dm"></div>
				<div className="inbox">
					<button type="button" className="btn_close">
						{"팝업 닫기"}
					</button>
					<h2 className="tit">
						{"비밀번호 입력"}
					</h2>
					<div className="con">
						<div className="input_password">
							<p>
								{"게시글 등록 시 설정한 비밀번호를 입력해주세요."}
							</p>
							<input type="password" className="text w100p" placeholder="비밀번호를 입력해주세요." />
						</div>
						<div className="btns_btm">
							<a href="/support/qna_view" className="btn btn_small btn_wbb">
								{"확인"}
							</a>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

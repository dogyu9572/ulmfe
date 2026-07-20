export default function ArchiveElementaryContent() {
	return (
		<>
			<section className="board_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"사건탐구 프로그램"}
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
						<select name="" id="" className="text">
							<option value="">
								{"학습 유형"}
							</option>
						</select>
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
				<div className="board_basic">
					<table>
						<caption className="sound_only">
							{"게시판 목록으로 번호, 제목, 작성일 정보를 제공합니다."}
						</caption>
						<colgroup>
							<col className="board_num" />
							<col className="board_edu_type" />
							<col className="board_tit" />
							<col className="board_file" />
							<col className="board_date" />
							<col className="board_hit" />
						</colgroup>
						<thead>
							<tr>
								<th scope="col">
									{"번호"}
								</th>
								<th scope="col">
									{"학습 유형"}
								</th>
								<th scope="col">
									{"제목"}
								</th>
								<th scope="col">
									{"첨부파일"}
								</th>
								<th scope="col">
									{"등록일"}
								</th>
								<th scope="col">
									{"조회수"}
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="new">
								<td className="board_num">
									{"10"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"9"}
								</td>
								<td className="board_edu_type type2">
									<span>
										{"본학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr className="new">
								<td className="board_num">
									{"8"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"7"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"6"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"5"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"4"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"3"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"2"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
							<tr>
								<td className="board_num">
									{"1"}
								</td>
								<td className="board_edu_type type1">
									<span>
										{"사전학습"}
									</span>
								</td>
								<td className="board_tit">
									<a href="/archive/elementary_view">
										<span className="sound_only">
											{"[새 글]"}
										</span>
										{" 제목이 들어가는 자리입니다."}
									</a>
								</td>
								<td className="board_file">
									<span className="sound_only">
										{"첨부파일:"}
									</span>
									<i className="file"></i>
								</td>
								<td className="board_date">
									<span className="sound_only">
										{"등록일:"}
									</span>
									{"2026.01.01"}
								</td>
								<td className="board_hit">
									<span className="sound_only">
										{"조회수:"}
									</span>
									{"123"}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
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

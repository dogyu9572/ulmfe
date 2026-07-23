type ListProps = {
	title: string
	variant: 'notice' | 'gallery-large' | 'gallery-small'
}

function SearchFallback() {
	return (
		<form className="search_wrap" aria-hidden="true">
			<fieldset disabled>
				<legend className="sound_only">게시글 검색</legend>
				<select defaultValue="all" aria-label="검색 조건 선택"><option value="all">전체</option></select>
				<div className="search_area">
					<input type="text" placeholder="검색어를 입력해주세요." aria-label="검색어 입력" />
					<button type="button" className="btn">검색</button>
				</div>
			</fieldset>
		</form>
	)
}

export function NewsBoardListFallback({ title, variant }: ListProps) {
	return (
		<section className="board_wrap inner" aria-labelledby="page-title" aria-busy="true">
			<h1 id="page-title" className="subtitle">{title}</h1>
			<div className="board_top">
				<div className="flex left"><div className="total">총 <strong>0</strong>건</div></div>
				<SearchFallback />
			</div>
			{variant === 'notice' ? (
				<div className="board_basic">
					<table>
						<caption className="sound_only">게시판 목록으로 번호, 제목, 작성일 정보를 제공합니다.</caption>
						<colgroup>
							<col className="board_num" /><col className="board_edu_type" /><col className="board_tit" />
							<col className="board_file" /><col className="board_date" /><col className="board_hit" />
						</colgroup>
						<thead><tr><th scope="col">번호2</th><th scope="col">학습 유형</th><th scope="col">제목</th><th scope="col">첨부파일</th><th scope="col">등록일</th><th scope="col">조회수</th></tr></thead>
						<tbody><tr><td colSpan={6}>게시물을 불러오는 중입니다.</td></tr></tbody>
					</table>
				</div>
			) : (
				<>
					<ul className={`gallery_basic ${variant === 'gallery-large' ? 'type_large' : 'type_small'}`} />
					<p role="status">게시물을 불러오는 중입니다.</p>
				</>
			)}
			<div className="board_bottom" />
		</section>
	)
}

export function NewsBoardDetailFallback() {
	return (
		<section className="board_wrap inner" aria-busy="true">
			<div className="board_view">
				<div className="tit_area">
					<h1 className="tit">게시글을 불러오는 중입니다.</h1>
					<ul className="info">
						<li><strong>등록일</strong><p>-</p></li>
						<li><strong>조회수</strong><p>0</p></li>
					</ul>
				</div>
				<div className="cont" />
				<div className="file_area" />
			</div>
		</section>
	)
}

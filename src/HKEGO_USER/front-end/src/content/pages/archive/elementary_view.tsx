export default function ArchiveElementaryViewContent() {
	return (
		<>
			<section className="board_wrap inner" aria-labelledby="page-title">
				<div className="board_view">
					<div className="tit_area">
						<h1 className="tit" id="page-title">
							{"제목이 들어가는 자리입니다."}
						</h1>
						<ul className="info">
							<li>
								<strong>
									{"등록일"}
								</strong>
								<p>
									{"YYYY.MM.DD"}
								</p>
							</li>
							<li>
								<strong>
									{"조회수"}
								</strong>
								<p>
									{"123"}
								</p>
							</li>
						</ul>
					</div>
					<div className="cont">
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다."}
						<br />
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다."}
						<br />
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다."}
						<br />
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다."}
						<br />
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다."}
						<br />
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다."}
						<br />
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다."}
						<br />
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다."}
						<br />
						{"\r\n\t\t\t게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.게시글 내용입니다.\r\n\t\t"}
					</div>
					<div className="file_area">
						<a href="#this" download="">
							<span>
								{"첨부파일명입니다. 첨부파일명입니다. 첨부파일명입니다.pdf"}
							</span>
							<i className="btn_download flex_center">
								{"다운로드"}
							</i>
						</a>
						<a href="#this" download="">
							<span>
								{"첨부파일명입니다. 첨부파일명입니다. 첨부파일명입니다.pdf"}
							</span>
							<i className="btn_download flex_center">
								{"다운로드"}
							</i>
						</a>
					</div>
				</div>
				<div className="board_bottom flex_center">
					<div className="prev_next">
						<a href="#this" className="prev">
							<strong>
								{"이전 글"}
							</strong>
							<p>
								{"이전 글 제목"}
							</p>
						</a>
						<a href="#this" className="next">
							<strong>
								{"다음 글"}
							</strong>
							<p>
								{"다음 글 제목"}
							</p>
						</a>
					</div>
					<a href="/archive/elementary" className="btn btn_wbb btn_large">
						{"목록"}
					</a>
				</div>
			</section>
		</>
	)
}

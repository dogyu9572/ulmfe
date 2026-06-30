import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'

const resources = [
	{ type: 'video', label: '동영상', title: 'OT(안전교육 영상)', text: '안전교육 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'video', label: '동영상', title: 'OT(활동동선 안내)', text: '활동동선 안내 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'video', label: '동영상', title: 'OT(사용법 튜토리얼)', text: '사용법 튜토리얼 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'document', label: '문서', title: '디자인엔 없으나 탭에 있어서 임의로 넣은 문서', text: '디자인엔 없으나 탭에 있어서 임의로 넣은 문서', href: '/pub/pdf/sample_document.pdf', button: '다운로드' }
]

export const ResourceCenterPage = () => (
	<main className="container" id="mainContent">
		<h1 className="sound_only">작은 아이디어가 도시를 바꾼다</h1>
		<StudentCaseHeader />

		<section className="basic_board">
			<div className="subtitle"><strong>자료실</strong>
				<p className="info">홈페이지 연계 자료 및 교육 콘텐츠</p>
			</div>

			<div className="page_scroll">
				<div className="board_top">
					<div className="select_tab">
						<button type="button" className="btn on" id="selectAll">전체</button>
						<button type="button" className="btn ico" id="selectDocument">문서</button>
						<button type="button" className="btn ico" id="selectVideo">동영상</button>
					</div>
					<div className="search_area">
						<input type="text" placeholder="자료를 검색하세요." />
						<button className="btn_search"></button>
					</div>
				</div>

				<h2 className="sound_only">자료실 목록</h2>
				<ul className="resource_wrap">
					{resources.map((resource) => (
						<li key={resource.title}>
							<div className={`type ${resource.type}`}>{resource.label}</div>
							<h3 className="tit">{resource.title}</h3>
							<p>{resource.text}</p>
							<a href={resource.href} target="_blank" className="btn">{resource.button}</a>
						</li>
					))}
				</ul>

				<div className="board_bottom">
					<nav className="paging" aria-label="게시판 페이지 이동">
						<a href="#this" className="arrow two first" aria-label="첫 페이지로 이동">처음</a>
						<a href="#this" className="arrow one prev" aria-label="이전 페이지로 이동">이전</a>
						<a href="#this" className="on" aria-current="page" aria-label="현재 1페이지">1</a>
						<a href="#this" aria-label="2페이지로 이동">2</a>
						<a href="#this" aria-label="3페이지로 이동">3</a>
						<a href="#this" aria-label="4페이지로 이동">4</a>
						<a href="#this" aria-label="5페이지로 이동">5</a>
						<a href="#this" className="arrow one next" aria-label="다음 페이지로 이동">다음</a>
						<a href="#this" className="arrow two last" aria-label="마지막 페이지로 이동">맨끝</a>
					</nav>
				</div>
			</div>
		</section>
	</main>
)

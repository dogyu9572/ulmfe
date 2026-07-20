import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'

export default function NotFound() {
	return (
		<>
			<link rel="stylesheet" href="/pub/css/styles_sub.css" precedence="legacy-subpage" />
			<SiteHeader />
			<main className="container error_wrap" id="mainContent">
				<section className="inner" aria-labelledby="error-title">
					<div className="gbox error404_area">
						<h1 id="error-title" className="tit">404 ERROR</h1>
						<p>죄송합니다. 페이지를 찾을 수 없습니다.<br />존재하지 않는 주소를 입력하셨거나<br />요청하신 페이지의 주소가 변경, 삭제되어 찾을 수 없습니다.</p>
						<a href="/" className="btn btn_wbb">홈으로</a>
					</div>
				</section>
			</main>
			<SiteFooter />
		</>
	)
}

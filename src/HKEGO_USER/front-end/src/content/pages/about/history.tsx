import { getPublicHistoryServer } from '@/lib/publicApiServer'
const formatMonth = (month: string) => {
	const value = Number(month)
	return Number.isInteger(value) && value >= 1 && value <= 12 ? `${value}월` : month
}

export default async function AboutHistoryContent() {
	const histories = await getPublicHistoryServer().catch(() => [])

	return (
		<section className="about_wrap inner" aria-labelledby="page-title">
			<h1 id="page-title" className="subtitle">연혁</h1>
			<div className="page_top_box history_top mb0">
				<strong>울산광역시미래교육관이 걸어온 길</strong>
				<p>그리고 앞으로 만들어 갈 미래를 함께 나눕니다.</p>
			</div>
			<div className="history_wrap">
				<h2 className="sound_only">연혁 목록</h2>
				<div className="line" aria-hidden="true"><div className="bar" /></div>
				<ul className="list">
					{histories.map((history) => (
						<li key={history.historyId}>
							<h3>{history.year}</h3>
							<ul className="history_content">
								<li>
									<strong>{formatMonth(history.month)}</strong>
									<p>{history.content}</p>
									{history.imageUrl ? (
										<div className="imgfit" aria-hidden="true">
											<img src={history.imageUrl} alt="" />
										</div>
									) : null}
								</li>
							</ul>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}

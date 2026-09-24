'use client'

import { useEffect, useState } from 'react'
import { getPublicHistory, type PublicHistory, resolvePublicMediaUrl } from '@/lib/publicApi'

const groupByYear = (histories: PublicHistory[]) =>
	histories.reduce<{ year: string; items: PublicHistory[] }[]>((groups, history) => {
		const last = groups[groups.length - 1]
		if (last && last.year === history.year) last.items.push(history)
		else groups.push({ year: history.year, items: [history] })
		return groups
	}, [])

export default function AboutHistoryContent() {
	const [histories, setHistories] = useState<PublicHistory[]>([])

	useEffect(() => {
		let cancelled = false
		void getPublicHistory()
			.then((data) => {
				if (!cancelled) setHistories(data)
			})
			.catch(() => {
				if (!cancelled) setHistories([])
			})
		return () => {
			cancelled = true
		}
	}, [])

	const groups = groupByYear(histories)

	return (
		<section className="about_wrap inner" aria-labelledby="page-title">
			<h1 id="page-title" className="subtitle">연혁</h1>
			<div className="page_top_box history_top mb0">
				<strong>울산광역시미래교육관은?</strong>
				<p>미래형 공간 위에 융합ㆍ첨단 콘텐츠를 활용해<br />인류가 직면한 다양한 문제를 학교 교육과정과 연계한<br />학생 주도 프로젝트 학습으로 체험하는 미래형 융합 교육 공간</p>
			</div>
			<div className="history_wrap">
				<h2 className="sound_only">연혁 목록</h2>
				<div className="line" aria-hidden="true"><div className="bar" /></div>
				<ul className="list">
					{groups.map((group) => (
						<li key={group.year}>
							<h3>{group.year}</h3>
							<ul className="history_content">
								{group.items.map((history) => (
									<li key={history.historyId}>
										<strong>{history.month}</strong>
										<p style={{ whiteSpace: 'pre-line' }}>{history.content}</p>
										{history.imageUrl ? (
											<div className="imgfit" aria-hidden="true">
												<img src={resolvePublicMediaUrl(history.imageUrl)} alt="" />
											</div>
										) : null}
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}

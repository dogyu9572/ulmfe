'use client'

import { useEffect, useState } from 'react'
import { getPublicCi, type PublicCiItem, type PublicCiSectionCode, resolvePublicMediaUrl } from '@/lib/publicApi'

/** 이미지로 노출되는 구분. FILE은 상단 다운로드 버튼이라 여기에 넣지 않는다. */
type CiImageSection = Exclude<PublicCiSectionCode, 'FILE'>

/** 경로가 채워진 항목. pickSection을 거치면 fileUrl이 보장된다. */
type CiVisibleItem = PublicCiItem & { fileUrl: string }

const SECTION_LABEL: Record<CiImageSection, string> = {
	SYMBOL: '심벌마크',
	SIGN: '시그니처',
	CHAR: '캐릭터'
}

const pickSection = (items: PublicCiItem[], seCd: PublicCiSectionCode): CiVisibleItem[] =>
	items.filter((item): item is CiVisibleItem => item.seCd === seCd && !!item.fileUrl)

const renderImageList = (seCd: CiImageSection, list: CiVisibleItem[]) => (
	<div className="lrbox">
		<h3 className="tit">
			{SECTION_LABEL[seCd]}
		</h3>
		<ul className="con ci_list">
			{list.map((item) => (
				<li key={item.ciId}>
					<div className="imgfit">
						<img src={resolvePublicMediaUrl(item.fileUrl)} alt={`${SECTION_LABEL[seCd]} - ${item.title}`} />
					</div>
					<p>
						{item.title}
					</p>
				</li>
			))}
		</ul>
	</div>
)

export default function AboutCiContent() {
	const [items, setItems] = useState<PublicCiItem[]>([])

	useEffect(() => {
		let cancelled = false
		void getPublicCi()
			.then((data) => {
				if (!cancelled) setItems(data)
			})
			.catch(() => {
				if (!cancelled) setItems([])
			})
		return () => {
			cancelled = true
		}
	}, [])
	// 심벌마크와 다운로드 파일은 관리자에서 사용 여부를 한 건만 유지하지만, 화면에서도 첫 항목만 쓴다.
	const symbol = pickSection(items, 'SYMBOL')[0] ?? null
	const signatures = pickSection(items, 'SIGN')
	const characters = pickSection(items, 'CHAR')
	const downloadFile = pickSection(items, 'FILE')[0] ?? null
	const hasAnySection = symbol != null || signatures.length > 0 || characters.length > 0

	return (
		<>
			<section className="about_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"CI"}
				</h1>
				<div className="page_top_box ci_top mb0">
					<strong>
						{"울산광역시미래교육관의 CI(Corporate Identity)는 "}
						<br className="pc_vw" />
						{"기관의 정체성과 비전을 담은 통합 이미지 시스템입니다."}
					</strong>
					<p>
						{"각각의 요소가 모여 울산광역시미래교육관만의 고유한 이미지를 만들어냅니다."}
					</p>
					{downloadFile ? (
						<div className="btns">
							<a
								href={resolvePublicMediaUrl(downloadFile.fileUrl)}
								className="btn btn_wbb btn_download"
								download={downloadFile.fileName ?? undefined}
							>
								{"CI 다운로드"}
							</a>
						</div>
					) : null}
				</div>
				{hasAnySection ? (
					<div className="lrbox_area tit_slim ci_wrap">
						<h2 className="sound_only">
							{"심벌마크, 시그니처, 캐릭터 양식"}
						</h2>
						{symbol ? (
							<div className="lrbox">
								<h3 className="tit">
									{SECTION_LABEL.SYMBOL}
								</h3>
								<div className="con gbox symbolmark">
									<img src={resolvePublicMediaUrl(symbol.fileUrl)} alt={symbol.title} />
								</div>
							</div>
						) : null}
						{signatures.length > 0 ? renderImageList('SIGN', signatures) : null}
						{characters.length > 0 ? renderImageList('CHAR', characters) : null}
					</div>
				) : null}
			</section>
		</>
	)
}

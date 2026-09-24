'use client'

// 교육프로그램 소개 목록. 상단 분류 탭으로 걸러 보여주고, 신청 링크가 있는 항목만 신청하기 버튼을 노출한다.
import { useState } from 'react'
import { withBasePath } from '@/lib/basePath'
import type { PublicEduProgram, PublicEduProgramCategory } from '@/lib/publicApi'
import { resolvePublicMediaUrl } from '@/lib/publicApi'

type Props = {
	programs: PublicEduProgram[]
	categories: PublicEduProgramCategory[]
}

const ALL = 'ALL'

export default function ProgramListView({ programs, categories }: Props) {
	const [activeCode, setActiveCode] = useState<string>(ALL)

	const visible = activeCode === ALL
		? programs
		: programs.filter((program) => program.categoryCode === activeCode)

	return (
		<>
			{categories.length > 0 && (
				<div className="program_tabs" role="tablist" aria-label="프로그램 분류">
					<button
						type="button"
						role="tab"
						aria-selected={activeCode === ALL}
						className={activeCode === ALL ? 'is-active' : ''}
						onClick={() => setActiveCode(ALL)}
					>
						전체
					</button>
					{categories.map((category) => (
						<button
							key={category.categoryCode}
							type="button"
							role="tab"
							aria-selected={activeCode === category.categoryCode}
							className={activeCode === category.categoryCode ? 'is-active' : ''}
							onClick={() => setActiveCode(category.categoryCode)}
						>
							{category.categoryName ?? category.categoryCode}
						</button>
					))}
				</div>
			)}

			{visible.length === 0 ? (
				<p className="program_empty">등록된 프로그램이 없습니다.</p>
			) : (
				<ul className="program_list program_intro_list">
					{visible.map((program) => (
						<li key={program.programId}>
							<div className="imgfit" aria-hidden="true">
								{program.thumbnailUrl ? <img src={resolvePublicMediaUrl(program.thumbnailUrl)} alt="" /> : null}
							</div>
							<div className="txt">
								{program.categoryName ? <span className="program_badge">{program.categoryName}</span> : null}
								<h3>{program.title}</h3>
								{program.description ? (
									<p className="program_desc">{program.description}</p>
								) : null}
								<ul className="program_meta">
									{program.place ? <li><strong>장소</strong>{program.place}</li> : null}
									{program.period ? <li><strong>시기</strong>{program.period}</li> : null}
									{program.capacity ? <li><strong>인원</strong>{program.capacity}</li> : null}
								</ul>
								{program.applyUrl ? (
									<a
										href={program.applyUrl.startsWith('/') ? withBasePath(program.applyUrl) : program.applyUrl}
										className="btn_link"
										target="_blank"
										rel="noreferrer noopener"
									>
										신청하기
										<span className="blind">새 창 열림</span>
									</a>
								) : null}
							</div>
						</li>
					))}
				</ul>
			)}
		</>
	)
}

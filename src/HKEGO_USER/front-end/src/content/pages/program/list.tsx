'use client'

import { useEffect, useState } from 'react'
import JsonLd from '@/components/JsonLd'
import ProgramListView from '@/components/public-program/ProgramListView'
import { getPublicEduProgramCategories, getPublicEduPrograms, type PublicEduProgram, type PublicEduProgramCategory } from '@/lib/publicApi'
import { eduProgramListJsonLd } from '@/lib/siteMeta'

export default function ProgramListContent() {
	const [programs, setPrograms] = useState<PublicEduProgram[]>([])
	const [categories, setCategories] = useState<PublicEduProgramCategory[]>([])

	useEffect(() => {
		let cancelled = false
		void Promise.all([
			getPublicEduPrograms().catch(() => [] as PublicEduProgram[]),
			getPublicEduProgramCategories().catch(() => [] as PublicEduProgramCategory[])
		]).then(([nextPrograms, nextCategories]) => {
			if (cancelled) return
			setPrograms(nextPrograms)
			setCategories(nextCategories)
		})
		return () => {
			cancelled = true
		}
	}, [])

	const programListJsonLd = eduProgramListJsonLd(programs)

	return (
		<section className="program_wrap" aria-labelledby="page-title">
			{programListJsonLd ? <JsonLd data={programListJsonLd} /> : null}
			<div className="inner">
				<h1 id="page-title" className="subtitle">
					교육프로그램
				</h1>
				<div className="page_top_box program_list_top">
					질문하고, 탐구하고, 만드는
					<br className="pc_vw" />
					울산광역시미래교육관의 교육프로그램을 만나보세요.
				</div>
			</div>
			<div className="gbox pb_last">
				<div className="inner program_area">
					<ProgramListView programs={programs} categories={categories} />
				</div>
			</div>
		</section>
	)
}

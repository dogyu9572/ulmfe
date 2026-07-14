import { useEffect, useMemo, useState } from 'react'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { fetchTabletLearningResources, TabletLearningResource } from '../../api/tabletApi'

type ResourceFilter = 'ALL' | 'DOC' | 'VIDEO'

const resourceType = (resource: TabletLearningResource) => resource.dataTypeCd === 'VIDEO' ? 'video' : 'document'
const resourceLabel = (resource: TabletLearningResource) => {
	if (resource.dataTypeCd === 'VIDEO') return '동영상'
	if (resource.dataTypeCd === 'LINK') return '링크'
	return '문서'
}
const resourceHref = (resource: TabletLearningResource) => {
	const hasTarget = resource.fileSeq != null || Boolean(resource.videoEmbedUrl || resource.linkUrl)
	if (!hasTarget || !resource.pstSn) return ''
	const params = resource.fileSeq != null ? `?fileSeq=${resource.fileSeq}` : ''
	return `/api/tablet/learning-resources/${encodeURIComponent(resource.pstSn)}/open${params}`
}
const resourceButton = (resource: TabletLearningResource) => resource.dataTypeCd === 'VIDEO' || resource.dataTypeCd === 'LINK' ? '보기' : '다운로드'
const textOnly = (value?: string) => value ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : ''

export const ResourceCenterPage = () => {
	const flowSession = useRequiredTabletStudentFlowSession()
	const [resources, setResources] = useState<TabletLearningResource[]>([])
	const [filter, setFilter] = useState<ResourceFilter>('ALL')
	const [keyword, setKeyword] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		if (!flowSession?.prgrmTypeCd || !flowSession.prgrmSn) {
			setLoading(false)
			return
		}
		let alive = true
		setLoading(true)
		setError('')
		fetchTabletLearningResources(flowSession.prgrmTypeCd, flowSession.prgrmSn)
			.then((items) => {
				if (alive) setResources(items)
			})
			.catch((err) => {
				if (alive) setError(err instanceof Error ? err.message : '자료실을 불러오지 못했습니다.')
			})
			.finally(() => {
				if (alive) setLoading(false)
			})
		return () => {
			alive = false
		}
	}, [flowSession?.prgrmSn, flowSession?.prgrmTypeCd])

	const filteredResources = useMemo(() => {
		const normalizedKeyword = keyword.trim().toLowerCase()
		return resources.filter((resource) => {
			if (filter === 'DOC' && resource.dataTypeCd === 'VIDEO') return false
			if (filter === 'VIDEO' && resource.dataTypeCd !== 'VIDEO') return false
			if (!normalizedKeyword) return true
			return `${resource.pstTtl ?? ''} ${textOnly(resource.pstCn)} ${resource.orgnlFileNm ?? ''}`.toLowerCase().includes(normalizedKeyword)
		})
	}, [filter, keyword, resources])

	if (!flowSession) return null

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">자료실</h1>
			<StudentCaseHeader />
			<section className="basic_board">
				<div className="subtitle"><strong>자료실</strong><p className="info">홈페이지 연계 자료 및 교육 콘텐츠</p></div>
				<div className="page_scroll">
					<div className="board_top">
						<div className="select_tab">
							<button type="button" className={`btn${filter === 'ALL' ? ' on' : ''}`} id="selectAll" onClick={() => setFilter('ALL')}>전체</button>
							<button type="button" className={`btn ico${filter === 'DOC' ? ' on' : ''}`} id="selectDocument" onClick={() => setFilter('DOC')}>문서</button>
							<button type="button" className={`btn ico${filter === 'VIDEO' ? ' on' : ''}`} id="selectVideo" onClick={() => setFilter('VIDEO')}>동영상</button>
						</div>
						<div className="search_area"><input type="text" placeholder="자료를 검색하세요." value={keyword} onChange={(event) => setKeyword(event.target.value)} /><button type="button" className="btn_search" onClick={() => undefined}></button></div>
					</div>
					<h2 className="sound_only">자료실 목록</h2>
					{loading && <div className="wbox" style={{ padding: 32 }}>자료를 불러오는 중입니다.</div>}
					{!loading && error && <div className="wbox" style={{ padding: 32 }}>{error}</div>}
					{!loading && !error && filteredResources.length === 0 && <div className="wbox" style={{ padding: 32 }}>등록된 자료가 없습니다.</div>}
					{!loading && !error && filteredResources.length > 0 && (
						<ul className="resource_wrap">
							{filteredResources.map((resource) => {
								const href = resourceHref(resource)
								return (
									<li key={`${resource.pstSn}_${resource.fileSeq ?? 'link'}`}>
										<div className={`type ${resourceType(resource)}`}>{resourceLabel(resource)}</div>
										<h3 className="tit">{resource.pstTtl}</h3>
										<p>{textOnly(resource.pstCn) || resource.orgnlFileNm || ''}</p>
										{href ? <a href={href} target="_blank" rel="noreferrer" className="btn">{resourceButton(resource)}</a> : <span className="btn" aria-disabled="true">자료 없음</span>}
									</li>
								)
							})}
						</ul>
					)}
				</div>
			</section>
		</main>
	)
}

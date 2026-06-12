import React from 'react'
import { RowActionButtons } from '../../components/RowActionButtons'

const YnBadge = ({ value }: { value: string }) => (
	<span className={`bbs-master-list-badge ${value === 'Y' ? 'is-on use' : ''}`}>
		{value === 'Y' ? '사용' : '미사용'}
	</span>
)

type BbsPostRow = {
	pstSn: string
	pstTtl: string
	wrtrNm: string
	pstgYmd: string
	regDt: string
	upendFixYn: string
	inqCnt: number
	useYn: string
}

type Props = {
	list: BbsPostRow[]
	totalCount: number
	page: number
	pageSize: number
	loading: boolean
	showTop: boolean
	selectedPostIds: Set<string>
	onToggleSelect: (pstSn: string, checked: boolean) => void
	onEdit: (row: BbsPostRow) => void
	onDelete: (pstSn: string, title: string) => void
}

export const BbsPostListCardTemplate: React.FC<Props> = ({
	list,
	totalCount,
	page,
	pageSize,
	loading,
	showTop,
	selectedPostIds,
	onToggleSelect,
	onEdit,
	onDelete
}) => (
	<div className="bbs-post-card-list">
		{list.length === 0 ? (
			<div className="bbs-post-card-empty">데이터가 없습니다.</div>
		) : (
			list.map((row, idx) => (
				<article
					key={row.pstSn}
					className="bbs-post-card-item clickable"
					onClick={() => onEdit(row)}
				>
					<div className="bbs-post-card-head">
						<label
							className="bbs-post-card-check"
							onClick={(e) => e.stopPropagation()}
						>
							<input
								type="checkbox"
								checked={selectedPostIds.has(row.pstSn)}
								onChange={(e) => onToggleSelect(row.pstSn, e.target.checked)}
								aria-label={`${row.pstTtl} 선택`}
							/>
						</label>
						<strong className="bbs-post-card-no">
							{totalCount - (page - 1) * pageSize - idx}
						</strong>
						<span className="bbs-post-card-title">{row.pstTtl}</span>
					</div>
					<div className="bbs-post-card-meta">
						<span>작성자 {row.wrtrNm || '-'}</span>
						<span>등록일 {row.pstgYmd || row.regDt?.slice(0, 10) || '-'}</span>
						{showTop ? <span><YnBadge value={row.upendFixYn} /></span> : null}
						<span>조회수 {row.inqCnt ?? 0}</span>
						<span><YnBadge value={row.useYn} /></span>
					</div>
					<div className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
						<RowActionButtons
							onEdit={() => onEdit(row)}
							onDelete={() => onDelete(row.pstSn, row.pstTtl)}
							disabled={loading}
						/>
					</div>
				</article>
			))
		)}
	</div>
)

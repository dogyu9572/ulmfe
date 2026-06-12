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
	thumFileId?: string
}

type Props = {
	list: BbsPostRow[]
	totalCount: number
	page: number
	pageSize: number
	loading: boolean
	thumbnailUrlMap: Record<string, string>
	showTop: boolean
	selectedPostIds: Set<string>
	onToggleSelect: (pstSn: string, checked: boolean) => void
	onEdit: (row: BbsPostRow) => void
	onDelete: (pstSn: string, title: string) => void
}

export const BbsPostListThumbTemplate: React.FC<Props> = ({
	list,
	totalCount,
	page,
	pageSize,
	loading,
	thumbnailUrlMap,
	showTop,
	selectedPostIds,
	onToggleSelect,
	onEdit,
	onDelete
}) => (
	<div className="bbs-post-thumb-list">
		{list.length === 0 ? (
			<div className="bbs-post-thumb-empty">데이터가 없습니다.</div>
		) : (
			list.map((row, idx) => (
				<article
					key={row.pstSn}
					className="bbs-post-thumb-item clickable"
					onClick={() => onEdit(row)}
				>
					<div className="bbs-post-thumb-image" aria-hidden>
						{row.thumFileId && thumbnailUrlMap[row.thumFileId] ? (
							<img src={thumbnailUrlMap[row.thumFileId]} alt="" className="bbs-post-thumb-image-img" />
						) : (
							<span className="bbs-post-thumb-image-placeholder">THUMB</span>
						)}
					</div>
					<label
						className="bbs-post-thumb-check"
						onClick={(e) => e.stopPropagation()}
					>
						<input
							type="checkbox"
							checked={selectedPostIds.has(row.pstSn)}
							onChange={(e) => onToggleSelect(row.pstSn, e.target.checked)}
							aria-label={`${row.pstTtl} 선택`}
						/>
					</label>
					<div className="bbs-post-thumb-body">
						<div className="bbs-post-thumb-title-wrap">
							<strong className="bbs-post-thumb-no">
								{totalCount - (page - 1) * pageSize - idx}
							</strong>
							<span className="bbs-post-thumb-title">{row.pstTtl}</span>
						</div>
						<div className="bbs-post-thumb-meta">
							<span>작성자 {row.wrtrNm || '-'}</span>
							<span>등록일 {row.pstgYmd || row.regDt?.slice(0, 10) || '-'}</span>
							{showTop ? <span><YnBadge value={row.upendFixYn} /></span> : null}
							<span>조회수 {row.inqCnt ?? 0}</span>
							<span><YnBadge value={row.useYn} /></span>
						</div>
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

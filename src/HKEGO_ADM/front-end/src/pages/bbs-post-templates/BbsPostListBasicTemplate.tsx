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
	category?: string
	thumFileId?: string
	thmbFileId?: string
	atchFileMngNo?: string
	pstgYmd: string
	regDt: string
	upendFixYn: string
	inqCnt: number
	useYn: string
	ansSttsCd?: string
	answrNm?: string
	ansYmd?: string
}

type Props = {
	list: BbsPostRow[]
	totalCount: number
	page: number
	pageSize: number
	loading: boolean
	showThum: boolean
	thumbnailUrlMap: Record<string, string>
	showCate: boolean
	categoryLabel: string
	titleLabel: string
	qnaMode: boolean
	showTop: boolean
	getCategoryLabel: (code: string | undefined) => string
	selectedPostIds: Set<string>
	allSelected: boolean
	someSelected: boolean
	onToggleSelect: (pstSn: string, checked: boolean) => void
	onToggleSelectAll: (checked: boolean) => void
	onEdit: (row: BbsPostRow) => void
	onDelete: (pstSn: string, title: string) => void
}

export const BbsPostListBasicTemplate: React.FC<Props> = ({
	list,
	totalCount,
	page,
	pageSize,
	loading,
	showThum,
	thumbnailUrlMap,
	showCate,
	categoryLabel,
	titleLabel,
	qnaMode,
	showTop,
	getCategoryLabel,
	selectedPostIds,
	allSelected,
	someSelected,
	onToggleSelect,
	onToggleSelectAll,
	onEdit,
	onDelete
}) => {
	const colSpan = qnaMode ? 8 : 8 + (showThum ? 1 : 0) + (showCate ? 1 : 0) + (showTop ? 1 : 0)
	const getAnswerStatusLabel = (status: string | undefined) =>
		(status || '').toUpperCase() === 'DONE' ? '답변완료' : '답변대기'

	return (
		<table className="table bbs-post-basic-list-table">
			<thead>
				<tr>
					<th className="table-col-check" style={{ width: '50px'}}>
						<input
							type="checkbox"
							checked={allSelected}
							ref={(el) => {
								if (el) el.indeterminate = someSelected
							}}
							onChange={(e) => onToggleSelectAll(e.target.checked)}
							aria-label="전체 선택"
						/>
					</th>
					<th style={{ width: '50px'}}>{qnaMode ? 'No' : '번호'}</th>
					{!qnaMode && showThum ? <th style={{ width: '90px'}}>썸네일</th> : null}
					{!qnaMode && showCate ? <th style={{ width: '90px'}}>{categoryLabel}</th> : null}
					<th style={{ width: 'auto'}}>{titleLabel}</th>
					<th style={{ width: '90px'}}>작성자</th>
					<th style={{ width: '120px'}}>등록일</th>
					{qnaMode ? <th style={{ width: '100px'}}>답변자</th> : null}
					{qnaMode ? <th style={{ width: '120px'}}>답변일</th> : null}
					{qnaMode ? <th style={{ width: '100px'}}>답변상태</th> : null}
					{!qnaMode && showTop ? <th style={{ width: '80px'}}>상단고정</th> : null}
					{!qnaMode ? <th style={{ width: '70px'}}>조회수</th> : null}
					{!qnaMode ? <th style={{ width: '80px'}}>사용</th> : null}
					<th style={{ width: '120px'}}>관리</th>
				</tr>
			</thead>
			<tbody>
				{list.map((row, idx) => {
					const thumbnailId =
						(row.thumFileId || '').trim() ||
						(row.thmbFileId || '').trim() ||
						(row.atchFileMngNo || '').trim()
					return (
						<tr key={row.pstSn} className="clickable" onClick={() => onEdit(row)}>
							<td className="table-col-check" onClick={(e) => e.stopPropagation()}>
								<input
									type="checkbox"
									checked={selectedPostIds.has(row.pstSn)}
									onChange={(e) => onToggleSelect(row.pstSn, e.target.checked)}
									aria-label={`${row.pstTtl} 선택`}
								/>
							</td>
							<td>{totalCount - (page - 1) * pageSize - idx}</td>
							{!qnaMode && showThum ? (
								<td>
									{thumbnailId && thumbnailUrlMap[thumbnailId] ? (
										<img src={thumbnailUrlMap[thumbnailId]} alt="" className="bbs-post-basic-thum" />
									) : (
										<span className="bbs-post-basic-thum-empty" aria-hidden>THUMB</span>
									)}
								</td>
							) : null}
							{!qnaMode && showCate ? <td>{getCategoryLabel(row.category)}</td> : null}
							<td className="bbs-post-list-title" title={row.pstTtl}>{row.pstTtl}</td>
							<td>{row.wrtrNm}</td>
							<td>{row.pstgYmd || row.regDt?.slice(0, 10)}</td>
							{qnaMode ? <td>{row.answrNm || '-'}</td> : null}
							{qnaMode ? <td>{row.ansYmd || '-'}</td> : null}
							{qnaMode ? <td>{getAnswerStatusLabel(row.ansSttsCd)}</td> : null}
							{!qnaMode && showTop ? <td><YnBadge value={row.upendFixYn} /></td> : null}
							{!qnaMode ? <td>{row.inqCnt ?? 0}</td> : null}
							{!qnaMode ? <td><YnBadge value={row.useYn} /></td> : null}
							<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
								<RowActionButtons
									onEdit={() => onEdit(row)}
									onDelete={() => onDelete(row.pstSn, row.pstTtl)}
									disabled={loading}
									editLabel={qnaMode ? '확인' : '수정'}
								/>
							</td>
						</tr>
					)
				})}
				{list.length === 0 && (
				<tr>
					<td colSpan={colSpan} style={{ textAlign: 'center' }}>
						데이터가 없습니다.
					</td>
				</tr>
				)}
			</tbody>
		</table>
	)
}

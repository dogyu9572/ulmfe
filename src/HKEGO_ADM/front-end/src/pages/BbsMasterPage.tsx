import React, { useCallback, useEffect, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'
import { ListPagination } from '../components/ListPagination'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL, resolveBackendUrl } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type BbsMasterDto = {
	bbsId: string
	bbsNm: string
	bbsCn: string
	bbsSkinCd: string
	bbsImg: string
	pageArtclCnt: number
	atchFileYn: string
	fileCnt: number
	fileSize: number | null
	useYn: string
	repYn: string
	cmtYn: string
	seqYn: string
	mainYn: string
	topYn: string
	thumYn: string
	linkYn: string
	hideYn: string
	lockYn: string
	newYn: string
	newNo: number
	hotYn: string
	hotNo: number
	cateYn: string
	cateCd: string
	etc1Yn: string
	etc1Nm: string
	etc1Tp: string
	etc1Cd: string
	etc2Yn: string
	etc2Nm: string
	etc2Tp: string
	etc2Cd: string
	etc3Yn: string
	etc3Nm: string
	etc3Tp: string
	etc3Cd: string
	etc4Yn: string
	etc4Nm: string
	etc4Tp: string
	etc4Cd: string
	etc5Yn: string
	etc5Nm: string
	etc5Tp: string
	etc5Cd: string
	posblList: string
	posblView: string
	posblWrite: string
	regId: string
	regDt: string
	modId: string
	modDt: string
}

const BACKEND = API_BASE_URL

const defaultForm: BbsMasterDto = {
	bbsId: '',
	bbsNm: '',
	bbsCn: '',
	bbsSkinCd: 'LIST_BASIC',
	bbsImg: '',
	pageArtclCnt: 10,
	atchFileYn: 'N',
	fileCnt: 0,
	fileSize: null,
	useYn: 'Y',
	repYn: 'N',
	cmtYn: 'N',
	seqYn: 'N',
	mainYn: 'N',
	topYn: 'N',
	thumYn: 'N',
	linkYn: 'N',
	hideYn: 'N',
	lockYn: 'N',
	newYn: 'N',
	newNo: 0,
	hotYn: 'N',
	hotNo: 0,
	cateYn: 'N',
	cateCd: '',
	etc1Yn: 'N',
	etc1Nm: '',
	etc1Tp: 'input',
	etc1Cd: '',
	etc2Yn: 'N',
	etc2Nm: '',
	etc2Tp: 'input',
	etc2Cd: '',
	etc3Yn: 'N',
	etc3Nm: '',
	etc3Tp: 'input',
	etc3Cd: '',
	etc4Yn: 'N',
	etc4Nm: '',
	etc4Tp: 'input',
	etc4Cd: '',
	etc5Yn: 'N',
	etc5Nm: '',
	etc5Tp: 'input',
	etc5Cd: '',
	posblList: '1',
	posblView: '1',
	posblWrite: '3',
	regId: '',
	regDt: '',
	modId: '',
	modDt: ''
}

const EXTRA_TYPE_OPTIONS = ['input', 'textarea', 'checkbox', 'radio', 'select']
const BYTES_PER_MB = 1024 * 1024
const BBS_SKIN_OPTIONS = ['LIST_BASIC', 'LIST_CARD', 'LIST_THUMB'] as const

function normalizeBbsSkin(v: string | null | undefined): (typeof BBS_SKIN_OPTIONS)[number] {
	const s = String(v || '').trim().toUpperCase()
	return (BBS_SKIN_OPTIONS as readonly string[]).includes(s) ? (s as (typeof BBS_SKIN_OPTIONS)[number]) : 'LIST_BASIC'
}

const ynBadge = (value: string, kind: 'file' | 'cate' | 'thum' | 'link' | 'use') => {
	const isOn = value === 'Y'
	return (
		<span className={`bbs-master-list-badge ${isOn ? `is-on ${kind}` : ''}`}>
			{isOn ? '사용' : '미사용'}
		</span>
	)
}

const bytesToMb = (bytes: number | null): string => {
	if (bytes == null || Number.isNaN(bytes)) {
		return ''
	}
	const mb = bytes / BYTES_PER_MB
	return Number.isInteger(mb) ? String(mb) : mb.toFixed(2)
}

const mbToBytes = (mbText: string): number | null => {
	if (!mbText || mbText.trim() === '') {
		return null
	}
	const mb = Number(mbText)
	if (!Number.isFinite(mb) || mb < 0) {
		return null
	}
	return Math.round(mb * BYTES_PER_MB)
}

const formatDateTime = (value: string): string => {
	if (!value) {
		return '-'
	}
	const text = String(value).replace('T', ' ')
	return text.length >= 16 ? text.slice(0, 16) : text
}

const renderYnRadios = (
	name: string,
	value: string,
	onChange: (value: string) => void
) => (
	<button
		type="button"
		name={name}
		className={`yn-toggle ${value === 'Y' ? 'is-on' : 'is-off'}`}
		onClick={() => onChange(value === 'Y' ? 'N' : 'Y')}
		aria-pressed={value === 'Y'}
	>
		<span className="yn-toggle-label">{value === 'Y' ? '사용' : '미사용'}</span>
		<span className="yn-toggle-knob" aria-hidden="true" />
	</button>
)

export const BbsMasterPage: React.FC = () => {
	const [list, setList] = useState<BbsMasterDto[]>([])
	const [useYnFilter, setUseYnFilter] = useState<string>('')
	const [form, setForm] = useState<BbsMasterDto>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [fileSizeMbInput, setFileSizeMbInput] = useState<string>('')
	const [bbsImgFile, setBbsImgFile] = useState<File | null>(null)
	const [bbsImgPreviewUrl, setBbsImgPreviewUrl] = useState<string>('')
	const [bbsImgDisplayName, setBbsImgDisplayName] = useState<string>('')
	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const pageSize = DEFAULT_LIST_PAGE_SIZE

	const fetchList = useCallback(async (targetPage = page) => {
		setError(null)
		try {
			const p: string[] = [`page=${targetPage}`, `size=${pageSize}`]
			if (useYnFilter) p.push(`useYn=${encodeURIComponent(useYnFilter)}`)
			const res = await fetch(`${BACKEND}/api/admin/bbs-master?${p.join('&')}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<BbsMasterDto>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
		} catch {
			setError('게시판 마스터 목록 조회 중 오류가 발생했습니다.')
		}
	}, [useYnFilter, page, pageSize])

	const handleSearch = () => {
		setPage(1)
		void fetchList(1)
	}

	useEffect(() => {
		void fetchList(page)
	}, [fetchList, page])

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	useEffect(() => {
		if (!popupOpen) return
		if (bbsImgFile) {
			const url = URL.createObjectURL(bbsImgFile)
			setBbsImgPreviewUrl(url)
			setBbsImgDisplayName(bbsImgFile.name)
			return () => URL.revokeObjectURL(url)
		}
		if (!form.bbsImg) {
			setBbsImgPreviewUrl('')
			setBbsImgDisplayName('')
			return
		}
		let cancelled = false
		fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(form.bbsImg)}`, { credentials: 'include' })
			.then((res) => res.json())
			.then((result: ApiResponse<{ fileUrl?: string; fileOriginName?: string }>) => {
				if (cancelled || !result.success || !result.data) return
				setBbsImgPreviewUrl(resolveBackendUrl(result.data.fileUrl || ''))
				setBbsImgDisplayName(result.data.fileOriginName || form.bbsImg)
			})
			.catch(() => {
				if (cancelled) return
				setBbsImgPreviewUrl('')
				setBbsImgDisplayName(form.bbsImg)
			})
		return () => {
			cancelled = true
		}
	}, [popupOpen, bbsImgFile, form.bbsImg])

	const openNewPopup = () => {
		setForm({ ...defaultForm })
		setFileSizeMbInput(bytesToMb(defaultForm.fileSize))
		setBbsImgFile(null)
		setBbsImgPreviewUrl('')
		setBbsImgDisplayName('')
		setPopupMode('new')
		setPopupOpen(true)
	}
	const openEditPopup = (row: BbsMasterDto) => {
		setForm({
			...defaultForm,
			...row,
			bbsSkinCd: normalizeBbsSkin(row.bbsSkinCd),
			fileSize: row.fileSize ?? null,
			cateCd: row.cateCd ?? ''
		})
		setFileSizeMbInput(bytesToMb(row.fileSize ?? null))
		setBbsImgFile(null)
		setBbsImgPreviewUrl('')
		setBbsImgDisplayName('')
		setPopupMode('edit')
		setPopupOpen(true)
	}
	const closePopup = () => {
		setPopupOpen(false)
		setError(null)
		setFileSizeMbInput('')
		setBbsImgFile(null)
		setBbsImgPreviewUrl('')
		setBbsImgDisplayName('')
	}

	const handleSave = async () => {
		if (!form.bbsNm?.trim()) {
			setError('게시판명을 입력하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			let nextBbsImg = form.bbsImg
			if (bbsImgFile) {
				const fd = new FormData()
				fd.append('file', bbsImgFile)
				fd.append('menuType', 'bbs')
				const uploadRes = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
					method: 'POST',
					body: fd,
					credentials: 'include'
				})
				const uploadResult: ApiResponse<{ fiId?: string }> = await uploadRes.json()
				if (!uploadResult.success || !uploadResult.data?.fiId) {
					setError(uploadResult.message || '게시판 이미지 업로드에 실패했습니다.')
					return
				}
				nextBbsImg = uploadResult.data.fiId
			}

			if (popupMode === 'new') {
				const { bbsId: _, ...body } = { ...form, bbsImg: nextBbsImg, bbsSkinCd: normalizeBbsSkin(form.bbsSkinCd) }
				const res = await fetch(`${BACKEND}/api/admin/bbs-master`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				})
				const result: ApiResponse<BbsMasterDto> = await res.json()
				if (!result.success) {
					setError(result.message || '등록에 실패했습니다.')
					return
				}
				setMessage('게시판 마스터가 등록되었습니다.')
			} else {
				const res = await fetch(
					`${BACKEND}/api/admin/bbs-master/${encodeURIComponent(form.bbsId)}`,
					{
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ ...form, bbsImg: nextBbsImg, bbsSkinCd: normalizeBbsSkin(form.bbsSkinCd) }),
						credentials: 'include'
					}
				)
				const result: ApiResponse<BbsMasterDto> = await res.json()
				if (!result.success) {
					setError(result.message || '수정에 실패했습니다.')
					return
				}
				setMessage('게시판 마스터가 수정되었습니다.')
			}
			closePopup()
			await fetchList(page)
		} catch {
			setError(popupMode === 'new' ? '등록 중 오류가 발생했습니다.' : '수정 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!form.bbsId) return
		if (!window.confirm(`게시판 "${form.bbsNm}"를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(
				`${BACKEND}/api/admin/bbs-master/${encodeURIComponent(form.bbsId)}`,
				{ method: 'DELETE', credentials: 'include' }
			)
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('게시판 마스터가 삭제되었습니다.')
			closePopup()
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteRow = async (bbsId: string, bbsNm: string) => {
		if (!window.confirm(`게시판 "${bbsNm}"를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(
				`${BACKEND}/api/admin/bbs-master/${encodeURIComponent(bbsId)}`,
				{ method: 'DELETE', credentials: 'include' }
			)
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('게시판 마스터가 삭제되었습니다.')
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AdminLayout title="게시판 마스터 관리">
			<CrudPageCard title="게시판 마스터 관리" error={error} message={message}>
				<div className="code-filters search-section" style={{ flexWrap: 'wrap', gap: '8px' }}>
					<label>
						사용여부
						<select value={useYnFilter} onChange={(e) => setUseYnFilter(e.target.value)}>
							<option value="">전체</option>
							<option value="Y">Y</option>
							<option value="N">N</option>
						</select>
					</label>
					<button type="button" className="admin-list-btn-sky" onClick={handleSearch}>조회</button>
				</div>
				<div className="list-toolbar">
					<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
					<button type="button" className="admin-list-btn-sky" onClick={openNewPopup}>신규</button>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th>게시판ID</th>
							<th>게시판명</th>
							<th>요약설명</th>
							<th>스킨</th>
							<th>페이지당 게시물</th>
							<th>파일첨부</th>
							<th>카테고리</th>
							<th>썸네일</th>
							<th>링크</th>
							<th>사용여부</th>
							<th>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr
								key={row.bbsId}
								className="clickable"
								onClick={() => openEditPopup(row)}
							>
								<td>{row.bbsId}</td>
								<td>{row.bbsNm}</td>
								<td>{row.bbsCn}</td>
								<td>{row.bbsSkinCd}</td>
								<td>{row.pageArtclCnt}</td>
								<td>{ynBadge(row.atchFileYn, 'file')}</td>
								<td>{ynBadge(row.cateYn, 'cate')}</td>
								<td>{ynBadge(row.thumYn, 'thum')}</td>
								<td>{ynBadge(row.linkYn, 'link')}</td>
								<td>{ynBadge(row.useYn, 'use')}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => openEditPopup(row)}
										onDelete={() => handleDeleteRow(row.bbsId, row.bbsNm)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={11} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>
				<ListPagination
					page={page}
					totalPages={totalPages}
					disabled={loading}
					onPageChange={(p) => setPage(p)}
				/>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={popupMode === 'new' ? '게시판 마스터 등록' : '게시판 마스터 상세 (수정)'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						{popupMode === 'edit' && form.bbsId && (
							<button
								type="button"
								onClick={handleDelete}
								disabled={loading}
								className="admin-footer-btn-delete"
								style={{ marginRight: 'auto' }}
							>
								삭제
							</button>
						)}
						<button type="button" className="admin-list-btn-edit" onClick={handleSave} disabled={loading}>
							{popupMode === 'new' ? '등록' : '수정'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup}>닫기</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table form-table-cols4 bbs-master-form-table">
					<tbody>
						<tr>
							<th colSpan={4} className="bbs-master-section-title">기본 정보</th>
						</tr>
						{popupMode === 'edit' && (
							<>
								<tr>
									<th>게시판ID</th>
									<td><input type="text" value={form.bbsId} readOnly /></td>
									<th>게시판명</th>
									<td>
										<input
											type="text"
											value={form.bbsNm}
											onChange={(e) => setForm({ ...form, bbsNm: e.target.value })}
										/>
									</td>
								</tr>
								<tr>
									<th>요약설명</th>
									<td colSpan={3}>
										<textarea
											value={form.bbsCn}
											onChange={(e) => setForm({ ...form, bbsCn: e.target.value })}
											rows={3}
										/>
									</td>
								</tr>
								<tr>
									<th>사용여부</th>
									<td>
										{renderYnRadios('useYn-edit', form.useYn, (value) => setForm({ ...form, useYn: value }))}
									</td>
									<th>스킨</th>
									<td>
									<select
										value={normalizeBbsSkin(form.bbsSkinCd)}
										onChange={(e) => setForm({ ...form, bbsSkinCd: e.target.value })}
									>
										{BBS_SKIN_OPTIONS.map((skin) => (
											<option key={skin} value={skin}>{skin}</option>
										))}
									</select>
									</td>
								</tr>
							</>
						)}
						{popupMode === 'new' && (
							<>
								<tr>
									<th>게시판명</th>
									<td colSpan={3}>
										<input
											type="text"
											value={form.bbsNm}
											onChange={(e) => setForm({ ...form, bbsNm: e.target.value })}
										/>
									</td>
								</tr>
								<tr>
									<th>요약설명</th>
									<td colSpan={3}>
										<textarea
											value={form.bbsCn}
											onChange={(e) => setForm({ ...form, bbsCn: e.target.value })}
											rows={3}
										/>
									</td>
								</tr>
								<tr>
									<th>사용여부</th>
									<td>
										{renderYnRadios('useYn-new', form.useYn, (value) => setForm({ ...form, useYn: value }))}
									</td>
									<th>스킨</th>
									<td>
									<select
										value={normalizeBbsSkin(form.bbsSkinCd)}
										onChange={(e) => setForm({ ...form, bbsSkinCd: e.target.value })}
									>
										{BBS_SKIN_OPTIONS.map((skin) => (
											<option key={skin} value={skin}>{skin}</option>
										))}
									</select>
									</td>
								</tr>
							</>
						)}
						{popupMode === 'edit' && (
							<tr>
								<th>파일첨부</th>
								<td colSpan={3}>
									{renderYnRadios('atchFileYn-edit', form.atchFileYn, (value) => setForm({ ...form, atchFileYn: value }))}
									{form.atchFileYn === 'Y' && (
										<>
											<label style={{ marginLeft: 8 }}>
												갯수
												<input
													type="number"
													value={form.fileCnt}
													onChange={(e) => setForm({ ...form, fileCnt: Number(e.target.value) || 0 })}
													style={{ width: 50, marginLeft: 4 }}
												/>
											</label>
											<label style={{ marginLeft: 8 }}>
												용량(MB)
												<input
													type="number"
													step="0.1"
													min="0"
													value={fileSizeMbInput}
													onChange={(e) => {
														const nextMb = e.target.value
														setFileSizeMbInput(nextMb)
														setForm({ ...form, fileSize: mbToBytes(nextMb) })
													}}
													style={{ width: 80, marginLeft: 4 }}
												/>
											</label>
										</>
									)}
								</td>
							</tr>
						)}
						{popupMode === 'new' && (
							<tr>
								<th>게시판 이미지</th>
								<td colSpan={3}>
									<label className="category-file-input">
										<input
											type="file"
											accept="image/*"
											onChange={(e) => setBbsImgFile(e.target.files?.[0] ?? null)}
										/>
										<span className="category-file-input-btn">파일 선택</span>
										<span className="category-file-input-name">
											{bbsImgDisplayName || '선택된 파일 없음'}
										</span>
									</label>
									{bbsImgPreviewUrl && (
										<img src={bbsImgPreviewUrl} alt="게시판 이미지 미리보기" className="category-thumb-preview" />
									)}
								</td>
							</tr>
						)}
						{popupMode === 'edit' && (
							<tr>
								<th>게시판 이미지</th>
								<td colSpan={3}>
									<label className="category-file-input">
										<input
											type="file"
											accept="image/*"
											onChange={(e) => setBbsImgFile(e.target.files?.[0] ?? null)}
										/>
										<span className="category-file-input-btn">파일 선택</span>
										<span className="category-file-input-name">
											{bbsImgDisplayName || '선택된 파일 없음'}
										</span>
									</label>
									{bbsImgPreviewUrl && (
										<img src={bbsImgPreviewUrl} alt="게시판 이미지 미리보기" className="category-thumb-preview" />
									)}
								</td>
							</tr>
						)}
						{popupMode === 'new' && (
							<tr>
								<th>파일첨부</th>
								<td colSpan={3}>
									{renderYnRadios('atchFileYn-new', form.atchFileYn, (value) => setForm({ ...form, atchFileYn: value }))}
									{form.atchFileYn === 'Y' && (
										<>
											<label style={{ marginLeft: 8 }}>
												갯수
												<input
													type="number"
													value={form.fileCnt}
													onChange={(e) => setForm({ ...form, fileCnt: Number(e.target.value) || 0 })}
													style={{ width: 50, marginLeft: 4 }}
												/>
											</label>
											<label style={{ marginLeft: 8 }}>
												용량(MB)
												<input
													type="number"
													step="0.1"
													min="0"
													value={fileSizeMbInput}
													onChange={(e) => {
														const nextMb = e.target.value
														setFileSizeMbInput(nextMb)
														setForm({ ...form, fileSize: mbToBytes(nextMb) })
													}}
													style={{ width: 80, marginLeft: 4 }}
												/>
											</label>
										</>
									)}
								</td>
							</tr>
						)}
						{popupMode === 'edit' && (
							<tr>
								<th>답변/댓글</th>
								<td colSpan={3}>
									<div className="bbs-master-inline-group">
										<label>
											답변가능{' '}
											{renderYnRadios('repYn-edit-inline', form.repYn, (value) => setForm({ ...form, repYn: value }))}
										</label>
										<label>
											댓글가능{' '}
											{renderYnRadios('cmtYn-edit-inline', form.cmtYn, (value) => setForm({ ...form, cmtYn: value }))}
										</label>
										<label>
											페이지당 게시물 수{' '}
											<input
												type="number"
												value={form.pageArtclCnt}
												onChange={(e) => setForm({ ...form, pageArtclCnt: Number(e.target.value) || 0 })}
												style={{ width: 72 }}
											/>
										</label>
									</div>
								</td>
							</tr>
						)}
						<tr>
							<th colSpan={4} className="bbs-master-section-title">표시/권한 설정</th>
						</tr>
						{popupMode === 'new' && (
							<tr>
								<th>답변/댓글</th>
								<td>
									<label>
										답변가능{' '}
										<select
											value={form.repYn}
											onChange={(e) => setForm({ ...form, repYn: e.target.value })}
										>
											<option value="Y">Y</option>
											<option value="N">N</option>
										</select>
									</label>
									<label style={{ marginLeft: 8 }}>
										댓글가능{' '}
										<select
											value={form.cmtYn}
											onChange={(e) => setForm({ ...form, cmtYn: e.target.value })}
										>
											<option value="Y">Y</option>
											<option value="N">N</option>
										</select>
									</label>
									<label style={{ marginLeft: 8 }}>
										페이지당 게시물 수{' '}
										<input
											type="number"
											value={form.pageArtclCnt}
											onChange={(e) => setForm({ ...form, pageArtclCnt: Number(e.target.value) || 0 })}
											style={{ width: 72 }}
										/>
									</label>
								</td>
								<th>메인/상단/순서</th>
								<td>
									<div className="bbs-master-inline-group">
										<label>
										메인노출{' '}
										{renderYnRadios('mainYn-new', form.mainYn, (value) => setForm({ ...form, mainYn: value }))}
										</label>
										<label>
										상단고정{' '}
										{renderYnRadios('topYn-new', form.topYn, (value) => setForm({ ...form, topYn: value }))}
										</label>
										<label>
										순서기능{' '}
										{renderYnRadios('seqYn-new', form.seqYn, (value) => setForm({ ...form, seqYn: value }))}
										</label>
									</div>
								</td>
							</tr>
						)}
						{popupMode === 'edit' && (
							<tr>
								<th>메인/상단/순서</th>
								<td colSpan={3}>
									<div className="bbs-master-inline-group">
										<label>
										메인노출{' '}
										{renderYnRadios('mainYn-edit', form.mainYn, (value) => setForm({ ...form, mainYn: value }))}
										</label>
										<label>
										상단고정{' '}
										{renderYnRadios('topYn-edit', form.topYn, (value) => setForm({ ...form, topYn: value }))}
										</label>
										<label>
										순서기능{' '}
										{renderYnRadios('seqYn-edit', form.seqYn, (value) => setForm({ ...form, seqYn: value }))}
										</label>
									</div>
								</td>
							</tr>
						)}
						<tr>
							<th>추가옵션</th>
							<td colSpan={3}>
								<label>
									썸네일{' '}
									{renderYnRadios('thumYn', form.thumYn, (value) => setForm({ ...form, thumYn: value }))}
								</label>
								<label style={{ marginLeft: 8 }}>
									링크{' '}
									{renderYnRadios('linkYn', form.linkYn, (value) => setForm({ ...form, linkYn: value }))}
								</label>
								<label style={{ marginLeft: 8 }}>
									숨김{' '}
									{renderYnRadios('hideYn', form.hideYn, (value) => setForm({ ...form, hideYn: value }))}
								</label>
								<label style={{ marginLeft: 8 }}>
									잠금{' '}
									{renderYnRadios('lockYn', form.lockYn, (value) => setForm({ ...form, lockYn: value }))}
								</label>
							</td>
						</tr>
						<tr>
							<th>새글/인기글</th>
							<td colSpan={3}>
								<label>
									새글{' '}
									{renderYnRadios('newYn', form.newYn, (value) => setForm({ ...form, newYn: value }))}
								</label>
								<label style={{ marginLeft: 8 }}>
									새글일수{' '}
									<input
										type="number"
										value={form.newNo}
										onChange={(e) => setForm({ ...form, newNo: Number(e.target.value) || 0 })}
										style={{ width: 70 }}
									/>
								</label>
								<label style={{ marginLeft: 8 }}>
									인기글{' '}
									{renderYnRadios('hotYn', form.hotYn, (value) => setForm({ ...form, hotYn: value }))}
								</label>
								<label style={{ marginLeft: 8 }}>
									기준조회수{' '}
									<input
										type="number"
										value={form.hotNo}
										onChange={(e) => setForm({ ...form, hotNo: Number(e.target.value) || 0 })}
										style={{ width: 90 }}
									/>
								</label>
							</td>
						</tr>
						<tr>
							<th>카테고리</th>
							<td colSpan={3}>
								<label>
									사용{' '}
									{renderYnRadios('cateYn', form.cateYn, (value) => setForm({ ...form, cateYn: value }))}
								</label>
								<label style={{ marginLeft: 8 }}>
									코드ID{' '}
									<input
										type="text"
										value={form.cateCd}
										onChange={(e) => setForm({ ...form, cateCd: e.target.value })}
										placeholder="예: COM020"
									/>
								</label>
							</td>
						</tr>
						{([1, 2, 3, 4, 5] as const).map((idx) => {
							const ynKey = `etc${idx}Yn` as const
							const nmKey = `etc${idx}Nm` as const
							const tpKey = `etc${idx}Tp` as const
							const cdKey = `etc${idx}Cd` as const
							const etcEnabled = form[ynKey] === 'Y'
							const showCodeId = ['select', 'radio', 'checkbox'].includes(form[tpKey])
							return (
								<tr key={`etc-${idx}`}>
									<th>{`ETC${idx}`}</th>
									<td colSpan={3}>
										<label>
											사용{' '}
											{renderYnRadios(`etc${idx}Yn`, form[ynKey], (value) => setForm({ ...form, [ynKey]: value }))}
										</label>
										{etcEnabled && (
											<>
												<label style={{ marginLeft: 8 }}>
													명칭{' '}
													<input
														type="text"
														value={form[nmKey]}
														onChange={(e) => setForm({ ...form, [nmKey]: e.target.value })}
														style={{ width: 120 }}
													/>
												</label>
											<label style={{ marginLeft: 8 }}>
												타입
											</label>
											<select
												value={form[tpKey]}
												onChange={(e) => setForm({ ...form, [tpKey]: e.target.value })}
												style={{ width: 120 }}
											>
												{EXTRA_TYPE_OPTIONS.map((tp) => (
													<option key={`${idx}-${tp}`} value={tp}>{tp}</option>
												))}
											</select>
											{showCodeId && (
												<label style={{ marginLeft: 8 }}>
													코드ID{' '}
													<input
														type="text"
														value={form[cdKey]}
														onChange={(e) => setForm({ ...form, [cdKey]: e.target.value })}
														style={{ width: 120 }}
													/>
												</label>
											)}
											</>
										)}
									</td>
								</tr>
							)
						})}
						{popupMode === 'edit' && (
							<tr>
								<th>등록</th>
								<td>
									{`${form.regId || '-'} (${formatDateTime(form.regDt)})`}
								</td>
								<th>수정</th>
								<td>
									{`${form.modId || '-'} (${formatDateTime(form.modDt)})`}
								</td>
							</tr>
						)}
						{popupMode === 'edit' && (
							<tr>
								<th>권한</th>
								<td colSpan={3}>
									<label>
										리스트{' '}
										<select
											value={form.posblList}
											onChange={(e) => setForm({ ...form, posblList: e.target.value })}
										>
											<option value="1">전체</option>
											<option value="2">회원</option>
											<option value="3">관리자</option>
										</select>
									</label>
									<label style={{ marginLeft: 8 }}>
										상세보기{' '}
										<select
											value={form.posblView}
											onChange={(e) => setForm({ ...form, posblView: e.target.value })}
										>
											<option value="1">전체</option>
											<option value="2">회원</option>
											<option value="3">관리자</option>
										</select>
									</label>
									<label style={{ marginLeft: 8 }}>
										작성{' '}
										<select
											value={form.posblWrite}
											onChange={(e) => setForm({ ...form, posblWrite: e.target.value })}
										>
											<option value="1">전체</option>
											<option value="2">회원</option>
											<option value="3">관리자</option>
										</select>
									</label>
								</td>
							</tr>
						)}
						{popupMode === 'new' && (
							<tr>
								<th>권한</th>
								<td colSpan={3}>
									<label>
										리스트{' '}
										<select
											value={form.posblList}
											onChange={(e) => setForm({ ...form, posblList: e.target.value })}
										>
											<option value="1">전체</option>
											<option value="2">회원</option>
											<option value="3">관리자</option>
										</select>
									</label>
									<label style={{ marginLeft: 8 }}>
										상세보기{' '}
										<select
											value={form.posblView}
											onChange={(e) => setForm({ ...form, posblView: e.target.value })}
										>
											<option value="1">전체</option>
											<option value="2">회원</option>
											<option value="3">관리자</option>
										</select>
									</label>
									<label style={{ marginLeft: 8 }}>
										작성{' '}
										<select
											value={form.posblWrite}
											onChange={(e) => setForm({ ...form, posblWrite: e.target.value })}
										>
											<option value="1">전체</option>
											<option value="2">회원</option>
											<option value="3">관리자</option>
										</select>
									</label>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

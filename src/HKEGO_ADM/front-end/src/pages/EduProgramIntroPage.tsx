// 홈페이지 교육프로그램 소개 목록에 노출할 프로그램을 등록·정렬·노출 관리하는 화면
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { API_BASE_URL, resolveBackendUrl } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type SessionInfo = {
	adminId: string
	adminName: string
}

type CategoryCode = {
	code: string
	name: string
}

type EduProgramIntroDto = {
	prgrmIntrdSn: number | null
	prgrmCtgryCd: string
	prgrmTtl: string
	prgrmExpln: string
	plcCn: string
	oprtnPdCn: string
	nopeCn: string
	aplyUrlAddr: string
	imgFileId: string
	/** 조회 전용. 목록 API가 분류명과 첨부파일 경로를 함께 내려준다. */
	prgrmCtgryNm?: string | null
	fileUrl?: string | null
	fileName?: string | null
	sortSeq: number
	useYn: string
	regDt?: string
}

const BACKEND = API_BASE_URL

const defaultForm = (): EduProgramIntroDto => ({
	prgrmIntrdSn: null,
	prgrmCtgryCd: '',
	prgrmTtl: '',
	prgrmExpln: '',
	plcCn: '',
	oprtnPdCn: '',
	nopeCn: '',
	aplyUrlAddr: '',
	imgFileId: '',
	sortSeq: 0,
	useYn: 'Y'
})

function formatDate(d: string | null | undefined): string {
	if (!d) return '-'
	return d.slice(0, 10)
}

const useYnBadge = (useYn: string) => {
	const isOn = useYn === 'Y'
	return (
		<span className={`bbs-master-list-badge ${isOn ? 'is-on use' : ''}`}>
			{isOn ? '사용' : '미사용'}
		</span>
	)
}

const renderYnToggle = (value: string, onChange: (next: 'Y' | 'N') => void) => (
	<button
		type="button"
		className={`yn-toggle ${value === 'Y' ? 'is-on' : 'is-off'}`}
		onClick={() => onChange(value === 'Y' ? 'N' : 'Y')}
		aria-pressed={value === 'Y'}
	>
		<span className="yn-toggle-label">{value === 'Y' ? '사용' : '미사용'}</span>
		<span className="yn-toggle-knob" aria-hidden="true" />
	</button>
)

export const EduProgramIntroPage: React.FC = () => {
	const [list, setList] = useState<EduProgramIntroDto[]>([])
	const [categories, setCategories] = useState<CategoryCode[]>([])
	const [currentAdmin, setCurrentAdmin] = useState<SessionInfo>({ adminId: '', adminName: '' })
	const [loading, setLoading] = useState(false)
	const [orderSaving, setOrderSaving] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [form, setForm] = useState<EduProgramIntroDto>(defaultForm())
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [imgFile, setImgFile] = useState<File | null>(null)
	const [imgPreviewUrl, setImgPreviewUrl] = useState('')
	const [imgDisplayName, setImgDisplayName] = useState('')
	const imgInputRef = useRef<HTMLInputElement | null>(null)
	const imgObjectUrlRef = useRef<string | null>(null)

	// 입력 중인 값과 실제 조회에 쓰인 값을 나눠 둔다. 조회 조건이 걸려 있으면 드래그 정렬을 막기 위해서다.
	const [ctgryFilter, setCtgryFilter] = useState('')
	const [useYnFilter, setUseYnFilter] = useState('')
	const [keyword, setKeyword] = useState('')
	const [appliedFilter, setAppliedFilter] = useState({ ctgry: '', useYn: '', keyword: '' })

	const [dragSn, setDragSn] = useState<number | null>(null)
	const [dragOverSn, setDragOverSn] = useState<number | null>(null)
	const suppressRowClickRef = useRef(false)

	const fetchSession = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/auth/session`, { credentials: 'include' })
			const result: ApiResponse<SessionInfo> = await res.json()
			if (result.success && result.data) {
				setCurrentAdmin({
					adminId: result.data.adminId ?? '',
					adminName: result.data.adminName ?? ''
				})
			}
		} catch {
			// 세션 오류는 공통 인증 흐름에서 처리한다.
		}
	}, [])

	const fetchCategories = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/edu-program-intros/categories`, { credentials: 'include' })
			const result: ApiResponse<CategoryCode[]> = await res.json()
			if (result.success) setCategories(result.data ?? [])
		} catch {
			// 분류 조회 실패는 목록 오류와 섞이지 않도록 조용히 넘긴다.
		}
	}, [])

	const fetchList = useCallback(async (filter?: { ctgry: string; useYn: string; keyword: string }) => {
		const applied = filter ?? { ctgry: ctgryFilter, useYn: useYnFilter, keyword: keyword.trim() }
		setError(null)
		try {
			const qs = new URLSearchParams()
			if (applied.ctgry) qs.set('prgrmCtgryCd', applied.ctgry)
			if (applied.useYn) qs.set('useYn', applied.useYn)
			if (applied.keyword) qs.set('keyword', applied.keyword)
			const suffix = qs.toString() ? `?${qs.toString()}` : ''
			setAppliedFilter(applied)
			const res = await fetch(`${BACKEND}/api/admin/edu-program-intros${suffix}`, { credentials: 'include' })
			const result: ApiResponse<EduProgramIntroDto[]> = await res.json()
			if (!result.success) {
				setError(result.message || '프로그램 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data ?? [])
		} catch {
			setError('프로그램 목록 조회 중 오류가 발생했습니다.')
		}
	}, [ctgryFilter, useYnFilter, keyword])

	useEffect(() => {
		void fetchSession()
		void fetchCategories()
	}, [fetchSession, fetchCategories])

	useEffect(() => {
		void fetchList({ ctgry: '', useYn: '', keyword: '' })
		// 최초 진입은 조건 없이 전체를 불러온다. 이후 조회는 검색 버튼이 담당한다.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!imgFile) return
		if (imgObjectUrlRef.current) URL.revokeObjectURL(imgObjectUrlRef.current)
		const url = URL.createObjectURL(imgFile)
		imgObjectUrlRef.current = url
		setImgPreviewUrl(url)
		setImgDisplayName(imgFile.name)
		return () => {
			URL.revokeObjectURL(url)
			if (imgObjectUrlRef.current === url) imgObjectUrlRef.current = null
		}
	}, [imgFile])

	const resetImage = () => {
		if (imgObjectUrlRef.current) {
			URL.revokeObjectURL(imgObjectUrlRef.current)
			imgObjectUrlRef.current = null
		}
		setImgFile(null)
		setImgPreviewUrl('')
		setImgDisplayName('')
		if (imgInputRef.current) imgInputRef.current.value = ''
	}

	const openNewPopup = () => {
		resetImage()
		setForm({ ...defaultForm(), prgrmCtgryCd: categories[0]?.code ?? '' })
		setPopupMode('new')
		setError(null)
		setPopupOpen(true)
	}

	const openEditPopup = (row: EduProgramIntroDto) => {
		resetImage()
		setForm({
			prgrmIntrdSn: row.prgrmIntrdSn,
			prgrmCtgryCd: row.prgrmCtgryCd ?? '',
			prgrmTtl: row.prgrmTtl ?? '',
			prgrmExpln: row.prgrmExpln ?? '',
			plcCn: row.plcCn ?? '',
			oprtnPdCn: row.oprtnPdCn ?? '',
			nopeCn: row.nopeCn ?? '',
			aplyUrlAddr: row.aplyUrlAddr ?? '',
			imgFileId: row.imgFileId ?? '',
			sortSeq: row.sortSeq ?? 0,
			useYn: row.useYn ?? 'Y'
		})
		setImgPreviewUrl(row.fileUrl ? resolveBackendUrl(row.fileUrl) : '')
		setImgDisplayName(row.fileName || row.imgFileId || '')
		setPopupMode('edit')
		setError(null)
		setPopupOpen(true)
	}

	/** 목록 전체 순서를 다시 매기는 방식이라 일부만 보이는 상태에서 드래그하면 순서가 어긋난다. */
	const isFiltered = Boolean(appliedFilter.ctgry || appliedFilter.useYn || appliedFilter.keyword)

	const clearSearch = () => {
		setCtgryFilter('')
		setUseYnFilter('')
		setKeyword('')
		void fetchList({ ctgry: '', useYn: '', keyword: '' })
	}

	const closePopup = () => {
		resetImage()
		setPopupOpen(false)
		setError(null)
	}

	const uploadImage = async (file: File, fiId: string): Promise<string> => {
		const fd = new FormData()
		fd.append('file', file)
		fd.append('menuType', 'edu-program-intro')
		if (fiId) fd.append('fiId', fiId)
		const res = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
			method: 'POST',
			body: fd,
			credentials: 'include'
		})
		const result: ApiResponse<{ fiId?: string }> = await res.json()
		if (!result.success || !result.data?.fiId) {
			throw new Error(result.message || '이미지 업로드에 실패했습니다.')
		}
		return result.data.fiId
	}

	const handleSave = async () => {
		if (!form.prgrmCtgryCd) {
			setError('프로그램 분류를 선택하세요.')
			return
		}
		if (!form.prgrmTtl.trim()) {
			setError('타이틀을 입력하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const imgFileId = imgFile ? await uploadImage(imgFile, form.imgFileId) : form.imgFileId
			const body = {
				prgrmCtgryCd: form.prgrmCtgryCd,
				prgrmTtl: form.prgrmTtl.trim(),
				prgrmExpln: form.prgrmExpln,
				plcCn: form.plcCn,
				oprtnPdCn: form.oprtnPdCn,
				nopeCn: form.nopeCn,
				aplyUrlAddr: form.aplyUrlAddr.trim(),
				imgFileId,
				sortSeq: form.sortSeq ?? 0,
				useYn: form.useYn ?? 'Y',
				rgtr: currentAdmin.adminId,
				mdtr: currentAdmin.adminId
			}
			const isNew = form.prgrmIntrdSn == null
			const res = await fetch(
				isNew
					? `${BACKEND}/api/admin/edu-program-intros`
					: `${BACKEND}/api/admin/edu-program-intros/${form.prgrmIntrdSn}`,
				{
					method: isNew ? 'POST' : 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				}
			)
			const result: ApiResponse<EduProgramIntroDto> = await res.json()
			if (!result.success) {
				setError(result.message || (isNew ? '등록에 실패했습니다.' : '수정에 실패했습니다.'))
				return
			}
			setMessage(isNew ? '교육프로그램이 등록되었습니다.' : '교육프로그램이 수정되었습니다.')
			closePopup()
			await fetchList(appliedFilter)
		} catch (err) {
			setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (row: EduProgramIntroDto) => {
		if (row.prgrmIntrdSn == null) return
		if (!window.confirm(`"${row.prgrmTtl}" 항목을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			// 삭제자는 서버가 세션에서 가져오므로 deltr 를 보내지 않는다.
			const res = await fetch(`${BACKEND}/api/admin/edu-program-intros/${row.prgrmIntrdSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('교육프로그램이 삭제되었습니다.')
			if (popupOpen) closePopup()
			await fetchList(appliedFilter)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const persistOrder = async (rows: EduProgramIntroDto[]) => {
		setOrderSaving(true)
		setError(null)
		setMessage(null)
		try {
			// 행마다 독립된 UPDATE라 순차로 기다릴 이유가 없다. 화면은 이미 낙관적으로 갱신돼 있다.
			const results = await Promise.all(
				rows
					.filter((row) => row.prgrmIntrdSn != null)
					.map(async (row, index) => {
						const res = await fetch(
							`${BACKEND}/api/admin/edu-program-intros/${row.prgrmIntrdSn}/seq?sortSeq=${(index + 1) * 10}`,
							{ method: 'PUT', credentials: 'include' }
						)
						return (await res.json()) as ApiResponse<void>
					})
			)
			const failed = results.find((result) => !result.success)
			if (failed) {
				setError(failed.message || '순서 변경에 실패했습니다.')
				await fetchList(appliedFilter)
				return
			}
			setMessage('순서가 변경되었습니다.')
		} catch {
			setError('순서 변경 중 오류가 발생했습니다.')
			await fetchList(appliedFilter)
		} finally {
			setOrderSaving(false)
		}
	}

	const handleDrop = async (targetSn: number) => {
		if (dragSn == null || dragSn === targetSn || orderSaving) return
		const fromIdx = list.findIndex((r) => r.prgrmIntrdSn === dragSn)
		const toIdx = list.findIndex((r) => r.prgrmIntrdSn === targetSn)
		if (fromIdx < 0 || toIdx < 0) return
		const reordered = [...list]
		const [moved] = reordered.splice(fromIdx, 1)
		reordered.splice(toIdx, 0, moved)
		suppressRowClickRef.current = true
		setDragSn(null)
		setDragOverSn(null)
		setList(reordered.map((row, index) => ({ ...row, sortSeq: (index + 1) * 10 })))
		await persistOrder(reordered)
	}

	return (
		<AdminLayout title="프로그램 소개">
			<CrudPageCard title="프로그램 소개" error={error} message={message}>
				<div className="bbs-post-filters search-section edu-program-intro-search-row">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">프로그램</label>
						<select
							value={ctgryFilter}
							onChange={(e) => setCtgryFilter(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="">전체</option>
							{categories.map((category) => (
								<option key={category.code} value={category.code}>{category.name}</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">타이틀</label>
						<input
							type="text"
							value={keyword}
							placeholder="타이틀"
							onChange={(e) => setKeyword(e.target.value)}
							className="bbs-post-filter-input"
							onKeyDown={(e) => {
								if (e.key === 'Enter') void fetchList()
							}}
						/>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">사용여부</label>
						<select
							value={useYnFilter}
							onChange={(e) => setUseYnFilter(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="">전체</option>
							<option value="Y">사용</option>
							<option value="N">미사용</option>
						</select>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList()}>
							검색
						</button>
						<button type="button" className="admin-filter-btn-reset" onClick={clearSearch}>
							초기화
						</button>
					</div>
				</div>

				<div className="list-toolbar">
					<span className="list-toolbar-info">
						{formatListToolbarInfo(list.length)}
						<span className="banner-list-order-hint">
							{isFiltered
								? ' · 검색 조건이 걸려 있는 동안에는 순서를 바꿀 수 없습니다. 초기화 후 이용하세요.'
								: ' · 순서 열을 드래그하여 사용자 페이지 노출 순서를 바꿉니다.'}
						</span>
					</span>
					<button type="button" className="admin-list-btn-sky" onClick={openNewPopup}>등록</button>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: '88px' }}>순서</th>
							<th style={{ width: '72px' }}>썸네일</th>
							<th style={{ width: '160px' }}>프로그램</th>
							<th style={{ width: 'auto' }}>타이틀</th>
							<th style={{ width: '180px' }}>장소</th>
							<th style={{ width: '100px' }}>사용여부</th>
							<th style={{ width: '110px' }}>등록일</th>
							<th style={{ width: '120px' }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr
								key={row.prgrmIntrdSn!}
								className={[
									'clickable',
									'banner-list-row',
									dragSn === row.prgrmIntrdSn ? 'is-dragging' : '',
									dragOverSn === row.prgrmIntrdSn ? 'is-drag-over' : ''
								].filter(Boolean).join(' ')}
								draggable={!orderSaving && !isFiltered}
								onDragStart={(e) => {
									if (orderSaving || isFiltered || row.prgrmIntrdSn == null) return
									setDragSn(row.prgrmIntrdSn)
									e.dataTransfer.effectAllowed = 'move'
								}}
								onDragOver={(e) => {
									if (dragSn == null || row.prgrmIntrdSn == null) return
									e.preventDefault()
									setDragOverSn(row.prgrmIntrdSn)
								}}
								onDragLeave={() => {
									if (dragOverSn === row.prgrmIntrdSn) setDragOverSn(null)
								}}
								onDrop={(e) => {
									e.preventDefault()
									if (row.prgrmIntrdSn != null) void handleDrop(row.prgrmIntrdSn)
								}}
								onDragEnd={() => {
									setDragSn(null)
									setDragOverSn(null)
								}}
								onClick={() => {
									if (suppressRowClickRef.current) {
										suppressRowClickRef.current = false
										return
									}
									openEditPopup(row)
								}}
							>
								<td onClick={(e) => e.stopPropagation()}>
									<span className="banner-list-order-cell">
										<i className="category-drag-handle" aria-hidden="true">⋮⋮</i>
										<span>{row.sortSeq}</span>
									</span>
								</td>
								<td>
									{row.fileUrl ? (
										<img src={resolveBackendUrl(row.fileUrl)} alt="" className="product-list-thumb" />
									) : (
										<span className="product-list-thumb product-list-thumb--empty" aria-hidden />
									)}
								</td>
								<td>{row.prgrmCtgryNm || row.prgrmCtgryCd}</td>
								<td>{row.prgrmTtl}</td>
								<td>{row.plcCn || '-'}</td>
								<td>{useYnBadge(row.useYn)}</td>
								<td>{formatDate(row.regDt)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => openEditPopup(row)}
										onDelete={() => void handleDelete(row)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={8} style={{ textAlign: 'center' }}>{isFiltered ? '검색 결과가 없습니다.' : '데이터가 없습니다.'}</td>
							</tr>
						)}
					</tbody>
				</table>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={`프로그램 소개 ${popupMode === 'new' ? '등록' : '상세 (수정)'}`}
				onClose={closePopup}
				wide
				footer={
					<>
						{form.prgrmIntrdSn != null && (
							<button
								type="button"
								onClick={() => void handleDelete(form)}
								disabled={loading}
								className="admin-footer-btn-delete"
								style={{ marginRight: 'auto' }}
							>
								삭제
							</button>
						)}
						<button type="button" className="admin-list-btn-edit" onClick={() => void handleSave()} disabled={loading}>
							{popupMode === 'new' ? '등록' : '수정'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup}>닫기</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table">
					<tbody>
						<tr>
							<th>프로그램</th>
							<td>
								<select
									value={form.prgrmCtgryCd}
									onChange={(e) => setForm({ ...form, prgrmCtgryCd: e.target.value })}
								>
									<option value="">선택하세요</option>
									{categories.map((category) => (
										<option key={category.code} value={category.code}>{category.name}</option>
									))}
								</select>
							</td>
						</tr>
						<tr>
							<th>타이틀</th>
							<td>
								<input
									type="text"
									value={form.prgrmTtl}
									onChange={(e) => setForm({ ...form, prgrmTtl: e.target.value })}
									placeholder="예: 사건탐구"
								/>
							</td>
						</tr>
						<tr>
							<th>설명글</th>
							<td>
								<textarea
									rows={4}
									value={form.prgrmExpln}
									onChange={(e) => setForm({ ...form, prgrmExpln: e.target.value })}
									placeholder="프로그램을 소개하는 문구를 입력하세요."
								/>
							</td>
						</tr>
						<tr>
							<th>장소</th>
							<td>
								<input
									type="text"
									value={form.plcCn}
									onChange={(e) => setForm({ ...form, plcCn: e.target.value })}
									placeholder="예: 햇살마당 집결 후 이동"
								/>
							</td>
						</tr>
						<tr>
							<th>시기</th>
							<td>
								<input
									type="text"
									value={form.oprtnPdCn}
									onChange={(e) => setForm({ ...form, oprtnPdCn: e.target.value })}
									placeholder="예: 3월 ~ 11월"
								/>
							</td>
						</tr>
						<tr>
							<th>인원</th>
							<td>
								<input
									type="text"
									value={form.nopeCn}
									onChange={(e) => setForm({ ...form, nopeCn: e.target.value })}
									placeholder="예: 회차당 24명"
								/>
							</td>
						</tr>
						<tr>
							<th>신청 링크</th>
							<td>
								<input
									type="text"
									value={form.aplyUrlAddr}
									onChange={(e) => setForm({ ...form, aplyUrlAddr: e.target.value })}
									placeholder="비워두면 신청하기 버튼이 표시되지 않습니다."
								/>
							</td>
						</tr>
						<tr>
							<th>썸네일</th>
							<td>
								<input
									ref={imgInputRef}
									type="file"
									accept="image/*"
									onChange={(e) => setImgFile(e.target.files?.[0] ?? null)}
									style={{ display: 'none' }}
								/>
								<button
									type="button"
									className="popup-file-btn"
									onClick={() => imgInputRef.current?.click()}
									disabled={loading}
								>
									파일 선택
								</button>
								{(imgDisplayName || imgPreviewUrl) && (
									<div className="popup-img-preview">
										{imgPreviewUrl && <img src={imgPreviewUrl} alt="썸네일 미리보기" />}
										<span className="popup-img-path">{imgDisplayName}</span>
									</div>
								)}
							</td>
						</tr>
						<tr>
							<th>사용여부</th>
							<td>{renderYnToggle(form.useYn, (useYn) => setForm({ ...form, useYn }))}</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

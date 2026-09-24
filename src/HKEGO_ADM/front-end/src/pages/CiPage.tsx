// 홈페이지 CI(심벌마크·시그니처·캐릭터·통합 다운로드 파일)를 구분별로 등록·정렬·노출 관리하는 화면
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

/** FILE은 상단 단일 슬롯에서만 다루므로 탭 목록에는 넣지 않는다. */
type CiSectionCode = 'SYMBOL' | 'SIGN' | 'CHAR' | 'FILE'
type CiTabCode = Exclude<CiSectionCode, 'FILE'>

type CiDto = {
	ciSn: number | null
	ciSeCd: CiSectionCode
	ciTtl: string
	imgFileId: string
	/** 조회 전용. 목록 API가 첨부파일 경로와 원본 파일명을 함께 내려준다. */
	fileUrl?: string | null
	fileName?: string | null
	sortSeq: number
	useYn: string
	regDt?: string
}

const BACKEND = API_BASE_URL

const CI_SECTIONS: { code: CiTabCode; label: string }[] = [
	{ code: 'SYMBOL', label: '심벌마크' },
	{ code: 'SIGN', label: '시그니처' },
	{ code: 'CHAR', label: '캐릭터' }
]

const defaultForm = (ciSeCd: CiSectionCode): CiDto => ({
	ciSn: null,
	ciSeCd,
	ciTtl: '',
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

export const CiPage: React.FC = () => {
	const [ciSeCd, setCiSeCd] = useState<CiTabCode>('SYMBOL')
	const [list, setList] = useState<CiDto[]>([])
	const [currentAdmin, setCurrentAdmin] = useState<SessionInfo>({ adminId: '', adminName: '' })
	const [loading, setLoading] = useState(false)
	const [orderSaving, setOrderSaving] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [form, setForm] = useState<CiDto>(defaultForm('SYMBOL'))
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [imgFile, setImgFile] = useState<File | null>(null)
	const [imgPreviewUrl, setImgPreviewUrl] = useState('')
	const [imgDisplayName, setImgDisplayName] = useState('')
	const imgInputRef = useRef<HTMLInputElement | null>(null)
	const imgObjectUrlRef = useRef<string | null>(null)

	const [dragCiSn, setDragCiSn] = useState<number | null>(null)
	const [dragOverCiSn, setDragOverCiSn] = useState<number | null>(null)
	const suppressRowClickRef = useRef(false)

	// 상단 통합 다운로드 파일 슬롯. 구분 FILE 행 한 건을 교체하는 용도라 탭 목록과 별도로 관리한다.
	const [downloadRow, setDownloadRow] = useState<CiDto | null>(null)
	const [downloadFile, setDownloadFile] = useState<File | null>(null)
	const [downloadSaving, setDownloadSaving] = useState(false)
	const downloadInputRef = useRef<HTMLInputElement | null>(null)

	const section = CI_SECTIONS.find((s) => s.code === ciSeCd) ?? CI_SECTIONS[0]

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

	const fetchList = useCallback(async (targetSeCd: CiTabCode) => {
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/ci?ciSeCd=${targetSeCd}`, { credentials: 'include' })
			const result: ApiResponse<CiDto[]> = await res.json()
			if (!result.success) {
				setError(result.message || 'CI 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data ?? [])
		} catch {
			setError('CI 목록 조회 중 오류가 발생했습니다.')
		}
	}, [])

	const fetchDownloadSlot = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/ci?ciSeCd=FILE`, { credentials: 'include' })
			const result: ApiResponse<CiDto[]> = await res.json()
			if (!result.success) return
			setDownloadRow((result.data ?? [])[0] ?? null)
		} catch {
			// 상단 슬롯 조회 실패는 목록 오류와 섞이지 않도록 조용히 넘긴다.
		}
	}, [])

	useEffect(() => {
		void fetchSession()
	}, [fetchSession])

	useEffect(() => {
		void fetchDownloadSlot()
	}, [fetchDownloadSlot])

	useEffect(() => {
		void fetchList(ciSeCd)
	}, [fetchList, ciSeCd])

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
		setForm(defaultForm(ciSeCd))
		setPopupMode('new')
		setError(null)
		setPopupOpen(true)
	}

	const openEditPopup = (row: CiDto) => {
		resetImage()
		setForm({
			ciSn: row.ciSn,
			ciSeCd: row.ciSeCd,
			ciTtl: row.ciTtl ?? '',
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

	const closePopup = () => {
		resetImage()
		setPopupOpen(false)
		setError(null)
	}

	/** 이미지는 file-info-image, 통합 다운로드 zip은 file-info-attach로 올린다. 허용 확장자 검증이 서로 다르다. */
	const uploadFile = async (
		file: File,
		fiId: string,
		endpoint: 'file-info-image' | 'file-info-attach'
	): Promise<string> => {
		const fd = new FormData()
		fd.append('file', file)
		fd.append('menuType', 'ci')
		if (fiId) fd.append('fiId', fiId)
		const res = await fetch(`${BACKEND}/api/admin/upload/${endpoint}`, {
			method: 'POST',
			body: fd,
			credentials: 'include'
		})
		const result: ApiResponse<{ fiId?: string }> = await res.json()
		if (!result.success || !result.data?.fiId) {
			throw new Error(result.message || '파일 업로드에 실패했습니다.')
		}
		return result.data.fiId
	}

	const handleSave = async () => {
		if (!form.ciTtl.trim()) {
			setError('제목을 입력하세요.')
			return
		}
		if (!imgFile && !form.imgFileId) {
			setError('이미지를 등록하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const imgFileId = imgFile
				? await uploadFile(imgFile, form.imgFileId, 'file-info-image')
				: form.imgFileId
			const body = {
				ciSeCd: form.ciSeCd,
				ciTtl: form.ciTtl.trim(),
				imgFileId,
				sortSeq: form.sortSeq ?? 0,
				useYn: form.useYn ?? 'Y',
				rgtr: currentAdmin.adminId,
				mdtr: currentAdmin.adminId
			}
			const isNew = form.ciSn == null
			const res = await fetch(
				isNew ? `${BACKEND}/api/admin/ci` : `${BACKEND}/api/admin/ci/${form.ciSn}`,
				{
					method: isNew ? 'POST' : 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				}
			)
			const result: ApiResponse<CiDto> = await res.json()
			if (!result.success) {
				setError(result.message || (isNew ? '등록에 실패했습니다.' : '수정에 실패했습니다.'))
				return
			}
			setMessage(isNew ? 'CI가 등록되었습니다.' : 'CI가 수정되었습니다.')
			closePopup()
			await fetchList(ciSeCd)
		} catch (err) {
			setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async (row: CiDto) => {
		if (row.ciSn == null) return
		if (!window.confirm(`"${row.ciTtl}" 항목을 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			// 삭제자는 서버가 세션에서 가져오므로 deltr 를 보내지 않는다.
			const res = await fetch(`${BACKEND}/api/admin/ci/${row.ciSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('CI가 삭제되었습니다.')
			if (popupOpen) closePopup()
			await fetchList(ciSeCd)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const persistOrder = async (rows: CiDto[]) => {
		setOrderSaving(true)
		setError(null)
		setMessage(null)
		try {
			// 행마다 독립된 UPDATE라 순차로 기다릴 이유가 없다. 화면은 이미 낙관적으로 갱신돼 있다.
			const results = await Promise.all(
				rows
					.filter((row) => row.ciSn != null)
					.map(async (row, index) => {
						const res = await fetch(`${BACKEND}/api/admin/ci/${row.ciSn}/seq?sortSeq=${index + 1}`, {
							method: 'PUT',
							credentials: 'include'
						})
						return (await res.json()) as ApiResponse<void>
					})
			)
			const failed = results.find((result) => !result.success)
			if (failed) {
				setError(failed.message || '순서 변경에 실패했습니다.')
				await fetchList(ciSeCd)
				return
			}
			setMessage('순서가 변경되었습니다.')
		} catch {
			setError('순서 변경 중 오류가 발생했습니다.')
			await fetchList(ciSeCd)
		} finally {
			setOrderSaving(false)
		}
	}

	const handleDrop = async (targetCiSn: number) => {
		if (dragCiSn == null || dragCiSn === targetCiSn || orderSaving) return
		const fromIdx = list.findIndex((r) => r.ciSn === dragCiSn)
		const toIdx = list.findIndex((r) => r.ciSn === targetCiSn)
		if (fromIdx < 0 || toIdx < 0) return
		const reordered = [...list]
		const [moved] = reordered.splice(fromIdx, 1)
		reordered.splice(toIdx, 0, moved)
		suppressRowClickRef.current = true
		setDragCiSn(null)
		setDragOverCiSn(null)
		setList(reordered.map((row, index) => ({ ...row, sortSeq: index + 1 })))
		await persistOrder(reordered)
	}

	const handleDownloadSave = async () => {
		if (!downloadFile) {
			setError('교체할 파일을 선택하세요.')
			return
		}
		setDownloadSaving(true)
		setError(null)
		setMessage(null)
		try {
			const imgFileId = await uploadFile(downloadFile, downloadRow?.imgFileId ?? '', 'file-info-attach')
			const targetSn = downloadRow?.ciSn ?? null
			const body = {
				ciSeCd: 'FILE',
				ciTtl: downloadFile.name.slice(0, 100),
				imgFileId,
				sortSeq: downloadRow?.sortSeq ?? 1,
				useYn: 'Y',
				rgtr: currentAdmin.adminId,
				mdtr: currentAdmin.adminId
			}
			const res = await fetch(
				targetSn == null ? `${BACKEND}/api/admin/ci` : `${BACKEND}/api/admin/ci/${targetSn}`,
				{
					method: targetSn == null ? 'POST' : 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				}
			)
			const result: ApiResponse<CiDto> = await res.json()
			if (!result.success) {
				setError(result.message || '다운로드 파일 저장에 실패했습니다.')
				return
			}
			setMessage('CI 다운로드 파일이 교체되었습니다.')
			setDownloadFile(null)
			if (downloadInputRef.current) downloadInputRef.current.value = ''
			await fetchDownloadSlot()
		} catch (err) {
			setError(err instanceof Error ? err.message : '다운로드 파일 저장 중 오류가 발생했습니다.')
		} finally {
			setDownloadSaving(false)
		}
	}

	return (
		<AdminLayout title="CI 관리">
			<CrudPageCard title="CI 관리" error={error} message={message}>
				<div className="content-step-card">
					<div className="content-step-header content-step-header--with-action">
						<span>CI 통합 다운로드 파일</span>
						<button
							type="button"
							className="admin-list-btn-edit"
							onClick={() => void handleDownloadSave()}
							disabled={downloadSaving || !downloadFile}
						>
							저장
						</button>
					</div>
					<div>
						<input
							ref={downloadInputRef}
							type="file"
							accept=".zip"
							onChange={(e) => setDownloadFile(e.target.files?.[0] ?? null)}
							style={{ display: 'none' }}
						/>
						<button
							type="button"
							className="popup-file-btn"
							onClick={() => downloadInputRef.current?.click()}
							disabled={downloadSaving}
						>
							파일 선택
						</button>
						<span className="popup-img-path" style={{ marginLeft: 8 }}>
							{downloadFile
								? `${downloadFile.name} (저장 전)`
								: (downloadRow?.fileName || downloadRow?.ciTtl || '등록된 파일이 없습니다.')}
						</span>
					</div>
				</div>
				<div className="content-category-tabs">
					{CI_SECTIONS.map((tab) => (
						<button
							key={tab.code}
							type="button"
							className={`content-category-tab ${ciSeCd === tab.code ? 'is-active' : ''}`}
							onClick={() => setCiSeCd(tab.code)}
						>
							{tab.label}
						</button>
					))}
				</div>
				<div className="list-toolbar">
					<span className="list-toolbar-info">
						{formatListToolbarInfo(list.length)}
						<span className="banner-list-order-hint">
							{ciSeCd === 'SYMBOL'
								? ' · 사용으로 저장하면 다른 심벌마크는 자동으로 미사용 처리됩니다.'
								: ' · 순서 열을 드래그하여 노출 순서를 바꿉니다.'}
						</span>
					</span>
					<button type="button" className="admin-list-btn-sky" onClick={openNewPopup}>신규</button>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: '88px' }}>순서</th>
							<th style={{ width: '72px' }}>이미지</th>
							<th style={{ width: 'auto' }}>제목</th>
							<th style={{ width: '100px' }}>사용여부</th>
							<th style={{ width: '110px' }}>등록일</th>
							<th style={{ width: '120px' }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr
								key={row.ciSn!}
								className={[
									'clickable',
									'banner-list-row',
									dragCiSn === row.ciSn ? 'is-dragging' : '',
									dragOverCiSn === row.ciSn ? 'is-drag-over' : ''
								].filter(Boolean).join(' ')}
								draggable={!orderSaving}
								onDragStart={(e) => {
									if (orderSaving || row.ciSn == null) return
									setDragCiSn(row.ciSn)
									e.dataTransfer.effectAllowed = 'move'
								}}
								onDragOver={(e) => {
									if (dragCiSn == null || row.ciSn == null) return
									e.preventDefault()
									setDragOverCiSn(row.ciSn)
								}}
								onDragLeave={() => {
									if (dragOverCiSn === row.ciSn) setDragOverCiSn(null)
								}}
								onDrop={(e) => {
									e.preventDefault()
									if (row.ciSn != null) void handleDrop(row.ciSn)
								}}
								onDragEnd={() => {
									setDragCiSn(null)
									setDragOverCiSn(null)
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
								<td>{row.ciTtl}</td>
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
								<td colSpan={6} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={`${section.label} ${popupMode === 'new' ? '등록' : '상세 (수정)'}`}
				onClose={closePopup}
				wide
				footer={
					<>
						{form.ciSn != null && (
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
							<th>구분</th>
							<td><input type="text" value={section.label} readOnly /></td>
						</tr>
						<tr>
							<th>제목 <span className="required">*</span></th>
							<td>
								<input
									type="text"
									value={form.ciTtl}
									onChange={(e) => setForm({ ...form, ciTtl: e.target.value })}
									placeholder="예: 가로형 국문"
								/>
							</td>
						</tr>
						<tr>
							<th>이미지 <span className="required">*</span></th>
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
										{imgPreviewUrl && <img src={imgPreviewUrl} alt="이미지 미리보기" />}
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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

type BannerDto = {
	bnrSn: number | null
	bnrNm: string
	bnrMainCn: string
	bnrSubCn: string
	pdtYmd: string
	newBadgeYn: string
	lnkgUrlAddr: string
	lnkgSeCd: string
	pstgBgngYmd: string
	pstgEndYmd: string
	pstgPrdUseYn: string
	pcAtchFileId: string
	moblAtchFileId: string
	sortSeq: number
	useYn: string
	regDt?: string
	mdfcnDt?: string
}

const BACKEND = API_BASE_URL

const defaultForm: BannerDto = {
	bnrSn: null,
	bnrNm: '',
	bnrMainCn: '',
	bnrSubCn: '',
	pdtYmd: '',
	newBadgeYn: 'N',
	lnkgUrlAddr: '',
	lnkgSeCd: 'B',
	pstgBgngYmd: '',
	pstgEndYmd: '',
	pstgPrdUseYn: 'N',
	pcAtchFileId: '',
	moblAtchFileId: '',
	sortSeq: 0,
	useYn: 'Y'
}

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

const bannerListThumbFiId = (row: BannerDto) => (row.pcAtchFileId || row.moblAtchFileId || '').trim()

const renderBannerListThumb = (row: BannerDto, thumbMap: Record<string, string>) => {
	const fiId = bannerListThumbFiId(row)
	if (fiId && thumbMap[fiId]) {
		return <img src={thumbMap[fiId]} alt="" className="product-list-thumb" />
	}
	return <span className="product-list-thumb product-list-thumb--empty" aria-hidden />
}

const reorderBannerRows = (rows: BannerDto[], fromIdx: number, toIdx: number): BannerDto[] => {
	if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return rows
	const cloned = [...rows]
	const [moved] = cloned.splice(fromIdx, 1)
	cloned.splice(toIdx, 0, moved)
	return cloned.map((row, index) => ({ ...row, sortSeq: index }))
}

const renderYnToggle = (
	value: string,
	onChange: (next: 'Y' | 'N') => void,
	labelOn: string,
	labelOff: string
) => (
	<button
		type="button"
		className={`yn-toggle ${value === 'Y' ? 'is-on' : 'is-off'}`}
		onClick={() => onChange(value === 'Y' ? 'N' : 'Y')}
		aria-pressed={value === 'Y'}
	>
		<span className="yn-toggle-label">{value === 'Y' ? labelOn : labelOff}</span>
		<span className="yn-toggle-knob" aria-hidden="true" />
	</button>
)

export const BannerPage: React.FC = () => {
	const [list, setList] = useState<BannerDto[]>([])
	const [form, setForm] = useState<BannerDto>(defaultForm)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [useYnFilter, setUseYnFilter] = useState('')
	const [startPublishDate, setStartPublishDate] = useState('')
	const [endPublishDate, setEndPublishDate] = useState('')
	const [startRegDate, setStartRegDate] = useState('')
	const [endRegDate, setEndRegDate] = useState('')
	const [searchType, setSearchType] = useState('title')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const pageSize = DEFAULT_LIST_PAGE_SIZE
	const [listThumbMap, setListThumbMap] = useState<Record<string, string>>({})
	const [dragBnrIdx, setDragBnrIdx] = useState<number | null>(null)
	const [dragOverBnrIdx, setDragOverBnrIdx] = useState<number | null>(null)
	const [orderSaving, setOrderSaving] = useState(false)
	const suppressRowClickRef = useRef(false)

	const [imgPcFile, setImgPcFile] = useState<File | null>(null)
	const [imgMoFile, setImgMoFile] = useState<File | null>(null)
	const [imgPcPreviewUrl, setImgPcPreviewUrl] = useState('')
	const [imgMoPreviewUrl, setImgMoPreviewUrl] = useState('')
	const [imgPcDisplayName, setImgPcDisplayName] = useState('')
	const [imgMoDisplayName, setImgMoDisplayName] = useState('')
	const [clearImgPc, setClearImgPc] = useState(false)
	const [clearImgMo, setClearImgMo] = useState(false)
	const imgPcObjectUrlRef = useRef<string | null>(null)
	const imgMoObjectUrlRef = useRef<string | null>(null)
	const imgPcInputRef = useRef<HTMLInputElement>(null)
	const imgMoInputRef = useRef<HTMLInputElement>(null)

	const isOrderChangeEnabled = useMemo(
		() =>
			page === 1 &&
			!useYnFilter &&
			!startPublishDate &&
			!endPublishDate &&
			!startRegDate &&
			!endRegDate &&
			!searchKeyword.trim(),
		[page, useYnFilter, startPublishDate, endPublishDate, startRegDate, endRegDate, searchKeyword]
	)

	const buildSearchParams = useCallback((targetPage: number) => {
		const p: string[] = [`page=${targetPage}`, `size=${pageSize}`]
		if (useYnFilter) p.push(`useYn=${encodeURIComponent(useYnFilter)}`)
		if (startPublishDate) p.push(`startPublishDate=${encodeURIComponent(startPublishDate)}`)
		if (endPublishDate) p.push(`endPublishDate=${encodeURIComponent(endPublishDate)}`)
		if (startRegDate) p.push(`startRegDate=${encodeURIComponent(startRegDate)}`)
		if (endRegDate) p.push(`endRegDate=${encodeURIComponent(endRegDate)}`)
		if (searchType) p.push(`searchType=${encodeURIComponent(searchType)}`)
		if (searchKeyword) p.push(`searchKeyword=${encodeURIComponent(searchKeyword)}`)
		return `?${p.join('&')}`
	}, [useYnFilter, startPublishDate, endPublishDate, startRegDate, endRegDate, searchType, searchKeyword, pageSize])

	const fetchList = useCallback(async (targetPage = page) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage)
			const hasSearch = useYnFilter || startPublishDate || endPublishDate || startRegDate || endRegDate || searchKeyword.trim()
			const url = hasSearch ? `${BACKEND}/api/admin/banner/search${qs}` : `${BACKEND}/api/admin/banner/list${qs}`
			const res = await fetch(url, { credentials: 'include' })
			const result: ApiResponse<PagedListData<BannerDto>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '목록 조회에 실패했습니다.')
				return
			}
			const rows = result.data.list ?? []
			setList(rows)
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			const fiIds = Array.from(
				new Set(
					rows
						.flatMap((item) => [(item.pcAtchFileId || '').trim(), (item.moblAtchFileId || '').trim()])
						.filter(Boolean)
				)
			)
			if (fiIds.length === 0) {
				setListThumbMap({})
				return
			}
			const thumbEntries = await Promise.all(
				fiIds.map(async (fiId) => {
					try {
						const r = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, {
							credentials: 'include'
						})
						const json: ApiResponse<{ fileUrl?: string }> = await r.json()
						return [fiId, json.success ? resolveBackendUrl(json.data?.fileUrl || '') : ''] as const
					} catch {
						return [fiId, ''] as const
					}
				})
			)
			const thumbMap: Record<string, string> = {}
			for (const [fiId, fileUrl] of thumbEntries) {
				if (fileUrl) thumbMap[fiId] = fileUrl
			}
			setListThumbMap(thumbMap)
		} catch {
			setError('배너 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, useYnFilter, startPublishDate, endPublishDate, startRegDate, endRegDate, searchKeyword])

	useEffect(() => {
		void fetchList(page)
	}, [fetchList, page])

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	const resetBannerImages = () => {
		if (imgPcObjectUrlRef.current) {
			URL.revokeObjectURL(imgPcObjectUrlRef.current)
			imgPcObjectUrlRef.current = null
		}
		if (imgMoObjectUrlRef.current) {
			URL.revokeObjectURL(imgMoObjectUrlRef.current)
			imgMoObjectUrlRef.current = null
		}
		setImgPcFile(null)
		setImgMoFile(null)
		setImgPcPreviewUrl('')
		setImgMoPreviewUrl('')
		setImgPcDisplayName('')
		setImgMoDisplayName('')
		setClearImgPc(false)
		setClearImgMo(false)
		if (imgPcInputRef.current) imgPcInputRef.current.value = ''
		if (imgMoInputRef.current) imgMoInputRef.current.value = ''
	}

	const loadBannerImageInfo = useCallback((fiId: string, slot: 'pc' | 'mo') => {
		if (!fiId) {
			if (slot === 'pc') {
				setImgPcPreviewUrl('')
				setImgPcDisplayName('')
			} else {
				setImgMoPreviewUrl('')
				setImgMoDisplayName('')
			}
			return
		}
		fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(fiId)}`, { credentials: 'include' })
			.then((r) => r.json())
			.then((result: ApiResponse<{ fileUrl?: string; fileOriginName?: string }>) => {
				if (!result.success || !result.data) return
				const previewUrl = resolveBackendUrl(result.data.fileUrl || '')
				const displayName = result.data.fileOriginName || fiId
				if (slot === 'pc') {
					setImgPcPreviewUrl(previewUrl)
					setImgPcDisplayName(displayName)
				} else {
					setImgMoPreviewUrl(previewUrl)
					setImgMoDisplayName(displayName)
				}
			})
			.catch(() => {
				if (slot === 'pc') {
					setImgPcDisplayName(fiId)
				} else {
					setImgMoDisplayName(fiId)
				}
			})
	}, [])

	useEffect(() => {
		if (imgPcFile) {
			if (imgPcObjectUrlRef.current) {
				URL.revokeObjectURL(imgPcObjectUrlRef.current)
			}
			const url = URL.createObjectURL(imgPcFile)
			imgPcObjectUrlRef.current = url
			setImgPcPreviewUrl(url)
			setImgPcDisplayName(imgPcFile.name)
			return () => {
				URL.revokeObjectURL(url)
				if (imgPcObjectUrlRef.current === url) imgPcObjectUrlRef.current = null
			}
		}
		if (clearImgPc || !form.pcAtchFileId) {
			setImgPcPreviewUrl('')
			setImgPcDisplayName('')
			return
		}
		loadBannerImageInfo(form.pcAtchFileId, 'pc')
	}, [imgPcFile, form.pcAtchFileId, clearImgPc, loadBannerImageInfo])

	useEffect(() => {
		if (imgMoFile) {
			if (imgMoObjectUrlRef.current) {
				URL.revokeObjectURL(imgMoObjectUrlRef.current)
			}
			const url = URL.createObjectURL(imgMoFile)
			imgMoObjectUrlRef.current = url
			setImgMoPreviewUrl(url)
			setImgMoDisplayName(imgMoFile.name)
			return () => {
				URL.revokeObjectURL(url)
				if (imgMoObjectUrlRef.current === url) imgMoObjectUrlRef.current = null
			}
		}
		if (clearImgMo || !form.moblAtchFileId) {
			setImgMoPreviewUrl('')
			setImgMoDisplayName('')
			return
		}
		loadBannerImageInfo(form.moblAtchFileId, 'mo')
	}, [imgMoFile, form.moblAtchFileId, clearImgMo, loadBannerImageInfo])

	const handleImgSelect = (slot: 'pc' | 'mo', file: File | null) => {
		if (!file) return
		if (!file.type.startsWith('image/')) {
			alert('이미지 파일만 업로드 가능합니다.')
			return
		}
		if (slot === 'pc') {
			setClearImgPc(false)
			setImgPcFile(file)
			if (imgPcInputRef.current) imgPcInputRef.current.value = ''
		} else {
			setClearImgMo(false)
			setImgMoFile(file)
			if (imgMoInputRef.current) imgMoInputRef.current.value = ''
		}
	}

	const clearBannerImage = (slot: 'pc' | 'mo') => {
		if (slot === 'pc') {
			setClearImgPc(true)
			setImgPcFile(null)
			if (imgPcInputRef.current) imgPcInputRef.current.value = ''
		} else {
			setClearImgMo(true)
			setImgMoFile(null)
			if (imgMoInputRef.current) imgMoInputRef.current.value = ''
		}
	}

	const uploadBannerImage = async (file: File | null, fiId: string, clear: boolean): Promise<string> => {
		if (clear && !file) return ''
		if (!file) return fiId || ''
		const fd = new FormData()
		fd.append('file', file)
		fd.append('menuType', 'banner')
		if (fiId && !clear) fd.append('fiId', fiId)
		const uploadRes = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
			method: 'POST',
			body: fd,
			credentials: 'include'
		})
		const uploadResult: ApiResponse<{ fiId?: string }> = await uploadRes.json()
		if (!uploadResult.success || !uploadResult.data?.fiId) {
			throw new Error(uploadResult.message || '이미지 업로드에 실패했습니다.')
		}
		return uploadResult.data.fiId
	}

	const openNewPopup = () => {
		setForm({ ...defaultForm })
		resetBannerImages()
		setPopupMode('new')
		setPopupOpen(true)
	}
	const openEditPopup = (row: BannerDto) => {
		setForm({
			...defaultForm,
			bnrSn: row.bnrSn ?? null,
			bnrNm: row.bnrNm ?? '',
			bnrMainCn: row.bnrMainCn ?? '',
			bnrSubCn: row.bnrSubCn ?? '',
			pdtYmd: row.pdtYmd ?? '',
			newBadgeYn: row.newBadgeYn ?? 'N',
			lnkgUrlAddr: row.lnkgUrlAddr ?? '',
			lnkgSeCd: row.lnkgSeCd ?? 'B',
			pstgBgngYmd: row.pstgBgngYmd ? String(row.pstgBgngYmd).slice(0, 10) : '',
			pstgEndYmd: row.pstgEndYmd ? String(row.pstgEndYmd).slice(0, 10) : '',
			pstgPrdUseYn: row.pstgPrdUseYn ?? 'N',
			pcAtchFileId: row.pcAtchFileId ?? '',
			moblAtchFileId: row.moblAtchFileId ?? '',
			sortSeq: row.sortSeq ?? 0,
			useYn: row.useYn ?? 'Y'
		})
		resetBannerImages()
		setPopupMode('edit')
		setPopupOpen(true)
	}
	const closePopup = () => {
		resetBannerImages()
		setPopupOpen(false)
		setError(null)
	}

	const handleSearch = () => {
		setPage(1)
		void fetchList(1)
	}
	const clearSearch = () => {
		setUseYnFilter('')
		setStartPublishDate('')
		setEndPublishDate('')
		setStartRegDate('')
		setEndRegDate('')
		setSearchType('title')
		setSearchKeyword('')
		setPage(1)
	}

	const handleSave = async () => {
		if (!form.bnrNm?.trim()) {
			setError('제목을 입력하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			let pcAtchFileId = form.pcAtchFileId || ''
			let moblAtchFileId = form.moblAtchFileId || ''
			if (clearImgPc && !imgPcFile) pcAtchFileId = ''
			if (clearImgMo && !imgMoFile) moblAtchFileId = ''
			pcAtchFileId = await uploadBannerImage(imgPcFile, pcAtchFileId, clearImgPc)
			moblAtchFileId = await uploadBannerImage(imgMoFile, moblAtchFileId, clearImgMo)

			const body = {
				bnrNm: form.bnrNm,
				bnrMainCn: form.bnrMainCn ?? '',
				bnrSubCn: form.bnrSubCn ?? '',
				pdtYmd: form.pdtYmd ?? '',
				newBadgeYn: form.newBadgeYn ?? 'N',
				lnkgUrlAddr: form.lnkgUrlAddr ?? '',
				lnkgSeCd: form.lnkgSeCd ?? 'B',
				pstgBgngYmd: form.pstgBgngYmd || null,
				pstgEndYmd: form.pstgEndYmd || null,
				pstgPrdUseYn: form.pstgPrdUseYn ?? 'N',
				pcAtchFileId,
				moblAtchFileId,
				sortSeq: form.sortSeq ?? 0,
				useYn: form.useYn ?? 'Y'
			}
			if (popupMode === 'new') {
				const res = await fetch(`${BACKEND}/api/admin/banner`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				})
				const result: ApiResponse<BannerDto> = await res.json()
				if (!result.success) {
					setError(result.message || '등록에 실패했습니다.')
					return
				}
				setMessage('배너가 등록되었습니다.')
			} else {
				const bnrSn = form.bnrSn!
				const res = await fetch(`${BACKEND}/api/admin/banner/${bnrSn}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
					credentials: 'include'
				})
				const result: ApiResponse<BannerDto> = await res.json()
				if (!result.success) {
					setError(result.message || '수정에 실패했습니다.')
					return
				}
				setMessage('배너가 수정되었습니다.')
			}
			closePopup()
			await fetchList(page)
		} catch (err) {
			setError(err instanceof Error ? err.message : (popupMode === 'new' ? '등록 중 오류가 발생했습니다.' : '수정 중 오류가 발생했습니다.'))
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (form.bnrSn == null) return
		if (!window.confirm(`"${form.bnrNm}" 배너를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/banner/${form.bnrSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('배너가 삭제되었습니다.')
			closePopup()
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const persistBannerOrder = async (rows: BannerDto[]) => {
		setOrderSaving(true)
		setError(null)
		setMessage(null)
		try {
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i]
				if (row.bnrSn == null) continue
				const res = await fetch(`${BACKEND}/api/admin/banner/${row.bnrSn}/seq?sortSeq=${i}`, {
					method: 'PUT',
					credentials: 'include'
				})
				const result: ApiResponse<unknown> = await res.json()
				if (!result.success) {
					setError(result.message || '순서 변경에 실패했습니다.')
					await fetchList(page)
					return
				}
			}
			setMessage('순서가 변경되었습니다.')
			await fetchList(page)
		} catch {
			setError('순서 변경 중 오류가 발생했습니다.')
			await fetchList(page)
		} finally {
			setOrderSaving(false)
		}
	}

	const handleBannerDrop = async (targetBnrIdx: number) => {
		if (dragBnrIdx == null || dragBnrIdx === targetBnrIdx || !isOrderChangeEnabled || orderSaving) return
		const fromIdx = list.findIndex((r) => r.bnrSn === dragBnrIdx)
		const toIdx = list.findIndex((r) => r.bnrSn === targetBnrIdx)
		if (fromIdx < 0 || toIdx < 0) return
		const reordered = reorderBannerRows(list, fromIdx, toIdx)
		suppressRowClickRef.current = true
		setDragBnrIdx(null)
		setDragOverBnrIdx(null)
		setList(reordered)
		await persistBannerOrder(reordered)
	}

	const handleDeleteRow = async (bnrSn: number, bnrNm: string) => {
		if (!window.confirm(`"${bnrNm}" 배너를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/banner/${bnrSn}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('배너가 삭제되었습니다.')
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AdminLayout title="배너관리">
			<CrudPageCard title="배너관리" error={error} message={message}>
				<div className="code-filters bbs-post-filters search-section" style={{ flexWrap: 'wrap', gap: '8px' }}>
					<label>
						사용여부
						<select value={useYnFilter} onChange={(e) => setUseYnFilter(e.target.value)}>
							<option value="">전체</option>
							<option value="Y">Y</option>
							<option value="N">N</option>
						</select>
					</label>
					<label>
						게시기간
						<input
							type="date"
							value={startPublishDate}
							onChange={(e) => setStartPublishDate(e.target.value)}
						/>
						~
						<input
							type="date"
							value={endPublishDate}
							onChange={(e) => setEndPublishDate(e.target.value)}
						/>
					</label>
					<label>
						등록일
						<input type="date" value={startRegDate} onChange={(e) => setStartRegDate(e.target.value)} />
						~
						<input type="date" value={endRegDate} onChange={(e) => setEndRegDate(e.target.value)} />
					</label>
					<div className="banner-search-row">
						<label className="banner-search-field">
							검색
							<select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
								<option value="title">제목</option>
								<option value="content">내용</option>
								<option value="all">제목+내용</option>
							</select>
							<input
								type="text"
								placeholder="검색어"
								value={searchKeyword}
								onChange={(e) => setSearchKeyword(e.target.value)}
							/>
						</label>
						<div className="banner-search-actions">
							<button type="button" className="admin-list-btn-sky" onClick={handleSearch}>검색</button>
							<button type="button" className="admin-filter-btn-reset" onClick={clearSearch}>초기화</button>
						</div>
					</div>
				</div>
				<div className="list-toolbar">
					<span className="list-toolbar-info">
						{formatListToolbarInfo(totalCount, page, totalPages)}
						{isOrderChangeEnabled && list.length > 1 && (
							<span className="banner-list-order-hint"> · 순서 열을 드래그하여 변경</span>
						)}
						{!isOrderChangeEnabled && (
							<span className="banner-list-order-hint"> · 순서 변경은 1페이지·검색 조건 없을 때만 가능</span>
						)}
					</span>
					<button type="button" className="admin-list-btn-sky" onClick={openNewPopup}>신규</button>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: '60px'}}>번호</th>
							<th style={{ width: '72px'}}>썸네일</th>
							<th style={{ width: 'auto'}}>제목</th>
							<th style={{ width: '210px'}}>게시기간</th>
							<th style={{ width: '88px'}}>순서</th>
							<th style={{ width: '100px'}}>사용여부</th>
							<th style={{ width: '100px'}}>등록일</th>
							<th style={{ width: '120px'}}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr
								key={row.bnrSn!}
								className={[
									'clickable',
									'banner-list-row',
									dragBnrIdx === row.bnrSn ? 'is-dragging' : '',
									dragOverBnrIdx === row.bnrSn ? 'is-drag-over' : ''
								].filter(Boolean).join(' ')}
								draggable={isOrderChangeEnabled && !orderSaving}
								onDragStart={(e) => {
									if (!isOrderChangeEnabled || orderSaving || row.bnrSn == null) return
									setDragBnrIdx(row.bnrSn)
									e.dataTransfer.effectAllowed = 'move'
								}}
								onDragOver={(e) => {
									if (!isOrderChangeEnabled || dragBnrIdx == null || row.bnrSn == null) return
									e.preventDefault()
									setDragOverBnrIdx(row.bnrSn)
								}}
								onDragLeave={() => {
									if (dragOverBnrIdx === row.bnrSn) setDragOverBnrIdx(null)
								}}
								onDrop={(e) => {
									e.preventDefault()
									if (row.bnrSn != null) void handleBannerDrop(row.bnrSn)
								}}
								onDragEnd={() => {
									setDragBnrIdx(null)
									setDragOverBnrIdx(null)
								}}
								onClick={() => {
									if (suppressRowClickRef.current) {
										suppressRowClickRef.current = false
										return
									}
									openEditPopup(row)
								}}
							>
								<td>{row.bnrSn}</td>
								<td>{renderBannerListThumb(row, listThumbMap)}</td>
								<td>{row.bnrNm}</td>
								<td>
									{row.pstgPrdUseYn === 'Y'
										? `${formatDate(row.pstgBgngYmd)} ~ ${formatDate(row.pstgEndYmd)}`
										: '-'}
								</td>
								<td onClick={(e) => e.stopPropagation()}>
									<span className="banner-list-order-cell">
										{isOrderChangeEnabled && (
											<i className="category-drag-handle" aria-hidden="true">⋮⋮</i>
										)}
										<span>{row.sortSeq}</span>
									</span>
								</td>
								<td>{useYnBadge(row.useYn)}</td>
								<td>{formatDate(row.regDt)}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => openEditPopup(row)}
										onDelete={() => handleDeleteRow(row.bnrSn!, row.bnrNm)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={8} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
							</tr>
						)}
					</tbody>
				</table>
				<ListPagination
					page={page}
					totalPages={totalPages}
					disabled={loading || orderSaving}
					onPageChange={(p) => setPage(p)}
				/>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={popupMode === 'new' ? '배너 등록' : '배너 상세 (수정)'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						{popupMode === 'edit' && form.bnrSn != null && (
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
				<table className="form-table form-table-cols4">
					<tbody>
						{popupMode === 'edit' && form.bnrSn != null && (
							<tr>
								<th>번호</th>
								<td><input type="text" value={form.bnrSn} readOnly /></td>
								<th>제목</th>
								<td>
									<input
										type="text"
										value={form.bnrNm}
										onChange={(e) => setForm({ ...form, bnrNm: e.target.value })}
									/>
								</td>
							</tr>
						)}
						{popupMode === 'new' && (
							<tr>
								<th>제목</th>
								<td colSpan={3}>
									<input
										type="text"
										value={form.bnrNm}
										onChange={(e) => setForm({ ...form, bnrNm: e.target.value })}
									/>
								</td>
							</tr>
						)}
						<tr>
							<th>메인텍스트</th>
							<td>
								<input
									type="text"
									value={form.bnrMainCn}
									onChange={(e) => setForm({ ...form, bnrMainCn: e.target.value })}
								/>
							</td>
							<th>서브텍스트</th>
							<td>
								<input
									type="text"
									value={form.bnrSubCn}
									onChange={(e) => setForm({ ...form, bnrSubCn: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>제품발매일</th>
							<td>
								<input
									type="text"
									value={form.pdtYmd}
									onChange={(e) => setForm({ ...form, pdtYmd: e.target.value })}
									placeholder="YYYY-MM-DD"
								/>
							</td>
							<th>NEW뱃지</th>
							<td>
								{renderYnToggle(
									form.newBadgeYn,
									(newBadgeYn) => setForm({ ...form, newBadgeYn }),
									'표시',
									'미표시'
								)}
							</td>
						</tr>
						<tr>
							<th>링크</th>
							<td colSpan={3}>
								<input
									type="text"
									value={form.lnkgUrlAddr}
									onChange={(e) => setForm({ ...form, lnkgUrlAddr: e.target.value })}
									placeholder="https://"
								/>
							</td>
						</tr>
						<tr>
							<th>링크타입</th>
							<td>
								<select value={form.lnkgSeCd} onChange={(e) => setForm({ ...form, lnkgSeCd: e.target.value })}>
									<option value="P">부모창(P)</option>
									<option value="B">새창(B)</option>
								</select>
							</td>
							<th>게시기간 사용</th>
							<td>
								{renderYnToggle(
									form.pstgPrdUseYn,
									(pstgPrdUseYn) => setForm({ ...form, pstgPrdUseYn }),
									'사용',
									'미사용'
								)}
							</td>
						</tr>
						<tr>
							<th>게시시작일</th>
							<td>
								<input
									type="date"
									value={form.pstgBgngYmd}
									onChange={(e) => setForm({ ...form, pstgBgngYmd: e.target.value })}
								/>
							</td>
							<th>게시종료일</th>
							<td>
								<input
									type="date"
									value={form.pstgEndYmd}
									onChange={(e) => setForm({ ...form, pstgEndYmd: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>이미지(PC)</th>
							<td>
								<input
									ref={imgPcInputRef}
									type="file"
									accept="image/*"
									onChange={(e) => handleImgSelect('pc', e.target.files?.[0] ?? null)}
									style={{ display: 'none' }}
								/>
								<button
									type="button"
									className="popup-file-btn"
									onClick={() => imgPcInputRef.current?.click()}
									disabled={loading}
								>
									파일 선택
								</button>
								{(imgPcDisplayName || imgPcPreviewUrl) && !clearImgPc && (
									<>
										<button
											type="button"
											className="popup-file-btn-secondary"
											style={{ marginLeft: 8 }}
											onClick={() => clearBannerImage('pc')}
											disabled={loading}
										>
											삭제
										</button>
										<div className="popup-img-preview">
											{imgPcPreviewUrl && (
												<img src={imgPcPreviewUrl} alt="PC 이미지 미리보기" />
											)}
											<span className="popup-img-path">{imgPcDisplayName}</span>
										</div>
									</>
								)}
							</td>
							<th>이미지(모바일)</th>
							<td>
								<input
									ref={imgMoInputRef}
									type="file"
									accept="image/*"
									onChange={(e) => handleImgSelect('mo', e.target.files?.[0] ?? null)}
									style={{ display: 'none' }}
								/>
								<button
									type="button"
									className="popup-file-btn"
									onClick={() => imgMoInputRef.current?.click()}
									disabled={loading}
								>
									파일 선택
								</button>
								{(imgMoDisplayName || imgMoPreviewUrl) && !clearImgMo && (
									<>
										<button
											type="button"
											className="popup-file-btn-secondary"
											style={{ marginLeft: 8 }}
											onClick={() => clearBannerImage('mo')}
											disabled={loading}
										>
											삭제
										</button>
										<div className="popup-img-preview">
											{imgMoPreviewUrl && (
												<img src={imgMoPreviewUrl} alt="모바일 이미지 미리보기" />
											)}
											<span className="popup-img-path">{imgMoDisplayName}</span>
										</div>
									</>
								)}
							</td>
						</tr>
						<tr>
							<th>순서</th>
							<td>
								<input
									type="number"
									value={form.sortSeq}
									onChange={(e) => setForm({ ...form, sortSeq: parseInt(e.target.value, 10) || 0 })}
								/>
							</td>
							<th>사용여부</th>
							<td>
								{renderYnToggle(
									form.useYn,
									(useYn) => setForm({ ...form, useYn }),
									'사용',
									'미사용'
								)}
							</td>
						</tr>
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

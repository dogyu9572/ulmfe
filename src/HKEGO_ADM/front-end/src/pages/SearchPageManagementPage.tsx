import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { type PagedListData } from '../utils/listPaginationConstants'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { ListPagination } from '../components/ListPagination'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type SessionInfo = {
	adminId: string
	adminName: string
}

type SearchPage = {
	srchPageSn: number | null
	menu1DepthNm: string
	menu2DepthNm: string
	menu3DepthNm: string
	pageTtl: string
	pageCn: string
	pageUrl: string
	regDt?: string
	rgtr?: string
	rgtrNm?: string
	mdtr?: string
}

type HomepageMenu = {
	menuCd: string
	parentMenuCd: string
	menuDepth: number
	menuNm: string
	sortSeq: number
	useYn: string
}

const BACKEND = API_BASE_URL
const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const defaultForm = (): SearchPage => ({
	srchPageSn: null,
	menu1DepthNm: '',
	menu2DepthNm: '',
	menu3DepthNm: '',
	pageTtl: '',
	pageCn: '',
	pageUrl: ''
})

const stripText = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const formatMenuPath = (row: SearchPage) =>
	[row.menu1DepthNm, row.menu2DepthNm, row.menu3DepthNm].filter(Boolean).join(' > ')

export const SearchPageManagementPage: React.FC = () => {
	const [form, setForm] = useState<SearchPage>(defaultForm)
	const [list, setList] = useState<SearchPage[]>([])
	const [menus, setMenus] = useState<HomepageMenu[]>([])
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
	const [totalCount, setTotalCount] = useState(0)
	const [menu1FilterCd, setMenu1FilterCd] = useState('')
	const [menu2FilterCd, setMenu2FilterCd] = useState('')
	const [menu3FilterCd, setMenu3FilterCd] = useState('')
	const [formMenu1Cd, setFormMenu1Cd] = useState('')
	const [formMenu2Cd, setFormMenu2Cd] = useState('')
	const [formMenu3Cd, setFormMenu3Cd] = useState('')
	const [startRegDate, setStartRegDate] = useState('')
	const [endRegDate, setEndRegDate] = useState('')
	const [searchType, setSearchType] = useState('title')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set())
	const [currentAdmin, setCurrentAdmin] = useState<SessionInfo>({ adminId: '', adminName: '' })
	const [popupOpen, setPopupOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])
	const editMode = form.srchPageSn != null
	const rootMenus = useMemo(
		() => menus.filter((item) => item.menuDepth === 1).sort((a, b) => a.sortSeq - b.sortSeq),
		[menus]
	)
	const filterSecondMenus = useMemo(
		() => menus.filter((item) => item.parentMenuCd === menu1FilterCd).sort((a, b) => a.sortSeq - b.sortSeq),
		[menus, menu1FilterCd]
	)
	const filterThirdMenus = useMemo(
		() => menus.filter((item) => item.parentMenuCd === menu2FilterCd).sort((a, b) => a.sortSeq - b.sortSeq),
		[menus, menu2FilterCd]
	)
	const formSecondMenus = useMemo(
		() => menus.filter((item) => item.parentMenuCd === formMenu1Cd).sort((a, b) => a.sortSeq - b.sortSeq),
		[menus, formMenu1Cd]
	)
	const formThirdMenus = useMemo(
		() => menus.filter((item) => item.parentMenuCd === formMenu2Cd).sort((a, b) => a.sortSeq - b.sortSeq),
		[menus, formMenu2Cd]
	)

	const getMenuName = (menuCd: string) => menus.find((item) => item.menuCd === menuCd)?.menuNm ?? ''
	const findMenuByName = (menuDepth: number, menuNm: string, parentMenuCd = '') =>
		menus.find((item) =>
			item.menuDepth === menuDepth &&
			item.menuNm === menuNm &&
			(item.parentMenuCd || '') === parentMenuCd
		)

	const clearMessageLater = (text: string) => {
		setMessage(text)
		window.setTimeout(() => setMessage(null), 3000)
	}

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
			// global auth flow handles session errors
		}
	}, [])

	const fetchMenus = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/homepage-menus`, { credentials: 'include' })
			const result: ApiResponse<HomepageMenu[]> = await res.json()
			if (result.success && result.data) {
				setMenus(result.data.filter((item) => item.useYn !== 'N'))
			}
		} catch {
			setError('홈페이지 메뉴 조회 중 오류가 발생했습니다.')
		}
	}, [])

	const buildSearchParams = useCallback((targetPage: number, targetSize = pageSize) => {
		const qs = new URLSearchParams()
		qs.set('page', String(targetPage))
		qs.set('size', String(targetSize))
		const menu1DepthNm = getMenuName(menu1FilterCd)
		const menu2DepthNm = getMenuName(menu2FilterCd)
		const menu3DepthNm = getMenuName(menu3FilterCd)
		if (menu1DepthNm) qs.set('menu1DepthNm', menu1DepthNm)
		if (menu2DepthNm) qs.set('menu2DepthNm', menu2DepthNm)
		if (menu3DepthNm) qs.set('menu3DepthNm', menu3DepthNm)
		if (startRegDate) qs.set('startRegDate', startRegDate)
		if (endRegDate) qs.set('endRegDate', endRegDate)
		if (searchType) qs.set('searchType', searchType)
		if (searchKeyword.trim()) qs.set('searchKeyword', searchKeyword.trim())
		return qs.toString()
	}, [pageSize, menu1FilterCd, menu2FilterCd, menu3FilterCd, menus, startRegDate, endRegDate, searchType, searchKeyword])

	const fetchList = useCallback(async (targetPage = page, targetSize = pageSize) => {
		setError(null)
		try {
			const qs = buildSearchParams(targetPage, targetSize)
			const res = await fetch(`${BACKEND}/api/admin/search-pages?${qs}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<SearchPage>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '통합검색 페이지 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
			setPageSize(result.data.size ?? targetSize)
			setSelectedIds(new Set())
		} catch {
			setError('통합검색 페이지 목록 조회 중 오류가 발생했습니다.')
		}
	}, [buildSearchParams, page, pageSize])

	useEffect(() => {
		void fetchSession()
		void fetchMenus()
		void fetchList(1, DEFAULT_PAGE_SIZE)
	}, [])

	const openNewPopup = () => {
		setForm(defaultForm())
		setFormMenu1Cd('')
		setFormMenu2Cd('')
		setFormMenu3Cd('')
		setError(null)
		setPopupOpen(true)
	}

	const openEditPopup = (row: SearchPage) => {
		setForm({ ...row })
		const menu1 = findMenuByName(1, row.menu1DepthNm)
		const menu2 = menu1 ? findMenuByName(2, row.menu2DepthNm, menu1.menuCd) : undefined
		const menu3 = menu2 ? findMenuByName(3, row.menu3DepthNm, menu2.menuCd) : undefined
		setFormMenu1Cd(menu1?.menuCd ?? '')
		setFormMenu2Cd(menu2?.menuCd ?? '')
		setFormMenu3Cd(menu3?.menuCd ?? '')
		setError(null)
		setPopupOpen(true)
	}

	const closePopup = () => {
		setPopupOpen(false)
		setError(null)
		setForm(defaultForm())
		setFormMenu1Cd('')
		setFormMenu2Cd('')
		setFormMenu3Cd('')
	}

	const saveSearchPage = async () => {
		if (!form.menu1DepthNm.trim()) {
			setError('1depth 메뉴명을 입력해주세요.')
			return
		}
		if (!form.pageTtl.trim()) {
			setError('제목을 입력해주세요.')
			return
		}
		if (!form.pageCn.trim()) {
			setError('내용을 입력해주세요.')
			return
		}
		if (!form.pageUrl.trim()) {
			setError('페이지 URL을 입력해주세요.')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const body: SearchPage = {
				...form,
				menu1DepthNm: form.menu1DepthNm.trim(),
				menu2DepthNm: form.menu2DepthNm.trim(),
				menu3DepthNm: form.menu3DepthNm.trim(),
				pageTtl: form.pageTtl.trim(),
				pageCn: form.pageCn.trim(),
				pageUrl: form.pageUrl.trim(),
				rgtr: currentAdmin.adminId,
				rgtrNm: currentAdmin.adminName,
				mdtr: currentAdmin.adminId
			}
			const url = editMode
				? `${BACKEND}/api/admin/search-pages/${form.srchPageSn}`
				: `${BACKEND}/api/admin/search-pages`
			const res = await fetch(url, {
				method: editMode ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body)
			})
			const result: ApiResponse<SearchPage> = await res.json()
			if (!result.success) {
				setError(result.message || '저장에 실패했습니다.')
				return
			}
			clearMessageLater(editMode ? '수정되었습니다.' : '등록되었습니다.')
			closePopup()
			await fetchList(editMode ? page : 1, pageSize)
		} catch {
			setError('저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteSearchPage = async (row: SearchPage) => {
		if (row.srchPageSn == null) return
		if (!window.confirm('삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const qs = currentAdmin.adminId ? `?deltr=${encodeURIComponent(currentAdmin.adminId)}` : ''
			const res = await fetch(`${BACKEND}/api/admin/search-pages/${row.srchPageSn}${qs}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			clearMessageLater('삭제되었습니다.')
			closePopup()
			await fetchList(page, pageSize)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const deleteSelectedSearchPages = async () => {
		if (selectedIds.size === 0) {
			window.alert('삭제할 통합검색 페이지를 선택해주세요.')
			return
		}
		if (!window.confirm('선택한 항목을 삭제하시겠습니까?')) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/search-pages/delete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					srchPageSns: Array.from(selectedIds),
					deltr: currentAdmin.adminId
				})
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '선택삭제에 실패했습니다.')
				return
			}
			clearMessageLater('선택한 항목이 삭제되었습니다.')
			await fetchList(page, pageSize)
		} catch {
			setError('선택삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const clearSearch = () => {
		setMenu1FilterCd('')
		setMenu2FilterCd('')
		setMenu3FilterCd('')
		setStartRegDate('')
		setEndRegDate('')
		setSearchType('title')
		setSearchKeyword('')
		setTimeout(() => void fetchList(1, pageSize), 0)
	}

	const changeFilterMenu1 = (menuCd: string) => {
		setMenu1FilterCd(menuCd)
		setMenu2FilterCd('')
		setMenu3FilterCd('')
	}

	const changeFilterMenu2 = (menuCd: string) => {
		setMenu2FilterCd(menuCd)
		setMenu3FilterCd('')
	}

	const changeFormMenu1 = (menuCd: string) => {
		setFormMenu1Cd(menuCd)
		setFormMenu2Cd('')
		setFormMenu3Cd('')
		setForm({
			...form,
			menu1DepthNm: getMenuName(menuCd),
			menu2DepthNm: '',
			menu3DepthNm: ''
		})
	}

	const changeFormMenu2 = (menuCd: string) => {
		setFormMenu2Cd(menuCd)
		setFormMenu3Cd('')
		setForm({
			...form,
			menu2DepthNm: getMenuName(menuCd),
			menu3DepthNm: ''
		})
	}

	const changeFormMenu3 = (menuCd: string) => {
		setFormMenu3Cd(menuCd)
		setForm({
			...form,
			menu3DepthNm: getMenuName(menuCd)
		})
	}

	const changePageSize = (nextSize: number) => {
		setPageSize(nextSize)
		void fetchList(1, nextSize)
	}

	const toggleSelected = (id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const allSelected = list.length > 0 && list.every((row) => row.srchPageSn != null && selectedIds.has(row.srchPageSn))

	const toggleSelectAll = () => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (allSelected) {
				list.forEach((row) => {
					if (row.srchPageSn != null) next.delete(row.srchPageSn)
				})
			} else {
				list.forEach((row) => {
					if (row.srchPageSn != null) next.add(row.srchPageSn)
				})
			}
			return next
		})
	}

	return (
		<AdminLayout title="통합검색 관리">
			<CrudPageCard title="통합검색 관리" error={popupOpen ? null : error} message={message}>
				<div className="list-toolbar">
					<div className="list-toolbar-left">
						<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
						<select
							value={pageSize}
							onChange={(e) => changePageSize(Number(e.target.value))}
							className="list-page-size-select"
							aria-label="페이지당 목록 개수"
						>
							{PAGE_SIZE_OPTIONS.map((n) => (
								<option key={n} value={n}>{n}</option>
							))}
						</select>
					</div>
					<div className="list-toolbar-actions">
						<button
							type="button"
							className="admin-footer-btn-delete"
							onClick={() => void deleteSelectedSearchPages()}
							disabled={selectedIds.size === 0 || loading}
						>
							선택삭제{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
						</button>
						<button type="button" className="admin-list-btn-sky" onClick={openNewPopup} disabled={loading}>
							등록
						</button>
					</div>
				</div>

				<div className="bbs-post-filters search-section search-page-search-row">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">메뉴검색</label>
						<select
							value={menu1FilterCd}
							onChange={(e) => changeFilterMenu1(e.target.value)}
							className="bbs-post-filter-select"
						>
							<option value="">1depth</option>
							{rootMenus.map((item) => (
								<option key={item.menuCd} value={item.menuCd}>{item.menuNm}</option>
							))}
						</select>
						<select
							value={menu2FilterCd}
							onChange={(e) => changeFilterMenu2(e.target.value)}
							className="bbs-post-filter-select"
							disabled={!menu1FilterCd}
						>
							<option value="">2depth</option>
							{filterSecondMenus.map((item) => (
								<option key={item.menuCd} value={item.menuCd}>{item.menuNm}</option>
							))}
						</select>
						<select
							value={menu3FilterCd}
							onChange={(e) => setMenu3FilterCd(e.target.value)}
							className="bbs-post-filter-select"
							disabled={!menu2FilterCd || filterThirdMenus.length === 0}
						>
							<option value="">3depth</option>
							{filterThirdMenus.map((item) => (
								<option key={item.menuCd} value={item.menuCd}>{item.menuNm}</option>
							))}
						</select>
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">등록일</label>
						<input type="date" value={startRegDate} onChange={(e) => setStartRegDate(e.target.value)} className="bbs-post-filter-date" />
						<span>~</span>
						<input type="date" value={endRegDate} onChange={(e) => setEndRegDate(e.target.value)} className="bbs-post-filter-date" />
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="bbs-post-filter-select">
							<option value="title">제목</option>
							<option value="content">내용</option>
							<option value="all">전체</option>
						</select>
						<input
							type="text"
							value={searchKeyword}
							placeholder="검색어"
							onChange={(e) => setSearchKeyword(e.target.value)}
							className="bbs-post-filter-input"
							onKeyDown={(e) => {
								if (e.key === 'Enter') void fetchList(1, pageSize)
							}}
						/>
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky" onClick={() => void fetchList(1, pageSize)}>
							검색
						</button>
						<button type="button" className="admin-filter-btn-reset" onClick={clearSearch}>
							초기화
						</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th className="table-col-check">
								<input
									type="checkbox"
									checked={allSelected}
									onChange={toggleSelectAll}
									aria-label="현재 페이지 전체 선택"
								/>
							</th>
							<th style={{ width: '80px' }}>번호</th>
							<th style={{ width: '180px' }}>메뉴명(1depth)</th>
							<th style={{ width: '180px' }}>메뉴명(2depth)</th>
							<th>제목</th>
							<th style={{ width: '220px' }}>페이지 URL</th>
							<th style={{ width: '120px' }}>등록일</th>
							<th style={{ width: '120px' }}>작성자</th>
							<th style={{ width: '120px' }}>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row, idx) => (
							<tr key={row.srchPageSn ?? idx} className="clickable" onClick={() => openEditPopup(row)}>
								<td className="table-col-check" onClick={(e) => e.stopPropagation()}>
									{row.srchPageSn != null && (
										<input
											type="checkbox"
											checked={selectedIds.has(row.srchPageSn)}
											onChange={() => toggleSelected(row.srchPageSn!)}
											onClick={(e) => e.stopPropagation()}
											aria-label={`${row.pageTtl} 선택`}
										/>
									)}
								</td>
								<td>{totalCount - ((page - 1) * pageSize + idx)}</td>
								<td>{row.menu1DepthNm || '-'}</td>
								<td>{row.menu2DepthNm || '-'}</td>
								<td className="search-page-list-title">
									{row.pageTtl}
									<span>{stripText(row.pageCn).slice(0, 40)}</span>
								</td>
								<td className="search-page-url">{row.pageUrl}</td>
								<td>{row.regDt ? row.regDt.slice(0, 10) : '-'}</td>
								<td>{row.rgtrNm || row.rgtr || '-'}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => openEditPopup(row)}
										onDelete={() => void deleteSearchPage(row)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr><td colSpan={9} style={{ textAlign: 'center' }}>데이터가 없습니다.</td></tr>
						)}
					</tbody>
				</table>

				<ListPagination
					page={page}
					totalPages={totalPages}
					disabled={loading}
					onPageChange={(targetPage) => void fetchList(targetPage, pageSize)}
				/>
			</CrudPageCard>

			<LayerPopup
				open={popupOpen}
				title={editMode ? '통합검색 관리 (상세)' : '통합검색 등록'}
				onClose={closePopup}
				wideDouble
				footer={
					<>
						{editMode && (
							<button
								type="button"
								className="admin-footer-btn-delete"
								onClick={() => void deleteSearchPage(form)}
								disabled={loading}
								style={{ marginRight: 'auto' }}
							>
								삭제
							</button>
						)}
						<button type="button" className="admin-list-btn-edit" onClick={() => void saveSearchPage()} disabled={loading}>
							저장
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closePopup} disabled={loading}>
							목록
						</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table form-table-cols4">
					<tbody>
						<tr>
							<th>메뉴선택</th>
							<td colSpan={3}>
								<div className="search-page-menu-fields">
									<select value={formMenu1Cd} onChange={(e) => changeFormMenu1(e.target.value)}>
										<option value="">1depth</option>
										{rootMenus.map((item) => (
											<option key={item.menuCd} value={item.menuCd}>{item.menuNm}</option>
										))}
									</select>
									<select value={formMenu2Cd} onChange={(e) => changeFormMenu2(e.target.value)} disabled={!formMenu1Cd}>
										<option value="">2depth</option>
										{formSecondMenus.map((item) => (
											<option key={item.menuCd} value={item.menuCd}>{item.menuNm}</option>
										))}
									</select>
									<select
										value={formMenu3Cd}
										onChange={(e) => changeFormMenu3(e.target.value)}
										disabled={!formMenu2Cd || formThirdMenus.length === 0}
									>
										<option value="">3depth</option>
										{formThirdMenus.map((item) => (
											<option key={item.menuCd} value={item.menuCd}>{item.menuNm}</option>
										))}
									</select>
								</div>
							</td>
						</tr>
						<tr>
							<th>제목</th>
							<td colSpan={3}>
								<input
									type="text"
									value={form.pageTtl}
									onChange={(e) => setForm({ ...form, pageTtl: e.target.value })}
									style={{ width: '100%', maxWidth: '100%' }}
								/>
							</td>
						</tr>
						<tr>
							<th>페이지 URL</th>
							<td colSpan={3}>
								<input
									type="text"
									value={form.pageUrl}
									onChange={(e) => setForm({ ...form, pageUrl: e.target.value })}
									style={{ width: '100%', maxWidth: '100%' }}
								/>
							</td>
						</tr>
						{editMode && (
							<tr>
								<th>등록일</th>
								<td>{form.regDt ? form.regDt.slice(0, 10) : '-'}</td>
								<th>작성자</th>
								<td>{form.rgtrNm || form.rgtr || '-'}</td>
							</tr>
						)}
						<tr>
							<th>내용</th>
							<td colSpan={3}>
								<textarea
									className="search-page-content-textarea"
									value={form.pageCn}
									onChange={(e) => setForm({ ...form, pageCn: e.target.value })}
								/>
							</td>
						</tr>
						{editMode && (
							<tr>
								<th>선택 메뉴</th>
								<td colSpan={3}>{formatMenuPath(form) || '-'}</td>
							</tr>
						)}
					</tbody>
				</table>
			</LayerPopup>
		</AdminLayout>
	)
}

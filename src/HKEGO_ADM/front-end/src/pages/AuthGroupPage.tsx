import React, { useCallback, useEffect, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, type PagedListData } from '../utils/listPaginationConstants'
import { ListPagination } from '../components/ListPagination'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL } from '../config'
import { codeDetailId } from '../utils/codeDetail'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type AuthGroupDto = {
	authrtCd: string
	authrtNm: string
	authrtCn: string
	useYn: string
}

type CodeDt = {
	cdId: string
	cdDtlId: string
	code?: string
	cdDtlNm: string
	seq: number | null
}

const BACKEND = API_BASE_URL

const useYnBadge = (useYn: string) => {
	const isOn = useYn === 'Y'
	return (
		<span className={`bbs-master-list-badge ${isOn ? 'is-on use' : ''}`}>
			{isOn ? '사용' : '미사용'}
		</span>
	)
}

/** 관리 열 폭 — td/th 인라인으로만 제어 (테이블 레이아웃 힌트) */
const AUTH_GROUP_MANAGE_COL_STYLE: React.CSSProperties = {
	width: 240,
	maxWidth: 240,
	boxSizing: 'border-box',
	verticalAlign: 'middle'
}

export const AuthGroupPage: React.FC = () => {
	const [list, setList] = useState<AuthGroupDto[]>([])
	const [useYnFilter, setUseYnFilter] = useState<string>('')
	const [agIdOptions, setAgIdOptions] = useState<CodeDt[]>([])
	const [form, setForm] = useState<AuthGroupDto>({
		authrtCd: '',
		authrtNm: '',
		authrtCn: '',
		useYn: 'Y'
	})
	const [formPopupOpen, setFormPopupOpen] = useState(false)
	const [formPopupMode, setFormPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const pageSize = DEFAULT_LIST_PAGE_SIZE

	// 레이어 팝업: 권한관리 (메뉴 할당)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupGroup, setPopupGroup] = useState({ id: '', name: '' })
	const [menuTree, setMenuTree] = useState<{ parent: CodeDt; children: CodeDt[] }[]>([])
	const [selectedMenuCodes, setSelectedMenuCodes] = useState<string[]>([])
	const [popupSaving, setPopupSaving] = useState(false)

	const fetchList = useCallback(async (targetPage = page) => {
		setError(null)
		try {
			const p: string[] = [`page=${targetPage}`, `size=${pageSize}`]
			if (useYnFilter) p.push(`useYn=${encodeURIComponent(useYnFilter)}`)
			const res = await fetch(`${BACKEND}/api/admin/auth/groups?${p.join('&')}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<AuthGroupDto>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
		} catch {
			setError('권한 그룹 목록 조회 중 오류가 발생했습니다.')
		}
	}, [useYnFilter, page, pageSize])

	const handleSearch = () => {
		setPage(1)
		void fetchList(1)
	}

	const fetchCode003 = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/codes/detail?cdId=COM003&useYn=Y`, {
				credentials: 'include'
			})
			const result: ApiResponse<CodeDt[]> = await res.json()
			if (result.success && result.data) {
				setAgIdOptions(result.data.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0)))
			}
		} catch {
			// COM003 없으면 빈 배열
		}
	}, [])

	useEffect(() => {
		void fetchList(page)
	}, [fetchList, page])
	useEffect(() => {
		fetchCode003()
	}, [fetchCode003])

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	const openNewFormPopup = () => {
		setForm({ authrtCd: '', authrtNm: '', authrtCn: '', useYn: 'Y' })
		setFormPopupMode('new')
		setFormPopupOpen(true)
	}
	const openEditFormPopup = (row: AuthGroupDto) => {
		setForm({ ...row })
		setFormPopupMode('edit')
		setFormPopupOpen(true)
	}
	const closeFormPopup = () => {
		setFormPopupOpen(false)
		setError(null)
	}

	const handleSave = async () => {
		if (!form.authrtCd?.trim()) {
			setError('권한그룹 ID를 선택하세요.')
			return
		}
		if (!form.authrtNm?.trim()) {
			setError('권한그룹명을 입력하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			if (formPopupMode === 'new') {
				const res = await fetch(`${BACKEND}/api/admin/auth/groups`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(form),
					credentials: 'include'
				})
				const result: ApiResponse<unknown> = await res.json()
				if (!result.success) {
					setError(result.message || '등록에 실패했습니다.')
					return
				}
				setMessage('권한 그룹이 등록되었습니다.')
				closeFormPopup()
			} else {
				const res = await fetch(`${BACKEND}/api/admin/auth/groups/${encodeURIComponent(form.authrtCd)}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(form),
					credentials: 'include'
				})
				const result: ApiResponse<unknown> = await res.json()
				if (!result.success) {
					setError(result.message || '수정에 실패했습니다.')
					return
				}
				setMessage('권한 그룹이 수정되었습니다.')
				closeFormPopup()
			}
			await fetchList(page)
		} catch {
			setError(formPopupMode === 'new' ? '등록 중 오류가 발생했습니다.' : '수정 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!form.authrtCd) {
			setError('삭제할 권한 그룹을 선택하세요.')
			return
		}
		if (!window.confirm(`권한 그룹 "${form.authrtNm}"를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/auth/groups/${encodeURIComponent(form.authrtCd)}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('권한 그룹이 삭제되었습니다.')
			closeFormPopup()
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteRow = async (authrtCd: string, authrtNm: string) => {
		if (!window.confirm(`권한 그룹 "${authrtNm}"를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/auth/groups/${encodeURIComponent(authrtCd)}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('권한 그룹이 삭제되었습니다.')
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const openPermissionPopup = async (row: AuthGroupDto) => {
		setPopupGroup({ id: row.authrtCd, name: row.authrtNm })
		setPopupOpen(true)
		setSelectedMenuCodes([])
		setMenuTree([])
		try {
			const [com1Res, com2Res, menusRes] = await Promise.all([
				fetch(`${BACKEND}/api/admin/codes/detail?cdId=COM001&useYn=Y`, { credentials: 'include' }),
				fetch(`${BACKEND}/api/admin/codes/detail?cdId=COM002&useYn=Y`, { credentials: 'include' }),
				fetch(`${BACKEND}/api/admin/auth/groups/${encodeURIComponent(row.authrtCd)}/menus`, {
					credentials: 'include'
				})
			])
			const com1: ApiResponse<CodeDt[]> = await com1Res.json()
			const com2: ApiResponse<CodeDt[]> = await com2Res.json()
			const menus: ApiResponse<string[]> = await menusRes.json()
			const topList = (com1.success && com1.data) ? com1.data : []
			const subList = (com2.success && com2.data) ? com2.data : []
			const tree: { parent: CodeDt; children: CodeDt[] }[] = topList.map((t) => {
				const topCode = codeDetailId(t)
				return {
					parent: t,
					children: subList
						.filter((s) => codeDetailId(s).startsWith(topCode))
						.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
				}
			})
			setMenuTree(tree)
			setSelectedMenuCodes(menus.success && menus.data ? menus.data : [])
		} catch {
			setError('메뉴 목록을 불러오는 중 오류가 발생했습니다.')
		}
	}

	const toggleMenuCode = (code: string) => {
		setSelectedMenuCodes((prev) =>
			prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
		)
	}

	const isParentChecked = (children: CodeDt[]) =>
		children.length > 0 && children.every((c) => selectedMenuCodes.includes(codeDetailId(c)))

	const isParentIndeterminate = (children: CodeDt[]) => {
		if (children.length === 0) return false
		const selectedCount = children.filter((c) => selectedMenuCodes.includes(codeDetailId(c))).length
		return selectedCount > 0 && selectedCount < children.length
	}

	const toggleParentMenu = (children: CodeDt[]) => {
		const childCodes = children.map((c) => codeDetailId(c))
		const allChecked = childCodes.length > 0 && childCodes.every((code) => selectedMenuCodes.includes(code))
		setSelectedMenuCodes((prev) => {
			if (allChecked) {
				return prev.filter((code) => !childCodes.includes(code))
			}
			const merged = new Set(prev)
			childCodes.forEach((code) => merged.add(code))
			return Array.from(merged)
		})
	}

	const savePopupMenus = async () => {
		if (!popupGroup.id) return
		setPopupSaving(true)
		try {
			const res = await fetch(`${BACKEND}/api/admin/auth/groups/${encodeURIComponent(popupGroup.id)}/menus`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ menuCodes: selectedMenuCodes }),
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '메뉴 권한 저장에 실패했습니다.')
				return
			}
			setMessage('메뉴 권한이 저장되었습니다.')
			setPopupOpen(false)
		} catch {
			setError('메뉴 권한 저장 중 오류가 발생했습니다.')
		} finally {
			setPopupSaving(false)
		}
	}

	return (
		<AdminLayout title="권한그룹관리">
			<CrudPageCard title="권한그룹관리" error={error} message={message}>
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
							<button type="button" className="admin-list-btn-sky" onClick={openNewFormPopup}>신규</button>
						</div>

						<table className="table">
							<thead>
								<tr>
									<th>권한그룹ID</th>
									<th>권한그룹명</th>
									<th>설명</th>
									<th>사용여부</th>
									<th style={AUTH_GROUP_MANAGE_COL_STYLE}>관리</th>
								</tr>
							</thead>
							<tbody>
								{list.map((row) => (
									<tr
										key={row.authrtCd}
										className="clickable"
										onClick={() => openEditFormPopup(row)}
									>
										<td>{row.authrtCd}</td>
										<td>{row.authrtNm}</td>
										<td>{row.authrtCn}</td>
										<td>{useYnBadge(row.useYn)}</td>
										<td
											className="table-actions admin-list-manage-td"
											style={AUTH_GROUP_MANAGE_COL_STYLE}
											onClick={(e) => e.stopPropagation()}
										>
											<RowActionButtons
												onEdit={() => openEditFormPopup(row)}
												onDelete={() => handleDeleteRow(row.authrtCd, row.authrtNm)}
												disabled={loading}
												extra={[{ label: '권한관리', onClick: () => openPermissionPopup(row) }]}
											/>
										</td>
									</tr>
								))}
								{list.length === 0 && (
									<tr>
										<td colSpan={5} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
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
				open={formPopupOpen}
				title={formPopupMode === 'new' ? '권한 그룹 등록' : '권한 그룹 상세 (수정)'}
				onClose={closeFormPopup}
				footer={
					<>
						{formPopupMode === 'edit' && form.authrtCd && (
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
							{formPopupMode === 'new' ? '등록' : '수정'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closeFormPopup}>닫기</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table">
								<tbody>
									<tr>
										<th>권한그룹 ID (COM003)</th>
										<td>
											<select
												value={form.authrtCd}
												onChange={(e) => setForm({ ...form, authrtCd: e.target.value })}
												disabled={formPopupMode === 'edit'}
											>
												<option value="">선택</option>
												{agIdOptions.map((o) => (
													<option key={codeDetailId(o)} value={codeDetailId(o)}>{codeDetailId(o)} - {o.cdDtlNm}</option>
												))}
											</select>
										</td>
									</tr>
									<tr>
										<th>권한그룹명</th>
										<td>
											<input
												type="text"
												value={form.authrtNm}
												onChange={(e) => setForm({ ...form, authrtNm: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>설명</th>
										<td>
											<input
												type="text"
												value={form.authrtCn}
												onChange={(e) => setForm({ ...form, authrtCn: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>사용여부</th>
										<td>
											<select
												value={form.useYn}
												onChange={(e) => setForm({ ...form, useYn: e.target.value })}
											>
												<option value="Y">Y</option>
												<option value="N">N</option>
											</select>
										</td>
									</tr>
								</tbody>
							</table>
			</LayerPopup>

			<LayerPopup
				open={popupOpen}
				title={`메뉴 권한 할당 - ${popupGroup.name}`}
				onClose={() => setPopupOpen(false)}
				footer={
					<>
						<button type="button" className="admin-list-btn-edit" onClick={savePopupMenus} disabled={popupSaving}>
							{popupSaving ? '저장 중...' : '저장'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={() => setPopupOpen(false)}>닫기</button>
					</>
				}
			>
							<div className="auth-menu-list">
								<table className="auth-menu-grid-table">
									<thead>
										<tr>
											<th>대메뉴</th>
											<th>서브메뉴</th>
										</tr>
									</thead>
									<tbody>
										{menuTree.map(({ parent, children }) => (
											<tr key={codeDetailId(parent)}>
												<td className="auth-menu-parent-cell">
													<label className="auth-menu-parent-label">
														<input
															type="checkbox"
															className="auth-menu-parent-check"
															checked={isParentChecked(children)}
															ref={(el) => {
																if (el) el.indeterminate = isParentIndeterminate(children)
															}}
															onChange={() => toggleParentMenu(children)}
														/>
														<span>{parent.cdDtlNm}</span>
													</label>
												</td>
												<td className="auth-menu-children-cell">
													{children.length > 0 ? (
														<ul className="auth-menu-items">
															{children.map((c) => (
																<li key={codeDetailId(c)}>
																	<label>
																		<input
																			type="checkbox"
																			checked={selectedMenuCodes.includes(codeDetailId(c))}
																			onChange={() => toggleMenuCode(codeDetailId(c))}
																		/>
																		<span>{c.cdDtlNm}</span>
																	</label>
																</li>
															))}
														</ul>
													) : (
														<span className="muted">등록된 서브메뉴 없음</span>
													)}
												</td>
											</tr>
										))}
										{menuTree.length === 0 && (
											<tr>
												<td colSpan={2} style={{ textAlign: 'center' }}>
													<span className="muted">COM001/COM002 메뉴 코드가 없습니다. 코드관리에서 등록하세요.</span>
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
			</LayerPopup>
		</AdminLayout>
	)
}

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
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

type HomepageMenu = {
	menuCd: string
	parentMenuCd: string
	menuDepth: number
	menuNm: string
	originalMenuNm: string
	sortSeq: number
	useYn: string
	mdtr?: string
}

const BACKEND = API_BASE_URL

const renderUseToggle = (value: string, onChange: (next: 'Y' | 'N') => void) => (
	<button
		type="button"
		className={`yn-toggle ${value === 'Y' ? 'is-on' : 'is-off'}`}
		onClick={() => onChange(value === 'Y' ? 'N' : 'Y')}
		aria-pressed={value === 'Y'}
	>
		<span className="yn-toggle-label">{value === 'Y' ? '노출' : '숨김'}</span>
		<span className="yn-toggle-knob" aria-hidden="true" />
	</button>
)

export const HomepageMenuPage: React.FC = () => {
	const [menus, setMenus] = useState<HomepageMenu[]>([])
	const [selected1, setSelected1] = useState('')
	const [selected2, setSelected2] = useState('')
	const [selected3, setSelected3] = useState('')
	const [editName, setEditName] = useState('')
	const [editUseYn, setEditUseYn] = useState<'Y' | 'N'>('Y')
	const [currentAdmin, setCurrentAdmin] = useState<SessionInfo>({ adminId: '', adminName: '' })
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

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
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/homepage-menus`, { credentials: 'include' })
			const result: ApiResponse<HomepageMenu[]> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '홈페이지 메뉴 목록 조회에 실패했습니다.')
				return
			}
			setMenus(result.data)
			if (!selected1) {
				const first = result.data.find((item) => item.menuDepth === 1)
				if (first) setSelected1(first.menuCd)
			}
		} catch {
			setError('홈페이지 메뉴 목록 조회 중 오류가 발생했습니다.')
		}
	}, [selected1])

	useEffect(() => {
		void fetchSession()
		void fetchMenus()
	}, [])

	const roots = useMemo(
		() => menus.filter((item) => item.menuDepth === 1).sort((a, b) => a.sortSeq - b.sortSeq),
		[menus]
	)
	const secondMenus = useMemo(
		() => menus.filter((item) => item.parentMenuCd === selected1).sort((a, b) => a.sortSeq - b.sortSeq),
		[menus, selected1]
	)
	const thirdMenus = useMemo(
		() => menus.filter((item) => item.parentMenuCd === selected2).sort((a, b) => a.sortSeq - b.sortSeq),
		[menus, selected2]
	)

	const selectedMenuCd = selected3 || selected2 || selected1
	const selectedMenu = useMemo(
		() => menus.find((item) => item.menuCd === selectedMenuCd) ?? null,
		[menus, selectedMenuCd]
	)
	const selectedSiblings = useMemo(() => {
		if (!selectedMenu) return []
		return menus
			.filter((item) => item.menuDepth === selectedMenu.menuDepth && (item.parentMenuCd || '') === (selectedMenu.parentMenuCd || ''))
			.sort((a, b) => a.sortSeq - b.sortSeq)
	}, [menus, selectedMenu])
	const selectedIndex = selectedMenu ? selectedSiblings.findIndex((item) => item.menuCd === selectedMenu.menuCd) : -1

	useEffect(() => {
		if (!selected1 && roots[0]) {
			setSelected1(roots[0].menuCd)
			return
		}
		if (selected1 && !roots.some((item) => item.menuCd === selected1)) {
			setSelected1(roots[0]?.menuCd ?? '')
			setSelected2('')
			setSelected3('')
		}
	}, [roots, selected1])

	useEffect(() => {
		if (selected2 && !secondMenus.some((item) => item.menuCd === selected2)) {
			setSelected2('')
			setSelected3('')
		}
	}, [secondMenus, selected2])

	useEffect(() => {
		if (selected3 && !thirdMenus.some((item) => item.menuCd === selected3)) {
			setSelected3('')
		}
	}, [thirdMenus, selected3])

	useEffect(() => {
		if (selectedMenu) {
			setEditName(selectedMenu.menuNm)
			setEditUseYn(selectedMenu.useYn === 'N' ? 'N' : 'Y')
		} else {
			setEditName('')
			setEditUseYn('Y')
		}
	}, [selectedMenu])

	const selectMenu = (item: HomepageMenu) => {
		if (item.menuDepth === 1) {
			setSelected1(item.menuCd)
			setSelected2('')
			setSelected3('')
		} else if (item.menuDepth === 2) {
			setSelected2(item.menuCd)
			setSelected3('')
		} else {
			setSelected3(item.menuCd)
		}
	}

	const saveMenu = async () => {
		if (!selectedMenu) {
			setError('수정할 메뉴를 선택해주세요.')
			return
		}
		if (!editName.trim()) {
			setError('메뉴명을 입력해주세요.')
			return
		}
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/homepage-menus/${encodeURIComponent(selectedMenu.menuCd)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					...selectedMenu,
					menuNm: editName.trim(),
					useYn: editUseYn,
					mdtr: currentAdmin.adminId
				})
			})
			const result: ApiResponse<HomepageMenu> = await res.json()
			if (!result.success) {
				setError(result.message || '메뉴 수정에 실패했습니다.')
				return
			}
			setMenus((prev) => prev.map((item) => item.menuCd === result.data.menuCd ? result.data : item))
			clearMessageLater('수정되었습니다.')
		} catch {
			setError('메뉴 수정 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const moveSelected = async (direction: 'up' | 'down') => {
		if (!selectedMenu) return
		if ((direction === 'up' && selectedIndex <= 0) || (direction === 'down' && selectedIndex >= selectedSiblings.length - 1)) return
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/homepage-menus/${encodeURIComponent(selectedMenu.menuCd)}/move`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ direction, mdtr: currentAdmin.adminId })
			})
			const result: ApiResponse<HomepageMenu[]> = await res.json()
			if (!result.success) {
				setError(result.message || '순서 수정에 실패했습니다.')
				return
			}
			setMenus(result.data)
			clearMessageLater('순서가 수정되었습니다.')
		} catch {
			setError('순서 수정 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const renderColumn = (title: string, rows: HomepageMenu[], emptyText: string) => (
		<div className="homepage-menu-column">
			<div className="homepage-menu-column-title">{title}</div>
			<div className="homepage-menu-list">
				{rows.map((item) => (
					<button
						key={item.menuCd}
						type="button"
						className={`homepage-menu-item ${[selected1, selected2, selected3].includes(item.menuCd) ? 'active' : ''} ${item.useYn === 'N' ? 'is-hidden' : ''}`}
						onClick={() => selectMenu(item)}
					>
						<span>{item.menuNm}</span>
						{item.useYn === 'N' && <em>숨김</em>}
					</button>
				))}
				{rows.length === 0 && <div className="homepage-menu-empty">{emptyText}</div>}
			</div>
		</div>
	)

	return (
		<AdminLayout title="메뉴 관리">
			<CrudPageCard title="홈페이지 메뉴관리" error={error} message={message}>
				<div className="homepage-menu-manager">
					<div className="homepage-menu-board">
						{renderColumn('1depth', roots, '1depth 메뉴가 없습니다.')}
						{renderColumn('2depth', secondMenus, '선택한 1depth의 하위 메뉴가 없습니다.')}
						{renderColumn('3depth', thirdMenus, '선택한 2depth의 하위 메뉴가 없습니다.')}
					</div>

					<div className="homepage-menu-actions">
						<button type="button" className="admin-filter-btn-reset" onClick={() => void moveSelected('up')} disabled={loading || selectedIndex <= 0}>
							▲
						</button>
						<button type="button" className="admin-filter-btn-reset" onClick={() => void moveSelected('down')} disabled={loading || selectedIndex < 0 || selectedIndex >= selectedSiblings.length - 1}>
							▼
						</button>
					</div>

					<table className="form-table homepage-menu-form-table">
						<tbody>
							<tr>
								<th>선택 메뉴</th>
								<td>{selectedMenu ? `${selectedMenu.menuDepth}depth / ${selectedMenu.originalMenuNm || selectedMenu.menuNm}` : '-'}</td>
							</tr>
							<tr>
								<th>메뉴명</th>
								<td>
									<div className="homepage-menu-edit-row">
										<input
											type="text"
											value={editName}
											onChange={(e) => setEditName(e.target.value)}
											disabled={!selectedMenu || loading}
										/>
										<button type="button" className="admin-list-btn-edit" onClick={() => void saveMenu()} disabled={!selectedMenu || loading}>
											수정
										</button>
									</div>
								</td>
							</tr>
							<tr>
								<th>노출여부</th>
								<td>
									<div className="homepage-menu-edit-row">
										{renderUseToggle(editUseYn, setEditUseYn)}
										<button type="button" className="admin-list-btn-edit" onClick={() => void saveMenu()} disabled={!selectedMenu || loading}>
											수정
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</CrudPageCard>
		</AdminLayout>
	)
}

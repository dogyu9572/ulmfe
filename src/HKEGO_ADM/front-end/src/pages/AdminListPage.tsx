import React, { useCallback, useEffect, useRef, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { DEFAULT_LIST_PAGE_SIZE, extractPagedList, type PagedListData } from '../utils/listPaginationConstants'
import { ListPagination } from '../components/ListPagination'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type AdminDto = {
	id: string
	userNm: string
	emlAddr: string
	acntSttsCd: string
	authrtCd: string
}

type AuthGroupDto = {
	authrtCd: string
	authrtNm: string
	authrtCn: string
	useYn: string
}

const BACKEND = API_BASE_URL

const adminStatusOptions = [
	{ value: 'ACTIVE', label: '활성', className: 'status-badge status-badge--normal' },
	{ value: 'INACTIVE', label: '비활성', className: 'status-badge status-badge--unused' }
]

const adminStatusBadge = (status: string) => {
	const opt = adminStatusOptions.find((o) => o.value === status)
	return (
		<span className={opt?.className ?? 'status-badge'}>
			{opt?.label ?? status}
		</span>
	)
}

const adminRoleBadge = (roleId: string, roleOptions: AuthGroupDto[]) => {
	const name = roleOptions.find((r) => r.authrtCd === roleId)?.authrtNm ?? roleId
	if (!roleId) {
		return <span className="bbs-master-list-badge">-</span>
	}
	return (
		<span className="bbs-master-list-badge is-on cate">
			{name}
		</span>
	)
}

export const AdminListPage: React.FC = () => {
	const [list, setList] = useState<AdminDto[]>([])
	const [roleOptions, setRoleOptions] = useState<AuthGroupDto[]>([])
	const [statusFilter, setStatusFilter] = useState<string>('')
	const [roleFilter, setRoleFilter] = useState<string>('')
	const [form, setForm] = useState<AdminDto>({
		id: '',
		userNm: '',
		emlAddr: '',
		acntSttsCd: 'ACTIVE',
		authrtCd: ''
	})
	const [password, setPassword] = useState('')
	const [passwordChange, setPasswordChange] = useState('')
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [totalCount, setTotalCount] = useState(0)
	const formRef = useRef<HTMLFormElement | null>(null)
	const pageSize = DEFAULT_LIST_PAGE_SIZE

	const fetchAuthGroups = useCallback(async () => {
		try {
			const res = await fetch(`${BACKEND}/api/admin/auth/groups?useYn=Y&size=100`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<AuthGroupDto> | AuthGroupDto[]> = await res.json()
			if (result.success && result.data) {
				setRoleOptions(extractPagedList(result.data))
			}
		} catch {
			// ignore
		}
	}, [])

	useEffect(() => {
		fetchAuthGroups()
	}, [fetchAuthGroups])

	const fetchList = useCallback(async (targetPage = page) => {
		setError(null)
		try {
			const params = new URLSearchParams()
			params.set('page', String(targetPage))
			params.set('size', String(pageSize))
			if (statusFilter) params.set('status', statusFilter)
			if (roleFilter) params.set('role', roleFilter)
			const res = await fetch(`${BACKEND}/api/admin/admins?${params.toString()}`, { credentials: 'include' })
			const result: ApiResponse<PagedListData<AdminDto>> = await res.json()
			if (!result.success || !result.data) {
				setError(result.message || '목록 조회에 실패했습니다.')
				return
			}
			setList(result.data.list ?? [])
			setTotalCount(result.data.totalCount ?? 0)
			setPage(result.data.page ?? targetPage)
		} catch {
			setError('관리자 목록 조회 중 오류가 발생했습니다.')
		}
	}, [page, pageSize, statusFilter, roleFilter])

	useEffect(() => {
		void fetchList(page)
	}, [fetchList, page])

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	const handleSearch = () => {
		setPage(1)
		void fetchList(1)
	}

	const openNewPopup = () => {
		setForm({
			id: '',
			userNm: '',
			emlAddr: '',
			acntSttsCd: 'ACTIVE',
			authrtCd: roleOptions[0]?.authrtCd ?? ''
		})
		setPassword('')
		setPasswordChange('')
		setPopupMode('new')
		setPopupOpen(true)
	}

	const openEditPopup = (row: AdminDto) => {
		setForm({ ...row })
		setPassword('')
		setPasswordChange('')
		setPopupMode('edit')
		setPopupOpen(true)
	}

	const closePopup = () => {
		setPopupOpen(false)
		setError(null)
	}

	const handleSave = async () => {
		const formData = formRef.current ? new FormData(formRef.current) : null
		const currentForm: AdminDto = {
			id: String(formData?.get('id') ?? form.id),
			userNm: String(formData?.get('userNm') ?? form.userNm),
			emlAddr: String(formData?.get('emlAddr') ?? form.emlAddr),
			acntSttsCd: String(formData?.get('acntSttsCd') ?? form.acntSttsCd),
			authrtCd: String(formData?.get('authrtCd') ?? form.authrtCd)
		}
		setForm(currentForm)
		if (!currentForm.id?.trim()) {
			setError('아이디를 입력하세요.')
			return
		}
		if (!currentForm.userNm?.trim()) {
			setError('이름을 입력하세요.')
			return
		}
		if (popupMode === 'new' && !password.trim()) {
			setError('신규 등록 시 비밀번호를 입력하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			if (popupMode === 'new') {
				const res = await fetch(`${BACKEND}/api/admin/admins?password=${encodeURIComponent(password)}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(currentForm),
					credentials: 'include'
				})
				const result: ApiResponse<unknown> = await res.json()
				if (!result.success) {
					setError(result.message || '등록에 실패했습니다.')
					return
				}
				setMessage('관리자를 등록했습니다.')
				closePopup()
			} else {
				const res = await fetch(`${BACKEND}/api/admin/admins/${encodeURIComponent(currentForm.id)}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(currentForm),
					credentials: 'include'
				})
				const result: ApiResponse<unknown> = await res.json()
				if (!result.success) {
					setError(result.message || '수정에 실패했습니다.')
					return
				}
				setMessage('관리자 정보를 수정했습니다.')
				closePopup()
			}
			await fetchList(page)
		} catch {
			setError(popupMode === 'new' ? '등록 중 오류가 발생했습니다.' : '수정 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleChangePassword = async () => {
		if (!form.id || !passwordChange.trim()) {
			setError('비밀번호를 입력하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(
				`${BACKEND}/api/admin/admins/${encodeURIComponent(form.id)}/password?password=${encodeURIComponent(passwordChange)}`,
				{ method: 'PUT', credentials: 'include' }
			)
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '비밀번호 변경에 실패했습니다.')
				return
			}
			setMessage('비밀번호를 변경했습니다.')
			setPasswordChange('')
		} catch {
			setError('비밀번호 변경 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!form.id) {
			setError('삭제할 관리자를 선택하세요.')
			return
		}
		if (!window.confirm(`관리자 "${form.userNm}"를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/admins/${encodeURIComponent(form.id)}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('관리자를 삭제했습니다.')
			closePopup()
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteRow = async (adminId: string, adminName: string) => {
		if (!window.confirm(`관리자 "${adminName}"를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/admins/${encodeURIComponent(adminId)}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '삭제에 실패했습니다.')
				return
			}
			setMessage('관리자를 삭제했습니다.')
			await fetchList(page)
		} catch {
			setError('삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AdminLayout title="관리자 관리">
			<CrudPageCard title="관리자 관리" error={error} message={message}>
				<div className="code-filters search-section" style={{ flexWrap: 'wrap', gap: '8px' }}>
							<label>
								상태
								<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
									<option value="">전체</option>
									<option value="ACTIVE">ACTIVE</option>
									<option value="INACTIVE">INACTIVE</option>
								</select>
							</label>
							<label>
								역할
								<select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
									<option value="">전체</option>
									{roleOptions.map((r) => (
										<option key={r.authrtCd} value={r.authrtCd}>{r.authrtNm}</option>
									))}
								</select>
							</label>
							<button type="button" className="admin-list-btn-sky" onClick={handleSearch}>
								조회
							</button>
						</div>
						<div className="list-toolbar">
							<span className="list-toolbar-info">{formatListToolbarInfo(totalCount, page, totalPages)}</span>
							<button type="button" className="admin-list-btn-sky" onClick={openNewPopup}>신규</button>
						</div>

						<table className="table">
							<thead>
								<tr>
									<th style={{ width: '180px'}}>아이디</th>
									<th style={{ width: '120px'}}>이름</th>
									<th style={{ width: 'auto'}}>이메일</th>
									<th style={{ width: '100px'}}>상태</th>
									<th style={{ width: '120px'}}>역할</th>
									<th style={{ width: '120px'}}>관리</th>
								</tr>
							</thead>
							<tbody>
								{list.map((row) => (
									<tr
										key={row.id}
										className="clickable"
										onClick={() => openEditPopup(row)}
									>
										<td>{row.id}</td>
										<td>{row.userNm}</td>
										<td>{row.emlAddr}</td>
										<td>{adminStatusBadge(row.acntSttsCd)}</td>
										<td>{adminRoleBadge(row.authrtCd, roleOptions)}</td>
										<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
											<RowActionButtons
												onEdit={() => openEditPopup(row)}
												onDelete={() => handleDeleteRow(row.id, row.userNm)}
												disabled={loading}
											/>
										</td>
									</tr>
								))}
								{list.length === 0 && (
									<tr>
										<td colSpan={6} style={{ textAlign: 'center' }}>
											데이터가 없습니다.
										</td>
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
				title={popupMode === 'new' ? '관리자 등록' : '관리자 상세 (수정)'}
				onClose={closePopup}
				footer={
					<>
						{popupMode === 'edit' && form.id && (
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
				<form ref={formRef} onSubmit={(e) => e.preventDefault()}>
				<table className="form-table">
								<tbody>
									<tr>
										<th>아이디</th>
										<td>
											<input
												type="text"
												name="id"
												value={form.id}
												onChange={(e) => setForm({ ...form, id: e.target.value })}
												disabled={popupMode === 'edit'}
											/>
										</td>
									</tr>
									<tr>
										<th>이름</th>
										<td>
											<input
												type="text"
												name="userNm"
												value={form.userNm}
												onChange={(e) => setForm({ ...form, userNm: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>이메일</th>
										<td>
											<input
												type="text"
												name="emlAddr"
												value={form.emlAddr}
												onChange={(e) => setForm({ ...form, emlAddr: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>상태</th>
										<td>
											<select
												name="acntSttsCd"
												value={form.acntSttsCd}
												onChange={(e) => setForm({ ...form, acntSttsCd: e.target.value })}
											>
												<option value="ACTIVE">ACTIVE</option>
												<option value="INACTIVE">INACTIVE</option>
											</select>
										</td>
									</tr>
									<tr>
										<th>역할 (권한그룹)</th>
										<td>
											<select
												name="authrtCd"
												value={form.authrtCd}
												onChange={(e) => setForm({ ...form, authrtCd: e.target.value })}
											>
												<option value="">선택</option>
												{roleOptions.map((r) => (
													<option key={r.authrtCd} value={r.authrtCd}>{r.authrtNm}</option>
												))}
											</select>
										</td>
									</tr>
									{popupMode === 'new' && (
										<tr>
											<th>비밀번호</th>
											<td>
												<div className="form-password-block">
													<input
														type="password"
														className="form-password-input-single"
														value={password}
														onChange={(e) => setPassword(e.target.value)}
														placeholder="신규 비밀번호"
														autoComplete="new-password"
													/>
												</div>
											</td>
										</tr>
									)}
									{popupMode === 'edit' && form.id && (
										<tr>
											<th>비밀번호 변경</th>
											<td>
												<div className="form-password-block">
													<div className="form-password-inline">
														<input
															type="password"
															value={passwordChange}
															onChange={(e) => setPasswordChange(e.target.value)}
															placeholder="변경할 비밀번호"
															autoComplete="new-password"
														/>
														<button
															type="button"
															className="form-password-submit"
															onClick={handleChangePassword}
															disabled={loading}
														>
															비밀번호 변경
														</button>
													</div>
												</div>
											</td>
										</tr>
									)}
								</tbody>
							</table>
							</form>
			</LayerPopup>
		</AdminLayout>
	)
}

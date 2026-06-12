import React, { useEffect, useState } from 'react'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'
import { ListPagination } from '../components/ListPagination'
import { API_BASE_URL } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type CodeDetail = {
	cdId: string
	code: string
	cdDtlNm: string
	useYn: string
}

type UserInfo = {
	userSn?: number
	usrGb: string
	usrLevel: string
	userId: string
	enpswd?: string
	userNm: string
	mblTelno: string
	emlAddr: string
	usrZip: string
	usrAddr1: string
	usrAddr2: string
	usrCmp: string
	usrDept: string
	usrPost: string
	mmplSttsCd: string
	regDt?: string
	lastLogin?: string
}

type UserListData = {
	list: UserInfo[]
	totalCount: number
}

const emptyForm: UserInfo = {
	usrGb: '11',
	usrLevel: 'USER',
	userId: '',
	enpswd: '',
	userNm: '',
	mblTelno: '',
	emlAddr: '',
	usrZip: '',
	usrAddr1: '',
	usrAddr2: '',
	usrCmp: '',
	usrDept: '',
	usrPost: '',
	mmplSttsCd: 'Y'
}

const usrStaOptions = [
	{ value: 'Y', label: '정상', className: 'status-badge status-badge--normal' },
	{ value: 'N', label: '미사용', className: 'status-badge status-badge--unused' },
	{ value: 'M', label: '이관', className: 'status-badge status-badge--migrated' },
	{ value: 'H', label: '휴면', className: 'status-badge status-badge--dormant' }
]

const defaultUsrGbNameMap: Record<string, string> = {
	'101': '일반회원',
	'201': '대리점'
}

export const UserInfoPage: React.FC = () => {
	const [list, setList] = useState<UserInfo[]>([])
	const [usrGbOptions, setUsrGbOptions] = useState<CodeDetail[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [message, setMessage] = useState<string | null>(null)
	const [popupOpen, setPopupOpen] = useState(false)
	const [popupMode, setPopupMode] = useState<'new' | 'edit'>('new')
	const [form, setForm] = useState<UserInfo>(emptyForm)
	const [passwordChange, setPasswordChange] = useState('')
	const [page, setPage] = useState(1)
	const [pageSize] = useState(10)
	const [usrStaFilter, setUsrStaFilter] = useState('')
	const [searchType, setSearchType] = useState('all')
	const [searchKeyword, setSearchKeyword] = useState('')

	const getUsrGbName = (usrGb: string) => {
		const normalizedUsrGb = String(usrGb ?? '').trim()
		const matched = usrGbOptions.find((item) => String(item.code ?? '').trim() === normalizedUsrGb)
		return matched?.cdDtlNm ?? defaultUsrGbNameMap[normalizedUsrGb] ?? normalizedUsrGb
	}

	const getUsrStaOption = (mmplSttsCd: string) => {
		return usrStaOptions.find((item) => item.value === mmplSttsCd)
	}

	const fetchUsrGbOptions = async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/admin/codes/detail?cdId=COM010`, {
				credentials: 'include'
			})
			const result: ApiResponse<CodeDetail[]> = await res.json()
			if (!result.success) {
				return
			}
			const filtered = (result.data ?? []).filter((item) => item.useYn !== 'N')
			setUsrGbOptions(filtered)
		} catch {
			// ignore
		}
	}

	const fetchList = async () => {
		setLoading(true)
		setError(null)
		try {
			const params = new URLSearchParams()
			params.set('page', String(page))
			params.set('pageSize', String(pageSize))
			if (usrStaFilter) params.set('mmplSttsCd', usrStaFilter)
			if (searchType) params.set('searchType', searchType)
			if (searchKeyword.trim()) params.set('searchKeyword', searchKeyword.trim())

			const res = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
				credentials: 'include'
			})
			const result: ApiResponse<UserListData> = await res.json()
			if (!result.success) {
				setError(result.message || '회원 목록 조회에 실패했습니다.')
				return
			}
			setList(result.data?.list ?? [])
			setTotalCount(result.data?.totalCount ?? 0)
		} catch {
			setError('회원 목록 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchUsrGbOptions()
	}, [])

	useEffect(() => {
		fetchList()
	}, [page, usrStaFilter])

	const openNewPopup = () => {
		const defaultUsrGb = String(usrGbOptions[0]?.code ?? emptyForm.usrGb).trim()
		setPopupMode('new')
		setForm({ ...emptyForm, usrGb: defaultUsrGb })
		setPasswordChange('')
		setPopupOpen(true)
	}

	const openEditPopup = (row: UserInfo) => {
		setPopupMode('edit')
		setForm({
			...row,
			usrGb: String(row.usrGb ?? '').trim(),
			enpswd: ''
		})
		setPasswordChange('')
		setPopupOpen(true)
	}

	const closePopup = () => {
		setPopupOpen(false)
		setError(null)
	}

	const handleSave = async () => {
		if (!form.userId.trim()) {
			setError('회원아이디를 입력하세요.')
			return
		}
		if (!form.userNm.trim()) {
			setError('회원명을 입력하세요.')
			return
		}
		if (popupMode === 'new' && !(form.enpswd || '').trim()) {
			setError('비밀번호를 입력하세요.')
			return
		}

		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const method = popupMode === 'new' ? 'POST' : 'PUT'
			const url = popupMode === 'new'
				? `${API_BASE_URL}/api/admin/users`
				: `${API_BASE_URL}/api/admin/users/${form.userSn}`
			const payload: UserInfo = { ...form }
			if (popupMode === 'edit' && !payload.enpswd?.trim()) {
				delete payload.enpswd
			}

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '저장에 실패했습니다.')
				return
			}
			setMessage(popupMode === 'new' ? '회원이 등록되었습니다.' : '회원 정보가 수정되었습니다.')
			closePopup()
			await fetchList()
		} catch {
			setError('저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleChangePassword = async () => {
		if (!form.userSn) return
		if (!passwordChange.trim()) {
			setError('변경할 비밀번호를 입력하세요.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${API_BASE_URL}/api/admin/users/${form.userSn}/password`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ newPassword: passwordChange }),
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '비밀번호 변경에 실패했습니다.')
				return
			}
			setPasswordChange('')
			setMessage('비밀번호가 변경되었습니다.')
		} catch {
			setError('비밀번호 변경 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleWithdraw = async (user: UserInfo) => {
		if (!user.userSn) return
		if (!window.confirm(`회원 "${user.userNm}"를 탈퇴 처리하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.userSn}/withdraw`, {
				method: 'POST',
				credentials: 'include'
			})
			const result: ApiResponse<unknown> = await res.json()
			if (!result.success) {
				setError(result.message || '탈퇴 처리에 실패했습니다.')
				return
			}
			setMessage('회원 탈퇴가 완료되었습니다.')
			if (popupOpen) closePopup()
			await fetchList()
		} catch {
			setError('탈퇴 처리 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	return (
		<AdminLayout title="회원 관리">
			<CrudPageCard title="회원 관리" error={error} message={message}>
				<div className="code-filters search-section" style={{ flexWrap: 'wrap', gap: '8px' }}>
					<label>
						상태
						<select value={usrStaFilter} onChange={(e) => { setUsrStaFilter(e.target.value); setPage(1) }}>
							<option value="">전체</option>
							{usrStaOptions.map((item) => (
								<option key={item.value} value={item.value}>{item.label}</option>
							))}
						</select>
					</label>
					<label>
						검색
						<select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
							<option value="all">전체</option>
							<option value="userId">아이디</option>
							<option value="userNm">회원명</option>
							<option value="mblTelno">휴대폰</option>
							<option value="emlAddr">이메일</option>
						</select>
					</label>
					<input
						type="text"
						value={searchKeyword}
						onChange={(e) => setSearchKeyword(e.target.value)}
						placeholder="검색어 입력"
					/>
					<button type="button" className="admin-list-btn-sky" onClick={() => { setPage(1); fetchList() }}>
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
							<th>번호</th>
							<th>아이디</th>
							<th>회원명</th>
							<th>구분</th>
							<th>휴대폰</th>
							<th>이메일</th>
							<th>상태</th>
							<th>등록일</th>
							<th>관리</th>
						</tr>
					</thead>
					<tbody>
						{list.map((row) => (
							<tr key={row.userSn} className="clickable" onClick={() => openEditPopup(row)}>
								<td>{row.userSn}</td>
								<td>{row.userId}</td>
								<td>{row.userNm}</td>
								<td>
									<span className="code-chip">{getUsrGbName(row.usrGb)}</span>
								</td>
								<td>{row.mblTelno}</td>
								<td>{row.emlAddr}</td>
								<td>
									<span className={getUsrStaOption(row.mmplSttsCd)?.className ?? 'status-badge'}>
										{getUsrStaOption(row.mmplSttsCd)?.label ?? row.mmplSttsCd}
									</span>
								</td>
								<td>{row.regDt?.slice(0, 10) ?? '-'}</td>
								<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
									<RowActionButtons
										onEdit={() => openEditPopup(row)}
										onDelete={() => handleWithdraw(row)}
										disabled={loading}
									/>
								</td>
							</tr>
						))}
						{list.length === 0 && (
							<tr>
								<td colSpan={9} style={{ textAlign: 'center' }}>
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
				title={popupMode === 'new' ? '회원 등록' : '회원 상세 (수정)'}
				onClose={closePopup}
				widePlus300
				footer={
					<>
						{popupMode === 'edit' && (
							<button
								type="button"
								onClick={() => handleWithdraw(form)}
								disabled={loading}
								className="admin-footer-btn-delete"
								style={{ marginRight: 'auto' }}
							>
								탈퇴
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
						<tr>
							<th>회원아이디</th>
							<td>
								<input
									type="text"
									value={form.userId}
									onChange={(e) => setForm({ ...form, userId: e.target.value })}
									disabled={popupMode === 'edit'}
								/>
							</td>
							<th>회원명</th>
							<td>
								<input
									type="text"
									value={form.userNm}
									onChange={(e) => setForm({ ...form, userNm: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>회원구분</th>
							<td>
								<select
									value={form.usrGb}
									onChange={(e) => setForm({ ...form, usrGb: e.target.value })}
								>
									{usrGbOptions.map((item) => (
										<option key={item.code} value={item.code}>{item.cdDtlNm}</option>
									))}
								</select>
							</td>
							<th>관리자권한</th>
							<td>
								<input
									type="text"
									value={form.usrLevel}
									onChange={(e) => setForm({ ...form, usrLevel: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>휴대폰번호</th>
							<td>
								<input
									type="text"
									value={form.mblTelno}
									onChange={(e) => setForm({ ...form, mblTelno: e.target.value })}
								/>
							</td>
							<th>이메일</th>
							<td>
								<input
									type="text"
									value={form.emlAddr}
									onChange={(e) => setForm({ ...form, emlAddr: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>우편번호</th>
							<td>
								<input
									type="text"
									value={form.usrZip}
									onChange={(e) => setForm({ ...form, usrZip: e.target.value })}
								/>
							</td>
							<th>상태</th>
							<td>
								<select
									value={form.mmplSttsCd}
									onChange={(e) => setForm({ ...form, mmplSttsCd: e.target.value })}
								>
									{usrStaOptions.map((item) => (
										<option key={item.value} value={item.value}>{item.label}</option>
									))}
								</select>
							</td>
						</tr>
						<tr>
							<th>기본주소</th>
							<td colSpan={3}>
								<input
									type="text"
									placeholder="기본주소"
									value={form.usrAddr1}
									onChange={(e) => setForm({ ...form, usrAddr1: e.target.value })}
									style={{ maxWidth: '100%' }}
								/>
							</td>
						</tr>
						<tr>
							<th>상세주소</th>
							<td colSpan={3}>
								<input
									type="text"
									placeholder="상세주소"
									value={form.usrAddr2}
									onChange={(e) => setForm({ ...form, usrAddr2: e.target.value })}
									style={{ maxWidth: '100%' }}
								/>
							</td>
						</tr>
						<tr>
							<th>회사명</th>
							<td>
								<input
									type="text"
									value={form.usrCmp}
									onChange={(e) => setForm({ ...form, usrCmp: e.target.value })}
								/>
							</td>
							<th>부서</th>
							<td>
								<input
									type="text"
									value={form.usrDept}
									onChange={(e) => setForm({ ...form, usrDept: e.target.value })}
								/>
							</td>
						</tr>
						<tr>
							<th>직위</th>
							<td>
								<input
									type="text"
									value={form.usrPost}
									onChange={(e) => setForm({ ...form, usrPost: e.target.value })}
								/>
							</td>
							<th />
							<td />
						</tr>
						{popupMode === 'new' && (
							<tr>
								<th>비밀번호</th>
								<td colSpan={3}>
									<div className="form-password-block">
										<input
											type="password"
											className="form-password-input-single"
											value={form.enpswd ?? ''}
											onChange={(e) => setForm({ ...form, enpswd: e.target.value })}
											placeholder="신규 비밀번호"
											autoComplete="new-password"
										/>
									</div>
								</td>
							</tr>
						)}
						{popupMode === 'edit' && (
							<tr>
								<th>비밀번호 변경</th>
								<td colSpan={3}>
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
			</LayerPopup>
		</AdminLayout>
	)
}

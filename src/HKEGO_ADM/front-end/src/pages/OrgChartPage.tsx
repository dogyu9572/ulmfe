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

type OrgMember = {
	orgMbrSn: number | null
	frstClsfCd: string
	frstClsfNm: string
	scndClsfCd: string
	scndClsfNm: string
	taskCn: string
	telno: string
	sortSeq: number
	useYn: string
}

type OrgSecondCategory = {
	code: string
	name: string
}

type OrgFirstCategory = {
	code: string
	name: string
	children: OrgSecondCategory[]
}

const BACKEND = API_BASE_URL

const ORG_CATEGORIES: OrgFirstCategory[] = [
	{
		code: 'DIRECTOR',
		name: '관장',
		children: [
			{ code: 'DIRECTOR', name: '관장' }
		]
	},
	{
		code: 'ORG',
		name: '관장',
		children: [
			{ code: 'PLAN', name: '기획운영팀' },
			{ code: 'EDU', name: '교육팀' },
			{ code: 'FACILITY', name: '시설팀' }
		]
	}
]

const findFirstCategory = (code: string) =>
	ORG_CATEGORIES.find((category) => category.code === code) ?? ORG_CATEGORIES[0]

const defaultMember = (first: OrgFirstCategory, second: OrgSecondCategory): OrgMember => ({
	orgMbrSn: null,
	frstClsfCd: first.code,
	frstClsfNm: first.name,
	scndClsfCd: second.code,
	scndClsfNm: second.name,
	taskCn: '',
	telno: '',
	sortSeq: 0,
	useYn: 'Y'
})

export const OrgChartPage: React.FC = () => {
	const [firstCd, setFirstCd] = useState('ORG')
	const [secondCd, setSecondCd] = useState('PLAN')
	const [members, setMembers] = useState<OrgMember[]>([])
	const [currentAdmin, setCurrentAdmin] = useState<SessionInfo>({ adminId: '', adminName: '' })
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [dragMemberIdx, setDragMemberIdx] = useState<number | null>(null)
	const [dragOverMemberIdx, setDragOverMemberIdx] = useState<number | null>(null)

	const firstCategory = useMemo(() => findFirstCategory(firstCd), [firstCd])
	const secondCategory = useMemo(
		() => firstCategory.children.find((child) => child.code === secondCd) ?? firstCategory.children[0],
		[firstCategory, secondCd]
	)
	const selectedCategoryLabel = secondCategory.name

	const clearMessageLater = (text: string) => {
		setMessage(text)
		window.setTimeout(() => setMessage(null), 3000)
	}

	const normalizeMembers = (rows: OrgMember[]) =>
		[...rows].sort((a, b) => (Number(b.sortSeq) || 0) - (Number(a.sortSeq) || 0))

	const applyDragSortSeq = (rows: OrgMember[]) =>
		rows.map((row, index) => ({ ...row, sortSeq: rows.length - index }))

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

	const fetchMembers = useCallback(async (first: OrgFirstCategory, second: OrgSecondCategory) => {
		setLoading(true)
		setError(null)
		try {
			const qs = new URLSearchParams({
				frstClsfCd: first.code,
				scndClsfCd: second.code
			})
			const res = await fetch(`${BACKEND}/api/admin/org-chart?${qs}`, { credentials: 'include' })
			const result: ApiResponse<OrgMember[]> = await res.json()
			if (!result.success) {
				setError(result.message || '조직도 항목 조회에 실패했습니다.')
				return
			}
			setMembers(normalizeMembers(result.data ?? []))
		} catch {
			setError('조직도 항목 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		void fetchSession()
	}, [fetchSession])

	useEffect(() => {
		void fetchMembers(firstCategory, secondCategory)
	}, [firstCategory, secondCategory, fetchMembers])

	const selectCategory = (firstCode: string, secondCode: string) => {
		setFirstCd(firstCode)
		setSecondCd(secondCode)
	}

	const addMemberRow = () => {
		setMembers((prev) => applyDragSortSeq([
			...prev,
			defaultMember(firstCategory, secondCategory)
		]))
	}

	const updateMember = (index: number, patch: Partial<OrgMember>) => {
		setMembers((prev) => prev.map((row, rowIndex) => (
			rowIndex === index ? { ...row, ...patch } : row
		)))
	}

	const handleMemberDrop = (targetIndex: number) => {
		if (dragMemberIdx == null || dragMemberIdx === targetIndex || loading) return
		setMembers((prev) => {
			const next = [...prev]
			const [moved] = next.splice(dragMemberIdx, 1)
			next.splice(targetIndex, 0, moved)
			return applyDragSortSeq(next)
		})
		setDragMemberIdx(null)
		setDragOverMemberIdx(null)
	}

	const deleteMember = async (row: OrgMember, index: number) => {
		if (!window.confirm('삭제하시겠습니까?')) return
		if (row.orgMbrSn == null) {
			setMembers((prev) => applyDragSortSeq(prev.filter((_, rowIndex) => rowIndex !== index)))
			return
		}
		setLoading(true)
		setError(null)
		try {
			const qs = currentAdmin.adminId ? `?deltr=${encodeURIComponent(currentAdmin.adminId)}` : ''
			const res = await fetch(`${BACKEND}/api/admin/org-chart/${row.orgMbrSn}${qs}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const result: ApiResponse<void> = await res.json()
			if (!result.success) {
				setError(result.message || '조직도 항목 삭제에 실패했습니다.')
				return
			}
			clearMessageLater('조직도 항목이 삭제되었습니다.')
			void fetchMembers(firstCategory, secondCategory)
		} catch {
			setError('조직도 항목 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const saveMembers = async () => {
		const targets = members
			.map((row, index) => ({
				...row,
				frstClsfCd: firstCategory.code,
				frstClsfNm: firstCategory.name,
				scndClsfCd: secondCategory.code,
				scndClsfNm: secondCategory.name,
				taskCn: row.taskCn.trim(),
				telno: row.telno.trim(),
				sortSeq: members.length - index,
				useYn: 'Y',
				rgtr: currentAdmin.adminId,
				mdtr: currentAdmin.adminId
			}))
			.filter((row) => row.taskCn)

		if (targets.length !== members.length) {
			setError('담당업무를 입력해주세요.')
			return
		}

		setLoading(true)
		setError(null)
		try {
			for (const row of targets) {
				const url = row.orgMbrSn == null
					? `${BACKEND}/api/admin/org-chart`
					: `${BACKEND}/api/admin/org-chart/${row.orgMbrSn}`
				const res = await fetch(url, {
					method: row.orgMbrSn == null ? 'POST' : 'PUT',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify(row)
				})
				const result: ApiResponse<OrgMember> = await res.json()
				if (!result.success) {
					setError(result.message || '조직도 항목 저장에 실패했습니다.')
					return
				}
			}
			clearMessageLater('조직도 항목이 저장되었습니다.')
			void fetchMembers(firstCategory, secondCategory)
		} catch {
			setError('조직도 항목 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AdminLayout title="조직도 관리">
			<CrudPageCard title="조직도 관리" error={error} message={message}>
				<div className="org-chart-manager">
					<div className="org-chart-class-section">
						<div className="org-chart-class-head">
							<h4>조직도</h4>
						</div>
						<table className="org-chart-class-table">
							<thead>
								<tr>
									<th>1차 분류</th>
									<th>2차분류</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										<span className="org-chart-class-cell org-chart-class-cell-static">
											관장
										</span>
									</td>
									<td>
										<button
											type="button"
											className={`org-chart-class-cell ${firstCd === 'ORG' && secondCd === 'PLAN' ? 'active' : ''}`}
											onClick={() => selectCategory('ORG', 'PLAN')}
										>
											기획운영팀
										</button>
									</td>
								</tr>
								<tr>
									<td aria-hidden />
									<td>
										<button
											type="button"
											className={`org-chart-class-cell ${firstCd === 'ORG' && secondCd === 'EDU' ? 'active' : ''}`}
											onClick={() => selectCategory('ORG', 'EDU')}
										>
											교육팀
										</button>
									</td>
								</tr>
								<tr>
									<td aria-hidden />
									<td>
										<button
											type="button"
											className={`org-chart-class-cell ${firstCd === 'ORG' && secondCd === 'FACILITY' ? 'active' : ''}`}
											onClick={() => selectCategory('ORG', 'FACILITY')}
										>
											시설팀
										</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="org-chart-edit-panel">
						<div className="org-chart-edit-head">
							<div>
								<p className="org-chart-edit-kicker">선택 분류</p>
								<h4>{selectedCategoryLabel}</h4>
							</div>
							<div className="org-chart-edit-actions">
								<button type="button" className="admin-list-btn-sky" onClick={addMemberRow} disabled={loading}>
									추가
								</button>
								<button type="button" className="admin-list-btn-edit" onClick={() => void saveMembers()} disabled={loading}>
									저장
								</button>
							</div>
						</div>

						<table className="table org-chart-member-table">
							<thead>
								<tr>
									<th>담당업무</th>
									<th style={{ width: '220px' }}>전화번호</th>
									<th style={{ width: '120px' }}>정렬</th>
									<th style={{ width: '90px' }}>삭제</th>
								</tr>
							</thead>
							<tbody>
								{members.map((row, index) => (
									<tr
										key={row.orgMbrSn ?? `new-${index}`}
										className={[
											'org-chart-member-row',
											dragMemberIdx === index ? 'is-dragging' : '',
											dragOverMemberIdx === index ? 'is-drag-over' : ''
										].filter(Boolean).join(' ')}
										draggable={!loading}
										onDragStart={(e) => {
											if (loading) return
											setDragMemberIdx(index)
											e.dataTransfer.effectAllowed = 'move'
										}}
										onDragOver={(e) => {
											if (loading || dragMemberIdx == null) return
											e.preventDefault()
											setDragOverMemberIdx(index)
										}}
										onDragLeave={() => {
											if (dragOverMemberIdx === index) setDragOverMemberIdx(null)
										}}
										onDrop={(e) => {
											e.preventDefault()
											handleMemberDrop(index)
										}}
										onDragEnd={() => {
											setDragMemberIdx(null)
											setDragOverMemberIdx(null)
										}}
									>
										<td>
											<input
												type="text"
												value={row.taskCn}
												onChange={(e) => updateMember(index, { taskCn: e.target.value })}
												className="org-chart-member-input"
											/>
										</td>
										<td>
											<input
												type="text"
												value={row.telno}
												onChange={(e) => updateMember(index, { telno: e.target.value })}
												className="org-chart-member-input"
											/>
										</td>
										<td>
											<span className="org-chart-member-order-cell">
												<i className="category-drag-handle" aria-hidden="true">⋮⋮</i>
												<span>{row.sortSeq || members.length - index}</span>
											</span>
										</td>
										<td>
											<button
												type="button"
												className="admin-footer-btn-delete"
												onClick={() => void deleteMember(row, index)}
												disabled={loading}
											>
												삭제
											</button>
										</td>
									</tr>
								))}
								{members.length === 0 && (
									<tr>
										<td colSpan={4} style={{ textAlign: 'center' }}>
											등록된 항목이 없습니다. 추가 버튼으로 항목을 등록하세요.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</CrudPageCard>
		</AdminLayout>
	)
}

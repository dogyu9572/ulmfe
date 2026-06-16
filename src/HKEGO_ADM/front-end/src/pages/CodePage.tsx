import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { LayerPopup } from '../components/LayerPopup'
import { RowActionButtons } from '../components/RowActionButtons'
import { API_BASE_URL } from '../config'
import { normalizeHexColor } from '../utils/codeBadge'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type CodeMa = {
	cdId: string
	cdNm: string
	cdCn: string
	useYn: string
}

type CodeDt = {
	cdId: string
	code: string
	cdDtlNm: string
	cdDtlCn: string
	seq: number | null
	useYn: string
	etc1: string
	codeEtc2: string
	codeEtc3: string
	atchFileMngNo: string
}

type CodePageMode = 'code' | 'menu'

type CodePageProps = {
	mode?: CodePageMode
}

const MENU_CODE_IDS = new Set(['COM001', 'COM002'])

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

const toColorPickerValue = (value: string): string => normalizeHexColor(value) ?? '#000000'

const truncateWithEllipsis = (value?: string | null, maxLen = 6) => {
	const text = (value || '').trim()
	if (!text) return '-'
	if (text.length <= maxLen) return text
	return <span title={text}>{text.slice(0, maxLen)}…</span>
}

const renderEtc3Cell = (value?: string) => {
	const raw = (value || '').trim()
	if (!raw) return '-'
	const hex = normalizeHexColor(raw)
	return (
		<span className="code-etc3-list-cell">
			{hex ? (
				<span
					className="code-etc3-color-preview code-etc3-color-preview--list"
					style={{ backgroundColor: hex }}
					title={hex}
					aria-hidden="true"
				/>
			) : null}
			<span className="code-etc3-list-text">{raw}</span>
		</span>
	)
}

export const CodePage: React.FC<CodePageProps> = ({ mode = 'code' }) => {
	const [masters, setMasters] = useState<CodeMa[]>([])
	const [details, setDetails] = useState<CodeDt[]>([])

	const [selectedCodeId, setSelectedCodeId] = useState<string>('')

	const [masterUseYnFilter] = useState<string>('')
	const [detailUseYnFilter] = useState<string>('')

	const [masterForm, setMasterForm] = useState<CodeMa>({
		cdId: '',
		cdNm: '',
		cdCn: '',
		useYn: 'Y'
	})
	const [detailForm, setDetailForm] = useState<CodeDt>({
		cdId: '',
		code: '',
		cdDtlNm: '',
		cdDtlCn: '',
		seq: null,
		useYn: 'Y',
		etc1: '',
		codeEtc2: '',
		codeEtc3: '',
		atchFileMngNo: ''
	})

	const [masterFormPopupOpen, setMasterFormPopupOpen] = useState(false)
	const [masterFormPopupMode, setMasterFormPopupMode] = useState<'new' | 'edit'>('new')
	const [detailFormPopupOpen, setDetailFormPopupOpen] = useState(false)
	const [detailFormPopupMode, setDetailFormPopupMode] = useState<'new' | 'edit'>('new')

	const [loading, setLoading] = useState<boolean>(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const backendBaseUrl = API_BASE_URL
	const isMenuMode = mode === 'menu'
	const pageTitle = isMenuMode ? '메뉴 관리' : '코드 관리'
	const masterTitle = isMenuMode ? '메뉴 구분' : '마스터 코드'
	const detailTitle = isMenuMode ? '메뉴 목록' : '상세 코드'
	const masterNewLabel = isMenuMode ? '메뉴 구분 신규' : '마스터 신규'
	const detailNewLabel = isMenuMode ? '메뉴 신규' : '상세 신규'
	const masterEmptyMessage = isMenuMode ? '메뉴 구분 데이터가 없습니다.' : '데이터가 없습니다.'
	const detailEmptyMessage = isMenuMode ? '메뉴 데이터가 없습니다.' : '데이터가 없습니다.'
	const masterNameLabel = isMenuMode ? '메뉴 구분명' : '코드명'
	const detailNameLabel = isMenuMode ? '메뉴명' : '코드명'
	const detailDescriptionLabel = isMenuMode || selectedCodeId === 'COM001' || selectedCodeId === 'COM002' ? '메뉴 URL' : '설명'

	const filterMastersByMode = (rows: CodeMa[]) =>
		rows.filter((row) => (isMenuMode ? MENU_CODE_IDS.has(row.cdId) : !MENU_CODE_IDS.has(row.cdId)))

	const fetchMasters = async () => {
		setError(null)
		try {
			const params = masterUseYnFilter ? `?useYn=${encodeURIComponent(masterUseYnFilter)}` : ''
			const response = await fetch(`${backendBaseUrl}/api/admin/codes/master${params}`, {
				credentials: 'include'
			})
			const result: ApiResponse<CodeMa[]> = await response.json()
			if (!result.success) {
				setError(result.message || '공통코드 마스터 목록 조회에 실패했습니다.')
				return
			}
			const filteredMasters = filterMastersByMode(result.data || [])
			setMasters(filteredMasters)
			if (selectedCodeId && !filteredMasters.some((item) => item.cdId === selectedCodeId)) {
				setSelectedCodeId('')
				setDetails([])
			}
		} catch (e) {
			setError('공통코드 마스터 목록 조회 중 오류가 발생했습니다.')
		}
	}

	const fetchDetails = async (cdId: string) => {
		if (!cdId) {
			setDetails([])
			return
		}
		setError(null)
		try {
			const query: string[] = [`cdId=${encodeURIComponent(cdId)}`]
			if (detailUseYnFilter) {
				query.push(`useYn=${encodeURIComponent(detailUseYnFilter)}`)
			}
			const qs = query.length ? `?${query.join('&')}` : ''
			const response = await fetch(`${backendBaseUrl}/api/admin/codes/detail${qs}`, {
				credentials: 'include'
			})
			const result: ApiResponse<CodeDt[]> = await response.json()
			if (!result.success) {
				setError(result.message || '공통코드 상세 목록 조회에 실패했습니다.')
				return
			}
			setDetails(result.data || [])
		} catch (e) {
			setError('공통코드 상세 목록 조회 중 오류가 발생했습니다.')
		}
	}

	useEffect(() => {
		fetchMasters()
	}, [masterUseYnFilter, mode])

	useEffect(() => {
		if (selectedCodeId) {
			fetchDetails(selectedCodeId)
		}
	}, [selectedCodeId, detailUseYnFilter])

	const handleSelectMaster = (item: CodeMa) => {
		setSelectedCodeId(item.cdId)
		setDetailForm({
			cdId: item.cdId,
			code: '',
			cdDtlNm: '',
			cdDtlCn: '',
			seq: null,
			useYn: 'Y',
			etc1: '',
			codeEtc2: '',
			codeEtc3: '',
			atchFileMngNo: ''
		})
	}

	const openNewMasterPopup = () => {
		setMasterForm({
			cdId: '',
			cdNm: '',
			cdCn: '',
			useYn: 'Y'
		})
		setMasterFormPopupMode('new')
		setMasterFormPopupOpen(true)
	}
	const openEditMasterPopup = (m: CodeMa) => {
		setMasterForm({ ...m })
		setMasterFormPopupMode('edit')
		setMasterFormPopupOpen(true)
	}
	const closeMasterPopup = () => {
		setMasterFormPopupOpen(false)
		setError(null)
	}

	const openNewDetailPopup = () => {
		if (!selectedCodeId) {
			setError('먼저 마스터 코드를 선택하세요.')
			return
		}
		setDetailForm({
			cdId: selectedCodeId,
			code: '',
			cdDtlNm: '',
			cdDtlCn: '',
			seq: null,
			useYn: 'Y',
			etc1: '',
			codeEtc2: '',
			codeEtc3: '',
			atchFileMngNo: ''
		})
		setDetailFormPopupMode('new')
		setDetailFormPopupOpen(true)
	}
	const openEditDetailPopup = (d: CodeDt) => {
		setDetailForm({ ...d })
		setDetailFormPopupMode('edit')
		setDetailFormPopupOpen(true)
	}
	const closeDetailPopup = () => {
		setDetailFormPopupOpen(false)
		setError(null)
	}

	const handleSaveMaster = async () => {
		if (!masterForm.cdId || !masterForm.cdNm) {
			setError('코드ID와 코드명은 필수입니다.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const isNew = masterFormPopupMode === 'new'
			const url = isNew
				? `${backendBaseUrl}/api/admin/codes/master`
				: `${backendBaseUrl}/api/admin/codes/master/${encodeURIComponent(masterForm.cdId)}`
			const method = isNew ? 'POST' : 'PUT'
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(masterForm),
				credentials: 'include'
			})
			const result: ApiResponse<null> = await response.json()
			if (!result.success) {
				setError(result.message || '공통코드 마스터 저장에 실패했습니다.')
				return
			}
			setMessage(result.message || '공통코드 마스터가 저장되었습니다.')
			closeMasterPopup()
			await fetchMasters()
			if (isNew) {
				setSelectedCodeId(masterForm.cdId)
				fetchDetails(masterForm.cdId)
			}
		} catch (e) {
			setError('공통코드 마스터 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteMaster = async () => {
		if (!masterForm.cdId) {
			setError('삭제할 마스터 코드를 선택하세요.')
			return
		}
		if (!window.confirm(`공통코드 마스터 "${masterForm.cdId}"를 삭제하시겠습니까?`)) {
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const response = await fetch(
				`${backendBaseUrl}/api/admin/codes/master/${encodeURIComponent(masterForm.cdId)}`,
				{
					method: 'DELETE',
					credentials: 'include'
				}
			)
			const result: ApiResponse<null> = await response.json()
			if (!result.success) {
				setError(result.message || '공통코드 마스터 삭제에 실패했습니다.')
				return
			}
			setMessage(result.message || '공통코드 마스터가 삭제되었습니다.')
			if (selectedCodeId === masterForm.cdId) {
				setSelectedCodeId('')
				setDetails([])
			}
			closeMasterPopup()
			await fetchMasters()
		} catch (e) {
			setError('공통코드 마스터 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteMasterRow = async (cdId: string) => {
		if (!window.confirm(`공통코드 마스터 "${cdId}"를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const response = await fetch(
				`${backendBaseUrl}/api/admin/codes/master/${encodeURIComponent(cdId)}`,
				{ method: 'DELETE', credentials: 'include' }
			)
			const result: ApiResponse<null> = await response.json()
			if (!result.success) {
				setError(result.message || '공통코드 마스터 삭제에 실패했습니다.')
				return
			}
			setMessage(result.message || '공통코드 마스터가 삭제되었습니다.')
			if (selectedCodeId === cdId) {
				setSelectedCodeId('')
				setDetails([])
			}
			await fetchMasters()
		} catch (e) {
			setError('공통코드 마스터 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleSaveDetail = async () => {
		if (!detailForm.cdId || !detailForm.code || !detailForm.cdDtlNm) {
			setError('상세 코드ID, 코드, 코드명은 필수입니다.')
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const isNew = detailFormPopupMode === 'new'
			const url = isNew
				? `${backendBaseUrl}/api/admin/codes/detail`
				: `${backendBaseUrl}/api/admin/codes/detail/${encodeURIComponent(
						detailForm.cdId
					)}/${encodeURIComponent(detailForm.code)}`
			const method = isNew ? 'POST' : 'PUT'
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(detailForm),
				credentials: 'include'
			})
			const result: ApiResponse<null> = await response.json()
			if (!result.success) {
				setError(result.message || '공통코드 상세 저장에 실패했습니다.')
				return
			}
			setMessage(result.message || '공통코드 상세가 저장되었습니다.')
			closeDetailPopup()
			if (selectedCodeId) {
				await fetchDetails(selectedCodeId)
			}
		} catch (e) {
			setError('공통코드 상세 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteDetail = async () => {
		if (!detailForm.cdId || !detailForm.code) {
			setError('삭제할 상세 코드를 선택하세요.')
			return
		}
		if (!window.confirm('선택한 공통코드 상세를 삭제하시겠습니까?')) {
			return
		}
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const response = await fetch(
				`${backendBaseUrl}/api/admin/codes/detail/${encodeURIComponent(
					detailForm.cdId
				)}/${encodeURIComponent(detailForm.code)}`,
				{
					method: 'DELETE',
					credentials: 'include'
				}
			)
			const result: ApiResponse<null> = await response.json()
			if (!result.success) {
				setError(result.message || '공통코드 상세 삭제에 실패했습니다.')
				return
			}
			setMessage(result.message || '공통코드 상세가 삭제되었습니다.')
			closeDetailPopup()
			if (selectedCodeId) {
				await fetchDetails(selectedCodeId)
			}
		} catch (e) {
			setError('공통코드 상세 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteDetailRow = async (cdId: string, code: string) => {
		if (!window.confirm(`상세 코드 "${code}"를 삭제하시겠습니까?`)) return
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const response = await fetch(
				`${backendBaseUrl}/api/admin/codes/detail/${encodeURIComponent(cdId)}/${encodeURIComponent(code)}`,
				{ method: 'DELETE', credentials: 'include' }
			)
			const result: ApiResponse<null> = await response.json()
			if (!result.success) {
				setError(result.message || '공통코드 상세 삭제에 실패했습니다.')
				return
			}
			setMessage(result.message || '공통코드 상세가 삭제되었습니다.')
			if (selectedCodeId) await fetchDetails(selectedCodeId)
		} catch (e) {
			setError('공통코드 상세 삭제 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<AdminLayout title={pageTitle}>
			<CrudPageCard title={pageTitle} error={error} message={message} disableInnerPanel>
				<div className="code-layout">
						<div className="code-master">
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
								<h4 style={{ marginBottom: 0 }}>{masterTitle}</h4>
								<button type="button" className="admin-list-btn-sky" onClick={openNewMasterPopup}>{masterNewLabel}</button>
							</div>

							<table className="table code-master-list-table">
								<thead>
									<tr>
										<th>코드ID</th>
										<th>{masterNameLabel}</th>
										<th>설명</th>
										<th>사용여부</th>
										<th>관리</th>
									</tr>
								</thead>
								<tbody>
									{masters.map((m) => (
										<tr
											key={m.cdId}
											className={m.cdId === selectedCodeId ? 'active' : ''}
											onClick={() => handleSelectMaster(m)}
										>
											<td>{m.cdId}</td>
											<td>{m.cdNm}</td>
											<td>{m.cdCn}</td>
											<td>{useYnBadge(m.useYn)}</td>
											<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
												<RowActionButtons
													onEdit={() => openEditMasterPopup(m)}
													onDelete={() => handleDeleteMasterRow(m.cdId)}
													disabled={loading}
												/>
											</td>
										</tr>
									))}
									{masters.length === 0 && (
										<tr>
											<td colSpan={5} style={{ textAlign: 'center' }}>
												{masterEmptyMessage}
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>

						<div className="code-detail">
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
								<h4 style={{ marginBottom: 0 }}>{detailTitle}</h4>
								<button type="button" className="admin-list-btn-sky" onClick={openNewDetailPopup} disabled={!selectedCodeId}>
									{detailNewLabel}
								</button>
							</div>

							<table className="table">
								<thead>
									<tr>
										<th style={{ width: '80px'}}>코드</th>
										<th style={{ width: 'auto'}}>{detailNameLabel}</th>
										<th>{detailDescriptionLabel}</th>
										<th style={{ width: '60px'}}>SEQ</th>
										<th style={{ width: '80px'}}>ETC3</th>
										<th style={{ width: '80px'}}>사용여부</th>
										<th style={{ width: '120px'}}>관리</th>
									</tr>
								</thead>
								<tbody>
									{details.map((d) => (
										<tr
											key={`${d.cdId}-${d.code}`}
											className="clickable"
											onClick={() => openEditDetailPopup(d)}
										>
											<td>{d.code}</td>
											<td>{d.cdDtlNm}</td>
											<td className="code-detail-dc-cell">{truncateWithEllipsis(d.cdDtlCn)}</td>
											<td>{d.seq}</td>
											<td>{renderEtc3Cell(d.codeEtc3)}</td>
											<td>{useYnBadge(d.useYn)}</td>
											<td className="table-actions admin-list-manage-td" onClick={(e) => e.stopPropagation()}>
												<RowActionButtons
													onEdit={() => openEditDetailPopup(d)}
													onDelete={() => handleDeleteDetailRow(d.cdId, d.code)}
													disabled={loading}
												/>
											</td>
										</tr>
									))}
									{selectedCodeId && details.length === 0 && (
										<tr>
											<td colSpan={7} style={{ textAlign: 'center' }}>
												{detailEmptyMessage}
											</td>
										</tr>
									)}
									{!selectedCodeId && (
										<tr>
											<td colSpan={7} style={{ textAlign: 'center' }}>
												먼저 마스터 코드를 선택하세요.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
				</div>
			</CrudPageCard>

			<LayerPopup
				open={masterFormPopupOpen}
				title={masterFormPopupMode === 'new' ? `${masterTitle} 등록` : `${masterTitle} 상세 (수정)`}
				onClose={closeMasterPopup}
				footer={
					<>
						{masterFormPopupMode === 'edit' && (
							<button
								type="button"
								onClick={handleDeleteMaster}
								disabled={loading}
								className="admin-footer-btn-delete"
								style={{ marginRight: 'auto' }}
							>
								삭제
							</button>
						)}
						<button type="button" className="admin-list-btn-edit" onClick={handleSaveMaster} disabled={loading}>
							{masterFormPopupMode === 'new' ? '등록' : '수정'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closeMasterPopup}>닫기</button>
					</>
				}
			>
				{error && <p className="form-error">{error}</p>}
				<table className="form-table">
								<tbody>
									<tr>
										<th>코드ID</th>
										<td>
											<input
												type="text"
												value={masterForm.cdId}
												onChange={(e) => setMasterForm({ ...masterForm, cdId: e.target.value })}
												disabled={masterFormPopupMode === 'edit'}
											/>
										</td>
									</tr>
									<tr>
										<th>{masterNameLabel}</th>
										<td>
											<input
												type="text"
												value={masterForm.cdNm}
												onChange={(e) => setMasterForm({ ...masterForm, cdNm: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>설명</th>
										<td>
											<input
												type="text"
												value={masterForm.cdCn}
												onChange={(e) => setMasterForm({ ...masterForm, cdCn: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>사용여부</th>
										<td>
											{renderYnToggle(masterForm.useYn, (useYn) => setMasterForm({ ...masterForm, useYn }))}
										</td>
									</tr>
								</tbody>
							</table>
			</LayerPopup>

			<LayerPopup
				open={detailFormPopupOpen}
				title={detailFormPopupMode === 'new' ? `${detailTitle} 등록` : `${detailTitle} 상세 (수정)`}
				onClose={closeDetailPopup}
				wide
				footer={
					<>
						{detailFormPopupMode === 'edit' && detailForm.code && (
							<button
								type="button"
								onClick={handleDeleteDetail}
								disabled={loading}
								className="admin-footer-btn-delete"
								style={{ marginRight: 'auto' }}
							>
								삭제
							</button>
						)}
						<button type="button" className="admin-list-btn-edit" onClick={handleSaveDetail} disabled={loading || !detailForm.cdId}>
							{detailFormPopupMode === 'new' ? '등록' : '수정'}
						</button>
						<button type="button" className="admin-footer-btn-close" onClick={closeDetailPopup}>닫기</button>
					</>
				}
			>
							{error && <p className="form-error">{error}</p>}
							<table className="form-table">
								<tbody>
									<tr>
										<th>코드ID</th>
										<td>
											<input type="text" value={detailForm.cdId} readOnly />
										</td>
									</tr>
									<tr>
										<th>코드</th>
										<td>
											<input
												type="text"
												value={detailForm.code}
												onChange={(e) => setDetailForm({ ...detailForm, code: e.target.value })}
												disabled={detailFormPopupMode === 'edit'}
											/>
										</td>
									</tr>
									<tr>
										<th>{detailNameLabel}</th>
										<td>
											<input
												type="text"
												value={detailForm.cdDtlNm}
												onChange={(e) => setDetailForm({ ...detailForm, cdDtlNm: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>{detailDescriptionLabel}</th>
										<td>
											<input
												type="text"
												value={detailForm.cdDtlCn}
												onChange={(e) => setDetailForm({ ...detailForm, cdDtlCn: e.target.value })}
												placeholder={isMenuMode || selectedCodeId === 'COM001' || selectedCodeId === 'COM002' ? '예: /dashboard, /admins' : undefined}
											/>
										</td>
									</tr>
									<tr>
										<th>SEQ</th>
										<td>
											<input
												type="number"
												value={detailForm.seq ?? ''}
												onChange={(e) => setDetailForm({ ...detailForm, seq: e.target.value === '' ? null : Number(e.target.value) })}
											/>
										</td>
									</tr>
									<tr>
										<th>사용여부</th>
										<td>
											{renderYnToggle(detailForm.useYn, (useYn) => setDetailForm({ ...detailForm, useYn }))}
										</td>
									</tr>
									<tr>
										<th>ETC1</th>
										<td>
											<input
												type="text"
												value={detailForm.etc1}
												onChange={(e) => setDetailForm({ ...detailForm, etc1: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>ETC2</th>
										<td>
											<input
												type="text"
												value={detailForm.codeEtc2}
												onChange={(e) => setDetailForm({ ...detailForm, codeEtc2: e.target.value })}
											/>
										</td>
									</tr>
									<tr>
										<th>ETC3</th>
										<td>
											<div className="code-etc3-color-wrap">
												<input
													type="text"
													className="code-etc3-color-text"
													value={detailForm.codeEtc3}
													onChange={(e) => setDetailForm({ ...detailForm, codeEtc3: e.target.value })}
													placeholder="#RRGGBB"
												/>
												<input
													type="color"
													className="code-etc3-color-picker"
													value={toColorPickerValue(detailForm.codeEtc3)}
													onChange={(e) => setDetailForm({ ...detailForm, codeEtc3: e.target.value.toUpperCase() })}
													title="색상 선택"
													aria-label="ETC3 색상 선택"
												/>
												{normalizeHexColor(detailForm.codeEtc3) ? (
													<span
														className="code-etc3-color-preview"
														style={{ backgroundColor: normalizeHexColor(detailForm.codeEtc3) ?? undefined }}
														aria-hidden="true"
													/>
												) : null}
											</div>
										</td>
									</tr>
									<tr>
										<th>파일</th>
										<td>
											<input
												type="text"
												value={detailForm.atchFileMngNo}
												onChange={(e) => setDetailForm({ ...detailForm, atchFileMngNo: e.target.value })}
											/>
										</td>
									</tr>
								</tbody>
							</table>
			</LayerPopup>
		</AdminLayout>
	)
}

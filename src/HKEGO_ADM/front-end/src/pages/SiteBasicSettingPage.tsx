import React, { useEffect, useRef, useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { API_BASE_URL, resolveBackendUrl } from '../config'

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type UploadInfo = {
	fiId?: string
	fileUrl?: string
	fileOriginName?: string
}

type SiteBasicSettingDto = {
	stngId?: string
	siteTtl: string
	hmpgAddr: string
	mngrEmlAddr: string
	ednstNm: string
	ednstAddr: string
	ednstTelno: string
	logoFileId: string
	faviconFileId: string
	ftrCn: string
	rgtr?: string
	mdtr?: string
}

type SessionInfo = {
	valid: boolean
	adminId: string
	adminName: string
}

const BACKEND = API_BASE_URL

const defaultForm: SiteBasicSettingDto = {
	siteTtl: '',
	hmpgAddr: '',
	mngrEmlAddr: '',
	ednstNm: '',
	ednstAddr: '',
	ednstTelno: '',
	logoFileId: '',
	faviconFileId: '',
	ftrCn: ''
}

function trimForm(form: SiteBasicSettingDto): SiteBasicSettingDto {
	return {
		...form,
		siteTtl: form.siteTtl.trim(),
		hmpgAddr: form.hmpgAddr.trim(),
		mngrEmlAddr: form.mngrEmlAddr.trim(),
		ednstNm: form.ednstNm.trim(),
		ednstAddr: form.ednstAddr.trim(),
		ednstTelno: form.ednstTelno.trim(),
		logoFileId: form.logoFileId.trim(),
		faviconFileId: form.faviconFileId.trim(),
		ftrCn: form.ftrCn.trim()
	}
}

export const SiteBasicSettingPage: React.FC = () => {
	const [form, setForm] = useState<SiteBasicSettingDto>(defaultForm)
	const [initialForm, setInitialForm] = useState<SiteBasicSettingDto>(defaultForm)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [logoFile, setLogoFile] = useState<File | null>(null)
	const [faviconFile, setFaviconFile] = useState<File | null>(null)
	const [logoPreviewUrl, setLogoPreviewUrl] = useState('')
	const [faviconPreviewUrl, setFaviconPreviewUrl] = useState('')
	const [logoDisplayName, setLogoDisplayName] = useState('')
	const [faviconDisplayName, setFaviconDisplayName] = useState('')
	const logoInputRef = useRef<HTMLInputElement>(null)
	const faviconInputRef = useRef<HTMLInputElement>(null)
	const logoObjectUrlRef = useRef<string | null>(null)
	const faviconObjectUrlRef = useRef<string | null>(null)
	const sessionAdminIdRef = useRef('')

	useEffect(() => {
		if (!message) return
		const timer = window.setTimeout(() => setMessage(null), 3000)
		return () => window.clearTimeout(timer)
	}, [message])

	useEffect(() => {
		let cancelled = false
		void fetch(`${BACKEND}/api/admin/auth/session`, { credentials: 'include' })
			.then((r) => r.json())
			.then((j: ApiResponse<SessionInfo>) => {
				if (!cancelled && j.success && j.data?.valid) {
					sessionAdminIdRef.current = j.data.adminId || ''
				}
			})
			.catch(() => {
				// ignore
			})
		return () => {
			cancelled = true
		}
	}, [])

	useEffect(() => {
		void fetchSetting()
		return () => {
			revokeLogoObjectUrl()
			revokeFaviconObjectUrl()
		}
	}, [])

	const revokeLogoObjectUrl = () => {
		if (logoObjectUrlRef.current) {
			URL.revokeObjectURL(logoObjectUrlRef.current)
			logoObjectUrlRef.current = null
		}
	}

	const revokeFaviconObjectUrl = () => {
		if (faviconObjectUrlRef.current) {
			URL.revokeObjectURL(faviconObjectUrlRef.current)
			faviconObjectUrlRef.current = null
		}
	}

	const loadFileInfo = async (fiId: string, type: 'logo' | 'favicon') => {
		const id = fiId.trim()
		if (!id) return
		try {
			const res = await fetch(`${BACKEND}/api/admin/upload/info/${encodeURIComponent(id)}`, { credentials: 'include' })
			const result: ApiResponse<UploadInfo> = await res.json()
			if (!result.success || !result.data) return
			const fileUrl = resolveBackendUrl(result.data.fileUrl || '')
			if (type === 'logo') {
				setLogoPreviewUrl(fileUrl)
				setLogoDisplayName(result.data.fileOriginName || id)
			} else {
				setFaviconPreviewUrl(fileUrl)
				setFaviconDisplayName(result.data.fileOriginName || id)
			}
		} catch {
			// ignore
		}
	}

	const fetchSetting = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`${BACKEND}/api/admin/site-basic-setting`, { credentials: 'include' })
			const result: ApiResponse<SiteBasicSettingDto> = await res.json()
			if (!result.success) {
				setError(result.message || '기본설정 조회에 실패했습니다.')
				return
			}
			const next = { ...defaultForm, ...(result.data || {}) }
			setForm(next)
			setInitialForm(next)
			setLogoFile(null)
			setFaviconFile(null)
			setLogoPreviewUrl('')
			setFaviconPreviewUrl('')
			setLogoDisplayName('')
			setFaviconDisplayName('')
			if (next.logoFileId) void loadFileInfo(next.logoFileId, 'logo')
			if (next.faviconFileId) void loadFileInfo(next.faviconFileId, 'favicon')
		} catch {
			setError('기본설정 조회 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleLogoSelected = (file: File | null) => {
		revokeLogoObjectUrl()
		setLogoFile(file)
		if (!file) {
			setLogoPreviewUrl('')
			setLogoDisplayName('')
			return
		}
		const url = URL.createObjectURL(file)
		logoObjectUrlRef.current = url
		setLogoPreviewUrl(url)
		setLogoDisplayName(file.name)
	}

	const handleFaviconSelected = (file: File | null) => {
		revokeFaviconObjectUrl()
		setFaviconFile(file)
		if (!file) {
			setFaviconPreviewUrl('')
			setFaviconDisplayName('')
			return
		}
		if (file.name.toLowerCase().endsWith('.ico')) {
			setFaviconPreviewUrl('')
		} else {
			const url = URL.createObjectURL(file)
			faviconObjectUrlRef.current = url
			setFaviconPreviewUrl(url)
		}
		setFaviconDisplayName(file.name)
	}

	const clearLogo = () => {
		revokeLogoObjectUrl()
		setLogoFile(null)
		setLogoPreviewUrl('')
		setLogoDisplayName('')
		setForm((prev) => ({ ...prev, logoFileId: '' }))
		if (logoInputRef.current) logoInputRef.current.value = ''
	}

	const clearFavicon = () => {
		revokeFaviconObjectUrl()
		setFaviconFile(null)
		setFaviconPreviewUrl('')
		setFaviconDisplayName('')
		setForm((prev) => ({ ...prev, faviconFileId: '' }))
		if (faviconInputRef.current) faviconInputRef.current.value = ''
	}

	const uploadLogo = async (existingFiId: string) => {
		if (!logoFile) return existingFiId
		const fd = new FormData()
		fd.append('file', logoFile)
		fd.append('menuType', 'site_setting')
		if (existingFiId) fd.append('fiId', existingFiId)
		const res = await fetch(`${BACKEND}/api/admin/upload/file-info-image`, {
			method: 'POST',
			body: fd,
			credentials: 'include'
		})
		const result: ApiResponse<UploadInfo> = await res.json()
		if (!result.success || !result.data?.fiId) {
			throw new Error(result.message || '로고 업로드에 실패했습니다.')
		}
		return result.data.fiId
	}

	const uploadFavicon = async (existingFiId: string) => {
		if (!faviconFile) return existingFiId
		const fd = new FormData()
		fd.append('file', faviconFile)
		fd.append('menuType', 'site_setting')
		if (existingFiId) fd.append('fiId', existingFiId)
		const res = await fetch(`${BACKEND}/api/admin/upload/file-info-attach`, {
			method: 'POST',
			body: fd,
			credentials: 'include'
		})
		const result: ApiResponse<UploadInfo> = await res.json()
		if (!result.success || !result.data?.fiId) {
			throw new Error(result.message || '파비콘 업로드에 실패했습니다.')
		}
		return result.data.fiId
	}

	const validate = (payload: SiteBasicSettingDto) => {
		if (!payload.siteTtl) return '사이트 타이틀을 입력하세요.'
		if (!payload.hmpgAddr) return '사이트 URL을 입력하세요.'
		if (!payload.mngrEmlAddr) return '관리자 이메일을 입력하세요.'
		return ''
	}

	const handleSave = async () => {
		setLoading(true)
		setError(null)
		setMessage(null)
		try {
			const trimmed = trimForm(form)
			const validationMessage = validate(trimmed)
			if (validationMessage) {
				setError(validationMessage)
				return
			}
			const logoFileId = await uploadLogo(trimmed.logoFileId)
			const faviconFileId = await uploadFavicon(trimmed.faviconFileId)
			const adminId = sessionAdminIdRef.current
			const payload = {
				...trimmed,
				logoFileId,
				faviconFileId,
				rgtr: adminId,
				mdtr: adminId
			}
			const res = await fetch(`${BACKEND}/api/admin/site-basic-setting`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
				credentials: 'include'
			})
			const result: ApiResponse<SiteBasicSettingDto> = await res.json()
			if (!result.success) {
				setError(result.message || '기본설정 저장에 실패했습니다.')
				return
			}
			const next = { ...defaultForm, ...(result.data || payload) }
			setForm(next)
			setInitialForm(next)
			setLogoFile(null)
			setFaviconFile(null)
			setMessage('기본설정이 저장되었습니다.')
			if (next.logoFileId) void loadFileInfo(next.logoFileId, 'logo')
			if (next.faviconFileId) void loadFileInfo(next.faviconFileId, 'favicon')
		} catch (e) {
			setError(e instanceof Error ? e.message : '기본설정 저장 중 오류가 발생했습니다.')
		} finally {
			setLoading(false)
		}
	}

	const handleCancel = () => {
		setForm(initialForm)
		setError(null)
		setMessage(null)
		setLogoFile(null)
		setFaviconFile(null)
		setLogoPreviewUrl('')
		setFaviconPreviewUrl('')
		setLogoDisplayName('')
		setFaviconDisplayName('')
		if (initialForm.logoFileId) void loadFileInfo(initialForm.logoFileId, 'logo')
		if (initialForm.faviconFileId) void loadFileInfo(initialForm.faviconFileId, 'favicon')
	}

	const renderFileBox = (
		type: 'logo' | 'favicon',
		label: string,
		accept: string,
		previewUrl: string,
		displayName: string,
		fileId: string
	) => {
		const inputRef = type === 'logo' ? logoInputRef : faviconInputRef
		const clear = type === 'logo' ? clearLogo : clearFavicon
		const select = type === 'logo' ? handleLogoSelected : handleFaviconSelected
		return (
			<div className="site-setting-file-wrap">
				<input
					ref={inputRef}
					type="file"
					accept={accept}
					className="bbs-post-attach-input-hidden"
					onChange={(e) => {
						const file = e.target.files?.[0] ?? null
						e.target.value = ''
						select(file)
					}}
				/>
				<div className="bbs-post-attach-actions">
					<button type="button" className="admin-list-btn-sky" onClick={() => inputRef.current?.click()} disabled={loading}>
						파일 선택
					</button>
					{(displayName || fileId) && (
						<button type="button" className="admin-footer-btn-delete" onClick={clear} disabled={loading}>
							제거
						</button>
					)}
				</div>
				<div className="site-setting-file-preview">
					{previewUrl ? (
						<img src={previewUrl} alt={`${label} 미리보기`} />
					) : (
						<span>{type === 'favicon' ? 'ICO/PNG' : 'LOGO'}</span>
					)}
				</div>
				<p className="site-setting-file-name">{displayName || fileId || '선택된 파일 없음'}</p>
			</div>
		)
	}

	return (
		<AdminLayout title="기본설정">
			<CrudPageCard title="기본설정" error={error} message={message} disableInnerPanel>
				<table className="table form-table site-setting-table">
					<tbody>
						<tr>
							<th>사이트 타이틀 <span className="required">*</span></th>
							<td>
								<input value={form.siteTtl} onChange={(e) => setForm({ ...form, siteTtl: e.target.value })} />
							</td>
						</tr>
						<tr>
							<th>사이트 URL <span className="required">*</span></th>
							<td>
								<input value={form.hmpgAddr} onChange={(e) => setForm({ ...form, hmpgAddr: e.target.value })} />
							</td>
						</tr>
						<tr>
							<th>관리자 이메일 <span className="required">*</span></th>
							<td>
								<input value={form.mngrEmlAddr} onChange={(e) => setForm({ ...form, mngrEmlAddr: e.target.value })} />
							</td>
						</tr>
						<tr>
							<th>교육관명</th>
							<td>
								<input value={form.ednstNm} onChange={(e) => setForm({ ...form, ednstNm: e.target.value })} />
							</td>
						</tr>
						<tr>
							<th>교육관 주소</th>
							<td>
								<input value={form.ednstAddr} onChange={(e) => setForm({ ...form, ednstAddr: e.target.value })} />
							</td>
						</tr>
						<tr>
							<th>교육관 연락처</th>
							<td>
								<input value={form.ednstTelno} onChange={(e) => setForm({ ...form, ednstTelno: e.target.value })} />
							</td>
						</tr>
						<tr>
							<th>로고</th>
							<td>{renderFileBox('logo', '로고', 'image/png,image/jpeg,image/gif,image/webp', logoPreviewUrl, logoDisplayName, form.logoFileId)}</td>
						</tr>
						<tr>
							<th>파비콘</th>
							<td>{renderFileBox('favicon', '파비콘', '.ico,image/png', faviconPreviewUrl, faviconDisplayName, form.faviconFileId)}</td>
						</tr>
						<tr>
							<th>푸터 텍스트</th>
							<td>
								<textarea
									value={form.ftrCn}
									onChange={(e) => setForm({ ...form, ftrCn: e.target.value })}
									rows={5}
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<div className="site-setting-actions">
					<button type="button" className="admin-list-btn-edit" onClick={handleSave} disabled={loading}>
						저장
					</button>
					<button type="button" className="admin-footer-btn-close" onClick={handleCancel} disabled={loading}>
						취소
					</button>
				</div>
			</CrudPageCard>
		</AdminLayout>
	)
}

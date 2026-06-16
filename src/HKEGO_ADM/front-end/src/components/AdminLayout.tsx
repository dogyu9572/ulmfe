import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { codeDetailId } from '../utils/codeDetail'

type AdminLayoutProps = {
	title?: string
	children: React.ReactNode
}

type CodeDetail = {
	cdId: string
	cdDtlId: string
	/** @deprecated API 호환 — cdDtlId 사용 */
	code?: string
	cdDtlNm: string
	cdDtlCn: string
	seq: number | null
	useYn: string
	etc1: string
	etc2: string
	etc3: string
	atchFileMngNo: string
}

type ApiResponse<T> = {
	success: boolean
	message: string
	data: T
}

type MenuChild = {
	id: string
	label: string
	path: string
}

type MenuGroup = {
	id: string
	label: string
	path?: string
	children: MenuChild[]
}

type SessionInfo = {
	valid: boolean
	adminId: string
	adminName: string
	adminRole: string
	adminRoleName: string
	canManageAdmin: boolean
	superAdmin: boolean
	allowedMenuPaths: string[]
	remainingSeconds: number
}

type MenuIconName =
	| 'dashboard'
	| 'admin'
	| 'auth'
	| 'code'
	| 'html'
	| 'product'
	| 'support'
	| 'solution'
	| 'dealer'
	| 'mail'
	| 'home'
	| 'board'
	| 'popup'
	| 'banner'
	| 'site'
	| 'stats'
	| 'log'
	| 'settings'
	| 'calendar'
	| 'folder'

const NO_MENU_PATH = '#'
const SESSION_CACHE_KEY = 'hkego-admin-session-cache-v2'
const MENU_CACHE_KEY = 'hkego-admin-menu-cache-v2'

function readCache<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') {
		return fallback
	}
	try {
		const raw = window.sessionStorage.getItem(key)
		return raw ? (JSON.parse(raw) as T) : fallback
	} catch {
		return fallback
	}
}

function writeCache<T>(key: string, value: T) {
	if (typeof window === 'undefined') {
		return
	}
	try {
		window.sessionStorage.setItem(key, JSON.stringify(value))
	} catch {
		// ignore cache write errors
	}
}

function toAdminPath(path: string): string {
	const raw = (path || '').trim()
	if (!raw) return '/admin/dashboard'
	if (raw.startsWith('/admin/')) return raw
	if (raw === '/admin') return '/admin/dashboard'
	if (raw.startsWith('/')) return `/admin${raw}`
	return `/admin/${raw}`
}

function formatRemaining(seconds: number): string {
	if (seconds <= 0) return '0:00'
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${s.toString().padStart(2, '0')}`
}

/** 서브메뉴에 쓰던 경로·라벨 규칙 — 대메뉴 아이콘에만 사용 */
function resolveMenuIconByPathAndLabel(path: string, label: string): MenuIconName {
	const p = toAdminPath(path).toLowerCase()
	const l = label.toLowerCase()
	if (p === '/admin/dashboard' || l.includes('대시보드')) return 'dashboard'
	if (l.includes('회원관리')) return 'admin'
	if (l.includes('html관리') || l.includes('html 관리')) return 'html'
	if (l.includes('상품관리') || l.includes('상품 관리') || p.includes('/product')) return 'product'
	if (l.includes('교육') || l.includes('행사')) return 'calendar'
	if (l.includes('고객지원') || l.includes('faq') || l.includes('qna') || p.includes('/visit-inquiry')) return 'support'
	if (l.includes('솔루션')) return 'solution'
	if (l.includes('대리점')) return 'dealer'
	if (l.includes('메일관리') || l.includes('메일발송') || p.includes('/mailing')) return 'mail'
	if (l.includes('홈페이지관리') || l.includes('홈페이지 관리')) return 'home'
	if (p.includes('/admins') || l.includes('관리자')) return 'admin'
	if (p.includes('admin-groups') || p.includes('auth-group') || l.includes('권한')) return 'auth'
	if (p.includes('/codes') || l.includes('코드')) return 'code'
	if (p.includes('bbs') || l.includes('게시')) return 'board'
	if (p.includes('popup') || l.includes('팝업')) return 'popup'
	if (p.includes('banner') || l.includes('배너')) return 'banner'
	if (p.includes('site-designs') || l.includes('사용자 디자인') || l.includes('디자인')) return 'site'
	if (p.includes('site-meta') || l.includes('사이트') || l.includes('메타')) return 'site'
	if (p.includes('hybrid-app') || l.includes('하이브리드') || l.includes('키스토어')) return 'settings'
	if (p.includes('/content') || l.includes('html') || l.includes('컨텐츠') || l.includes('콘텐츠')) return 'site'
	if (p.includes('/educate') || l.includes('교육')) return 'calendar'
	if (p.includes('schedule') || l.includes('일정')) return 'calendar'
	if (p.includes('log') || l.includes('로그')) return 'log'
	if (p.includes('stat') || l.includes('통계')) return 'stats'
	if (l.includes('시스템관리') || l.includes('시스템 관리')) return 'settings'
	return 'folder'
}

function getGroupMenuIcon(group: MenuGroup): MenuIconName {
	let icon = resolveMenuIconByPathAndLabel(group.path ?? '', group.label)
	if (icon !== 'folder') return icon
	for (const c of group.children) {
		icon = resolveMenuIconByPathAndLabel(c.path, c.label)
		if (icon !== 'folder') return icon
	}
	return 'folder'
}

const SIDEBAR_SKELETON_ROWS = 8

function SidebarMenuSkeleton() {
	return (
		<li className="sidebar-menu-skeleton" aria-hidden="true">
			{Array.from({ length: SIDEBAR_SKELETON_ROWS }, (_, i) => (
				<div key={i} className="sidebar-menu-skeleton__row">
					<span className="sidebar-menu-skeleton__icon skeleton-shimmer" />
					<span
						className="sidebar-menu-skeleton__bar skeleton-shimmer"
						style={{ maxWidth: `${58 + (i % 3) * 14}%` }}
					/>
				</div>
			))}
		</li>
	)
}

function renderLineIcon(
	iconName: MenuIconName,
	opts?: { size?: number; className?: string }
): React.ReactNode {
	const size = opts?.size ?? 24
	const iconStyle: React.CSSProperties = {
		width: size,
		height: size,
		marginRight: size <= 20 ? 8 : 6,
		flexShrink: 0,
		verticalAlign: 'middle'
	}
	const common = {
		className: opts?.className,
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 1,
		strokeLinecap: 'round' as const,
		strokeLinejoin: 'round' as const,
		style: iconStyle,
		'aria-hidden': true as const
	}
	switch (iconName) {
		case 'settings':
			return (
				<svg {...common}>
					<path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.7 1.7 0 1 1-3.4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H7a1.7 1.7 0 1 1 0-3.4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .5-.9V7a1.7 1.7 0 1 1 3.4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.5h.1a1.7 1.7 0 1 1 0 3.4h-.1a1 1 0 0 0-.9.6z" />
				</svg>
			)
		case 'calendar':
			return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></svg>
		case 'dashboard':
			return <svg {...common}><path d="M4 14a8 8 0 1 1 16 0" /><path d="M12 14l4-4" /><circle cx="12" cy="14" r="1.2" /></svg>
		case 'admin':
			return <svg {...common}><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>
		case 'auth':
			return <svg {...common}><path d="M6 11V8a6 6 0 0 1 12 0v3" /><rect x="5" y="11" width="14" height="10" rx="2" /></svg>
		case 'code':
			return <svg {...common}><path d="M8 9l-4 3 4 3M16 9l4 3-4 3" /></svg>
		case 'html':
			return <svg {...common}><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v5h5M9 12l-2 2 2 2M13 12l2 2-2 2" /></svg>
		case 'product':
			return <svg {...common}><path d="M3 8l9-5 9 5-9 5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
		case 'support':
			return <svg {...common}><path d="M4 12a8 8 0 0 1 16 0" /><rect x="3" y="12" width="4" height="6" rx="1" /><rect x="17" y="12" width="4" height="6" rx="1" /><path d="M8 20h8" /></svg>
		case 'solution':
			return <svg {...common}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /><path d="M7 10h10" /></svg>
		case 'dealer':
			return <svg {...common}><path d="M3 10h18" /><path d="M5 10V6h14v4M6 10v8h4v-5h4v5h4v-8" /><path d="M4 6l1-3h14l1 3" /></svg>
		case 'mail':
			return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 8l9 6 9-6" /></svg>
		case 'home':
			return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a12 12 0 0 1 0 18M12 3a12 12 0 0 0 0 18" /></svg>
		case 'board':
			return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h10M7 17h6" /></svg>
		case 'popup':
			return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18" /></svg>
		case 'banner':
			return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 15l5-4 4 3 3-2 6 5" /></svg>
		case 'site':
			return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a12 12 0 0 1 0 18M12 3a12 12 0 0 0 0 18" /></svg>
		case 'stats':
			return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20v-3" /></svg>
		case 'log':
			return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></svg>
		default:
			return <svg {...common}><path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
	}
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, children }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const cachedSession = readCache<SessionInfo | null>(SESSION_CACHE_KEY, null)
	const cachedMenus = readCache<MenuGroup[]>(MENU_CACHE_KEY, [])
	const [menuGroups, setMenuGroups] = useState<MenuGroup[]>(cachedMenus)
	const [menuLoading, setMenuLoading] = useState(cachedMenus.length === 0)
	const [menuError, setMenuError] = useState<string | null>(null)
	const menuGroupsRef = useRef(menuGroups)
	const [openGroupIds, setOpenGroupIds] = useState<string[]>([])
	const [sessionRemaining, setSessionRemaining] = useState<number | null>(
		cachedSession?.valid ? cachedSession.remainingSeconds : null
	)
	const [sessionReady, setSessionReady] = useState(Boolean(cachedSession?.valid))
	const [adminName, setAdminName] = useState<string>(cachedSession?.adminName ?? '')
	const [adminRole, setAdminRole] = useState<string>(cachedSession?.adminRole ?? '')
	const [adminRoleName, setAdminRoleName] = useState<string>(cachedSession?.adminRoleName ?? '')
	const [canManageAdmin, setCanManageAdmin] = useState(Boolean(cachedSession?.canManageAdmin))
	const [allowedMenuPaths, setAllowedMenuPaths] = useState<string[]>(
		Array.isArray(cachedSession?.allowedMenuPaths) ? cachedSession.allowedMenuPaths : []
	)
	const [mobileNavOpen, setMobileNavOpen] = useState(false)
	const [logoutLoading, setLogoutLoading] = useState(false)
	const logoutInFlightRef = useRef(false)

	menuGroupsRef.current = menuGroups

	const backendBaseUrl = API_BASE_URL

	const MOBILE_SIDEBAR_BP = 960

	const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])
	const toggleMobileNav = useCallback(() => setMobileNavOpen((v) => !v), [])

	const handleLogout = useCallback(async () => {
		if (logoutInFlightRef.current) return
		logoutInFlightRef.current = true
		setLogoutLoading(true)
		try {
			await fetch(`${backendBaseUrl}/api/admin/auth/logout`, {
				method: 'POST',
				credentials: 'include'
			})
		} catch {
			// 네트워크 오류여도 로그인 화면으로 이동
		} finally {
			setLogoutLoading(false)
			logoutInFlightRef.current = false
			writeCache(SESSION_CACHE_KEY, null)
			writeCache(MENU_CACHE_KEY, [])
			navigate('/admin/login', { replace: true })
		}
	}, [backendBaseUrl, navigate])

	const fetchSession = useCallback(async () => {
		try {
			const res = await fetch(`${backendBaseUrl}/api/admin/auth/session`, { credentials: 'include' })
			const json: ApiResponse<SessionInfo> = await res.json()
			if (!json.success || !json.data) {
				setSessionRemaining(0)
				return
			}
			const data = json.data
			setAdminName(data.adminName ?? '')
			setAdminRole(data.adminRole ?? '')
			setAdminRoleName(data.adminRoleName ?? '')
			setCanManageAdmin(Boolean(data.canManageAdmin))
			setAllowedMenuPaths(Array.isArray(data.allowedMenuPaths) ? data.allowedMenuPaths : [])
			setSessionRemaining(data.valid ? data.remainingSeconds : 0)
			setSessionReady(data.valid)
			writeCache(SESSION_CACHE_KEY, data)
			if (!data.valid) {
				writeCache(MENU_CACHE_KEY, [])
				navigate('/admin/login', { replace: true })
			}
		} catch {
			setSessionRemaining(0)
			setSessionReady(false)
			setAdminRole('')
			setAdminRoleName('')
			setCanManageAdmin(false)
			setAllowedMenuPaths([])
			writeCache(SESSION_CACHE_KEY, null)
			writeCache(MENU_CACHE_KEY, [])
			navigate('/admin/login', { replace: true })
		}
	}, [navigate])

	const isRestrictedMenuPath = (path: string): boolean =>
		path.startsWith('/admin/admins') || path.startsWith('/admin/admin-groups')

	const isMenuPathAllowed = useCallback((menuPath: string) => {
		if (menuPath === NO_MENU_PATH) {
			return true
		}
		if (menuPath === '/admin/dashboard' || menuPath === '/admin/forbidden') {
			return true
		}
		return allowedMenuPaths.some((allowedPath) => {
			if (menuPath === allowedPath || menuPath.startsWith(`${allowedPath}/`)) {
				return true
			}
			if (allowedPath.startsWith('/admin/bbs-post/') && menuPath.startsWith('/admin/bbs-post/')) {
				return true
			}
			return false
		})
	}, [allowedMenuPaths])

	const isPathAllowed = useCallback((pathname: string) => {
		if (pathname === '/admin/dashboard' || pathname === '/admin/forbidden') {
			return true
		}
		if (!allowedMenuPaths || allowedMenuPaths.length === 0) {
			return false
		}
		return allowedMenuPaths.some((allowedPath) => {
			if (pathname === allowedPath || pathname.startsWith(`${allowedPath}/`)) {
				return true
			}
			if (allowedPath.startsWith('/admin/bbs-post/') && pathname.startsWith('/admin/bbs-post/')) {
				return true
			}
			return false
		})
	}, [allowedMenuPaths])

	useEffect(() => {
		fetchSession()
	}, [fetchSession])

	useEffect(() => {
		if (sessionRemaining !== null && sessionRemaining <= 0) {
			navigate('/admin/login', { replace: true })
		}
	}, [sessionRemaining, navigate])

	const sessionTimerActive = sessionRemaining !== null && sessionRemaining > 0

	useEffect(() => {
		if (!sessionTimerActive) return
		const tick = setInterval(() => {
			setSessionRemaining((prev) => {
				if (prev == null || prev <= 1) return 0
				return prev - 1
			})
		}, 1000)
		return () => clearInterval(tick)
	}, [sessionTimerActive, navigate])

	useEffect(() => {
		if (sessionRemaining === null || sessionRemaining <= 0) {
			return
		}
		if (!isPathAllowed(location.pathname)) {
			navigate('/admin/forbidden', { replace: true })
		}
	}, [isPathAllowed, location.pathname, navigate, sessionRemaining])

	const resolveMenuPath = (item: CodeDetail): string => {
		// CODE_DC 에 저장된 메뉴 URL 우선 사용
		if (item.cdDtlCn != null && item.cdDtlCn.trim() !== '') {
			return toAdminPath(item.cdDtlCn.trim())
		}
		// ETC2 에 URL 이 있으면 사용
		if (item.etc2 && item.etc2.trim() !== '') {
			return toAdminPath(item.etc2.trim())
		}
		// URL 없는 하위 메뉴는 라우팅 대상에서 제외(자동 확장 오작동 방지)
		return NO_MENU_PATH
	}

	useEffect(() => {
		if (!sessionReady) {
			return
		}

		const loadMenus = async () => {
			setMenuError(null)
			if (menuGroupsRef.current.length === 0) {
				setMenuLoading(true)
			}
			try {
				const [resTop, resSub] = await Promise.all([
					fetch(`${backendBaseUrl}/api/admin/codes/detail?cdId=COM001&useYn=Y`, {
						credentials: 'include'
					}),
					fetch(`${backendBaseUrl}/api/admin/codes/detail?cdId=COM002&useYn=Y`, {
						credentials: 'include'
					})
				])

				const topJson: ApiResponse<CodeDetail[]> = await resTop.json()
				const subJson: ApiResponse<CodeDetail[]> = await resSub.json()

				if (!topJson.success || !subJson.success) {
					setMenuError('메뉴 코드를 불러오는 중 오류가 발생했습니다.')
					return
				}

				const topList = topJson.data || []
				const subList = subJson.data || []

				const groups: MenuGroup[] = topList.map((t) => {
					const topCode = codeDetailId(t)
					const children: MenuChild[] = subList
						// COM001.CD_DTL_ID 를 prefix 로 사용 (예: 11 -> 1101,1102,...)
						.filter((s) => codeDetailId(s).startsWith(topCode))
						.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
						.map((s) => ({
							id: codeDetailId(s),
							label: s.cdDtlNm,
							path: resolveMenuPath(s)
						}))
						.filter((child) => isMenuPathAllowed(child.path))

					// 상위 메뉴 클릭 시 이동 경로: CODE_DC(메뉴 URL) 우선, 없으면 첫 번째 하위 경로
					const firstRoutableChildPath = children.find((c) => c.path !== NO_MENU_PATH)?.path
					const groupPath = toAdminPath(
						(t.cdDtlCn != null && t.cdDtlCn.trim() !== '' ? t.cdDtlCn.trim() : null) ||
						t.etc1 ||
						(firstRoutableChildPath ?? '/admin/dashboard')
					)

					return {
						id: topCode,
						label: t.cdDtlNm,
						path: groupPath,
						children
					}
				}).filter((group) => group.children.length > 0)

				setMenuGroups(groups)
				writeCache(MENU_CACHE_KEY, groups)
				// 메뉴 재계산 시에도 현재 경로가 속한 그룹만 유지해 펼침 상태가 튀지 않도록 한다.
				const activeGroup = groups.find((g) =>
					g.children.some(
						(c) =>
							c.path !== NO_MENU_PATH &&
							(location.pathname === c.path || (c.path !== '/' && location.pathname.startsWith(c.path + '/')))
					)
				)
				setOpenGroupIds(activeGroup ? [activeGroup.id] : [])
			} catch {
				setMenuError('메뉴 정보를 불러오는 중 통신 오류가 발생했습니다.')
			} finally {
				setMenuLoading(false)
			}
		}

		loadMenus()
	}, [backendBaseUrl, isMenuPathAllowed, sessionReady])

	// 현재 경로에 해당하는 메뉴가 속한 그룹만 열고, 다른 대메뉴는 모두 닫기
	useEffect(() => {
		const pathname = location.pathname
		if (menuGroups.length === 0 || !pathname) return
		const groupWithActive = menuGroups.find((g) =>
			g.children.some(
				(c) => c.path !== NO_MENU_PATH && (pathname === c.path || (c.path !== '/' && pathname.startsWith(c.path + '/')))
			)
		)
		setOpenGroupIds(groupWithActive ? [groupWithActive.id] : [])
	}, [location.pathname, menuGroups])

	useEffect(() => {
		closeMobileNav()
	}, [location.pathname, closeMobileNav])

	useEffect(() => {
		if (!mobileNavOpen) {
			document.body.style.overflow = ''
			return
		}
		const sync = () => {
			const narrow = window.innerWidth <= MOBILE_SIDEBAR_BP
			document.body.style.overflow = narrow ? 'hidden' : ''
			if (!narrow) setMobileNavOpen(false)
		}
		sync()
		window.addEventListener('resize', sync)
		return () => {
			window.removeEventListener('resize', sync)
			document.body.style.overflow = ''
		}
	}, [mobileNavOpen])

	useEffect(() => {
		if (!mobileNavOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeMobileNav()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [mobileNavOpen, closeMobileNav])

	return (
		<div className={`backoffice${mobileNavOpen ? ' backoffice--nav-open' : ''}`}>
			<button
				type="button"
				className="backdrop"
				id="backdrop"
				aria-label="메뉴 닫기"
				tabIndex={mobileNavOpen ? 0 : -1}
				onClick={closeMobileNav}
			/>

			<div className="dashboard-container">
				<aside className="sidebar" id="admin-sidebar">
					<div className="sidebar-header">
						<h3>HKSTS ADMIN</h3>
					</div>
					<ul className="sidebar-menu">
						{menuError && (
							<li>
								<span style={{ padding: '12px 20px', color: '#fca5a5', fontSize: 12 }}>
									{menuError}
								</span>
							</li>
						)}

						{menuGroups.length > 0 &&
							menuGroups.map((group) => {
								if (!canManageAdmin) {
									const hasRestrictedGroupPath = group.path != null && isRestrictedMenuPath(group.path)
									const hasRestrictedChildPath = group.children.some((child) => isRestrictedMenuPath(child.path))
									if (hasRestrictedGroupPath || hasRestrictedChildPath) {
										return null
									}
								}
								const isOpen = openGroupIds.includes(group.id)
								return (
									<li key={group.id} className={isOpen ? 'open' : undefined}>
										<button
											type="button"
											className="sidebar-group"
											onClick={() => {
												setOpenGroupIds((prev) =>
													prev.includes(group.id)
														? prev.filter((id) => id !== group.id)
														: [...prev, group.id]
												)
											}}
										>
											{renderLineIcon(getGroupMenuIcon(group), {
												size: 18,
												className: 'sidebar-menu-icon sidebar-menu-icon--group'
											})}
											<span className="sidebar-group-label">{group.label}</span>
											<span className={`sidebar-group-arrow${isOpen ? ' open' : ''}`}>
												<i className="fas fa-chevron-down" aria-hidden="true" />
											</span>
										</button>
										<ul className={`sidebar-submenu${isOpen ? ' is-open' : ''}`}>
											{group.children.map((child) => {
												// /bbs-post/**** 등 하위 경로 접속 시 해당 메뉴 활성화: path가 /bbs-post 이거나 현재 경로가 child.path로 시작하면 active
												const pathname = location.pathname
												const isActiveMatch =
													child.path !== NO_MENU_PATH &&
													(pathname === child.path ||
													(child.path !== '/' && pathname.startsWith(child.path + '/')))
												return (
													<li key={child.id}>
														{child.path !== NO_MENU_PATH ? (
															<NavLink
																to={child.path}
																end={false}
																className={({ isActive }) =>
																	isActive || isActiveMatch ? 'active' : undefined
																}
															>
																{child.label}
															</NavLink>
														) : (
															<span>{child.label}</span>
														)}
													</li>
												)
											})}
										</ul>
									</li>
								)
							})}

						{menuLoading && menuGroups.length === 0 && !menuError && <SidebarMenuSkeleton />}
					</ul>
				</aside>

				<div className="content">
					<header className="header">
						<button
							type="button"
							id="sidebarToggle"
							className="sidebar-toggle"
							aria-label={mobileNavOpen ? '메뉴 닫기' : '메뉴 열기'}
							aria-expanded={mobileNavOpen}
							aria-controls="admin-sidebar"
							onClick={toggleMobileNav}
						>
							<div className="hamburger" aria-hidden="true">
								<span />
								<span />
								<span />
							</div>
						</button>

						<h2>{title ?? '백오피스'}</h2>

						{/* 유저 드롭다운 + 세션 타이머 */}
						<div className="user-dropdown">
							<div className="header-user-bar">
								<span className="header-user-name">
									{adminName ? `${adminName}님` : '관리자님'}
									{adminRoleName ? ` (${adminRoleName})` : adminRole ? ` (${adminRole})` : ''}
								</span>
								<span className="session-timer" id="sessionTimer">
									<i className="fas fa-clock" aria-hidden="true" />
									<span className="session-timer-text">
										<span id="sessionTimeLeft">
											{sessionRemaining !== null ? formatRemaining(sessionRemaining) : '--:--'}
										</span>
									</span>
								</span>
								<button
									type="button"
									className="session-extend-btn"
									id="sessionExtendBtn"
									title="세션 연장 (마지막 접속 시각 갱신)"
									onClick={() => fetchSession()}
								>
									연장
								</button>
								<div className="header-action-group">
									<NavLink
										to="/admin/dashboard"
										end
										title="대시보드"
										className={({ isActive }) =>
											`header-action-btn header-action-btn--dashboard${isActive ? ' active' : ''}`
										}
									>
										{renderLineIcon('dashboard', { size: 12, className: 'header-action-icon' })}
										<span>대시보드</span>
									</NavLink>
									<button
										type="button"
										className="header-action-btn header-action-btn--logout"
										title="로그아웃"
										disabled={logoutLoading}
										onClick={handleLogout}
									>
										<i className="fas fa-sign-out-alt" aria-hidden="true" />
										<span>{logoutLoading ? '처리 중…' : '로그아웃'}</span>
									</button>
								</div>
							</div>
							<div className="dropdown-content">
								<a href="#">정보수정</a>
								<button type="button" className="dropdown-logout-btn" onClick={handleLogout}>
									로그아웃
								</button>
							</div>
						</div>
					</header>

					<main className="main-content">{children}</main>
				</div>
			</div>
		</div>
	)
}

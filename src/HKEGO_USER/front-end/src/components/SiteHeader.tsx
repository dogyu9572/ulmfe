'use client'
import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/*
 * 메뉴 링크는 prefetch 를 끈다.
 * 헤더는 늘 화면에 떠 있어서 대메뉴 전부가 자동으로 프리페치되는데,
 * 그때 각 페이지가 가진 이미지·CSS preload 힌트까지 현재 문서로 딸려온다.
 * 도서관 안내 한 장을 여는데 전시 사진 28장을 미리 받아오던 것이 그 때문이다.
 */
import { usePathname, useRouter } from 'next/navigation'
import { resolvePublicMediaUrl } from '@/lib/publicApi'
import { getSiteChrome } from '@/lib/siteChrome'
import { FAVICON_PATH, SITE_NAME } from '@/lib/siteMeta'
import { SITE_MENUS, SiteMenu } from './siteNavigation'

function applyFavicon(url: string | null | undefined) {
    const href = resolvePublicMediaUrl(url?.trim() || FAVICON_PATH)
    const type = href.toLowerCase().endsWith('.svg') ? 'image/svg+xml' : undefined
    document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']").forEach((node) => {
        const link = node as HTMLLinkElement
        link.href = href
        if (type) link.type = type
        else link.removeAttribute('type')
    })
}

export default function SiteHeader() {
    const [siteMenus, setSiteMenus] = useState<SiteMenu[]>(SITE_MENUS)
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const pathname = usePathname()
    const router = useRouter()
    const [fixed, setFixed] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchInstantClose, setSearchInstantClose] = useState(false)
    const [headerHover, setHeaderHover] = useState(false)
    const [focusedMenu, setFocusedMenu] = useState<number | null>(null)
    const [mobileMenu, setMobileMenu] = useState<number | null>(null)
    const searchButtonRef = useRef<HTMLButtonElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const currentPath = pathname?.replace(/\/$/, '') || '/'
    const navigationPath = currentPath
        .replace(/^\/program\/elementary[1-5]$/, '/program/elementary')
        .replace(/^\/program\/mission[1-3]$/, '/program/mission')
        .replace(/^\/archive\/elementary_view$/, '/archive/elementary')
        .replace(/^\/archive\/mission_view$/, '/archive/mission')
        .replace(/^\/news\/notice_view$/, '/news/notice')
        .replace(/^\/news\/exhibit_view$/, '/news/exhibit')
        .replace(/^\/news\/event_view$/, '/news/event')
    useEffect(() => {
        let cancelled = false
        void getSiteChrome().then(({ menus, setting }) => {
            if (cancelled) return
            setSiteMenus(menus)
            setLogoUrl(setting?.logoUrl ?? null)
            const siteName = setting?.siteTitle?.trim()
            if (siteName) document.title = document.title.replace(SITE_NAME, siteName)
            applyFavicon(setting?.faviconUrl)
        })
        return () => {
            cancelled = true
        }
    }, [])
    useEffect(() => {
        const onScroll = () => setFixed(window.scrollY > 100)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])
    useEffect(() => {
        document.documentElement.classList.toggle('over_h', menuOpen)
        document.body.classList.toggle('over_h', menuOpen)
        return () => {
            document.documentElement.classList.remove('over_h')
            document.body.classList.remove('over_h')
        }
    }, [menuOpen])
    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus()
    }, [searchOpen])
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            if (searchOpen) {
                closeSearch()
            } else if (menuOpen) {
                setMenuOpen(false)
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [menuOpen, searchOpen])
    const openSearch = () => {
        setSearchInstantClose(false)
        setSearchOpen((open) => !open)
    }
    const closeSearch = () => {
        setSearchInstantClose(false)
        setSearchOpen(false)
        searchButtonRef.current?.focus()
    }
    const closeMenus = () => {
        setMenuOpen(false)
        setMobileMenu(null)
        setFocusedMenu(null)
        setHeaderHover(false)
    }
    const showComingSoon = () => {
        window.alert('준비중입니다.')
        closeMenus()
    }
    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const keyword = searchInputRef.current?.value.trim() || ''
        setSearchInstantClose(true)
        setSearchOpen(false)
        router.push(keyword ? `/total_search/index?search_keyword=${encodeURIComponent(keyword)}` : '/total_search/index')
    }
    const headerClasses = [
        'header',
        fixed ? 'fixed' : '',
        menuOpen ? 'on' : '',
        searchOpen ? 'search_open' : '',
        headerHover ? 'hover' : '',
        focusedMenu !== null ? 'focus_open' : ''
    ].filter(Boolean).join(' ')
    const searchAreaClasses = [
        'total_search_area',
        searchInstantClose ? 'no_transition' : ''
    ].filter(Boolean).join(' ')
    return (
        <header className={headerClasses}>
            <div className="sound_only">메인메뉴 영역</div>
            <Link
                href="/"
                className="logo"
                aria-label="울산광역시미래교육관 메인"
                onClick={closeMenus}
                /* 관리자에서 로고를 올리면 CSS 배경 이미지를 그 파일로 덮어쓴다. */
                style={logoUrl ? { backgroundImage: `url('${resolvePublicMediaUrl(logoUrl)}')` } : undefined}
            />
            <div className="gnb">
                <ul className="list">
                    {siteMenus.map((menu, index) => {
                        const menuActive = menu.children.some((child) => navigationPath === child.href)
                        return (
                        <li
                            className={`menu${menuActive ? ' on' : ''}${focusedMenu === index ? ' focus_open' : ''}`}
                            key={menu.label}
                            onMouseEnter={() => setHeaderHover(true)}
                            onMouseLeave={() => setHeaderHover(false)}
                            onFocus={() => setFocusedMenu(index)}
                            onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) setFocusedMenu(null)
                            }}
                        >
                            <Link href={menu.comingSoon ? currentPath : menu.href} prefetch={false} onClick={(event) => {
                                if (menu.comingSoon) {
                                    event.preventDefault()
                                    showComingSoon()
                                    return
                                }
                                closeMenus()
                            }}>{menu.label}</Link>
                            {!menu.comingSoon && <div className="snb">
                                <div className="tit">{menu.label}</div>
                                <ul>
                                    {menu.children.map((child) => (
                                        <li className={navigationPath === child.href ? 'on' : ''} key={child.href}><Link href={child.href} prefetch={false} onClick={closeMenus}>{child.label}</Link></li>
                                    ))}
                                </ul>
                            </div>}
                        </li>
                        )
                    })}
                </ul>
            </div>
            <button
                ref={searchButtonRef}
                type="button"
                className="btn btn_search"
                aria-expanded={searchOpen}
                onClick={openSearch}
            >
                검색
            </button>
            <button
                type="button"
                className="btn btn_menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
            >
                {menuOpen ? '메뉴 닫기' : '메뉴 열기'}
                <span className="t" aria-hidden="true" />
                <span className="m" aria-hidden="true" />
                <span className="b" aria-hidden="true" />
            </button>
            <div className="sitemap" aria-hidden={!menuOpen}>
                <ul className="list inner">
                    {siteMenus.map((menu, index) => {
                        const menuActive = menu.children.some((child) => navigationPath === child.href)
                        return (
                        <li className={`menu${menuActive ? ' on' : ''}${mobileMenu === index ? ' open' : ''}`} key={menu.label}>
                            <Link
                                href={menu.comingSoon ? currentPath : menu.href}
                                prefetch={false}
                                aria-expanded={mobileMenu === index}
                                onClick={(event) => {
                                    if (menu.comingSoon) {
                                        event.preventDefault()
                                        showComingSoon()
                                        return
                                    }
                                    if (window.innerWidth > 1023) {
                                        closeMenus()
                                        return
                                    }
                                    event.preventDefault()
                                    setMobileMenu((current) => current === index ? null : index)
                                }}
                            >
                                {menu.label}
                            </Link>
                            {!menu.comingSoon && <ul className="snb">
                                {menu.children.map((child) => (
                                    <li className={navigationPath === child.href ? 'on' : ''} key={child.href}><Link href={child.href} prefetch={false} onClick={closeMenus}>{child.label}</Link></li>
                                ))}
                            </ul>}
                        </li>
                        )
                    })}
                </ul>
                <button type="button" className="btn_exit" onClick={() => setMenuOpen(false)}>종료</button>
            </div>
            <div className={searchAreaClasses} aria-hidden={!searchOpen}>
                <button type="button" className="dm" aria-label="통합검색 닫기" onClick={closeSearch} />
                <div className="inbox">
                    <div className="tit">통합검색</div>
                    <form className="search_input_area" onSubmit={submitSearch}>
                        <input ref={searchInputRef} type="text" className="text" placeholder="검색어를 입력해주세요." />
                        <button type="submit" className="btn_submit">검색</button>
                    </form>
                    <button type="button" className="btn_close" onClick={closeSearch}>닫기</button>
                </div>
            </div>
        </header>
    )
}

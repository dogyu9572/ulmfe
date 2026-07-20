'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { resolveSiteHref, SITE_MENUS } from './siteNavigation'

export default function SiteHeader() {
	const pathname = usePathname()
	const [fixed, setFixed] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const [searchOpen, setSearchOpen] = useState(false)
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
		.replace(/^\/support\/qna_(write|view|modify)$/, '/support/qna')

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
				setSearchOpen(false)
				searchButtonRef.current?.focus()
			} else if (menuOpen) {
				setMenuOpen(false)
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [menuOpen, searchOpen])

	const closeSearch = () => {
		setSearchOpen(false)
		searchButtonRef.current?.focus()
	}

	const submitSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const keyword = searchInputRef.current?.value.trim() || ''
		window.location.href = keyword ? `/total_search/index?search_keyword=${encodeURIComponent(keyword)}` : '/total_search/index'
	}

	const headerClasses = [
		'header',
		fixed ? 'fixed' : '',
		menuOpen ? 'on' : '',
		searchOpen ? 'search_open' : '',
		headerHover ? 'hover' : '',
		focusedMenu !== null ? 'focus_open' : ''
	].filter(Boolean).join(' ')

	return (
		<header className={headerClasses}>
			<div className="sound_only">메인메뉴 영역</div>
			<a href="/" className="logo" aria-label="울산광역시미래교육관 메인" />
			<div className="gnb">
				<ul className="list">
					{SITE_MENUS.map((menu, index) => {
						const menuActive = menu.children.some((child) => {
							const resolved = resolveSiteHref(child.href)
							return navigationPath === resolved || navigationPath === child.href
						})
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
							<a href={resolveSiteHref(menu.href)}>{menu.label}</a>
							<div className="snb">
								<div className="tit">{menu.label}</div>
								<ul>
									{menu.children.map((child) => (
										<li className={navigationPath === resolveSiteHref(child.href) || navigationPath === child.href ? 'on' : ''} key={child.href}><a href={resolveSiteHref(child.href)}>{child.label}</a></li>
									))}
								</ul>
							</div>
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
				onClick={() => setSearchOpen((open) => !open)}
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
					{SITE_MENUS.map((menu, index) => {
						const menuActive = menu.children.some((child) => navigationPath === resolveSiteHref(child.href) || navigationPath === child.href)
						return (
						<li className={`menu${menuActive ? ' on' : ''}${mobileMenu === index ? ' open' : ''}`} key={menu.label}>
							<a
								href={resolveSiteHref(menu.href)}
								aria-expanded={mobileMenu === index}
								onClick={(event) => {
									if (window.innerWidth > 1023) return
									event.preventDefault()
									setMobileMenu((current) => current === index ? null : index)
								}}
							>
								{menu.label}
							</a>
							<ul className="snb">
								{menu.children.map((child) => (
									<li className={navigationPath === resolveSiteHref(child.href) || navigationPath === child.href ? 'on' : ''} key={child.href}><a href={resolveSiteHref(child.href)}>{child.label}</a></li>
								))}
							</ul>
						</li>
						)
					})}
				</ul>
				<button type="button" className="btn_exit" onClick={() => setMenuOpen(false)}>종료</button>
			</div>
			<div className="total_search_area" aria-hidden={!searchOpen}>
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

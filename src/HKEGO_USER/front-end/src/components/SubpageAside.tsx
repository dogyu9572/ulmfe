'use client'

import Link from 'next/link'

/*
 * 좌측 메뉴도 prefetch 를 끈다. 같은 섹션의 형제 페이지를 미리 받아오면서
 * 그 페이지들의 이미지 preload 힌트까지 현재 문서로 딸려 오기 때문이다.
 * 1F 를 여는데 2F·3F·별관·야외 사진을 미리 받던 것이 그 때문이었다.
 */
import { useState } from 'react'
import { SITE_MENUS } from './siteNavigation'

type SubpageAsideProps = {
	menuIndex: number
	currentHref: string
	title: string
	description: string
}

export default function SubpageAside({ menuIndex, currentHref, title, description }: SubpageAsideProps) {
	const [open, setOpen] = useState(false)
	const menu = SITE_MENUS[menuIndex]

	return (
		<div className="aside_wrap">
			<div className="inner">
				<div className="tit">{menu.label}</div>
				<p>{description}</p>
				<div className="location">
					<i className="home" aria-hidden="true" /><em aria-hidden="true" />
					<span>{menu.label}</span><em aria-hidden="true" /><span>{title}</span>
				</div>
				<nav className={`aside${open ? ' on' : ''}`} aria-label={`${menu.label} 하위 메뉴`}>
					<button type="button" className="btn" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{title}</button>
					<div className={`sub${menuIndex + 1} on`}>
						<ul className="snb">
							{menu.children.map((child) => (
								<li className={currentHref === child.href ? 'on' : ''} key={child.href}><Link href={child.href} prefetch={false} onClick={() => setOpen(false)}>{child.label}</Link></li>
							))}
						</ul>
					</div>
				</nav>
			</div>
		</div>
	)
}

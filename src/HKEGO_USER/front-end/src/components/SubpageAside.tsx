'use client'

import { useState } from 'react'
import { resolveSiteHref, SITE_MENUS } from './siteNavigation'

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
							{menu.children.map((child) => {
								const href = resolveSiteHref(child.href)
								return <li className={currentHref === href ? 'on' : ''} key={child.href}><a href={href}>{child.label}</a></li>
							})}
						</ul>
					</div>
				</nav>
			</div>
		</div>
	)
}

'use client'
// 조직도의 부서별 담당업무를 탭으로 전환합니다.
import { useState, type ReactNode } from 'react'
import styles from './OrganizationTabs.module.css'

export default function OrganizationTabs({ operation, general }: { operation: ReactNode; general: ReactNode }) {
	const [active, setActive] = useState(0)
	const tabs = [{ label: '운영부', content: operation }, { label: '총무부', content: general }]

	return (
		<div>
			<div className={styles.tabs} role="tablist" aria-label="부서별 담당업무">
				{tabs.map((tab, index) => (
					<button
						key={tab.label}
						type="button"
						role="tab"
						id={`organization-tab-${index}`}
						aria-controls={`organization-panel-${index}`}
						aria-selected={active === index}
						tabIndex={active === index ? 0 : -1}
						onClick={() => setActive(index)}
						onKeyDown={(event) => {
							if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
							event.preventDefault()
							const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index
							setActive(next)
							document.getElementById(`organization-tab-${next}`)?.focus()
						}}
					>{tab.label}</button>
				))}
			</div>
			<div id={`organization-panel-${active}`} role="tabpanel" aria-labelledby={`organization-tab-${active}`} tabIndex={0}>
				{tabs[active].content}
			</div>
		</div>
	)
}

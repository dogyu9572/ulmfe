import React from 'react'
import type { CSSProperties } from 'react'

export type CodeBadgeItem = {
	code: string
	cdDtlNm: string
	codeEtc3?: string
}

export type CodeBadgeKind = 'cate' | 'link' | 'file' | 'thum' | 'use' | 'edu-tp-theory' | 'edu-tp-practical'

export const normalizeHexColor = (value?: string | null): string | null => {
	const v = (value || '').trim()
	if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toUpperCase()
	if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v.toUpperCase()}`
	return null
}

export const getCodeBadgeStyle = (etc3?: string | null): CSSProperties | undefined => {
	const hex = normalizeHexColor(etc3)
	if (!hex) return undefined
	return {
		backgroundColor: `${hex}18`,
		borderColor: `${hex}66`,
		color: hex
	}
}

export const resolveCodeBadgeKind = (
	code: string,
	label?: string,
	fallback: CodeBadgeKind = 'cate'
): CodeBadgeKind => {
	if (code === '11' || label === '이론') return 'edu-tp-theory'
	if (code === '21' || label === '실기') return 'edu-tp-practical'
	return fallback
}

export const buildCodeBadgeProps = (options: {
	code: string
	label?: string
	codes?: CodeBadgeItem[]
	defaultKind?: CodeBadgeKind
	className?: string
}): { className: string; style?: CSSProperties; label: string } => {
	const matched = options.codes?.find((c) => c.code === options.code)
	const displayLabel = options.label || matched?.cdDtlNm || options.code
	const hex = normalizeHexColor(matched?.codeEtc3)
	const kind = resolveCodeBadgeKind(options.code, displayLabel, options.defaultKind ?? 'cate')
	const kindClass = hex ? 'is-custom-color' : kind
	const extra = options.className?.trim() ?? ''
	return {
		className: `bbs-master-list-badge is-on ${kindClass}${extra ? ` ${extra}` : ''}`,
		style: getCodeBadgeStyle(matched?.codeEtc3),
		label: displayLabel
	}
}

type CodeBadgeProps = {
	code?: string
	label?: string
	codes?: CodeBadgeItem[]
	defaultKind?: CodeBadgeKind
	className?: string
	emptyLabel?: string
}

export const CodeBadge: React.FC<CodeBadgeProps> = ({
	code,
	label,
	codes,
	defaultKind = 'cate',
	className = '',
	emptyLabel = '-'
}) => {
	if (!code) {
		return <span className={`bbs-master-list-badge${className ? ` ${className}` : ''}`}>{emptyLabel}</span>
	}
	const props = buildCodeBadgeProps({ code, label, codes, defaultKind, className })
	return (
		<span className={props.className} style={props.style} title={props.label}>
			{props.label}
		</span>
	)
}

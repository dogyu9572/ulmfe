import { Fragment } from 'react'

type EmphasisTextProps = {
	text?: string | null
	emphasisClassName?: string
}

type EmphasisSegment = {
	text: string
	emphasized: boolean
}

const EMPHASIS_PATTERN = /\*([^*\n]+)\*/g

export const parseEmphasisSegments = (value?: string | null): EmphasisSegment[] => {
	const text = value || ''
	const segments: EmphasisSegment[] = []
	let cursor = 0

	for (const match of text.matchAll(EMPHASIS_PATTERN)) {
		const matchIndex = match.index ?? 0
		if (matchIndex > cursor) segments.push({ text: text.slice(cursor, matchIndex), emphasized: false })
		segments.push({ text: match[1], emphasized: true })
		cursor = matchIndex + match[0].length
	}

	if (cursor < text.length) segments.push({ text: text.slice(cursor), emphasized: false })
	return segments
}

export const stripEmphasisMarkers = (value?: string | null) => parseEmphasisSegments(value).map((segment) => segment.text).join('')

export const EmphasisText = ({ text, emphasisClassName }: EmphasisTextProps) => (
	<>
		{parseEmphasisSegments(text).map((segment, index) => segment.emphasized
			? <strong className={emphasisClassName} key={`${segment.text}-${index}`}>{segment.text}</strong>
			: <Fragment key={`${segment.text}-${index}`}>{segment.text}</Fragment>)}
	</>
)

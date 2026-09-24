import { Fragment } from 'react'

type EmphasisTextProps = {
	text?: string | null
	emphasisClassName?: string
}

type EmphasisSegment = {
	text: string
	emphasized: boolean
	/** **굵게** 마커 — emphasisClassName 없이 순수 <strong>으로 렌더한다. 줄바꿈을 품을 수 있다 */
	strong?: boolean
}

/** **굵게**(줄바꿈 허용)를 먼저 잡고, 남은 *강조*(한 줄)를 잡는다 */
const EMPHASIS_PATTERN = /\*\*([\s\S]+?)\*\*|\*([^*\n]+)\*/g

export const parseEmphasisSegments = (value?: string | null): EmphasisSegment[] => {
	const text = value || ''
	const segments: EmphasisSegment[] = []
	let cursor = 0

	for (const match of text.matchAll(EMPHASIS_PATTERN)) {
		const matchIndex = match.index ?? 0
		if (matchIndex > cursor) segments.push({ text: text.slice(cursor, matchIndex), emphasized: false })
		segments.push(match[1] !== undefined
			? { text: match[1], emphasized: true, strong: true }
			: { text: match[2], emphasized: true })
		cursor = matchIndex + match[0].length
	}

	if (cursor < text.length) segments.push({ text: text.slice(cursor), emphasized: false })
	return segments
}

export const stripEmphasisMarkers = (value?: string | null) => parseEmphasisSegments(value).map((segment) => segment.text).join('')

/** 세그먼트 안의 \n을 <br />로 살려 준다 */
const withLineBreaks = (text: string) => text.split('\n').map((line, index) => (
	<Fragment key={index}>{index > 0 && <br />}{line}</Fragment>
))

export const EmphasisText = ({ text, emphasisClassName }: EmphasisTextProps) => (
	<>
		{parseEmphasisSegments(text).map((segment, index) => segment.emphasized
			? <strong className={segment.strong ? undefined : emphasisClassName} key={`${segment.text}-${index}`}>{withLineBreaks(segment.text)}</strong>
			: <Fragment key={`${segment.text}-${index}`}>{withLineBreaks(segment.text)}</Fragment>)}
	</>
)

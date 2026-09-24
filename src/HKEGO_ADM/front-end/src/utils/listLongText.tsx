// 목록 표에서 긴 텍스트를 80자까지만 노출하고 전문은 tooltip 으로 보여주는 셀
import React from 'react'

/** 목록 노출 상한. 이보다 길면 뒤를 잘라내고 말줄임표를 붙인다. */
export const LIST_TEXT_MAX_LENGTH = 80

export function truncateListText(value?: string | null, maxLength = LIST_TEXT_MAX_LENGTH): string {
	const text = (value ?? '').trim()
	return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

type ListLongTextCellProps = {
	/** 표시할 원문 */
	text?: string | null
	/** 기본 80자. 열이 좁은 표에서는 줄여서 넘긴다 */
	maxLength?: number
	/** 값이 없을 때 표시할 문자 */
	emptyText?: string
}

/**
 * 긴 텍스트를 담는 목록 셀.
 * 글자 수 제한만으로는 부족하다 — 이 표들은 `table-layout: auto` 라서
 * 80자짜리 한글도 열을 화면 밖까지 늘린다. 그래서 CSS(`list-long-text`)로 폭까지 함께 막는다.
 */
export const ListLongTextCell: React.FC<ListLongTextCellProps> = ({
	text,
	maxLength = LIST_TEXT_MAX_LENGTH,
	emptyText = '-'
}) => {
	const original = (text ?? '').trim()
	if (!original) {
		return <td style={{ textAlign: 'left' }}>{emptyText}</td>
	}
	// title 은 글자 수로 자르지 않은 경우에도 붙인다.
	// 80자 이내여도 열 너비를 넘으면 CSS 가 시각적으로 자르기 때문에, 전문을 볼 수단이 항상 있어야 한다.
	return (
		<td style={{ textAlign: 'left' }}>
			<span className="list-long-text" title={original}>
				{truncateListText(original, maxLength)}
			</span>
		</td>
	)
}

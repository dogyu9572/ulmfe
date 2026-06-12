/** Summernote jQuery 엘리먼트 (pasteHTML 등) */
export type SummernoteEl = { summernote: (action: string, value?: string) => unknown }

/** Enter → 이중 줄바꿈, Shift+Enter → 기본 단일 줄바꿈 */
export function summernoteOnEnterKeydown($el: SummernoteEl) {
	return function (e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			$el.summernote('pasteHTML', '<br><br>')
		}
	}
}

/** 공통코드 상세(CODE_DT) 항목 — 표준화 후 cdDtlId, 구 API 호환 code */
export type CodeDtLike = {
	cdDtlId?: string
	code?: string
}

export function codeDetailId(item: CodeDtLike): string {
	return (item.cdDtlId ?? item.code ?? '').trim()
}

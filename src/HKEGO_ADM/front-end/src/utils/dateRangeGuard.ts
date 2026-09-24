// 검색 조건의 시작일·종료일이 뒤집혔는지 검사하는 공통 가드
//
// 뒤집힌 범위를 그대로 서버에 보내면 조건에 맞는 행이 없어 0건이 돌아온다.
// 데이터가 없는 것과 구분되지 않아 사용자가 원인을 알 수 없으므로, 조회 전에 막고 이유를 알린다.

/**
 * 시작일이 종료일보다 늦으면 안내 문구를 돌려준다. 문제가 없으면 null.
 * 둘 중 하나만 입력한 경우는 열린 범위로 보고 통과시킨다.
 */
export function checkDateRange(start: string, end: string, label = '검색 기간'): string | null {
	const from = (start ?? '').trim()
	const to = (end ?? '').trim()
	if (!from || !to) return null
	if (from <= to) return null
	return `${label}의 시작일이 종료일보다 늦습니다. 날짜를 다시 확인해주세요.`
}

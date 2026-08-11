// 한글 자모 → 완성형 글자 조합 (미션2 지구존 E-09 자모 키패드용)

export const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
export const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
export const JONG = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'

/** 초성/중성/종성 인덱스로 완성형 한 글자를 만든다. 중성이 없으면 초성 자모만 반환 */
export const composeHangul = (cho: number | null, jung: number | null, jong: number | null) => {
	if (cho == null) return ''
	if (jung == null) return CHO[cho]
	return String.fromCharCode(0xac00 + (cho * 21 + jung) * 28 + (jong || 0))
}

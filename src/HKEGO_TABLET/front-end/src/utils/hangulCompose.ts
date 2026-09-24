// 한글 자모 → 완성형 글자 조합 (미션2 지구존 E-09 자모 키패드용)

export const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
export const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
export const JONG = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'

/**
 * 완성형 한글 낱말을 글자별 자모 배열로 분해한다 (미션2 사회존 S-07 암호 판정용).
 * 종성이 있으면 3개, 없으면 2개. 한글이 아닌 글자는 그대로 1개로 둔다.
 */
export const decomposeHangul = (word: string): string[][] =>
	Array.from(word).map((char) => {
		const code = char.charCodeAt(0) - 0xac00
		if (code < 0 || code > 11171) return [char]
		const jong = code % 28
		const jung = ((code - jong) / 28) % 21
		const cho = Math.floor(code / 588)
		return jong ? [CHO[cho], JUNG[jung], JONG[jong]] : [CHO[cho], JUNG[jung]]
	})

/** 초성/중성/종성 인덱스로 완성형 한 글자를 만든다. 중성이 없으면 초성 자모만 반환 */
export const composeHangul = (cho: number | null, jung: number | null, jong: number | null) => {
	if (cho == null) return ''
	if (jung == null) return CHO[cho]
	return String.fromCharCode(0xac00 + (cho * 21 + jung) * 28 + (jong || 0))
}

// 미션 퍼즐 타입 정의 — 퍼즐은 관리자에 등록하지 않고 missionPuzzleData.ts에 하드코딩한다 (실화면·프로토타입 공용)

/**
 * 힌트 1건 — 퍼즐 진입 후 at초 경과 시 자동 공개.
 * imageUrl은 정적 자산 경로 (public/pub/images/...).
 */
export type PuzzleHint = {
	at: number
	text: string
	imageUrl?: string
	imageCaption?: string
}

/** 오답 시 출제되는 문제은행 1문항 (SDGs 상식 OX·선택형). 관리자 SDGS_QUIZ_MST 1행에 대응한다 */
export type QuizQuestion = {
	/** 관리자 문제은행 문항 식별자. 프로토타입 샘플에는 없다 */
	id?: number
	question: string
	options: string[]
	/** 프로토타입 샘플의 0부터 시작하는 정답 위치. 실제 미션은 서버 판정 API를 사용한다 */
	answerIndex?: number
	/** 정답 확인 후 학생에게 보여줄 해설 */
	explanation?: string
	imageUrl?: string
}

/** 정답 후 다음 존 이동 안내 (지도 + 깜빡이 핑 % 좌표) */
export type NextZoneGuide = {
	name: string
	mapImageUrl?: string
	pingX?: number
	pingY?: number
}

/**
 * 전 엔진 공통 필드.
 *
 * id는 답안 식별자의 근거다 — 학생 답안은 `EDU_LRN_ANS.QSTN_SN`으로 매칭되고,
 * 퍼즐은 관리자 문항이 아니라 id를 해시한 값을 QSTN_SN으로 쓴다 (missionPuzzleData.puzzleQuestionSn).
 * **id를 바꾸면 그 퍼즐의 기존 답안 매칭이 끊긴다.**
 * quest는 학생에게 보이는 지문이자 `EDU_LRN_ANS.QSTN_CN`으로 저장되는 값이다 (관리자 학습결과에 그대로 노출).
 *
 * stepLabel·correctMessage·nextZone은 프로토타입(mission_proto) 연출 전용이라 선택 항목이다.
 */
type PuzzleBase = {
	id: string
	/** 지문 — \n 줄바꿈과 *강조* 마커를 쓴다 */
	quest: string
	hints: PuzzleHint[]
	/** 상단 스텝바 문구. 없으면 존 이름을 쓴다 */
	stepLabel?: string
	/** 정답 모달 문구. 없으면 모달 없이 다음 퍼즐로 넘어간다 */
	correctMessage?: string
	nextZone?: NextZoneGuide
}

/**
 * 판정이 없는 안내 화면 — 「다음」 버튼만으로 진행한다.
 * 미션3 E-16처럼 문제(암기) 화면과 입력 화면이 분리된 경우, 존 안에서 INFO → 입력 퍼즐 순으로 배치한다.
 */
export type InfoPuzzle = PuzzleBase & {
	type: 'INFO'
	/** 크게 강조해 보여줄 값 (예: 외워야 할 방향 순서) */
	displayText?: string
	imageUrl?: string
	imagePlaceholder?: string
	/** 하단 주의 문구 (예: 다음 화면에서는 문제가 보이지 않습니다) */
	notice?: string
	buttonLabel?: string
	/** 시연용 정답 표시줄 문구 */
	answerNote?: string
}

/** E1 코드 입력 — 숫자/영문/방향키 키패드 공용 */
export type CodePuzzle = PuzzleBase & {
	type: 'E1_CODE'
	keypad: 'NUMERIC' | 'ALPHA' | 'ARROW'
	answer: string
	/** ALPHA 키 구성 (예: 'SDGABCEIOU') */
	alphaKeys?: string
	/** 소문자 고정 슬롯 (예: 's' — SDGs의 마지막 글자) */
	fixedSuffix?: string
	/** 색상 자모 단서 (미션2 E-09) */
	colorClues?: { pos: number; jamo: string; color: string }[]
}

/** E1 변형 — 한글 자모 키패드 (미션2, 로드맵) */
export type JamoCodePuzzle = PuzzleBase & {
	type: 'E1_JAMO'
	answer: string
	colorClues?: CodePuzzle['colorClues']
}

/** E1 변형 — 슬롯 회전 (미션3 F-08, 로드맵) */
export type SlotPuzzle = PuzzleBase & {
	type: 'E1_SLOT'
	reels: string[][]
	answer: string
}

/** E2 글자판 뒤집기 — 앞면 글자를 순서대로 터치하면 뒷면이 조합됨 */
export type BoardFlipPuzzle = PuzzleBase & {
	type: 'E2_BOARD'
	front: string[][]
	back: string[][]
	/** 뒷면 조합 판정값 (예: 'upcycle') */
	answer: string
	/** 지문 아래 빈칸 표시 (예: '○○ ○○○ ○○') */
	blanksLabel?: string
	/** 시연 정답 안내용 — 앞면에서 터치할 글자 순서 (예: '착한생산과소비') */
	frontAnswer?: string
}

/** E2 변형 — 격자 순번 터치 (미션2 S-07, 로드맵) */
export type GridSequencePuzzle = PuzzleBase & {
	type: 'E2_GRID'
	cellCount: number
	columns: number
	sequence: number[]
	word: string
}

/** E3 다중 선택 — SDGs 17개 목표 등. 정답 개수는 학생에게 비공개 */
export type SelectPuzzle = PuzzleBase & {
	type: 'E3_SELECT'
	items: { label: string; color: string }[]
	answerIndexes: number[]
	/** n초 뒤 문구 공개 (1단계 색상만 → 2단계 문구) */
	labelRevealAfterSec?: number
}

/** E3 단서 매칭 — 좌우 항목 연결 */
export type MatchPuzzle = PuzzleBase & {
	type: 'E3_MATCH'
	clues: string[]
	left: string[]
	right: string[]
	/** left[i] ↔ right[answerMap[i]] */
	answerMap: number[]
}

/** E3 변형 — 순서 정렬 (미션2 F-06, 로드맵) */
export type SortPuzzle = PuzzleBase & {
	type: 'E3_SORT'
	items: { label: string; sortKey: number; letter: string }[]
	answerWord: string
}

/** E4 다른그림찾기 — % 좌표 + 판정 반경 */
export type DiffPuzzle = PuzzleBase & {
	type: 'E4_DIFF'
	imageAUrl: string
	imageBUrl: string
	imageALabel?: string
	imageBLabel?: string
	spots: { x: number; y: number; radius: number }[]
}

/** E5 기억력 — 색상 카드 ↔ 문구 카드 이형쌍 짝짓기 */
export type MemoryPuzzle = PuzzleBase & {
	type: 'E5_MEMORY'
	pairs: { label: string; color: string }[]
	/** 시연 축약 쌍 수 — 미지정 시 pairs 전체 */
	pairCount?: number
	columns?: number
	/** 틀릴 때마다 문제은행 1문항 출제 (최종 미션 true) */
	wrongTriggersQuiz?: boolean
}

/** E6 QR 수집 — 정답 판정 없는 수집형 (추가미션, 로드맵) */
export type QrPuzzle = PuzzleBase & {
	type: 'E6_QR'
	qrCount: number
	fragmentCount: number
}

export type MissionPuzzle =
	| InfoPuzzle
	| CodePuzzle
	| JamoCodePuzzle
	| SlotPuzzle
	| BoardFlipPuzzle
	| GridSequencePuzzle
	| SelectPuzzle
	| MatchPuzzle
	| SortPuzzle
	| DiffPuzzle
	| MemoryPuzzle
	| QrPuzzle

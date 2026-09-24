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
	/** 카드 상단 제목 — card_top 아래의 .tit 영역에 표시한다 */
	cardTitle?: string
	hints: PuzzleHint[]
	/** 상단 스텝바 문구. 없으면 존 이름을 쓴다 */
	stepLabel?: string
	/** 정답 모달 문구. 없으면 모달 없이 다음 퍼즐로 넘어간다 */
	correctMessage?: string
	nextZone?: NextZoneGuide
	/**
	 * 전시 콘텐츠가 오지 않아 **정답 자체가 임시**인 퍼즐.
	 * 화면에는 그대로 띄우되(검수 필요) 답안을 학습 결과로 저장하지 않는다 — 지어낸 값이 관리자 결과에 쌓이면 안 된다.
	 * 자산(이미지)만 더미이고 정답이 확정된 퍼즐에는 붙이지 않는다.
	 */
	dummy?: boolean
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
	/** 콘텐츠 영역을 별도 wbox로 감싼다 */
	contentBox?: boolean
	/** 이전 퍼즐 이동 버튼을 표시한다 */
	showBackButton?: boolean
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

/** E1 변형 — 한글 자모 키패드 (미션2 지구존 E-09) */
export type JamoCodePuzzle = PuzzleBase & {
	type: 'E1_JAMO'
	answer: string
	colorClues?: CodePuzzle['colorClues']
	/** 색상 강조를 적용할 콘텐츠 본문 — 자모를 순서대로 조합하면 answer가 된다 */
	passage?: string
	passageCaption?: string
}

/**
 * E1 변형 — 칸을 눌러 항목을 순환시켜 배열을 맞춘다 (미션3 미래존 F-08).
 *
 * 출발과 최종 목적지는 고정이고 가운데 칸만 돌아간다 (0728 메모17).
 * 칸을 누를 때마다 항목이 순서대로 순환하는 방식으로 확정되었다 (0728 메모16).
 */
export type SlotPuzzle = PuzzleBase & {
	type: 'E1_SLOT'
	/** 회전하는 칸의 항목 목록 — 칸 하나당 배열 하나 */
	reels: string[][]
	/** 칸별 정답 — reels[i]에서 골라야 할 항목. 항목이 여러 글자일 수 있어 문자열 배열로 둔다 */
	answers: string[]
	/** 맨 앞에 고정으로 놓이는 칸 (출발) */
	fixedHead?: string
	/** 맨 뒤에 고정으로 놓이는 칸 (최종 목적지) */
	fixedTail?: string
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

/**
 * E2 변형 — 암호표를 번호판·글자판과 대조해 낱말을 조합 (미션2 사회존 S-07).
 *
 * 학생은 암호표 숫자를 끊어 읽어 번호판에서 자리를 찾고, 같은 자리의 글자판 자모를 눌러 낱말을 만든다.
 * 뒤집기 동작은 없다 — 번호판과 글자판을 나란히 두고 학생이 직접 대조한다 (0728 메모10).
 *
 * 글자 경계는 answer에서 역산하므로(「울산태화강」 = 3·3·2·2·3자모) 받침 판정 로직이 필요 없다.
 */
export type CipherPuzzle = PuzzleBase & {
	type: 'E2_CIPHER'
	/** 학생에게 제시하는 암호표 원문 (예: '73511312248914137') */
	cipher: string
	/** 번호판 표기 — jamo와 같은 순서·같은 길이. 원문이 10을 '0'으로 적었으면 그대로 둔다 */
	numbers: string[]
	/** 글자판 자모 — numbers[i]에 대응 */
	jamo: string[]
	/** 판정값 (예: '울산태화강') */
	answer: string
	/** 시연용 끊어읽기 (예: ['735','11312','24','89','14137']) */
	segments?: string[]
}

/** E3 다중 선택 — SDGs 17개 목표 등. 정답 개수는 학생에게 비공개 */
export type SelectPuzzle = PuzzleBase & {
	type: 'E3_SELECT'
	/** iconUrl이 있으면 1단계에서 색상과 함께 기호를 보여준다 (0728 메모6) */
	items: { label: string; color: string; iconUrl?: string }[]
	answerIndexes: number[]
	/** n초 뒤 문구 공개 (1단계 색상·기호만 → 2단계 문구) */
	labelRevealAfterSec?: number
}

/**
 * E3 변형 — 문항별 4지선다 후 세트 채점 (미션1 사회존 S-14).
 *
 * 문항 전체가 맞아야 통과한다. 물건을 중복으로 고르면 어차피 오답이 되므로
 * 중복 방지 로직을 두지 않는다 (0728 메모7).
 */
export type ChoiceSetPuzzle = PuzzleBase & {
	type: 'E3_CHOICE_SET'
	/** 지문 위에 제시하는 단서 */
	clues: string[]
	/** 문항 (예: '1번 친구') */
	items: string[]
	/** 모든 문항이 공유하는 선택지 */
	options: string[]
	/** items[i]의 정답은 options[answerIndexes[i]] */
	answerIndexes: number[]
}

/** E3 변형 — 순서 정렬 (미션2 F-06, 로드맵) */
export type SortPuzzle = PuzzleBase & {
	type: 'E3_SORT'
	items: { label: string; sortKey: number; letter: string }[]
	answerWord: string
}

/**
 * E4 다른그림찾기 — % 좌표 + 판정 반경.
 *
 * 학생은 **전시장 설명패널의 실물 그림**과 태블릿 그림을 비교한다 (0728 확정본).
 * 그래서 태블릿에는 비교 대상 그림만 띄우고, 기준 그림은 화면에 내보내지 않는다.
 * referenceImageUrl은 프로토타입 시연에서만 나란히 보여주는 용도다.
 */
export type DiffPuzzle = PuzzleBase & {
	type: 'E4_DIFF'
	/** 태블릿에 띄우는 비교 대상 그림 — 여기서 다른 곳을 찾는다 */
	imageBUrl: string
	imageBLabel?: string
	/** 전시장에서 대조할 설명패널 안내 (예: 「서로 다른 한 끼」 설명패널) */
	referenceLabel?: string
	/** 시연 전용 기준 그림 — demo일 때만 렌더한다 */
	referenceImageUrl?: string
	spots: { x: number; y: number; radius: number }[]
}

/** E5 기억력 — 색상 카드 ↔ 문구 카드 이형쌍 짝짓기 */
export type MemoryPuzzle = PuzzleBase & {
	type: 'E5_MEMORY'
	/** imageUrl이 있으면 색상 대신 이미지를 카드 앞면에 쓴다 (로고 6쌍) */
	pairs: { label: string; color: string; imageUrl?: string }[]
	/** 시연 축약 쌍 수 — 미지정 시 pairs 전체 */
	pairCount?: number
	/** 지정 시 pair 배열의 순서대로 카드 쌍을 배치하고, 나머지는 뒤에 붙인다 */
	pairOrder?: number[]
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
	| CipherPuzzle
	| SelectPuzzle
	| ChoiceSetPuzzle
	| SortPuzzle
	| DiffPuzzle
	| MemoryPuzzle
	| QrPuzzle

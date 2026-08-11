// 미션 퍼즐 하드코딩 데이터 — 관리자에 등록하지 않고 여기서 관리한다. 실화면(MissionStepQuestPage)과 프로토타입이 함께 읽는다
import type { MissionPuzzle, QuizQuestion } from './missionPuzzleTypes'

export type MissionZonePuzzles = {
	/** 존 이름 — 학생 명단의 동선(routeCn) 또는 미션 프로그램 stepJson STEP3의 존 이름과 일치해야 한다 */
	name: string
	puzzles: MissionPuzzle[]
}

export type MissionProgramPuzzles = {
	key: string
	/** 관리자 「미션 프로그램」에 등록된 프로그램명. 공백을 무시하고 비교한다 */
	name: string
	/** 프로그램명이 관리자에서 다르게 등록된 경우를 위한 대체 이름 */
	aliases?: string[]
	/** 아래 tabLabel·sourceNote·caution·story·done·stickerCount는 프로토타입 화면 전용이다 */
	tabLabel: string
	sourceNote: string
	/** 근거 문서 미확보 등 확정 전 주의사항 — 지정 시 화면 상단에 경고 배너로 노출 */
	caution?: string
	/** 도입 화면 — 팀·동선 안내(team)는 동선이 배정되는 미션에만 있다. notice는 안전 안내 등 강조 문구 */
	story: {
		/** 사이드바 활동 순서에 표시할 이름 */
		name: string
		/** 상단 스텝바 문구 */
		stepLabel: string
		paragraphs: string[]
		team?: { label: string; size: number; routeOrder: string }
		notice?: string
	}
	done: { stepLabel: string; emoji: string; title: string; text: string }
	/** 존 완료마다 받는 스티커 수 — 0이면 스티커를 주지 않는 미션(추가미션) */
	stickerCount: number
	zones: MissionZonePuzzles[]
	/** 프로토타입 전용 오답 퀴즈 샘플. 실화면은 관리자 SDGs 퀴즈 은행을 세션 응답으로 받는다 */
	quizBank: QuizQuestion[]
}

const CAUTION_UNCONFIRMED = '근거 미확보 — 0718 합본 미수령 상태의 가설 사양입니다. 화면 구조와 퍼즐 엔진 매핑은 유효하나, 확정본 회신 후 정답값·전시물 코드 재검증이 필요합니다.'
const CAUTION_IMG_SUFFIX = ' · 가설 사양 — 확정본 회신 후 교체 필요'

/** SDGs 17개 목표 — E3 선택·E5 기억력 공용 */
export const SDGS: { label: string; color: string }[] = [
	{ label: '빈곤 퇴치', color: '#E5243B' },
	{ label: '기아 종식', color: '#DDA63A' },
	{ label: '건강과 웰빙', color: '#4C9F38' },
	{ label: '양질의 교육', color: '#C5192D' },
	{ label: '성평등', color: '#FF3A21' },
	{ label: '깨끗한 물과 위생', color: '#26BDE2' },
	{ label: '깨끗한 에너지', color: '#FCC30B' },
	{ label: '일자리와 경제성장', color: '#A21942' },
	{ label: '산업·혁신·기반시설', color: '#FD6925' },
	{ label: '불평등 감소', color: '#DD1367' },
	{ label: '도시와 공동체', color: '#FD9D24' },
	{ label: '생산과 소비', color: '#BF8B2E' },
	{ label: '기후변화 대응', color: '#3F7E44' },
	{ label: '해양생태계', color: '#0A97D9' },
	{ label: '육상생태계', color: '#56C02B' },
	{ label: '정의·평화·제도', color: '#00689D' },
	{ label: '지구촌 협력', color: '#19486A' }
]

const MAP_HINT_IMG = '/pub/images/mission/hint_map_library.svg'
const NEXT_ZONE_MAP = '/pub/images/mission/map_next_zone.svg'

const libraryCode: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm1-library-code',
	stepLabel: 'STEP3. 미션수행 — 러닝도서관 · 시작 미션',
	quest: '괴물을 잠재우려면 러닝 도서관을 탈출해야 한다.\n울산광역시미래교육관의 기록과 지속가능발전교육의 흔적을 찾아 *4자리 비밀번호*를 입력하라.',
	keypad: 'NUMERIC',
	answer: '1317',
	hints: [
		{
			at: 120,
			text: '러닝도서관 1층과 2층 맵이 뜨고, 힌트가 되는 부분이 표시된다. — 17개 목표가 있는 곳(1층 서가), 1층 바닥',
			imageUrl: MAP_HINT_IMG,
			imageCaption: 'map_1f.png · 붉은 점선 = 힌트가 되는 부분 (17개 목표가 있는 곳 · 1층 바닥)'
		},
		{ at: 240, text: '2층에서 1층을 바라다보세요. 무슨 글자가 보이나요? 그 글자를 숫자로 나타내면? (예시: A = 3)' },
		{ at: 360, text: '울산광역시미래교육관에서 배우고자 하는 것이 무엇일까? 그 목표는 몇 개일까요?' },
		{ at: 480, text: '두 숫자를 조합하세요.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *지구존*으로 이동하세요.',
	nextZone: { name: '지구존', mapImageUrl: NEXT_ZONE_MAP, pingX: 21, pingY: 34 }
}

const earthBoard: MissionPuzzle = {
	type: 'E2_BOARD',
	id: 'm1-earth-board',
	stepLabel: 'STEP3. 미션수행 — 지구존 · E-15 지구를 생각하는 생산과 소비',
	quest: '괴물을 잠재우기 위해 쓰레기가 더 버려지지 않도록 해야 해요.\n콘텐츠 내용 중에서 다음에 해당하는 문구를 찾으세요.',
	blanksLabel: '○○ ○○○ ○○',
	front: [
		['착', '소', '작', '가', '하'],
		['쓰', '는', '속', '과', '능'],
		['전', '지', '한', '기', '구'],
		['개', '비', '레', '출', '상'],
		['생', '구', '지', '산', '발']
	],
	back: [
		['u', 'l', 'a', 'f', 'j'],
		['k', 'm', 'n', 'c', 'q'],
		['17', 'i', 'p', 'o', 'b'],
		['d', 'e', 'x', 'g', 'z'],
		['c', 'w', 'r', 'y', 'h']
	],
	answer: 'upcycle',
	frontAnswer: '착한생산과소비',
	hints: [{ at: 300, text: '지속가능발전교육과 관련된 영어 단어입니다.' }],
	correctMessage: '정답입니다. 다음 미션을 위해 *미래존*으로 이동하세요.',
	nextZone: { name: '미래존', mapImageUrl: NEXT_ZONE_MAP, pingX: 51, pingY: 34 }
}

const futureDiff: MissionPuzzle = {
	type: 'E4_DIFF',
	id: 'm1-future-diff',
	stepLabel: 'STEP3. 미션수행 — 미래존 · F-03 서로 다른 한 끼',
	quest: '두 그림에서 *다른 곳 5군데*를 찾아 오른쪽 그림을 터치하세요.',
	imageAUrl: '/pub/images/mission/diff_tray_a.svg',
	imageBUrl: '/pub/images/mission/diff_tray_b.svg',
	imageALabel: 'A — 급식이 담긴 식판',
	imageBLabel: 'B — 음식이 남은 식판',
	spots: [
		{ x: 22, y: 30, radius: 11 },
		{ x: 52, y: 22, radius: 11 },
		{ x: 78, y: 44, radius: 11 },
		{ x: 35, y: 68, radius: 11 },
		{ x: 68, y: 74, radius: 11 }
	],
	hints: [{ at: 180, text: '식판 위 반찬의 색과 개수를 비교해 보세요.' }]
}

const futureSdgsSelect: MissionPuzzle = {
	type: 'E3_SELECT',
	id: 'm1-future-sdgs',
	stepLabel: 'STEP3. 미션수행 — 미래존 · SDGs 목표 선택',
	quest: '다음 화면은 지속가능발전에 관련된 17개의 목표입니다. *서로 다른 한 끼*와 관련 있는 지속가능발전목표를 클릭하여 정답을 찾아보세요. *정답의 개수는 비밀입니다.*',
	items: SDGS,
	answerIndexes: [0, 1],
	labelRevealAfterSec: 180,
	hints: [{ at: 180, text: '식탁·먹거리와 가장 가까운 목표 두 가지를 떠올려 보세요.' }],
	correctMessage: '정답입니다. 다음 미션을 위해 *사회존*으로 이동하세요.',
	nextZone: { name: '사회존', mapImageUrl: NEXT_ZONE_MAP, pingX: 80, pingY: 34 }
}

const socialMatch: MissionPuzzle = {
	type: 'E3_MATCH',
	id: 'm1-social-match',
	stepLabel: 'STEP3. 미션수행 — 사회존 · S-14 일하는 어린이',
	quest: '여기 4명의 친구가 지속가능한 지구를 위해 각자 의미 있는 물건을 딱 하나씩만 가지고 있습니다. 아래 단서를 읽고 물건을 연결해 주세요.',
	clues: [
		"단서 1  1번 친구와 3번 친구 중 한 명은 버려진 페트병을 새활용한 '친환경 옷'을 입고 있습니다.",
		'단서 2  2번 친구가 가진 물건은 전기가 필요하거나 달콤하게 먹을 수 있는 것이 아닙니다.',
		"단서 3  3번 친구는 버려진 전자폐기물에서 금속을 추출해 다시 만든 '핸드폰'을 가지고 있습니다.",
		'단서 4  4번 친구는 아동 노동 없이 만든 둥근 물건을 가지고 있지 않습니다.'
	],
	left: ['1번 친구', '2번 친구', '3번 친구', '4번 친구'],
	right: ['옷', '축구공', '핸드폰', '초콜릿'],
	answerMap: [0, 1, 2, 3],
	hints: [{ at: 180, text: '단서 3부터 확정한 뒤 단서 1을 적용해 보세요.' }]
}

const socialLock: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm1-social-lock',
	stepLabel: 'STEP3. 미션수행 — 사회존 · 자물쇠 코드',
	quest: '정답을 맞추면 *Sustainable Development Goals* 라는 영어가 나타납니다. 아래 자물쇠의 비밀번호를 완성하세요.\n※ 마지막 s는 소문자로 고정 제시됩니다.',
	keypad: 'ALPHA',
	answer: 'SDG',
	alphaKeys: 'SDGABCEIOU',
	fixedSuffix: 's',
	hints: [{ at: 180, text: 'Sustainable Development Goals의 머리글자입니다.' }],
	correctMessage: '정답을 맞췄다면 *러닝도서관*으로 가서 최종 미션을 풀어 괴물을 잠재워 주세요!',
	nextZone: { name: '러닝도서관', mapImageUrl: NEXT_ZONE_MAP, pingX: 36, pingY: 70 }
}

/** 최종 미션은 전 미션 공용 (LSS-3.4.14) */
const finalMemory: MissionPuzzle = {
	type: 'E5_MEMORY',
	id: 'shared-final-memory',
	stepLabel: 'STEP3. 미션수행 — 러닝도서관 · 최종 미션',
	quest: '이제 마지막입니다. 괴물이 국가지속가능발전목표를 다 뒤집어 놓았습니다. *같은 목표끼리* 배치해서 지속가능한 미래를 만들어주세요!\n※ 색상 카드 ↔ 목표 문구 카드를 짝짓는 이형 쌍입니다. 원문 17쌍, 시연은 8쌍으로 축약.',
	pairs: SDGS,
	pairCount: 8,
	columns: 8,
	wrongTriggersQuiz: true,
	hints: []
}

/** 오답 시 출제되는 SDGs 문제은행 — 프로토타입(mission_proto) 전용 샘플. 실화면은 관리자 은행을 세션으로 받는다 */
const quizBank: QuizQuestion[] = [
	{ question: '지속가능발전목표(SDGs)는 총 17개이다.', options: ['O', 'X'], answerIndex: 0 },
	{ question: '업사이클링은 버려진 물건을 그대로 다시 쓰는 것이다.', options: ['O', 'X'], answerIndex: 1 },
	{
		question: '다음 중 재활용이 가능한 것은?',
		options: ['① 음식물이 묻은 종이', '② 기름 묻은 비닐', '③ 깨끗이 씻은 페트병', '④ 깨진 도자기'],
		answerIndex: 2
	},
	{ question: '공정무역은 생산자에게 정당한 대가를 지불하는 무역이다.', options: ['O', 'X'], answerIndex: 0 }
]

export const mission1Program: MissionProgramPuzzles = {
	key: 'm1',
	tabLabel: '미션1 · 소비습관구출작전',
	name: '미션1 소비습관구출작전',
	sourceNote: '근거 문서 (개발자용 버전) 미션 프로그램 1번(0703).hwpx · 관리자 등록값이 화면에 어떻게 렌더되는지 확인용',
	story: {
		name: '스토리 제시',
		stepLabel: 'STEP1. 미션 제시 — 스토리',
		paragraphs: [
			'무심코 사고, 버린 물건들이 모여 *괴물*이 되었어요. 과소비와 낭비, 한 번 쓰고 버리는 습관이 이 괴물을 키우고 있습니다. 괴물을 잠재우려면, 러닝도서관에서 시작해서 미래교육관 곳곳에 있는 미션들을 완료해야 합니다.',
			'이 미션을 완료하는 방법은 간단합니다. 미션의 답을 숨겨놓은 곳을 찾아가 즐겁게 참가하면 됩니다.'
		],
		team: { label: 'A동선', size: 5, routeOrder: '지구존 → 미래존 → 사회존 → 러닝도서관' }
	},
	stickerCount: 5,
	done: {
		stepLabel: '미션 완료',
		emoji: '🎉',
		title: '축하합니다. 괴물을 잠재웠습니다. 미션 완료!',
		text: '스티커 5개를 모두 모았습니다. 태블릿을 선생님께 반납해 주세요.'
	},
	zones: [
		{ name: '러닝도서관', puzzles: [libraryCode] },
		{ name: '지구존', puzzles: [earthBoard] },
		{ name: '미래존', puzzles: [futureDiff, futureSdgsSelect] },
		{ name: '사회존', puzzles: [socialMatch, socialLock] },
		{ name: '최종 미션', puzzles: [finalMemory] }
	],
	quizBank
}

/* ══════════════════════════════════════════════════════════
   미션2 이상한 날씨 해결 작전 — 근거 미확보(0718 합본 미수령) 가설 사양
   ══════════════════════════════════════════════════════════ */

const m2LibraryCode: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm2-library-code',
	stepLabel: 'STEP3. 미션수행 — 러닝도서관 · 시작 미션',
	quest: '이상한 날씨의 기록이 잠긴 서고를 열어야 합니다.\n기후 기록에서 단서를 찾아 *4자리 비밀번호*를 입력하라.',
	keypad: 'NUMERIC',
	answer: '1727',
	hints: [
		{
			at: 120,
			text: '서가에 꽂힌 기후 연표의 첫 해와 마지막 해를 찾아보세요.',
			imageUrl: MAP_HINT_IMG,
			imageCaption: 'map_1f.png · 붉은 점선 = 힌트가 되는 부분'
		},
		{ at: 240, text: '두 숫자를 이어 붙이면 네 자리가 됩니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *지구존*으로 이동하세요.',
	nextZone: { name: '지구존', mapImageUrl: NEXT_ZONE_MAP, pingX: 21, pingY: 34 }
}

const m2EarthJamo: MissionPuzzle = {
	type: 'E1_JAMO',
	id: 'm2-earth-jamo',
	stepLabel: 'STEP3. 미션수행 — 지구존 · E-09 지구의 온도변화',
	quest: '지구가 뜨거워지는 것을 막아야 이상한 날씨가 멈춥니다.\n콘텐츠 속 색깔 단서를 찾아 *여덟 글자*를 완성하세요.',
	answer: '지구온도상승막자',
	colorClues: [
		{ pos: 2, jamo: 'ㄱ', color: '#e11d48' },
		{ pos: 4, jamo: 'ㄷ', color: '#1d4ed8' },
		{ pos: 6, jamo: 'ㅅ', color: '#15803d' },
		{ pos: 8, jamo: 'ㅈ', color: '#ea580c' }
	],
	hints: [
		{
			at: 180,
			text: '전시물 패널에서 같은 색으로 표시된 자모를 찾아보세요.',
			imageUrl: '/pub/images/mission/clue_e09.svg',
			imageCaption: 'clue_e09.png · 패널 오른쪽에 색깔 자모가 순번과 함께 붙어 있다' + CAUTION_IMG_SUFFIX
		},
		{ at: 300, text: '지구의 온도가 오르는 것을 막자는 뜻의 여덟 글자입니다. 지 · 구 · 온 · 도 로 시작합니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *미래존*으로 이동하세요.',
	nextZone: { name: '미래존', mapImageUrl: NEXT_ZONE_MAP, pingX: 51, pingY: 34 }
}

const m2FutureSort: MissionPuzzle = {
	type: 'E3_SORT',
	id: 'm2-future-sort',
	stepLabel: 'STEP3. 미션수행 — 미래존 · F-06 사건의 순서',
	quest: '기후와 감염병 사건을 *일어난 순서대로* 정렬하세요. 제자리를 찾으면 글자가 이어져 문장이 됩니다.\n※ 연도는 정답을 맞힌 뒤에 공개됩니다.',
	items: [
		{ label: '흑사병 대유행', sortKey: 1347, letter: '함' },
		{ label: '콜레라 1차 대유행', sortKey: 1817, letter: '께' },
		{ label: '스페인 독감', sortKey: 1918, letter: '협' },
		{ label: '런던 스모그 사건', sortKey: 1952, letter: '력' },
		{ label: '몬트리올 의정서 채택', sortKey: 1987, letter: '준' },
		{ label: '사스(SARS)', sortKey: 2003, letter: '비' },
		{ label: '신종플루', sortKey: 2009, letter: '하' },
		{ label: '메르스(MERS)', sortKey: 2015, letter: '는' },
		{ label: '파리협정 발효', sortKey: 2016, letter: '사' },
		{ label: '코로나19 대유행', sortKey: 2020, letter: '회' }
	],
	answerWord: '함께협력준비하는사회',
	hints: [
		{ at: 180, text: '가장 오래된 사건은 중세에 일어났습니다.' },
		{ at: 300, text: '첫 글자는 「함」으로 시작합니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *사회존*으로 이동하세요.',
	nextZone: { name: '사회존', mapImageUrl: NEXT_ZONE_MAP, pingX: 80, pingY: 34 }
}

const m2SocialGrid: MissionPuzzle = {
	type: 'E2_GRID',
	id: 'm2-social-grid',
	stepLabel: 'STEP3. 미션수행 — 사회존 · S-07 우리 마을은 변신 중',
	quest: '암호표를 *제시된 순서대로* 터치하세요. 순서가 틀리면 처음부터 다시 시작합니다.',
	cellCount: 18,
	columns: 6,
	sequence: [7, 3, 5, 11, 18],
	word: '울산태화강',
	hints: [
		{
			at: 180,
			text: '우리 지역을 가로지르는 강의 이름입니다.',
			imageUrl: '/pub/images/mission/clue_s07.svg',
			imageCaption: 'clue_s07.png · 지도를 가로지르는 물줄기의 이름을 찾으세요' + CAUTION_IMG_SUFFIX
		}
	],
	correctMessage: '정답을 맞췄다면 *러닝도서관*으로 가서 최종 미션을 풀어 주세요!',
	nextZone: { name: '러닝도서관', mapImageUrl: NEXT_ZONE_MAP, pingX: 36, pingY: 70 }
}

export const mission2Program: MissionProgramPuzzles = {
	key: 'm2',
	tabLabel: '미션2 · 이상한 날씨 해결 작전',
	name: '미션2 이상한 날씨 해결 작전',
	sourceNote: '관리자 등록값이 화면에 어떻게 렌더되는지 확인용',
	caution: CAUTION_UNCONFIRMED,
	story: {
		name: '스토리 제시',
		stepLabel: 'STEP1. 미션 제시 — 스토리',
		paragraphs: [
			'겨울에 꽃이 피고, 여름에는 비가 그치지 않습니다. 우리가 내뿜은 온실가스가 쌓여 *이상한 날씨*를 만들어 냈어요. 날씨를 되돌리려면 러닝도서관에서 시작해 미래교육관 곳곳의 미션을 완료해야 합니다.'
		],
		team: { label: 'B동선', size: 5, routeOrder: '지구존 → 미래존 → 사회존 → 러닝도서관' }
	},
	stickerCount: 5,
	done: {
		stepLabel: '미션 완료',
		emoji: '🎉',
		title: '축하합니다. 이상한 날씨를 되돌렸습니다. 미션 완료!',
		text: '스티커 5개를 모두 모았습니다. 태블릿을 선생님께 반납해 주세요.'
	},
	zones: [
		{ name: '러닝도서관', puzzles: [m2LibraryCode] },
		{ name: '지구존', puzzles: [m2EarthJamo] },
		{ name: '미래존', puzzles: [m2FutureSort] },
		{ name: '사회존', puzzles: [m2SocialGrid] },
		{ name: '최종 미션', puzzles: [finalMemory] }
	],
	quizBank
}

/* ══════════════════════════════════════════════════════════
   미션3 미래를 위한 오늘의 실천 작전 — 근거 미확보(0718 합본 미수령) 가설 사양
   ══════════════════════════════════════════════════════════ */

const m3LibraryCode: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm3-library-code',
	stepLabel: 'STEP3. 미션수행 — 러닝도서관 · 시작 미션',
	quest: '미래에서 온 편지가 잠긴 상자 안에 있습니다.\n러닝도서관을 둘러보고 *4자리 비밀번호*를 입력하라.',
	keypad: 'NUMERIC',
	answer: '1745',
	hints: [
		{
			at: 120,
			text: '서가 번호와 층수를 이어 보세요.',
			imageUrl: MAP_HINT_IMG,
			imageCaption: 'map_1f.png · 붉은 점선 = 힌트가 되는 부분'
		},
		{ at: 240, text: '앞의 두 자리는 17입니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *지구존*으로 이동하세요.',
	nextZone: { name: '지구존', mapImageUrl: NEXT_ZONE_MAP, pingX: 21, pingY: 34 }
}

const ARROW_SEQ = '↑→→↓←↓→'

/** 지구존 E-16은 문제(암기) 화면과 입력 화면이 분리된다 — 존 안에서 INFO → 입력 순으로 이어진다 */
const m3EarthMemorize: MissionPuzzle = {
	type: 'INFO',
	id: 'm3-earth-memorize',
	stepLabel: 'STEP3. 미션수행 — 지구존 · E-16 착한 소비 (문제)',
	quest: '진열대를 따라 이동한 *순서를 기억하세요.*\n※ 다음 화면에서는 문제가 보이지 않습니다.',
	imagePlaceholder: '진열대 배치 이미지 (전시 콘텐츠 확정 후 교체)',
	displayText: ARROW_SEQ,
	notice: '다음 화면에서는 문제가 보이지 않습니다. 순서를 기억하세요.',
	buttonLabel: '입력하러 가기',
	answerNote: `외워야 할 순서는 ${Array.from(ARROW_SEQ).join(' ')} 입니다. 다음 화면에서는 이 문제가 감춰집니다.`,
	hints: []
}

const m3EarthArrow: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm3-earth-arrow',
	stepLabel: 'STEP3. 미션수행 — 지구존 · E-16 착한 소비 (입력)',
	quest: '기억한 순서대로 *방향키*를 눌러 주세요.',
	keypad: 'ARROW',
	answer: ARROW_SEQ,
	hints: [
		{
			at: 180,
			text: '진열대 배치를 다시 보여드립니다. 처음 두 방향만 공개됩니다.',
			imageUrl: '/pub/images/mission/clue_e16.svg',
			imageCaption: 'clue_e16.png · 처음 두 방향만 다시 보여준다' + CAUTION_IMG_SUFFIX
		},
		{ at: 300, text: '오른쪽이 세 번 나옵니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *미래존*으로 이동하세요.',
	nextZone: { name: '미래존', mapImageUrl: NEXT_ZONE_MAP, pingX: 51, pingY: 34 }
}

const m3FutureSlot: MissionPuzzle = {
	type: 'E1_SLOT',
	id: 'm3-future-slot',
	stepLabel: 'STEP3. 미션수행 — 미래존 · F-08 나의 미래 직업과 AI',
	quest: '슬롯을 돌려 *미래 직업으로 가는 길*을 완성하세요.\n※ 슬롯마다 글자판 12종이 순환합니다.',
	reels: [
		['가', '나', '데', '로', '미', '바', '사', '아', '자', '차', '카', '타'],
		['이', '오', '우', '아', '어', '여', '요', '유', '으', '의', '에', '애'],
		['터', '타', '토', '투', '트', '티', '태', '테', '튀', '텨', '툰', '툴'],
		['분', '불', '반', '본', '빈', '붐', '북', '밥', '발', '별', '병', '부'],
		['석', '삭', '속', '숙', '신', '산', '선', '솔', '술', '성', '승', '시']
	],
	answer: '데이터분석',
	hints: [
		{ at: 180, text: '자료를 모아 뜻을 읽어내는 일을 부르는 말입니다.' },
		{ at: 300, text: '「데」로 시작하는 다섯 글자입니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *사회존*으로 이동하세요.',
	nextZone: { name: '사회존', mapImageUrl: NEXT_ZONE_MAP, pingX: 80, pingY: 34 }
}

const m3SocialCode: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm3-social-code',
	stepLabel: 'STEP3. 미션수행 — 사회존 · S-01 오늘의 실천',
	quest: '오늘 실천할 수 있는 일들이 번호로 붙어 있습니다.\n안내판을 읽고 *7자리 숫자*를 입력하라.',
	keypad: 'NUMERIC',
	answer: '1091011',
	hints: [
		{ at: 180, text: '지속가능발전목표 번호를 이어 붙인 숫자입니다.' },
		{ at: 300, text: '10 · 9 · 10 · 11 순서로 이어집니다.' }
	],
	correctMessage: '정답을 맞췄다면 *러닝도서관*으로 가서 최종 미션을 풀어 주세요!',
	nextZone: { name: '러닝도서관', mapImageUrl: NEXT_ZONE_MAP, pingX: 36, pingY: 70 }
}

export const mission3Program: MissionProgramPuzzles = {
	key: 'm3',
	tabLabel: '미션3 · 미래를 위한 오늘의 실천',
	name: '미션3 미래를 위한 오늘의 실천 작전',
	sourceNote: '관리자 등록값이 화면에 어떻게 렌더되는지 확인용',
	caution: CAUTION_UNCONFIRMED,
	story: {
		name: '스토리 제시',
		stepLabel: 'STEP1. 미션 제시 — 스토리',
		paragraphs: [
			'미래에서 온 편지가 도착했습니다. 지금 우리가 무엇을 하느냐에 따라 *미래의 모습*이 달라진다고 해요. 오늘 할 수 있는 실천을 찾아 미래교육관 곳곳의 미션을 완료해 주세요.'
		],
		team: { label: 'C동선', size: 5, routeOrder: '지구존 → 미래존 → 사회존 → 러닝도서관' }
	},
	stickerCount: 5,
	done: {
		stepLabel: '미션 완료',
		emoji: '🎉',
		title: '축하합니다. 오늘의 실천을 모두 찾았습니다. 미션 완료!',
		text: '스티커 5개를 모두 모았습니다. 태블릿을 선생님께 반납해 주세요.'
	},
	zones: [
		{ name: '러닝도서관', puzzles: [m3LibraryCode] },
		{ name: '지구존', puzzles: [m3EarthMemorize, m3EarthArrow] },
		{ name: '미래존', puzzles: [m3FutureSlot] },
		{ name: '사회존', puzzles: [m3SocialCode] },
		{ name: '최종 미션', puzzles: [finalMemory] }
	],
	quizBank
}

/* ══════════════════════════════════════════════════════════
   추가미션 울산광역시미래교육관을 찾아라! (QR 수집)
   ※ QR 개수(10)와 그림 분할 수(12)가 맞지 않는다 — 원문 미해결, 발주처 확정 필요
   ══════════════════════════════════════════════════════════ */

const extraQrCollect: MissionPuzzle = {
	type: 'E6_QR',
	id: 'mx-qr-collect',
	stepLabel: '추가미션 — QR 수집',
	quest: 'QR을 찾아 스캔하세요. 이미 스캔한 QR은 다시 반영되지 않습니다.\n※ 실기기에서는 카메라 권한이 필요합니다. 프로토타입에서는 버튼으로 스캔을 대체합니다.',
	qrCount: 10,
	fragmentCount: 12,
	hints: []
}

export const missionExtraProgram: MissionProgramPuzzles = {
	key: 'mx',
	tabLabel: '추가미션 · QR 수집',
	name: '추가미션 울산광역시미래교육관을 찾아라!',
	sourceNote: '관리자 등록값이 화면에 어떻게 렌더되는지 확인용',
	caution: CAUTION_UNCONFIRMED,
	story: {
		name: '추가미션 안내',
		stepLabel: '추가미션 — 안내',
		paragraphs: [
			'미래교육관 곳곳에 *QR 코드*가 숨어 있습니다. 찾아서 스캔할 때마다 가려진 그림이 한 조각씩 열립니다. 모두 찾아 그림을 완성해 보세요.'
		],
		notice: '난간에 매달리거나 위험한 곳에는 숨겨져 있지 않으니, 안전에 유의하세요.'
	},
	stickerCount: 0,
	done: {
		stepLabel: '추가미션 완료',
		emoji: '🧩',
		title: 'QR을 모두 찾았습니다!',
		text: '남은 조각 2개는 QR 개수 확정 후 채워집니다.'
	},
	zones: [{ name: 'QR 수집', puzzles: [extraQrCollect] }],
	quizBank
}

export const MISSION_PROGRAMS: MissionProgramPuzzles[] = [mission1Program, mission2Program, mission3Program, missionExtraProgram]

const normalizeName = (value: string) => value.replace(/[\s·*]/g, '')

export const normalizeMissionZoneName = (value: string) => {
	const normalized = normalizeName(value)
	return normalized === '도서관' || normalized === '도서관존' || normalized === '러닝도서관'
		? '러닝도서관'
		: value.trim()
}

export const missionProgramForName = (programName: string | undefined): MissionProgramPuzzles | null => {
	if (!programName) return null
	const key = normalizeName(programName)
	const exact = MISSION_PROGRAMS.find((item) =>
		normalizeName(item.name) === key ||
		normalizeName(item.tabLabel) === key ||
		(item.aliases ?? []).some((alias) => normalizeName(alias) === key)
	)
	if (exact) return exact
	if (key.startsWith('미션1')) return mission1Program
	if (key.startsWith('미션2')) return mission2Program
	if (key.startsWith('미션3')) return mission3Program
	if (key.includes('소비습관') && key.includes('구출작전')) return mission1Program
	if (key.includes('이상한날씨') && key.includes('해결작전')) return mission2Program
	if (key.includes('미래') && key.includes('오늘') && key.includes('실천')) return mission3Program
	return null
}

export const missionZoneForRoute = (program: MissionProgramPuzzles, routeName: string): MissionZonePuzzles | null => {
	const routeKey = normalizeName(normalizeMissionZoneName(routeName))
	return program.zones.find((zone) => normalizeName(normalizeMissionZoneName(zone.name)) === routeKey) ?? null
}

/**
 * 예약에 연결된 미션 프로그램 + 존 이름으로 퍼즐을 찾는다.
 * 프로그램명이 위 목록에 없으면 빈 배열 — 퍼즐 없이 관리자 활동지 문항만 나온다.
 * 관리자에서 프로그램명을 바꿨다면 해당 프로그램의 name 또는 aliases에 추가해야 한다.
 */
export const missionPuzzlesFor = (programName: string | undefined, zoneName: string | undefined): MissionPuzzle[] => {
	if (!programName || !zoneName) return []
	const program = missionProgramForName(programName)
	if (!program) return []
	const zone = missionZoneForRoute(program, zoneName)
	return zone?.puzzles ?? []
}

/**
 * 퍼즐 id → EDU_LRN_ANS.QSTN_SN 으로 저장할 안정적인 양수 (djb2).
 * 퍼즐 답안은 CNTN_SN=0으로 저장되므로 관리자 문항 번호와 충돌하지 않는다.
 * **퍼즐 id를 바꾸면 그 퍼즐의 기존 답안 매칭이 끊긴다.**
 */
export const puzzleQuestionSn = (puzzleId: string): number => {
	let hash = 5381
	for (let index = 0; index < puzzleId.length; index += 1) {
		hash = ((hash * 33) ^ puzzleId.charCodeAt(index)) >>> 0
	}
	return hash % 1_000_000_000
}

/**
 * 학습결과에 남길 정답값 — 엔진마다 정답이 담긴 필드가 다르다.
 * 빈 문자열이면 답안을 남기지 않는다 (INFO는 판정이 없어 답이 없다).
 */
export const puzzleAnswerValue = (puzzle: MissionPuzzle): string => {
	switch (puzzle.type) {
		case 'INFO':
			return ''
		case 'E1_CODE':
			return `${puzzle.answer}${puzzle.fixedSuffix || ''}`
		case 'E1_JAMO':
		case 'E1_SLOT':
		case 'E2_BOARD':
			return puzzle.answer
		case 'E2_GRID':
			return puzzle.word
		case 'E3_SORT':
			return puzzle.answerWord
		case 'E3_SELECT':
			return puzzle.answerIndexes.map((index) => `${index + 1}. ${puzzle.items[index]?.label || ''}`).join(', ')
		case 'E3_MATCH':
			return puzzle.answerMap.map((right, left) => `${puzzle.left[left]} → ${puzzle.right[right]}`).join(', ')
		case 'E4_DIFF':
			return `다른 곳 ${puzzle.spots.length}군데`
		case 'E5_MEMORY':
			return `${Math.min(puzzle.pairCount ?? puzzle.pairs.length, puzzle.pairs.length)}쌍 완성`
		case 'E6_QR':
			return `QR ${puzzle.qrCount}개소 수집`
	}
}

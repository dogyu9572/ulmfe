import { pubUrl } from '../config'
// 미션 퍼즐 하드코딩 데이터 — 관리자에 등록하지 않고 여기서 관리한다. 실화면(MissionStepQuestPage)과 프로토타입이 함께 읽는다
import type { MissionPuzzle, QuizQuestion } from './missionPuzzleTypes'
import { stripEmphasisMarkers } from '../utils/emphasisText'

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
	/** 프로그램명 아래 한 줄 소개 — 관리자 간단설명(simpleExpln)이 비어 있을 때 쓴다 */
	summary?: string
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

const CAUTION_UNCONFIRMED = '자산 미도착 — 0728 확정본의 사양은 반영했으나, 전시 콘텐츠 이미지와 진열대 배치가 아직 오지 않아 일부를 더미로 채웠습니다. 실물 자산 도착 후 교체가 필요합니다 (docs/06_MISSION_SPEC_GAP_0728.md 참고).'
const CAUTION_IMG_SUFFIX = ' · 더미 이미지 — 실물 자산 도착 후 교체 필요'
const COMMON_MISSION_DONE = {
	stepLabel: '미션 완료',
	emoji: '🎉',
	text: '스티커 5개를 모두 모았습니다. 태블릿을 선생님께 반납해 주세요.'
}

/** SDGs 17개 목표 — E3 선택·E5 기억력 공용 */
export const SDGS: { label: string; color: string }[] = [
	{ label: '빈곤층 감소와 사회안전망 강화', color: '#E5243B' },
	{ label: '식량 안보 및 지속 가능한 농업 강화', color: '#DDA63A' },
	{ label: '건강하고 행복한 삶 보장', color: '#4C9F38' },
	{ label: '모두를 위한 양질의 교육', color: '#C5192D' },
	{ label: '성평등 보장', color: '#FF3A21' },
	{ label: '건강하고 안전한 물관리', color: '#26BDE2' },
	{ label: '에너지 친환경적 생산과 소비', color: '#FCC30B' },
	{ label: '좋은 일자리 확대와 경제 성장', color: '#A21942' },
	{ label: '산업의 성장과 혁신 활성화 및 사회 기반 시설 구축', color: '#FD6925' },
	{ label: '모든 종류의 불평등 해소', color: '#DD1367' },
	{ label: '지속가능한 도시와 주거지 조성', color: '#FD9D24' },
	{ label: '지속가능한 생산과 소비', color: '#BF8B2E' },
	{ label: '기후변화와 대응', color: '#3F7E44' },
	{ label: '해양생태계 보전', color: '#0A97D9' },
	{ label: '육상생태계 보전', color: '#56C02B' },
	{ label: '평화 ˙ 정의 ˙ 포용', color: '#00689D' },
	{ label: '지구촌 협력 강화', color: '#19486A' },
	{ label: 'K-SDGs', color: '#fff' }
]

const MAP_HINT_IMG = pubUrl('/pub/images/mission/hint_map_library.svg')
export const NEXT_ZONE_MAP = pubUrl('/pub/images/mission/map_next_zone.svg')

const libraryCode: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm1-library-code',
	stepLabel: 'STEP1. 미션수행 — 러닝도서관 · 시작 미션',
	cardTitle: '지속가능발전교육의 흔적을 찾아라',
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

/** 문제 보기 버튼으로 콘텐츠를 찾아가게 하는 안내 화면 — 이미지는 콘텐츠 일부만 비춘다 */
const earthFind: MissionPuzzle = {
	type: 'INFO',
	id: 'm1-earth-find',
	stepLabel: 'STEP2. 미션수행 — 지구존 · 콘텐츠 찾기',
	cardTitle: '지구를 생각하는 생산과 소비',
	quest: '괴물을 잠재우기 위해 쓰레기가 더 버려지지 않도록 해야 해요. 문제 보기 버튼을 눌러 그림에 해당하는 콘텐츠를 찾으세요. 콘텐츠 속에서 단서를 찾아 비밀번호를 입력해서 쓰레기가 버려지는 것을 막으세요!',
	imagePlaceholder: 'E-15 콘텐츠 일부 이미지 — 어떤 콘텐츠인지 추측할 수 있도록 일부만 비춘다' + CAUTION_IMG_SUFFIX,
	notice: '콘텐츠 속에서 단서를 찾아 비밀번호를 입력해서 쓰레기가 버려지는 것을 막으세요!',
	buttonLabel: '문제 보기',
	hints: []
}

const earthBoard: MissionPuzzle = {
	type: 'E2_BOARD',
	id: 'm1-earth-board',
	stepLabel: 'STEP2. 미션수행 — 지구존 · E-15',
	cardTitle: '지구를 생각하는 생산과 소비',
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

const futureDiffIntro: MissionPuzzle = {
	type: 'INFO',
	id: 'm1-future-diff-intro',
	stepLabel: 'STEP3. 미션수행 — 미래존 · 서로 다른 한 끼',
	cardTitle: '서로 다른 한 끼',
	quest: '서로괴물을 잠재우기 위해 과소비와 낭비를 막아야 해요. 어서 미래존으로 가서  단서를 찾아보세요.',
	imagePlaceholder: '이미지',
	buttonLabel: '다음',
	showBackButton: true,
	hints: []
}

/** 서로 다른 한 끼 안내 2쪽 — futureDiffIntro에서 「다음」으로 바로 이어지는 두 번째 이미지 화면 */
const futureDiffIntro2: MissionPuzzle = {
	type: 'INFO',
	id: 'm1-future-diff-intro2',
	stepLabel: 'STEP3. 미션수행 — 미래존 · 서로 다른 한 끼',
	cardTitle: '서로 다른 한 끼',
	quest: '서로괴물을 잠재우기 위해 과소비와 낭비를 막아야 해요. 어서 미래존으로 가서  단서를 찾아보세요.',
	imagePlaceholder: '이미지',
	buttonLabel: '문제보기',
	showBackButton: true,
	hints: []
}

const futureDiff1: MissionPuzzle = {
	type: 'E4_DIFF',
	id: 'm1-future-diff',
	stepLabel: 'STEP3. 미션수행 — 미래존 · F-03 다른 그림 찾기 (1)',
	cardTitle: '서로 다른 한 끼 1',
	quest: '설명 패널의 그림과 태블릿에서 제시된 그림을 비교하여 다른 곳 5군데를 찾아보세요.',
	imageBUrl: pubUrl('/pub/images/mission/diff_tray_b.svg'),
	imageBLabel: '태블릿 그림 — 다른 곳 5군데' + CAUTION_IMG_SUFFIX,
	referenceLabel: '「서로 다른 한 끼」 설명패널 (1번 그림)',
	referenceImageUrl: pubUrl('/pub/images/mission/diff_tray_a.svg'),
	spots: [
		{ x: 22, y: 30, radius: 11 },
		{ x: 52, y: 22, radius: 11 },
		{ x: 78, y: 44, radius: 11 },
		{ x: 35, y: 68, radius: 11 },
		{ x: 68, y: 74, radius: 11 }
	],
	hints: [{ at: 180, text: '식판 위 반찬의 색과 개수를 비교해 보세요.' }]
}

/** 다른그림찾기와 SDGs 선택 사이의 도착 확인 화면 — 활동시작을 눌러야 문제가 제시된다 (0728 메모4) */
const futureStart: MissionPuzzle = {
	type: 'INFO',
	id: 'm1-future-start',
	stepLabel: 'STEP3. 미션수행 — 미래존 · F-03 활동 시작',
	cardTitle: '지속가능발전목표',
	quest: '‘서로 다른 한 끼로 왔나요?’ 왔다면 활동시작을 눌러주세요.',
	buttonLabel: '활동 시작',
	contentBox: true,
	showBackButton: true,
	hints: []
}

const futureSdgsSelect: MissionPuzzle = {
	type: 'E3_SELECT',
	id: 'm1-future-sdgs',
	stepLabel: 'STEP3. 미션수행 — 미래존 · SDGs 목표 선택',
	cardTitle: '17가지 목표',
	quest: '다음 화면은 지속가능발전에 관련된 17개의 목표입니다. 서로 다른 한 끼와 관련 있는 지속가능발전목표를 클릭하여 정답을 찾아보세요. 정답의 개수는 비밀입니다.(몇 개를 고르든, 고르고 나서 정답 확인 버튼을 누른다.)',
	items: SDGS,
	answerIndexes: [0, 1],
	labelRevealAfterSec: 180,
	hints: [{ at: 180, text: '식탁·먹거리와 가장 가까운 목표 두 가지를 떠올려 보세요.' }],
	correctMessage: '정답입니다. 다음 미션을 위해 *사회존*으로 이동하세요.',
	nextZone: { name: '사회존', mapImageUrl: NEXT_ZONE_MAP, pingX: 80, pingY: 34 }
}

const socialMatchIntro: MissionPuzzle = {
	type: 'INFO',
	id: 'm1-social-match-intro',
	stepLabel: 'STEP3. 미션수행 — 사회존 · 일하는 어린이',
	cardTitle: '일하는 어린이',
	quest: '일하는 어린이 콘텐츠 이미지를 확인한 후 다음을 눌러 문제를 시작하세요.',
	imagePlaceholder: '이미지',
	buttonLabel: '문제보기',
	showBackButton: true,
	hints: []
}

const socialMatch: MissionPuzzle = {
	type: 'E3_CHOICE_SET',
	id: 'm1-social-match',
	stepLabel: 'STEP3. 미션수행 — 사회존 · S-14 일하는 어린이',
	cardTitle: '일하는 어린이',
	quest: '잘 살펴봤나요?\n여기 4명의 친구(1번, 2번, 3번, 4번)가 지속가능한 지구를 위해 각자 의미 있는 물건을 딱 하나씩만 가지고 있습니다. 물건은 초콜릿, 축구공, 옷, 핸드폰입니다.\n아래의 단서를 읽고, 질문의 답을 찾아 자물쇠의 비밀번호를 풀어주세요!',
	clues: [
		"*단서 1*  1번 친구와 3번 친구 중 한 명은 버려진 페트병을 새활용(업사이클)한 '친환경 옷'을 입고 있습니다.",
		'*단서 2*  2번 친구가 가진 물건은 전기가 필요하거나(핸드폰), 달콤하게 먹을 수 있는 것(초콜릿)이 아닙니다.',
		"*단서 3*  3번 친구는 버려진 전자폐기물에서 금속을 추출해 다시 만든 '핸드폰'을 가지고 있습니다.",
		'*단서 4*  4번 친구는 아동 노동 없이 만든 둥근 물건(축구공)을 가지고 있지 않습니다.'
	],
	items: ['1번 친구', '2번 친구', '3번 친구', '4번 친구'],
	options: ['초콜릿', '축구공', '옷', '핸드폰'],
	answerIndexes: [2, 1, 3, 0],
	hints: [{ at: 180, text: '단서 3부터 확정한 뒤 단서 1을 적용해 보세요.' }]
}

const socialLock: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm1-social-lock',
	stepLabel: 'STEP3. 미션수행 — 사회존 · 자물쇠 코드',
	cardTitle: 'Sustainable Development Goals!',
	quest: '아래 자물쇠의 비밀번호를 완성하세요.',
	keypad: 'ALPHA',
	answer: 'SDG',
	alphaKeys: 'SDGABCEIOU',
	fixedSuffix: 's',
	hints: [{ at: 180, text: 'Sustainable Development Goals의 머리글자입니다.' }],
	correctMessage: '정답을 맞췄다면 *러닝도서관*으로 가서 최종 미션을 풀어 괴물을 잠재워 주세요!',
	nextZone: { name: '러닝도서관', mapImageUrl: NEXT_ZONE_MAP, pingX: 36, pingY: 70 }
}

/**
 * 최종 미션에 난이도를 올리려고 덧붙인 로고 6쌍 (0728 확정본).
 * 카드 세트는 고정이고 위치만 매번 섞인다 (0728 메모8 — 셔플은 MemoryPuzzlePanel이 담당).
 * imageUrl은 실물 로고 자산이 오면 채운다.
 */
const FINAL_LOGOS: { label: string; color: string }[] = [
	{ label: '울산광역시', color: '#ffffff' },
	{ label: '고래', color: '#ffffff' },
	{ label: '울산광역시교육청', color: '#ffffff' },
	{ label: '태극기', color: '#ffffff' },
	{ label: '풀', color: '#ffffff' },
	{ label: 'UN', color: '#ffffff' }
]

/** 최종 미션은 전 미션 공용 (LSS-3.4.14) */

const finalMemoryIntro: MissionPuzzle = {
	type: 'INFO',
	id: 'shared-final-memory-intro',
	stepLabel: 'STEP3. 미션수행 — 러닝도서관 · 최종 미션 안내',
	cardTitle: '최종 미션! 기억력 게임',
	quest: '이제 마지막입니다. 국가지속가능발전목표가 다 헝클어졌습니다. \n같은 목표끼리 배치해서 지속가능한 미래를 만들어주세요!\n두 개를 골라 같은 쌍이면 뒤집혀 있고, 아니면 다시 뒤집힙니다! \n틀릴 때마다 지속가능발전교육 1문제 팝업되어 문제 풀고 나서 다시 기억력 게임을 진행해 주세요.',
	imagePlaceholder: '이미지',
	buttonLabel: '문제보기',
	showBackButton: true,
	hints: []
}

const finalMemory: MissionPuzzle = {
	type: 'E5_MEMORY',
	id: 'shared-final-memory',
	stepLabel: 'STEP3. 미션수행 — 러닝도서관 · 최종 미션',
	cardTitle: 'Sustainable Development Goals!',
	quest: '아래 자물쇠의 비밀번호를 완성하세요.',
	pairs: [...SDGS, ...FINAL_LOGOS],
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
	tabLabel: '미션1 · *소비습관*구출작전',
	name: '미션1 소비습관구출작전',
	summary: '괴물의 탄생을 막아라!',
	sourceNote: '근거 문서 미션 프로그램 최종합본_검토-답변 완료(0728) · 관리자 등록값이 화면에 어떻게 렌더되는지 확인용',
	caution: CAUTION_UNCONFIRMED,
	story: {
		name: '스토리 제시',
		stepLabel: 'STEP1. 미션 제시 — 스토리',
		paragraphs: [
			'무심코 사고, 버린 물건들이 모여 괴물이 되었어요. 과소비와 낭비, 한 번 쓰고 버리는 습관이 이 괴물을 키우고 있습니다. 괴물을 잠재우려면, 러닝도서관에서 시작해서 미래교육관 곳곳에 있는 미션들을 완료해야 합니다.',
			'이 미션을 완료하는 방법은 간단합니다. 미션의 답을 숨겨놓은 곳을 찾아가 즐겁게 참가하면 됩니다.'
		],
		team: { label: 'A동선', size: 5, routeOrder: '지구존 → 미래존 → 사회존 → 러닝도서관' }
	},
	stickerCount: 5,
	done: {
		...COMMON_MISSION_DONE,
		title: '축하합니다.\n괴물을 잠재웠습니다. 미션 완료!',
	},
	zones: [
		{ name: '러닝도서관', puzzles: [libraryCode] },
		{ name: '지구존', puzzles: [earthFind, earthBoard] },
		{ name: '미래존', puzzles: [futureDiffIntro, futureDiffIntro2, futureDiff1, futureStart, futureSdgsSelect] },
		{ name: '사회존', puzzles: [socialMatchIntro, socialMatch, socialLock] },
		{ name: '최종 미션', puzzles: [finalMemoryIntro, finalMemory] }
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
	cardTitle: '지속가능발전교육의 흔적을 찾아라',
	quest: '흰뺨검둥오리를 위해 미션을 완료하기 위해서는 러닝 도서관을 탈출해야 한다. \n울산광역시미래교육관의 기록과 지속가능발전교육의 흔적을 찾아 4자리 비밀 번호를 입력하라.',
	keypad: 'NUMERIC',
	answer: '1727',
	hints: [
		{
			at: 120,
			text: '러닝도서관 1층과 2층 맵이 뜨고, 힌트가 되는 부분이 표시된다. — 17개 목표가 있는 곳(1층 서가), 계단 전체',
			imageUrl: MAP_HINT_IMG,
			imageCaption: 'map_1f.png · 붉은 점선 = 힌트가 되는 부분 (17개 목표가 있는 곳 · 계단 전체)'
		},
		{ at: 240, text: '울산광역시미래교육관에서 배우고자 하는 것이 무엇일까? 그 목표는 몇 개일까요?' },
		{ at: 360, text: '지금 러닝도서관에서 에너지 절약을 위해 실천할 수 있는 방법은 무엇이 있을까요? 2층에는 어떻게 갈 수 있나요? 계단 1개를 오를 때 소모되는 칼로리는 0.15kcal입니다.' },
		{ at: 480, text: '두 숫자를 조합하세요.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *지구존*으로 이동하세요.',
	nextZone: { name: '지구존', mapImageUrl: NEXT_ZONE_MAP, pingX: 21, pingY: 34 }
}

const m2EarthJamo: MissionPuzzle = {
	type: 'E1_JAMO',
	id: 'm2-earth-jamo',
	stepLabel: 'STEP3. 미션수행 — 지구존 · E-09 지구의 온도변화',
	cardTitle: '지구의 온도 변화',
	quest: '지구가 뜨거워지는 것을 막아야 이상한 날씨가 멈춥니다.\n콘텐츠 속 색깔 단서를 찾아 *여덟 글자*를 완성하세요.',
	answer: '지구온도상승막자',
	// 메모9는 "다음쪽의 참고 사진처럼" 만들라고 회신했는데 그 콘텐츠 이미지가 아직 오지 않았다.
	// 지문을 우리가 지어내면 색상 자모가 실제로 칠해지지 않아 화면이 스스로 모순되므로, 원문이 올 때까지 passage를 비워 둔다.
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
			imageUrl: pubUrl('/pub/images/mission/clue_e09.svg'),
			imageCaption: 'clue_e09.png · 패널 오른쪽에 색깔 자모가 순번과 함께 붙어 있다' + CAUTION_IMG_SUFFIX
		},
		{ at: 300, text: '지구의 온도가 오르는 것을 막자는 뜻의 여덟 글자입니다. 지 · 구 · 온 · 도 로 시작합니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *미래존*으로 이동하세요.',
	nextZone: { name: '미래존', mapImageUrl: NEXT_ZONE_MAP, pingX: 51, pingY: 34 }
}

/** 팬데믹의 역사 앞 안내 화면 — 콘텐츠 이미지를 확인하고 「문제보기」로 넘어간다 (m1-social-match-intro와 동일 구성) */
const m2FutureSortIntro: MissionPuzzle = {
	type: 'INFO',
	id: 'm2-future-sort-intro',
	stepLabel: 'STEP3. 미션수행 — 미래존 · 팬데믹의 역사',
	cardTitle: '팬데믹의 역사',
	quest: '지구에 닥친 위기를 이겨내고 환경을 지켜야 해요. \n어서 미래존으로 가서 단서를 찾아보세요.',
	imagePlaceholder: '이미지',
	buttonLabel: '문제보기',
	showBackButton: true,
	hints: []
}

/** 팬데믹의 역사 도착 확인 화면 — 글자판이 3분·5분에 걸쳐 맞춰지고, 다 열려야 활동시작을 누를 수 있다 (m1-future-start와 같은 구조) */
const m2FutureStart: MissionPuzzle = {
	type: 'INFO',
	id: 'm2-future-start',
	stepLabel: 'STEP3. 미션수행 — 미래존 · F-06 활동 시작',
	cardTitle: '팬데믹의 역사',
	quest: '‘팬데믹의 역사’로 왔나요? 왔다면 활동시작을 눌러주세요.',
	buttonLabel: '활동 시작',
	contentBox: true,
	showBackButton: true,
	hints: []
}

const m2FutureSort: MissionPuzzle = {
	type: 'E3_SORT',
	id: 'm2-future-sort',
	stepLabel: 'STEP3. 미션수행 — 미래존 · F-06 팬데믹의 역사',
	cardTitle: '팬데믹의 역사가 전하는 것',
	quest: '팬데믹의 역사가 하고 싶은 말은 무엇일까요?\n팬데믹의 역사를 보고 순서를 파악합니다. 그림을 보고 팬데믹의 역사에서 어디에 해당하는 그림인지 파악합니다. ',
	items: [
		{ label: '흑사병', sortKey: 1347, letter: '함' },
		{ label: '콜레라', sortKey: 1817, letter: '께' },
		{ label: '스페인 독감', sortKey: 1918, letter: '협' },
		{ label: '아시아 독감', sortKey: 1957, letter: '력' },
		{ label: '홍콩 독감', sortKey: 1968, letter: '준' },
		{ label: '천연두 근절 선언', sortKey: 1980, letter: '비' },
		{ label: '사스(SARS)', sortKey: 2003, letter: '하' },
		{ label: '신종플루', sortKey: 2009, letter: '는' },
		{ label: '메르스(MERS)', sortKey: 2015, letter: '사' },
		{ label: '코로나19', sortKey: 2020, letter: '회' }
	],
	answerWord: '함께협력준비하는사회',
	hints: [
		{ at: 180, text: '가장 오래된 감염병은 중세에 퍼졌습니다.' },
		{ at: 300, text: '첫 글자는 「함」으로 시작합니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *사회존*으로 이동하세요.',
	nextZone: { name: '사회존', mapImageUrl: NEXT_ZONE_MAP, pingX: 80, pingY: 34 }
}

/** 우리 마을은 변신 중 앞 안내 화면 — 콘텐츠 이미지를 확인하고 「문제보기」로 넘어간다 */
const m2SocialGridIntro: MissionPuzzle = {
	type: 'INFO',
	id: 'm2-social-grid-intro',
	stepLabel: 'STEP3. 미션수행 — 사회존 · 우리 마을은 변신 중',
	cardTitle: '우리 마을은 변신 중',
	quest: '흰뺨검둥오리의 먹이가 안정적이고 건강한 생태계가 유지되려면 울산을 생태도시로 만들어야 해요.\n어서 이동하세요 고고!',
	imagePlaceholder: '이미지',
	buttonLabel: '문제보기',
	showBackButton: true,
	hints: []
}

const m2SocialGrid: MissionPuzzle = {
	type: 'E2_CIPHER',
	id: 'm2-social-grid',
	stepLabel: 'STEP3. 미션수행 — 사회존 · S-07 우리 마을은 변신 중',
	cardTitle: '생태도시 암호 해독',
	quest: '우리 마을 변신 중 콘텐츠를 잘 살펴보았나요?\n다음 암호표를 해독하여 울산을 생태도시로 만들 열쇠를 찾아주세요.',
	cipher: '73511312248914137',
	segments: ['735', '11312', '24', '89', '14137'],
	numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '11', '12', '13', '14', '15'],
	jamo: ['ㅅ', 'ㅌ', 'ㅜ', 'ㅐ', 'ㄹ', 'ㅣ', 'ㅇ', 'ㅎ', 'ㅘ', 'ㅡ', 'ㅗ', 'ㄴ', 'ㅏ', 'ㄱ', 'ㄷ'],
	answer: '울산태화강',
	hints: [
		{ at: 180, text: '환경 오염으로 힘들었던 마을이 사람들의 노력으로 깨끗한 생태도시로 회복된 우리나라 대표 도시와 강' }
	],
	correctMessage: '정답을 맞췄다면 *러닝도서관*으로 가서 최종 미션을 풀어 주세요!',
	nextZone: { name: '러닝도서관', mapImageUrl: NEXT_ZONE_MAP, pingX: 36, pingY: 70 }
}

export const mission2Program: MissionProgramPuzzles = {
	key: 'm2',
	tabLabel: '미션2 · 이상한 날씨 *해결 작전*',
	summary: '이상한 날씨를 해결하라',
	name: '미션2 이상한 날씨 해결 작전',
	sourceNote: '관리자 등록값이 화면에 어떻게 렌더되는지 확인용',
	caution: CAUTION_UNCONFIRMED,
	story: {
		name: '스토리 제시',
		stepLabel: 'STEP1. 미션 제시 — 스토리',
		paragraphs: [
			'태화강의 흰뺨검둥오리는 매년 울산을 찾아오는 철새였지만 살기 좋아 텃새가 되었습니다. 그러나 이제는 계절이 뒤섞이고, 먹이도 사라져 살기 어려워졌다고 합니다. 흰뺨검둥오리가 떠나지 않으려면, 러닝도서관에서 시작해서 미래교육관 곳곳에 있는 미션들을 완료해야 합니다.\n**이 미션을 완료하는 방법은 간단합니다.\n미션의 답을 숨겨놓은 곳을 찾아가 즐겁게 참가하면 됩니다.**'
		],
		team: { label: 'B동선', size: 5, routeOrder: '지구존 → 미래존 → 사회존 → 러닝도서관' }
	},
	stickerCount: 5,
	done: {
		...COMMON_MISSION_DONE,
		title: '축하합니다.\n흰뺨검둥오리를 지켰습니다. 미션 완료!',
	},
	zones: [
		{ name: '러닝도서관', puzzles: [m2LibraryCode] },
		{ name: '지구존', puzzles: [m2EarthJamo] },
		{ name: '미래존', puzzles: [m2FutureSortIntro, m2FutureStart, m2FutureSort] },
		{ name: '사회존', puzzles: [m2SocialGridIntro, m2SocialGrid] },
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
	cardTitle: '-',
	quest: '2050년의 미래를 위해 미션을 완료하기 위해서는 러닝 도서관을 탈출해야 한다.\n울산광역시미래교육관의 기록과 지속가능발전교육의 흔적을 찾아 *4자리 비밀번호*를 입력하라.',
	keypad: 'NUMERIC',
	answer: '1745',
	hints: [
		{
			at: 120,
			text: '러닝도서관 1층과 2층 맵이 뜨고, 힌트가 되는 부분이 표시된다. — 17개 목표가 있는 곳(1층 서가), 무대 전체',
			imageUrl: MAP_HINT_IMG,
			imageCaption: 'map_1f.png · 붉은 점선 = 힌트가 되는 부분 (17개 목표가 있는 곳 · 무대 전체)'
		},
		{ at: 240, text: '울산광역시미래교육관에서 배우고자 하는 것이 무엇일까? 그 목표는 몇 개일까요?' },
		{ at: 360, text: "러닝도서관은 지속가능발전교육에 대해 강연을 할 수 있는 무대가 마련되어 있습니다. 강연을 '앉아서' 볼 수 있는 사람은 몇 명인가요? (한 의자에는 3사람이 앉을 수 있습니다.)" },
		{ at: 480, text: '두 숫자를 조합하세요.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *지구존*으로 이동하세요.',
	nextZone: { name: '지구존', mapImageUrl: NEXT_ZONE_MAP, pingX: 21, pingY: 34 }
}

/**
 * 진열대를 따라가는 상품 순서 — 0728 확정본이 제시한 7종.
 * 방향키 정답은 상품 7개에 대응하는 7방향으로 확정했다.
 * 진열대 실물 배치가 바뀌면 ARROW_SEQ만 고치면 문제·입력 화면이 함께 따라온다.
 */
const M3_SHELF_ORDER = ['소고기', '게(자연산)', '식물성 우유', '포도(노지)', '바디워시', '라면', '닭고기']
const ARROW_SEQ = '↑→→↓←↓→'

/** 착한 소비 앞 안내 화면 — 콘텐츠 이미지를 확인하고 「문제보기」로 넘어간다 */
const m3EarthIntro: MissionPuzzle = {
	type: 'INFO',
	id: 'm3-earth-intro',
	stepLabel: 'STEP3. 미션수행 — 지구존 · 착한 소비',
	cardTitle: '착한 소비',
	quest: '미래의 지구를 지키려면, 자원 낭비를 막고 자연 훼손을 막아야 해요.\n문제보기 버튼을 눌러 콘텐츠를 시작해 주세요.\n\n콘텐츠 속에서 단서를 찾아 비밀번호를 입력해서 자연이 훼손되는 것을 막으세요!',
	imagePlaceholder: '이미지',
	buttonLabel: '문제보기',
	showBackButton: true,
	hints: []
}

/**
 * 지구존 E-16은 문제(암기) 화면과 입력 화면이 분리된다 — 존 안에서 INFO → 입력 순으로 이어진다.
 * 돌아가기는 불가하고 틀리면 재시도한다 (0728 메모13).
 */
const m3EarthMemorize: MissionPuzzle = {
	type: 'INFO',
	id: 'm3-earth-memorize',
	stepLabel: 'STEP3. 미션수행 — 지구존 · E-16 착한 소비 (문제)',
	cardTitle: '착한 소비',
	quest: '생활용품 판매 진역대를 파악해서 2050년의 미래를 지키기 위한 방향을 알려주세요.',
	imagePlaceholder: '진열대 배치 이미지' + CAUTION_IMG_SUFFIX,
	displayText: M3_SHELF_ORDER.join(' → '),
	notice: '다음 화면에서는 문제가 보이지 않고, 이전 화면으로 돌아갈 수 없습니다. 순서를 기억하세요.',
	buttonLabel: '정답 입력',
	// 「정답 입력」 왼쪽에 이전 버튼 — 안내 화면(m3-earth-intro)으로 돌아간다
	showBackButton: true,
	answerNote: `외워야 할 방향은 ${Array.from(ARROW_SEQ).join(' ')} 입니다. 다음 화면에서는 이 문제가 감춰집니다.`,
	hints: []
}

const m3EarthArrow: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm3-earth-arrow',
	stepLabel: 'STEP3. 미션수행 — 지구존 · E-16 착한 소비 (입력)',
	cardTitle: '',
	quest: '기억한 순서대로 *방향키*를 눌러 주세요.',
	keypad: 'ARROW',
	answer: ARROW_SEQ,
	// 암기한 방향을 바로 입력하는 화면이라 힌트를 두지 않는다 (힌트가 비면 힌트바도 나오지 않는다)
	hints: [],
	correctMessage: '정답입니다. 다음 미션을 위해 *미래존*으로 이동하세요.',
	nextZone: { name: '미래존', mapImageUrl: NEXT_ZONE_MAP, pingX: 51, pingY: 34 }
}

/**
 * F-08 미래 직업으로 가는 과정 12단계 — 출발과 최종 목적지를 뺀 가운데 칸이다 (0728 메모17).
 * 칸마다 같은 12개 목록이 순환하므로, 뒤엉킨 과정을 제자리에 돌려놓는 문제가 된다.
 * **전시 콘텐츠 수정본이 오지 않아 항목은 더미다** (0728 메모23).
 * 순서 정답도 함께 지어낸 값이므로 퍼즐에 `dummy: true`를 달아 답안을 학습 결과로 저장하지 않는다.
 */
const M3_CAREER_STEPS = [
	'수학과 통계 배우기',
	'컴퓨터 언어 익히기',
	'데이터 모으기',
	'자료 정리하기',
	'AI 원리 이해하기',
	'작은 프로젝트 만들기',
	'대회에 참가하기',
	'전공 정하기',
	'현장에서 실습하기',
	'자격증 따기',
	'결과물 정리하기',
	'일자리 찾기'
]

/** 나의 미래 직업과 AI 앞 안내 화면 */
const m3FutureIntro: MissionPuzzle = {
	type: 'INFO',
	id: 'm3-future-intro',
	stepLabel: 'STEP3. 미션수행 — 미래존 · 나의 미래직업과 AI',
	cardTitle: '나의 미래직업과 AI',
	quest: '2050년의 미래에는 어떤 직업이 생겨나는지 알아야 해요.\n문제 보기 버튼을 눌러 그림에 해당하는 콘텐츠를 찾으세요.',
	imagePlaceholder: '이미지',
	buttonLabel: '문제보기',
	showBackButton: true,
	hints: []
}

const m3FutureSlot: MissionPuzzle = {
	type: 'E1_SLOT',
	id: 'm3-future-slot',
	stepLabel: 'STEP3. 미션수행 — 미래존 · F-08 나의 미래 직업과 AI',
	cardTitle: '나의 미래직업과 AI',
	quest: '미래에는 어떤 직업이 생겨날까요? AI 수도 울산의 특화 직업은 어떤 것이 있으며, \n어떤 가치를 가지고 있을 때 잘 어울릴까요?',
	// 12단계 항목이 전부 더미라 순서 정답도 지어낸 값이다. 콘텐츠 수정본(메모23)이 오면 해제한다
	dummy: true,
	fixedHead: '지금의 나',
	fixedTail: 'AI 데이터 분석가',
	reels: M3_CAREER_STEPS.map(() => M3_CAREER_STEPS),
	answers: M3_CAREER_STEPS,
	hints: [
		{ at: 180, text: '먼저 배워야 할 것이 무엇인지부터 생각해 보세요.' },
		{ at: 300, text: '전시 패널의 과정 순서와 같습니다.' }
	],
	correctMessage: '정답입니다. 다음 미션을 위해 *사회존*으로 이동하세요.',
	nextZone: { name: '사회존', mapImageUrl: NEXT_ZONE_MAP, pingX: 80, pingY: 34 }
}

/** 평화로운 사회와 나 앞 안내 화면 */
const m3SocialIntro: MissionPuzzle = {
	type: 'INFO',
	id: 'm3-social-intro',
	stepLabel: 'STEP3. 미션수행 — 사회존 · 평화로운 사회와 나',
	cardTitle: '평화로운 사회와 나',
	quest: '현재도 미래도 우리 모두의 행복한 삶을 원한다면 평화로운 사회와 그 속의 내가 되어야 해요. \n어서 이동하세요. 고고!!',
	imagePlaceholder: '이미지',
	buttonLabel: '문제보기',
	showBackButton: true,
	hints: []
}

const m3SocialCode: MissionPuzzle = {
	type: 'E1_CODE',
	id: 'm3-social-code',
	stepLabel: 'STEP3. 미션수행 — 사회존 · S-01 평화로운 사회와 나',
	cardTitle: '평화로운 사회와 나',
	quest: '당신은 2050년의 미래에서 온 낡은 태블릿을 하나 발견했습니다. 태블릿을 열어보려 하지만, 암호가 걸려있습니다. 화면에는 하나의 일기만이 띄워져 있을 뿐이었다.',
	keypad: 'NUMERIC',
	answer: '1091011',
	hints: [
		{
			at: 180,
			text: '오늘의 연결이 모여 암호가 됩니다. 일기 속에서 [누구를] → [어떻게] → [어디에서] → [무엇을] 만났는지 순서대로 찾아, 지도에서 위에서부터 몇 번째에 있는지 숫자를 차례대로 나열하여 비밀번호를 완성하세요.',
			imageUrl: pubUrl('/pub/images/mission/clue_s01_map.svg'),
			imageCaption: 'S-01 지도 — 항목이 위에서부터 몇 번째인지 센다' + CAUTION_IMG_SUFFIX
		},
		{ at: 300, text: '버스기사님 · 오토바이 · 온라인 게임 · 예술활동 순서로 찾습니다.' }
	],
	correctMessage: '정답을 맞췄다면 *러닝도서관*으로 가서 최종 미션을 풀어 주세요!',
	nextZone: { name: '러닝도서관', mapImageUrl: NEXT_ZONE_MAP, pingX: 36, pingY: 70 }
}

export const mission3Program: MissionProgramPuzzles = {
	key: 'm3',
	tabLabel: '미션3 · 미래를 위한 오늘의 실천',
	summary: '미래를 구하라!',
	name: '미션3 미래를 위한 오늘의 실천 작전',
	sourceNote: '관리자 등록값이 화면에 어떻게 렌더되는지 확인용',
	caution: CAUTION_UNCONFIRMED,
	story: {
		name: '스토리 제시',
		stepLabel: 'STEP1. 미션 제시 — 스토리',
		paragraphs: [
			'2050년의 나에게 편지가 왔습니다. 지금 이대로의 소비, 자원낭비, 자연훼손이 계속된다면 미래의 나와 우리는 위험하다는 내용이었습니다. 2050년의 미래에도 우리 모두의 행복한 삶을 원한다면 어제와는 다른 오늘을 계획하고 실천해야 합니다.',
			'2050년의 미래를 지키려면 러닝도서관에서 시작해서 미래교육관 곳곳에 있는 미션들을 완료해야 합니다.',
			'이 미션을 완료하는 방법은 간단합니다. 미션의 답을 숨겨놓은 곳을 찾아가 즐겁게 참가하면 됩니다.'
		],
		team: { label: 'C동선', size: 5, routeOrder: '지구존 → 미래존 → 사회존 → 러닝도서관' }
	},
	stickerCount: 5,
	done: {
		...COMMON_MISSION_DONE,
		title: '축하합니다. \n오늘의 실천을 모두 찾았습니다. 미션 완료!',
	},
	zones: [
		{ name: '러닝도서관', puzzles: [m3LibraryCode] },
		{ name: '지구존', puzzles: [m3EarthIntro, m3EarthMemorize, m3EarthArrow] },
		{ name: '미래존', puzzles: [m3FutureIntro, m3FutureSlot] },
		{ name: '사회존', puzzles: [m3SocialIntro, m3SocialCode] },
		{ name: '최종 미션', puzzles: [finalMemory] }
	],
	quizBank
}

/* ══════════════════════════════════════════════════════════
   추가미션 울산광역시미래교육관을 찾아라! (QR 수집)
   ※ 메모18로 QR 12개소 · 화면 12분할 확정. 스티커에 새기는 값은 ULMFE-QR-01 ~ 12
   ══════════════════════════════════════════════════════════ */

const extraQrCollect: MissionPuzzle = {
	type: 'E6_QR',
	id: 'mx-qr-collect',
	stepLabel: '추가미션 — QR 수집',
	cardTitle: '-',
	quest: 'QR을 찾아 미션 태블릿으로 촬영하세요. 찍은 사진에서 QR을 읽어 그림 조각이 열립니다.\n※ 이미 찾은 QR은 다시 반영되지 않습니다.',
	qrCount: 12,
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
		text: 'QR 12개소를 모두 찾아 그림을 완성했습니다.'
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

/**
 * 화면 상단 큰 제목용 프로그램명 — 「미션1 」·「미션1 · 」 같은 번호 접두를 떼어낸다.
 * (예: 미션1 소비습관구출작전 → 소비습관구출작전). 강조 마커도 함께 벗긴다.
 */
export const missionProgramTitle = (programName: string | undefined) =>
	stripEmphasisMarkers(programName).replace(/^미션\s*\d+\s*·?\s*/, '').trim()

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
		case 'E1_SLOT':
			return puzzle.answers.join(' → ')
		case 'E1_JAMO':
		case 'E2_BOARD':
		case 'E2_CIPHER':
			return puzzle.answer
		case 'E3_SORT':
			return puzzle.answerWord
		case 'E3_SELECT':
			return puzzle.answerIndexes.map((index) => `${index + 1}. ${puzzle.items[index]?.label || ''}`).join(', ')
		case 'E3_CHOICE_SET':
			return puzzle.answerIndexes.map((option, item) => `${puzzle.items[item]} → ${puzzle.options[option]}`).join(', ')
		case 'E4_DIFF':
			return `다른 곳 ${puzzle.spots.length}군데`
		case 'E5_MEMORY':
			return `${Math.min(puzzle.pairCount ?? puzzle.pairs.length, puzzle.pairs.length)}쌍 완성`
		case 'E6_QR':
			return `QR ${puzzle.qrCount}개소 수집`
	}
}

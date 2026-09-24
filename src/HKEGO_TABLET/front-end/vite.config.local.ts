// 백엔드(9033)·DB 없이 화면만 확인하기 위한 로컬 전용 Vite 설정 — /api/tablet/* 을 mock 응답으로 가로챈다
import { defineConfig, type Connect } from 'vite'
import react from '@vitejs/plugin-react-swc'

// adminId 'admin2'는 useQuestTimeLimit의 시간제한 우회 계정 — 남은시간은 흐르지만 제출이 막히지 않는다
const login = { valid: true, adminId: 'admin2', adminName: '데모관리자', adminRole: 'ADMIN' }

/*
 * 관리자 활동지 문항 샘플 — 근거 문서에 없는 **검증용 가짜 데이터**다.
 * 퍼즐 카드가 활동지 문항보다 앞에 오는지, 퍼즐을 풀기 전까지 뒤 문항이 잠기는지 확인하려고 한 건만 둔다.
 * 실제 문항은 관리자 교육콘텐츠에서 등록된다. 퍼즐은 관리자에 등록하지 않는다(missionPuzzleData 하드코딩).
 * 존에 활동지 없이 퍼즐만 두고 보려면 아래 배열을 []로 비운다.
 */
const worksheetContents = [
	{
		cntnSn: 101,
		cntnTypeCd: 'SELECT',
		cntnTypeNm: '선택형 활동',
		cardClsfCd: 'MISSION',
		cardClsfNm: '미션카드',
		cntnTtl: '[목 데이터] 러닝도서관 활동지',
		cntnCn: '',
		useYn: 'Y',
		questions: [
			{
				cntnQstnSn: 1001,
				cntnSn: 101,
				qstnTypeCd: 'SELECT',
				qstnTypeNm: '선택형 활동',
				qstnNm: '[목 데이터 · 스펙 아님] 러닝도서관에서 인상 깊었던 것을 고르세요.',
				sortSeq: 1,
				optnCn: JSON.stringify({ select: { choiceMode: 'MULTI', items: ['17개 목표 서가', '1층 바닥 글자', '2층 전망'] } })
			}
		]
	}
]

const missionStepJson = JSON.stringify([
	{ step: 'STEP1', stepName: '스토리 제시', title: '미션 제시' },
	{
		step: 'STEP3',
		stepName: '미션수행',
		quests: [
			{ name: '러닝도서관', title: '시작 미션', place: '1층 러닝도서관', limitMin: 25, contents: [{ cntnSn: 101 }] },
			{ name: '지구존', title: '지구를 생각하는 생산과 소비', place: '2층 지구존', limitMin: 25, contents: [] },
			{ name: '미래존', title: '서로 다른 한 끼', place: '2층 미래존', limitMin: 25, contents: [] },
			{ name: '사회존', title: '일하는 어린이', place: '1층 사회존', limitMin: 25, contents: [] }
		]
	}
])

// 미션 화면(퍼즐 포함) 확인용 세션. 사건탐구 화면을 보려면 prgrmTypeCd를 'QUEST'로 바꾼다
const session = {
	rsvtYmd: '2026-07-30',
	reservation: {
		rsvtSn: 1,
		rsvtNo: 'DEMO-0001',
		schlNm: '데모초등학교',
		scyrNm: '6학년',
		rsvtYmd: '2026-07-30',
		vstHm: '10:00',
		rsvtNope: 4,
		actlNope: 4,
		prgrmTypeCd: 'MISSION',
		prgrmTypeNm: '미션',
		prgrmSn: 1,
		// missionPuzzleData.ts의 프로그램명과 일치해야 해당 존의 하드코딩 퍼즐이 뜬다
		prgrmNm: '미션1 소비습관구출작전',
		teamCnt: 2,
		lrnSttsCd: 'ING',
		lrnSttsNm: '진행중',
		stdntCnt: 4,
		stepJson: missionStepJson
	},
	students: [1, 2, 3, 4].map((n) => ({
		stdntSn: n,
		rsvtSn: 1,
		stdntNo: `2026000${n}`,
		clasNm: '1반',
		clasNo: String(n),
		stdntNm: `학생${n}`,
		atndYn: 'Y',
		teamNm: n <= 2 ? '1팀' : '2팀',
		asgnNm: '데모 미션 프로그램',
		// 존 순서는 학생 명단의 동선 텍스트에서 나온다 — 비우면 미션 존 화면에 콘텐츠가 뜨지 않는다
		routeCn: '러닝도서관 -> 지구존 -> 미래존 -> 사회존',
		lrnSttsCd: 'ING',
		prgrsRt: 0
	})),
	contents: worksheetContents,
	progressLogs: [],
	savedAnswers: [],
	evaluationQuestions: [],
	surveyQuestions: [],
	/*
	 * 관리자 SDGs 퀴즈 은행 샘플 — 퍼즐 오답 시 랜덤 출제되는지 확인용.
	 * 빈 은행일 때 퀴즈를 건너뛰는 동작을 보려면 이 배열을 []로 비운다.
	 */
	quizBank: [
		// 필터링 검증용 무효 행 — 정답 번호 범위 초과. 이 행만 남으면 퀴즈가 출제되지 않아야 한다
		{ quizSn: 91, quizTypeCd: 'CHOICE', qstnCn: '[깨진 행] 정답 번호가 선택지 수를 넘는다', optnCn: JSON.stringify(['가', '나']), crrctAns: '5', explCn: null, imgUrl: null },
		{
			quizSn: 1,
			quizTypeCd: 'OX',
			qstnCn: '[목 데이터] 지속가능발전목표(SDGs)는 총 17개이다.',
			optnCn: null,
			crrctAns: 'O',
			explCn: '2015년 UN이 채택한 17개 목표입니다.',
			imgUrl: null
		},
		{
			quizSn: 2,
			quizTypeCd: 'CHOICE',
			qstnCn: '[목 데이터] 다음 중 재활용이 가능한 것은?',
			optnCn: JSON.stringify(['음식물이 묻은 종이', '기름 묻은 비닐', '깨끗이 씻은 페트병', '깨진 도자기']),
			crrctAns: '3',
			explCn: '이물질을 제거하고 헹군 페트병만 재활용됩니다.',
			imgUrl: null
		}
	]
}

// ponytail: 경로별 분기는 세션·로그인 둘뿐이고 나머지는 빈 배열로 충분하다.
// 특정 화면에 실제 데이터가 필요해지면 여기에만 케이스를 추가한다.
const mockData = (url: string): unknown => {
	if (url.startsWith('/api/tablet/auth/')) return login
	if (url === '/api/tablet/session') return session
	return []
}

const mockApi = (): Connect.NextHandleFunction => (req, res, next) => {
	const url = (req.url ?? '').split('?')[0]
	if (!url.startsWith('/api/')) return next()

	res.setHeader('Content-Type', 'application/json; charset=utf-8')
	res.end(JSON.stringify({ success: true, message: '', data: mockData(url) }))
}

export default defineConfig({
	server: {
		host: '127.0.0.1',
		port: 9133,
		strictPort: true
	},
	plugins: [
		react(),
		{
			name: 'tablet-mock-api',
			configureServer(server) {
				server.middlewares.use(mockApi())
			}
		}
	]
})

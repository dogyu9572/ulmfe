// 백엔드(9031)·DB 없이 관리자 화면만 확인하기 위한 로컬 전용 Vite 설정 — /api/admin/* 을 메모리 목으로 가로챈다
// 이 저장소의 node_modules는 리눅스용이라 여기서 직접 실행되지 않는다. 실행 방법은 `로컬테스트_환경.md` 참고
import { defineConfig, type Connect } from 'vite'
import react from '@vitejs/plugin-react-swc'

const session = {
	valid: true,
	adminId: 'demo',
	adminName: '데모관리자',
	adminRole: 'SUPER',
	adminRoleName: '최고관리자',
	canManageAdmin: true,
	allowedMenuPaths: ['/admin'],
	remainingSeconds: 3600
}

/* 좌측 메뉴는 공통코드 COM001(대분류)·COM002(소분류)로 조립된다. CD_DTL_ID 앞자리가 그룹 prefix */
const menuGroup = (cdDtlId: string, cdDtlNm: string, seq: number) => ({
	cdId: 'COM001', cdDtlId, cdDtlNm, cdDtlCn: '', seq, useYn: 'Y', etc1: '', etc2: '', etc3: '', atchFileMngNo: ''
})
const menuChild = (cdDtlId: string, cdDtlNm: string, path: string, seq: number) => ({
	cdId: 'COM002', cdDtlId, cdDtlNm, cdDtlCn: path, seq, useYn: 'Y', etc1: '', etc2: '', etc3: '', atchFileMngNo: ''
})

const menuTop = [
	menuGroup('10', '학습운영관리', 1),
	menuGroup('20', '교육프로그램관리', 2),
	menuGroup('30', '통계관리', 3),
	menuGroup('40', '사이트관리', 4)
]

const menuSub = [
	menuChild('1001', '학습예약관리', '/admin/learning-reservations', 1),
	menuChild('1002', '학습일정', '/admin/learning-calendar', 2),
	menuChild('1003', '현장운영현황', '/admin/field-operation-status', 3),
	menuChild('1004', '학습결과관리', '/admin/learning-results', 4),
	menuChild('1005', '학습지원자료', '/admin/learning-support-materials', 5),
	menuChild('2001', '사건탐구 프로그램', '/admin/exploration-programs', 1),
	menuChild('2002', '미션 프로그램', '/admin/mission-programs', 2),
	menuChild('2003', '콘텐츠 관리', '/admin/education-contents', 3),
	menuChild('2004', '평가지 관리', '/admin/evaluation-forms', 4),
	menuChild('2005', '설문지 관리', '/admin/survey-forms', 5),
	// 서버에서는 공통코드로 등록해야 나타난다 (서버작업_인수인계.md 2절)
	menuChild('2006', 'SDGs 퀴즈 은행', '/admin/sdgs-quizzes', 6),
	menuChild('3001', '교육프로그램 통계', '/admin/education-program-stats', 1),
	menuChild('3002', '자료 다운로드 통계', '/admin/material-download-stats', 2),
	menuChild('3003', '방문자 통계', '/admin/user-visitor-stats', 3),
	menuChild('4001', '게시판 관리', '/admin/bbs-master', 1),
	menuChild('4002', '배너 관리', '/admin/banners', 2),
	menuChild('4003', '팝업 관리', '/admin/popups', 3),
	menuChild('4004', '공통코드', '/admin/codes', 4)
]

/* ── SDGs 퀴즈 은행 — 저장·재조회 왕복을 보려고 메모리에 들고 있다 (서버 재시작 시 초기화) ── */

type Quiz = {
	quizSn: number
	quizTypeCd: string
	qstnCn: string
	qstnImgAtchFileId: string | null
	optnCn: string | null
	crrctAns: string
	explCn: string | null
	useYn: string
	rgtrNm: string
	regDt: string
}

const quizzes: Quiz[] = [
	{
		quizSn: 1,
		quizTypeCd: 'OX',
		qstnCn: '지속가능발전목표(SDGs)는 총 17개이다.',
		qstnImgAtchFileId: null,
		optnCn: null,
		crrctAns: 'O',
		explCn: '2015년 UN이 채택한 17개 목표입니다.',
		useYn: 'Y',
		rgtrNm: 'admin',
		regDt: '2026-07-30 10:00'
	},
	{
		quizSn: 2,
		quizTypeCd: 'CHOICE',
		qstnCn: '다음 중 재활용이 가능한 것은?',
		qstnImgAtchFileId: null,
		optnCn: JSON.stringify(['음식물이 묻은 종이', '기름 묻은 비닐', '깨끗이 씻은 페트병', '깨진 도자기']),
		crrctAns: '3',
		explCn: '이물질을 제거하고 헹군 페트병만 재활용됩니다.',
		useYn: 'Y',
		rgtrNm: 'admin',
		regDt: '2026-07-30 10:05'
	}
]
let nextQuizSn = 3

/**
 * 백엔드 `EgovSdgsQuizServiceImpl.toQuiz`와 같은 정규화·검증.
 * 검증 메시지까지 맞춰야 화면에서 확인한 동작이 실제 서버와 같다.
 */
const normalizeQuiz = (body: Record<string, unknown>) => {
	const type = body.quizTypeCd === 'CHOICE' ? 'CHOICE' : 'OX'
	const question = String(body.qstnCn ?? '').trim()
	const answer = String(body.crrctAns ?? '').trim()
	if (!question) throw new Error('문항 내용을 입력하세요.')
	let options: string | null = null
	if (type === 'CHOICE') {
		const items = (JSON.parse(String(body.optnCn || '[]')) as string[]).map((item) => String(item).trim()).filter(Boolean)
		if (items.length < 2) throw new Error('선택형은 선택지를 2개 이상 입력하세요.')
		const index = Number(answer)
		if (!index || index < 1 || index > items.length) throw new Error(`정답은 선택지 번호(1~${items.length})여야 합니다.`)
		options = JSON.stringify(items)
	} else if (answer !== 'O' && answer !== 'X') {
		throw new Error('OX형 정답은 O 또는 X여야 합니다.')
	}
	return {
		quizTypeCd: type,
		qstnCn: question,
		qstnImgAtchFileId: String(body.qstnImgAtchFileId ?? '') || null,
		optnCn: options,
		crrctAns: answer,
		explCn: String(body.explCn ?? '') || null,
		useYn: body.useYn === 'N' ? 'N' : 'Y'
	}
}

/* 활동지 콘텐츠 샘플 — 콘텐츠 관리 화면이 빈 목록으로 뜨지 않게 한 건만 둔다 */
const contents = [
	{
		cntnSn: 101,
		cntnTypeCd: 'SELECT',
		cntnTypeNm: '선택형 활동',
		cardClsfCd: 'MISSION',
		cardClsfNm: '미션카드',
		cntnTtl: '[목 데이터] 러닝도서관 활동지',
		cntnCn: '',
		prvdTypeCd: 'IMAGE',
		imgAtchFileId: '',
		videoUrlAddr: '',
		videoThmbAtchFileId: '',
		videoTtl: '',
		useYn: 'Y',
		regDt: '2026-07-30 09:00',
		rgtr: '데모관리자',
		questions: [
			{
				cntnQstnSn: 1001,
				cntnSn: 101,
				qstnTypeCd: 'SELECT',
				qstnTypeNm: '선택형 활동',
				qstnNm: '러닝도서관에서 인상 깊었던 것을 고르세요.',
				qstnImgAtchFileId: '',
				sortSeq: 1,
				optnCn: JSON.stringify({ select: { choiceMode: 'MULTI', items: ['17개 목표 서가', '1층 바닥 글자', '2층 전망'] } })
			}
		]
	}
]

const readBody = (req: Connect.IncomingMessage): Promise<Record<string, unknown>> =>
	new Promise((resolve) => {
		let raw = ''
		req.on('data', (chunk) => { raw += chunk })
		req.on('end', () => {
			try { resolve(raw ? JSON.parse(raw) : {}) } catch { resolve({}) }
		})
	})

// ponytail: 필터·페이징은 목에서 흉내만 낸다. 실제 동작은 백엔드에서 확인한다
const mockApi = (): Connect.NextHandleFunction => (req, res, next) => {
	const [url, query = ''] = (req.url ?? '').split('?')
	if (!url.startsWith('/api/')) return next()
	const method = (req.method ?? 'GET').toUpperCase()

	const send = (success: boolean, message: string, data: unknown) => {
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(JSON.stringify({ success, message, data }))
	}

	if (url === '/api/admin/auth/session') return send(true, '', session)
	if (url === '/api/admin/codes/detail') {
		if (query.includes('cdId=COM001')) return send(true, '', menuTop)
		if (query.includes('cdId=COM002')) return send(true, '', menuSub)
		return send(true, '', [])
	}

	/* 콘텐츠 관리 */
	if (url === '/api/admin/education-contents') {
		return send(true, '', { list: contents, totalCount: contents.length, page: 1, size: 20, totalPages: 1 })
	}
	const contentDetail = url.match(/^\/api\/admin\/education-contents\/(\d+)$/)
	if (contentDetail) return send(true, '', contents.find((item) => item.cntnSn === Number(contentDetail[1])) ?? null)

	/* SDGs 퀴즈 은행 — 양식 다운로드는 실제 xlsx를 만들지 않는다 (POI가 없다). 양식 내용 확인은 백엔드로 한다 */
	if (url === '/api/admin/sdgs-quizzes/import-template') {
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		res.setHeader('Content-Disposition', 'attachment; filename="sdgs-quiz-import-template.xlsx"')
		res.end(Buffer.from('MOCK-XLSX'))
		return
	}
	// 목이라 파싱하지 않고, 파일이 붙어 있으면 2건 등록으로 흉내낸다
	if (url === '/api/admin/sdgs-quizzes/import' && method === 'POST') {
		let size = 0
		req.on('data', (chunk) => { size += chunk.length })
		req.on('end', () => {
			if (size === 0) return send(false, '업로드할 엑셀 파일을 선택하세요.', null)
			quizzes.push(
				{ quizSn: nextQuizSn++, quizTypeCd: 'OX', qstnCn: '[일괄등록] 업사이클링은 버려진 물건을 그대로 다시 쓰는 것이다.', qstnImgAtchFileId: null, optnCn: null, crrctAns: 'X', explCn: '가치를 더해 새로 만드는 것이 업사이클링입니다.', useYn: 'Y', rgtrNm: 'admin', regDt: '2026-07-30 12:00' },
				{ quizSn: nextQuizSn++, quizTypeCd: 'CHOICE', qstnCn: '[일괄등록] 다음 중 재생에너지는?', qstnImgAtchFileId: null, optnCn: JSON.stringify(['석탄', '태양광', '천연가스']), crrctAns: '2', explCn: null, useYn: 'Y', rgtrNm: 'admin', regDt: '2026-07-30 12:00' }
			)
			send(true, 'SDGs 퀴즈 일괄등록 성공', 2)
		})
		return
	}

	const quizDetail = url.match(/^\/api\/admin\/sdgs-quizzes\/(\d+)$/)
	if (url === '/api/admin/sdgs-quizzes' && method === 'GET') {
		const params = new URLSearchParams(query)
		const filtered = quizzes.filter((quiz) =>
			(!params.get('quizTypeCd') || quiz.quizTypeCd === params.get('quizTypeCd'))
			&& (!params.get('useYn') || quiz.useYn === params.get('useYn'))
			&& (!params.get('searchKeyword') || quiz.qstnCn.includes(params.get('searchKeyword') as string))
		)
		const size = Number(params.get('size') || 10)
		return send(true, '', {
			list: filtered.slice().reverse().slice(0, size),
			totalCount: filtered.length,
			page: 1,
			size,
			totalPages: Math.max(1, Math.ceil(filtered.length / size))
		})
	}
	if (quizDetail && method === 'GET') {
		return send(true, '', quizzes.find((quiz) => quiz.quizSn === Number(quizDetail[1])) ?? null)
	}
	if (url === '/api/admin/sdgs-quizzes' && method === 'POST') {
		void readBody(req).then((body) => {
			try {
				const created = { quizSn: nextQuizSn++, ...normalizeQuiz(body), rgtrNm: 'admin', regDt: '2026-07-30 11:00' }
				quizzes.push(created)
				send(true, '등록 성공', created)
			} catch (e) {
				send(false, e instanceof Error ? e.message : '오류', null)
			}
		})
		return
	}
	if (quizDetail && method === 'PUT') {
		void readBody(req).then((body) => {
			const index = quizzes.findIndex((quiz) => quiz.quizSn === Number(quizDetail[1]))
			if (index < 0) return send(false, '퀴즈를 찾을 수 없습니다.', null)
			try {
				quizzes[index] = { ...quizzes[index], ...normalizeQuiz(body) }
				send(true, '수정 성공', quizzes[index])
			} catch (e) {
				send(false, e instanceof Error ? e.message : '오류', null)
			}
		})
		return
	}
	if (quizDetail && method === 'DELETE') {
		const index = quizzes.findIndex((quiz) => quiz.quizSn === Number(quizDetail[1]))
		if (index >= 0) quizzes.splice(index, 1)
		return send(true, '삭제 성공', null)
	}

	if (url.startsWith('/api/admin/upload/')) return send(true, '', null)
	return send(true, '', [])
}

export default defineConfig({
	server: {
		host: '127.0.0.1',
		port: 9131,
		strictPort: true
	},
	plugins: [
		react(),
		{
			name: 'adm-mock-api',
			configureServer(server) {
				server.middlewares.use(mockApi())
			}
		}
	]
})

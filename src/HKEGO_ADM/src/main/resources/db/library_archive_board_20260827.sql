-- 도서관 '자료실' 게시판(LBARC)과 분류 공통코드(COM047)를 신설하는 스크립트

-- ============================================================
-- [주의] 게시판 마스터 화면에서 자료실을 만들면 게시판 ID가 임의 5자리로 자동 생성됩니다.
-- 사용자 화면이 'LBARC'를 참조하므로, 게시판 등록만큼은 반드시 이 SQL로 진행하세요.
--
-- [실행 전 확인] 아래 두 쿼리 결과가 모두 0건이어야 그대로 실행할 수 있습니다.
--   SELECT * FROM CMMN_CD_MST WHERE CD_ID = 'COM047';
--   SELECT * FROM BBS_MST     WHERE BBS_ID = 'LBARC';
-- COM047이 이미 사용 중이라면 비어 있는 코드 ID로 바꾸고,
-- 아래 SQL과 BBS_MST.CTGR_CD_ID 값을 함께 수정하세요.
-- ============================================================

-- 1. 자료실 분류 공통코드
INSERT INTO CMMN_CD_MST (CD_ID, CD_NM, CD_CN, USE_YN)
VALUES ('COM047', '도서관 자료실 분류', '도서관 자료실 게시판의 게시글 분류', 'Y')
ON DUPLICATE KEY UPDATE
	CD_NM = VALUES(CD_NM),
	CD_CN = VALUES(CD_CN),
	USE_YN = VALUES(USE_YN);

INSERT INTO CMMN_CD_DTL (
	CD_ID,
	CD_DTL_ID,
	CD_DTL_NM,
	CD_DTL_CN,
	SORT_SEQ,
	USE_YN,
	RGTR_NM,
	REG_DT
) VALUES
	('COM047', 'QUIZ',   '독서퀴즈',        '도서관 자료실 독서퀴즈 분류',      10, 'Y', 'admin', NOW()),
	('COM047', 'ACTSHT', '독후활동지',      '도서관 자료실 독후활동지 분류',     20, 'Y', 'admin', NOW()),
	('COM047', 'EVENT',  '도서관 행사 안내', '도서관 자료실 행사 안내물 분류', 30, 'Y', 'admin', NOW())
ON DUPLICATE KEY UPDATE
	CD_DTL_NM = VALUES(CD_DTL_NM),
	CD_DTL_CN = VALUES(CD_DTL_CN),
	SORT_SEQ = VALUES(SORT_SEQ),
	USE_YN = VALUES(USE_YN);

-- 2. 자료실 게시판 마스터 (공지사항 ZEHSB 설정을 기준으로 함)
INSERT INTO BBS_MST (
	BBS_ID, BBS_NM, BBS_CN, BBS_SKIN_CD, BBS_IMG_FILE_ID, PAGE_ARTCL_CNT,
	ATCH_FILE_YN, ATCH_FILE_CNT, ATCH_FILE_SZ, USE_YN, ANS_YN, CMNT_YN, SORT_YN,
	MAIN_PSTG_YN, UPEND_FIX_YN, THMB_YN, LNKG_YN, HDN_YN, LCK_YN,
	NEW_YN, NEW_NMTM, POP_YN, POP_INQ_CNT, CTGR_YN, CTGR_CD_ID,
	ETC1_USE_YN, ETC2_USE_YN, ETC3_USE_YN, ETC4_USE_YN, ETC5_USE_YN,
	LIST_AUTHRT_CD, DTL_AUTHRT_CD, WRT_AUTHRT_CD, RGTR_NM, REG_DT, MDFR_NM, MDFCN_DT
) VALUES (
	'LBARC', '자료실', '독서퀴즈, 독후활동지, 도서관 행사 안내물을 제공합니다.', 'LIST_BASIC', NULL, 10,
	'Y', 5, 10485760, 'Y', 'N', 'N', 'N',
	'N', 'Y', 'N', 'N', 'N', 'N',
	'Y', 5, 'N', 0, 'Y', 'COM047',
	'N', 'N', 'N', 'N', 'N',
	'1', '1', '3', 'admin', NOW(), 'admin', NOW()
);

-- 3. 관리자 좌측 메뉴 등록
-- 관리자 메뉴는 COM001(대메뉴) + COM002(관리메뉴) 공통코드로 구성되며,
-- COM002의 CD_DTL_ID는 대메뉴 코드값을 접두어로 사용합니다.
-- 도서관 관리 대메뉴가 '80'이고 그 하위에 '8001 도서 관리'(SORT_SEQ 10)가 있어
-- '8002' / SORT_SEQ 20으로 등록합니다.
INSERT INTO CMMN_CD_DTL (
	CD_ID,
	CD_DTL_ID,
	CD_DTL_NM,
	CD_DTL_CN,
	SORT_SEQ,
	USE_YN,
	RGTR_NM,
	REG_DT
) VALUES
	('COM002', '8002', '자료실', '/admin/bbs-post/LBARC', 20, 'Y', 'admin', NOW())
ON DUPLICATE KEY UPDATE
	CD_DTL_NM = VALUES(CD_DTL_NM),
	CD_DTL_CN = VALUES(CD_DTL_CN),
	SORT_SEQ = VALUES(SORT_SEQ),
	USE_YN = VALUES(USE_YN);

-- ============================================================
-- [롤백]
--   DELETE FROM CMMN_CD_DTL WHERE CD_ID = 'COM002' AND CD_DTL_ID = '8002';
--   DELETE FROM BBS_ARTICLE WHERE BBS_ID = 'LBARC';
--   DELETE FROM BBS_MST     WHERE BBS_ID = 'LBARC';
--   DELETE FROM CMMN_CD_DTL WHERE CD_ID = 'COM047';
--   DELETE FROM CMMN_CD_MST WHERE CD_ID = 'COM047';
-- ============================================================

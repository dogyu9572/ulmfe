-- 홈페이지 CI(심벌마크·시그니처·캐릭터)를 관리자에서 직접 관리할 수 있도록 테이블과 메뉴를 추가한다.

-- 1. CI 테이블 생성
--    구분(CI_SE_CD)별로 SORT_SEQ가 독립 배정되며, 정렬은 SORT_SEQ ASC, CI_SN ASC 순이다.
CREATE TABLE IF NOT EXISTS HMPG_CI (
	CI_SN int NOT NULL AUTO_INCREMENT COMMENT 'CI일련번호',
	CI_SE_CD varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CI구분코드(SYMBOL:심벌마크, SIGN:시그니처, CHAR:캐릭터, FILE:통합다운로드파일)',
	CI_TTL varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CI제목',
	IMG_FILE_ID varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '이미지파일ID',
	SORT_SEQ int NOT NULL DEFAULT 0 COMMENT '구분별정렬순서',
	USE_YN varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Y' COMMENT '사용여부',
	DEL_YN char(1) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'N' COMMENT '삭제여부',
	REG_DT datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
	RGTR_NM varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '등록자명',
	MDFCN_DT datetime DEFAULT CURRENT_TIMESTAMP COMMENT '수정일시',
	MDFR_NM varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '수정자명',
	DEL_DT datetime DEFAULT NULL COMMENT '삭제일시',
	DLTR_NM varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '삭제자명',
	PRIMARY KEY (CI_SN),
	KEY IX_HMPG_CI_SE_SORT (CI_SE_CD, SORT_SEQ),
	KEY IX_HMPG_CI_USE_DEL (USE_YN, DEL_YN)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='홈페이지CI';

-- 2. 기존 퍼블리싱 이미지를 첨부파일로 등록
--    실제 파일 복사 없이 사용자 프론트의 정적 경로를 그대로 가리키게 한다.
--    관리자가 이미지를 교체하면 그 시점부터 /uploads/ci/ 경로로 자연스럽게 넘어간다.
INSERT IGNORE INTO ATCH_FILE_INFO
	(ATCH_FILE_MNG_NO, FILE_SEQ, ORGNL_FILE_NM, STRG_FILE_NM, ATCH_FILE_PATH_NM, FILE_SZ, FILE_EXTN_NM, FILE_TYPE_NM, REG_DT)
VALUES
	('CI_SEED_SYMBOL', 0, 'img_symbol.svg', 'img_symbol.svg', '/pub/images/img_symbol.svg', 1711, '.svg', 'image/svg+xml', NOW()),
	('CI_SEED_SIGN_01', 0, 'ci_horizontal_kr.png', 'ci_horizontal_kr.png', '/pub/images/ci_horizontal_kr.png', 18040, '.png', 'image/png', NOW()),
	('CI_SEED_SIGN_02', 0, 'ci_horizontal_kr_en.png', 'ci_horizontal_kr_en.png', '/pub/images/ci_horizontal_kr_en.png', 26126, '.png', 'image/png', NOW()),
	('CI_SEED_SIGN_03', 0, 'ci_vertical_kr.png', 'ci_vertical_kr.png', '/pub/images/ci_vertical_kr.png', 14653, '.png', 'image/png', NOW()),
	('CI_SEED_SIGN_04', 0, 'ci_vertical_kr_en.png', 'ci_vertical_kr_en.png', '/pub/images/ci_vertical_kr_en.png', 20327, '.png', 'image/png', NOW());

-- 3. CI 게시글 시드
--    심벌마크는 항상 1건만 노출되므로 사용 여부가 Y인 행도 1건이다. 캐릭터는 초기 데이터가 없다.
INSERT INTO HMPG_CI (CI_SE_CD, CI_TTL, IMG_FILE_ID, SORT_SEQ, USE_YN, DEL_YN, REG_DT, RGTR_NM, MDFCN_DT, MDFR_NM)
SELECT * FROM (
	SELECT 'SYMBOL' AS a, '심벌마크' AS b, 'CI_SEED_SYMBOL' AS c, 1 AS d, 'Y' AS e, 'N' AS f, NOW() AS g, 'admin' AS h, NOW() AS i, 'admin' AS j
	UNION ALL SELECT 'SIGN', '가로형 국문', 'CI_SEED_SIGN_01', 1, 'Y', 'N', NOW(), 'admin', NOW(), 'admin'
	UNION ALL SELECT 'SIGN', '가로형 국영문', 'CI_SEED_SIGN_02', 2, 'Y', 'N', NOW(), 'admin', NOW(), 'admin'
	UNION ALL SELECT 'SIGN', '세로형 국문', 'CI_SEED_SIGN_03', 3, 'Y', 'N', NOW(), 'admin', NOW(), 'admin'
	UNION ALL SELECT 'SIGN', '세로형 국영문', 'CI_SEED_SIGN_04', 4, 'Y', 'N', NOW(), 'admin', NOW(), 'admin'
) AS seed
WHERE NOT EXISTS (
	-- 이미지 구분만 본다. 뒤 스크립트가 넣는 FILE 행 때문에 이미지 시드가 통째로 건너뛰지 않도록 한다.
	SELECT 1 FROM (
		SELECT CI_SN FROM HMPG_CI WHERE DEL_YN = 'N' AND CI_SE_CD IN ('SYMBOL', 'SIGN', 'CHAR')
	) t
);

-- 4. 관리자 메뉴 등록
--    홈페이지 관리(COM001의 60) 그룹 하위이며, 휴관일 관리(6007) 다음 자리인 6008을 쓴다.
INSERT INTO CMMN_CD_DTL (CD_ID, CD_DTL_ID, CD_DTL_NM, CD_DTL_CN, SORT_SEQ, USE_YN, ETC1, ETC2, ETC3, ATCH_FILE_MNG_NO, REG_DT, RGTR_NM)
SELECT 'COM002', '6008', 'CI 관리', '/admin/ci', 80, 'Y', '', '', '', '', NOW(), 'system'
FROM DUAL
WHERE NOT EXISTS (
	SELECT 1 FROM (SELECT CD_ID, CD_DTL_ID FROM CMMN_CD_DTL) t
	WHERE t.CD_ID = 'COM002' AND t.CD_DTL_ID = '6008'
);

-- 5. 권한 매핑
--    연혁 관리(6003) 메뉴를 이미 가진 권한그룹에 CI 관리도 동일하게 부여한다.
INSERT INTO AUTH_MENU_MAP (AUTHRT_CD, MENU_CD, RGTR_NM, REG_DT)
SELECT m.AUTHRT_CD, '6008', 'system', NOW()
FROM (SELECT DISTINCT AUTHRT_CD FROM AUTH_MENU_MAP WHERE MENU_CD = '6003') m
WHERE NOT EXISTS (
	SELECT 1 FROM (SELECT AUTHRT_CD, MENU_CD FROM AUTH_MENU_MAP) t
	WHERE t.AUTHRT_CD = m.AUTHRT_CD AND t.MENU_CD = '6008'
);

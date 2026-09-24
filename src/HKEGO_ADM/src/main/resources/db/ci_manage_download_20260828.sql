-- CI 페이지 상단의 통합 다운로드 파일을 관리자에서 교체할 수 있도록 HMPG_CI에 FILE 구분 행을 추가한다.
-- 선행 스크립트: ci_manage_20260828.sql (HMPG_CI 생성)

-- 0. 구분 코드 설명에 FILE을 반영한다. SHOW CREATE TABLE만 보는 사람이 FILE의 존재를 놓치지 않도록 한다.
ALTER TABLE HMPG_CI
	MODIFY CI_SE_CD varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL
	COMMENT 'CI구분코드(SYMBOL:심벌마크, SIGN:시그니처, CHAR:캐릭터, FILE:통합다운로드파일)';

-- 1. 기존 퍼블리싱 zip을 첨부파일로 등록
--    파일 복사 없이 사용자 프론트의 정적 경로를 그대로 가리킨다.
--    관리자가 파일을 교체하면 그 시점부터 /uploads/ci/ 경로로 넘어간다.
INSERT IGNORE INTO ATCH_FILE_INFO
	(ATCH_FILE_MNG_NO, FILE_SEQ, ORGNL_FILE_NM, STRG_FILE_NM, ATCH_FILE_PATH_NM, FILE_SZ, FILE_EXTN_NM, FILE_TYPE_NM, REG_DT)
VALUES
	('CI_SEED_FILE', 0, 'ulmfe_ci.zip', 'ulmfe_ci.zip', '/pub/files/ulmfe_ci.zip', 78979, '.zip', 'application/zip', NOW());

-- 2. FILE 구분 행 1건
--    심벌마크와 마찬가지로 노출 항목은 항상 한 건이므로 순서는 1로 고정한다.
INSERT INTO HMPG_CI (CI_SE_CD, CI_TTL, IMG_FILE_ID, SORT_SEQ, USE_YN, DEL_YN, REG_DT, RGTR_NM, MDFCN_DT, MDFR_NM)
SELECT 'FILE', 'ulmfe_ci.zip', 'CI_SEED_FILE', 1, 'Y', 'N', NOW(), 'admin', NOW(), 'admin'
FROM DUAL
WHERE NOT EXISTS (
	SELECT 1 FROM (SELECT CI_SN FROM HMPG_CI WHERE CI_SE_CD = 'FILE' AND DEL_YN = 'N') t
);

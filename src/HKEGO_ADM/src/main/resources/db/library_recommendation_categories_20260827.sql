-- 사서 추천도서 분류 공통코드를 초등·청소년·성인으로 정비한다.
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
	('COM046', '01', '초등', '도서관 사서 추천도서 초등 분류', 10, 'Y', 'admin', NOW()),
	('COM046', '02', '청소년', '도서관 사서 추천도서 청소년 분류', 20, 'Y', 'admin', NOW()),
	('COM046', '03', '성인', '도서관 사서 추천도서 성인 분류', 30, 'Y', 'admin', NOW())
ON DUPLICATE KEY UPDATE
	CD_DTL_NM = VALUES(CD_DTL_NM),
	CD_DTL_CN = VALUES(CD_DTL_CN),
	SORT_SEQ = VALUES(SORT_SEQ),
	USE_YN = VALUES(USE_YN);

-- 연혁의 월(01~12) 컬럼을 자유 텍스트 시점 라벨로 전환하고, 내용란에 뭉쳐 있던 항목을 한 건씩 분리한다.
-- 기존에는 레코드당 월이 하나뿐이라 한 해의 여러 사건을 내용 한 덩어리에 줄바꿈으로 몰아넣었고,
-- 그 결과 화면에서 "4월 4. 20. …"처럼 시점 표기가 중복되었다.
--
-- 실행 이력: 운영 DB(ulmfe)에 2026-08-27 실행 완료. 백업은 backup/db/HMPG_HSTRY_before_month_label_20260827.sql 에 있다.
-- 주의: 2번 단계의 HSTRY_SN 45~50 은 실행 시점의 운영 DB 기준 값이라 다른 환경에서는 가리키는 행이 다르다.
--       다른 환경에 적용할 때는 그 DB에서 뭉쳐 있는 행을 먼저 조회해 대상 번호를 다시 확인한다.

-- 1. HSTRY_MM 을 char(2) 에서 varchar(40) 으로 확장한다.
--    "3. 16." 같은 일자 표기와 "2022. 10. ~ 2023. 9." 같은 기간 표기를 그대로 담기 위한 길이다.
ALTER TABLE HMPG_HSTRY
	MODIFY COLUMN HSTRY_MM varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '연혁시점';

-- 2. 뭉쳐 있던 기존 6건을 삭제 처리한다. (이미지 연결이 없어 함께 잃는 자료가 없다)
UPDATE HMPG_HSTRY
SET DEL_YN = 'Y',
	DEL_DT = NOW(),
	DLTR_NM = 'admin'
WHERE DEL_YN = 'N'
	AND HSTRY_SN IN (45, 46, 47, 48, 49, 50);

-- 3. 항목별로 분리한 15건을 등록한다. 시점 라벨은 기존 내용 앞머리에 있던 날짜를 그대로 옮긴 값이다.
INSERT INTO HMPG_HSTRY (
	HSTRY_YR, HSTRY_MM, HSTRY_CN, USE_YN, DEL_YN, REG_DT, RGTR_NM, MDFCN_DT, MDFR_NM
) VALUES
	('2026', '4. 20.', '(가칭)울산미래교육관 전시·체험 콘텐츠 제작·설치 착공', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2026', '7. 1.', '울산광역시미래교육관 행정기구 설치 조례 개정', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2026', '8. 26.', '울산광역시미래교육관 설립 공사 준공', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2026', '9. 1.', '제1대 박갑진 관장 취임', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),

	('2024', '10. 7.', '(가칭)울산미래교육관 설립공사 착공', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),

	('2022', '3. 16.', '(가칭)울산미래교육관 전시·체험 콘텐츠 구축 계획 수립', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2022', '2022. 6. ~ 2024. 1.', '(가칭)울산미래교육관 설립 기본·실시 설계', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2022', '2022. 9. ~ 2025. 12.', '(가칭)울산미래교육관 전시·체험 콘텐츠 기본·실시 설계', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2022', '2022. 10. ~ 2023. 9.', '문화재 발굴조사', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),

	('2021', '5. 3.', '교육부-행정안전부 공동투자심사 조건부 승인', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2021', '6. 28.', '(가칭)울산미래교육관 설립 세부추진계획 수립', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),

	('2020', '2. 14.', '(가칭)울산미래교육관 설립추진단 및 실무팀 구성·운영', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2020', '4. 8.', '(가칭)울산미래교육관 설립 기본계획 수립', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),
	('2020', '6. 22.', '지방자치단체(울산시, 북구청) 업무협약 체결', 'Y', 'N', NOW(), 'admin', NOW(), 'admin'),

	('2019', '4. 19.', '(가칭)울산미래교육관 설립 추진 결정(정책회의)', 'Y', 'N', NOW(), 'admin', NOW(), 'admin');

-- 4. 확인 (화면과 같은 정렬: 연도는 최신순, 연도 안에서는 시점 오름차순)
SELECT HSTRY_SN, HSTRY_YR, HSTRY_MM, HSTRY_CN
FROM HMPG_HSTRY
WHERE DEL_YN = 'N'
ORDER BY HSTRY_YR DESC, CAST(HSTRY_MM AS UNSIGNED) ASC, HSTRY_SN ASC;

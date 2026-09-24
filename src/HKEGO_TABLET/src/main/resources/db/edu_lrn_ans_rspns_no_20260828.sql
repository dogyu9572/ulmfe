-- EDU_LRN_ANS 응답번호 컬럼 추가
-- TabletMapper.xml 의 익명 설문 저장과 ADM 의 EvaluationFormDAO/SurveyFormDAO 결과 조회가 이 컬럼을 참조한다.
-- 한 예약 안에서 응답 묶음(제출 1회분)을 구분하는 값이며, 태블릿 제출 시 서버가 UUID 를 채운다.
-- 기존 행은 NULL 로 남고, 조회 쿼리가 COALESCE(RSPNS_NO, CONCAT(RSVT_SN,'-',STDNT_SN)) 로 대체 키를 만든다.
-- 되돌리기: edu_lrn_ans_rspns_no_rollback_20260828.sql

ALTER TABLE `EDU_LRN_ANS`
    ADD COLUMN IF NOT EXISTS `RSPNS_NO` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '응답번호';

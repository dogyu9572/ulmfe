-- EDU_LRN_ANS 응답번호 컬럼 되돌리기
-- 대응: edu_lrn_ans_rspns_no_20260828.sql
-- 주의: 컬럼을 지우면 해당 응답 묶음 구분 값이 사라진다. 되돌리기 전에 백업한다.

ALTER TABLE `EDU_LRN_ANS`
    DROP COLUMN IF EXISTS `RSPNS_NO`;

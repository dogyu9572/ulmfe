-- 보너스 스테이지(추가미션)를 관리자가 반 단위로 열어준 상태를 저장하는 테이블
-- 행의 존재가 곧 개방이다. 닫을 때는 행을 지우므로 개방여부 컬럼을 따로 두지 않는다.
-- 개방 단위가 「완료자 개별」로 확정되면 STDNT_SN 컬럼을 더하고, 「전체」로 확정되면 CLAS_NM에 약속된 표식을 넣는다.

CREATE TABLE IF NOT EXISTS EDU_BNS_OPN (
    RSVT_SN INT NOT NULL COMMENT '예약 일련번호',
    CLAS_NM VARCHAR(50) NOT NULL COMMENT '반 - 개방 단위',
    REG_DT DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '개방 일시',
    PRIMARY KEY (RSVT_SN, CLAS_NM),
    CONSTRAINT FK_EDU_BNS_OPN_01 FOREIGN KEY (RSVT_SN) REFERENCES EDU_RSVT_MST (RSVT_SN)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='보너스 스테이지 반별 개방';

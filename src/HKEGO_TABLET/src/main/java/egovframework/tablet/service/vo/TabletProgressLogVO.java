package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletProgressLogVO {
	private Integer stdntSn;
	private String stepCd;
	private String actvtNm;
	private String stepSttsCd;
	/** 단계 시작·완료 시각. 교사 모니터링의 평균 소요시간 계산에 쓴다. */
	private String bgngDt;
	private String cmptnDt;
}

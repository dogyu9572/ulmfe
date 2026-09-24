package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletQuestionnaireAnswerVO {
	private Integer qstnrSn;
	private Integer qstnSn;
	private String qstnCn;
	private String ansCn;
	/** 제출 묶음 식별자. 익명 제출에서만 서버가 채우고, 예약 귀속 제출은 비워 둔다. */
	private String rspnsNo;
}

package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletQuestionnaireQuestionVO {
	private Integer qstnrSn;
	private Integer qstnSn;
	private String qstnNo;
	private String ansTypeCd;
	private String ansTypeNm;
	private String qstnCn;
	private Integer sortSeq;
}

package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletSavedAnswerVO {
	private Integer lrnAnsSn;
	private Integer rsvtSn;
	private Integer stdntSn;
	private String ansTypeCd;
	private String stepCd;
	private Integer cntnSn;
	private Integer qstnrSn;
	private Integer qstnSn;
	private String qstnCn;
	private String ansCn;
}

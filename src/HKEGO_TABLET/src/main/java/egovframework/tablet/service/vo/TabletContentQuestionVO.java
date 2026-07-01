package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletContentQuestionVO {
	private Integer cntnQstnSn;
	private Integer cntnSn;
	private String qstnTypeCd;
	private String qstnTypeNm;
	private String qstnNm;
	private String qstnImgAtchFileId;
	private String optnCn;
	private Integer sortSeq;
}

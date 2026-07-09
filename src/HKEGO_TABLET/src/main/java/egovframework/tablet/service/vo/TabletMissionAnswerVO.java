package egovframework.tablet.service.vo;

import lombok.Data;

import java.util.List;

@Data
public class TabletMissionAnswerVO {
	private Integer cntnSn;
	private Integer qstnSn;
	private String qstnCn;
	private String ansCn;
	private String cardClsfCd;
	private List<TabletMissionAnswerFileVO> files;
}

package egovframework.tablet.service.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TabletQuestionnaireVO {
	private Integer qstnrSn;
	private String qstnrTypeCd;
	private String evlSeCd;
	private String qstnrNm;
	private String linkCd;
	private List<TabletQuestionnaireQuestionVO> questions = new ArrayList<>();
}

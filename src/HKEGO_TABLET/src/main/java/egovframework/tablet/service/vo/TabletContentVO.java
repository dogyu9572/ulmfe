package egovframework.tablet.service.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TabletContentVO {
	private Integer cntnSn;
	private String cntnTypeCd;
	private String cntnTypeNm;
	private String cardClsfCd;
	private String cardClsfNm;
	private String cntnTtl;
	private String cntnCn;
	private String prvdTypeCd;
	private String prvdTypeNm;
	private String imgAtchFileId;
	private String videoUrlAddr;
	private String videoThmbAtchFileId;
	private String videoTtl;
	private List<TabletContentQuestionVO> questions = new ArrayList<>();
}

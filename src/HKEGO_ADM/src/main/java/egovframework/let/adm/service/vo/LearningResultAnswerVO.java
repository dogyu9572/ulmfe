package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningResultAnswerVO {
	private Integer lrnAnsSn;
	private Integer rsvtSn;
	private Integer stdntSn;
	private String ansTypeCd;
	private String ansTypeNm;
	private String stepCd;
	private String stepNm;
	private String cardClsfCd;
	private String cardClsfNm;
	private Integer cntnSn;
	private Integer qstnrSn;
	private Integer qstnSn;
	private String qstnCn;
	private String ansCn;
}

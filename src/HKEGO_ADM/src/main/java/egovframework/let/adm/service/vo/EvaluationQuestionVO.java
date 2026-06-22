package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationQuestionVO {
	private Integer qstnSn;
	private Integer qstnrSn;
	private String qstnNo;
	private String ansTypeCd;
	private String ansTypeNm;
	private String qstnCn;
	private Integer sortSeq;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
}

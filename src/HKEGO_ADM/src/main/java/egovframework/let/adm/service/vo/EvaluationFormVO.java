package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationFormVO {
	private Integer qstnrSn;
	private String qstnrTypeCd;
	private String evlSeCd;
	private String evlSeNm;
	private String qstnrNm;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;

	@Builder.Default
	private List<EvaluationQuestionVO> questions = new ArrayList<>();
}

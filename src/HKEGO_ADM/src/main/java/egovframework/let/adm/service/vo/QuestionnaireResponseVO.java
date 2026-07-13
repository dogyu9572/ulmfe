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
public class QuestionnaireResponseVO {
	private String responseKey;
	private LocalDateTime submittedDt;
	private String participationType;
	private String schoolLevel;
	private String gender;
	private String residence;
	private Integer qstnSn;
	private String qstnNo;
	private String qstnCn;
	private String ansCn;
}

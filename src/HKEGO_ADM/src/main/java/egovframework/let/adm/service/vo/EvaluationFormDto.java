package egovframework.let.adm.service.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class EvaluationFormDto {
	private String evlSeCd;
	private String qstnrNm;
	private List<QuestionDto> questions = new ArrayList<>();

	@Data
	public static class QuestionDto {
		private Integer qstnSn;
		private String qstnNo;
		private String ansTypeCd;
		private String qstnCn;
		private Integer sortSeq;
	}
}

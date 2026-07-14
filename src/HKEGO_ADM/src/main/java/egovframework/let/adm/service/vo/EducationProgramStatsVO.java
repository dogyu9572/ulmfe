package egovframework.let.adm.service.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EducationProgramStatsVO {
	private String programTypeCd;
	private String programTypeNm;
	private Integer programSn;
	private String programNm;
	private Double step1CompletionRate;
	private Double step2CompletionRate;
	private Double step3CompletionRate;
	private Double step4CompletionRate;
}

package egovframework.let.adm.service.vo;

import lombok.Data;

@Data
public class EducationProgramDto {
	private String prgrmNm;
	private String trgtCn;
	private Integer totalTmMnt;
	private Integer maxNope;
	private String simpleExpln;
	private String startExpln;
	private String useYn;
	private Integer teamCnt;
	private String routeJson;
	private String stepJson;
	private String evalJson;
}

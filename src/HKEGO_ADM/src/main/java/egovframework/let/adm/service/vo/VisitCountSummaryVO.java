package egovframework.let.adm.service.vo;

import lombok.Data;

@Data
public class VisitCountSummaryVO {
	private String programTypeCd;
	private String programTypeNm;
	private Integer reservedSchoolCount;
	private Integer visitedSchoolCount;
	private Integer reservedStudentCount;
	private Integer attendedStudentCount;
}

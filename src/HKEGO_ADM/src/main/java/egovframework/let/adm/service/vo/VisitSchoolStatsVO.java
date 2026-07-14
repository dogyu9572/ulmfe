package egovframework.let.adm.service.vo;

import java.time.LocalDate;

import lombok.Data;

@Data
public class VisitSchoolStatsVO {
	private String schlNm;
	private String gradeClassNm;
	private Integer visitCount;
	private Integer totalStudentCount;
	private Integer attendedStudentCount;
	private LocalDate lastVisitDate;
}

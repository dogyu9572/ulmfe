package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningResultVO {
	private Integer rsvtSn;
	private String rsvtNo;
	private String schlNm;
	private String scyrNm;
	private String prgrmTypeCd;
	private String prgrmTypeNm;
	private Integer prgrmSn;
	private String prgrmNm;
	private LocalDate lrnYmd;
	private String picNm;
	private Integer rsvtNope;
	private Integer actlNope;
	private Integer atndCnt;
	private Integer studentCnt;
	private Integer attendanceRate;
	private LocalDateTime regDt;
	private List<LearningResultStudentVO> students;
}

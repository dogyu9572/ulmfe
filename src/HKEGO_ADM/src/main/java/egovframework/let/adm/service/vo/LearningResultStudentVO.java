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
public class LearningResultStudentVO {
	private Integer stdntSn;
	private Integer rsvtSn;
	private String stdntNo;
	private String clasNm;
	private String clasNo;
	private String stdntNm;
	private String atndYn;
	private String teamNm;
	private String asgnNm;
	private String routeCn;
	private String lrnSttsCd;
	private String lrnSttsNm;
	private Double prgrsRt;
	private Integer doneStepCnt;
	private Integer totalStepCnt;
	private LocalDateTime stdntNmDelDt;
}

package egovframework.let.adm.service.vo;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class EducationProgramStatsSourceVO {
	private String programTypeCd;
	private String programTypeNm;
	private Integer programSn;
	private String programNm;
	private String stepJson;
	private Integer reservationSn;
	private Integer studentSn;
	private String attendanceYn;
	private String learningStatusCd;
	private BigDecimal progressRate;
	private String doneStepCodes;
}

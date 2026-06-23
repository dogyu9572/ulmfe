package egovframework.let.adm.service.vo;

import lombok.Data;

import java.util.List;

@Data
public class LearningReservationDto {
	private String rsvtNo;
	private String schlNm;
	private String scyrNm;
	private String picNm;
	private String picTelno;
	private String picEmlAddr;
	private String rsvtYmd;
	private String vstHm;
	private Integer rsvtNope;
	private Integer actlNope;
	private String prgrmTypeCd;
	private Integer prgrmSn;
	private String lrnSttsCd;
	private List<LearningReservationStudentDto> students;
}

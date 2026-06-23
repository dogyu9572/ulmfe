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
public class LearningReservationVO {
	private Integer rsvtSn;
	private String rsvtNo;
	private String schlNm;
	private String scyrNm;
	private String picNm;
	private String picTelno;
	private String picEmlAddr;
	private LocalDate rsvtYmd;
	private String vstHm;
	private Integer rsvtNope;
	private Integer actlNope;
	private String prgrmTypeCd;
	private String prgrmTypeNm;
	private Integer prgrmSn;
	private String prgrmNm;
	private String lrnSttsCd;
	private String lrnSttsNm;
	private String stdntListYn;
	private Integer stdntCnt;
	private String rgtr;
	private LocalDateTime regDt;
	private String mdtr;
	private LocalDateTime mdfcnDt;
	private String deltr;
	private LocalDateTime delDt;
	private List<LearningReservationStudentVO> students;
}

package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletReservationVO {
	private Integer rsvtSn;
	private String rsvtNo;
	private String schlNm;
	private String scyrNm;
	private String rsvtYmd;
	private String vstHm;
	private Integer rsvtNope;
	private Integer actlNope;
	private String prgrmTypeCd;
	private String prgrmTypeNm;
	private Integer prgrmSn;
	private String prgrmNm;
	private String lrnSttsCd;
	private String lrnSttsNm;
	private Integer stdntCnt;
}

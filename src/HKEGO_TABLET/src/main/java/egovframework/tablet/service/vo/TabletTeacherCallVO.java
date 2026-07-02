package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletTeacherCallVO {
	private Long callSn;
	private Integer rsvtSn;
	private String teamNm;
	private String studentNames;
	private Integer studentCount;
	private String placeNm;
	private String callCn;
	private String callSttsCd;
	private String callSttsNm;
	private String regDt;
	private String readDt;
}

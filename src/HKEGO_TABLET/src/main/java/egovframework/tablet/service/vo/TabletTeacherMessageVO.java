package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletTeacherMessageVO {
	private Long msgSn;
	private Integer rsvtSn;
	private String targetNm;
	private Integer studentCount;
	private String messageCn;
	private Integer readCount;
	private String regDt;
}

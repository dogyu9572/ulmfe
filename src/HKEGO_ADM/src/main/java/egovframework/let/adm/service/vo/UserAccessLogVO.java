package egovframework.let.adm.service.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserAccessLogVO {
	private Integer cntnLogSn;
	private Integer userSn;
	private String userId;
	private String userNm;
	private String ipAddr;
	private String userAgtNm;
	private String rfrerAddr;
	private String ssnId;
	private String dmndUriAddr;
	private String dmndMthdCd;
	private Integer rspnsSttsCd;
	private String cntnTypeCd;
	private LocalDateTime regDt;
}

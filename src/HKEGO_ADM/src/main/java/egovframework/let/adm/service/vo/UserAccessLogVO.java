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

	public String getRequestUri() { return dmndUriAddr; }
	public void setRequestUri(String requestUri) { this.dmndUriAddr = requestUri; }
	public String getRequestMethod() { return dmndMthdCd; }
	public void setRequestMethod(String requestMethod) { this.dmndMthdCd = requestMethod; }
	public Integer getResponseStatus() { return rspnsSttsCd; }
	public void setResponseStatus(Integer responseStatus) { this.rspnsSttsCd = responseStatus; }
}

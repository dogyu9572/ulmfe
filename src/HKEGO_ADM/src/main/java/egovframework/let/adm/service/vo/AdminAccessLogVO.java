package egovframework.let.adm.service.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminAccessLogVO {
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

	public Integer getUsrIdx() { return userSn; }
	public void setUsrIdx(Integer usrIdx) { this.userSn = usrIdx; }
	public String getUsrId() { return userId; }
	public void setUsrId(String usrId) { this.userId = usrId; }
	public String getUsrNm() { return userNm; }
	public void setUsrNm(String usrNm) { this.userNm = usrNm; }
	public String getNm() { return userNm; }
	public void setNm(String nm) { this.userNm = nm; }
	public String getClientIp() { return ipAddr; }
	public void setClientIp(String clientIp) { this.ipAddr = clientIp; }
	public String getUserAgent() { return userAgtNm; }
	public void setUserAgent(String userAgent) { this.userAgtNm = userAgent; }
	public String getReferer() { return rfrerAddr; }
	public void setReferer(String referer) { this.rfrerAddr = referer; }
	public String getSessionId() { return ssnId; }
	public void setSessionId(String sessionId) { this.ssnId = sessionId; }
	public String getRequestUri() { return dmndUriAddr; }
	public void setRequestUri(String requestUri) { this.dmndUriAddr = requestUri; }
	public String getRequestMethod() { return dmndMthdCd; }
	public void setRequestMethod(String requestMethod) { this.dmndMthdCd = requestMethod; }
	public Integer getResponseStatus() { return rspnsSttsCd; }
	public void setResponseStatus(Integer responseStatus) { this.rspnsSttsCd = responseStatus; }
	public String getAccessType() { return cntnTypeCd; }
	public void setAccessType(String accessType) { this.cntnTypeCd = accessType; }
}


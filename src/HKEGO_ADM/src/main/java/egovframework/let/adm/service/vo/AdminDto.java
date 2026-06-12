package egovframework.let.adm.service.vo;

import lombok.Data;

@Data
public class AdminDto {
	private String id;
	private String userNm;
	private String emlAddr;
	private String acntSttsCd;
	private String authrtCd;

	public String getAiId() { return id; }
	public void setAiId(String aiId) { this.id = aiId; }
	public String getAiName() { return userNm; }
	public void setAiName(String aiName) { this.userNm = aiName; }
	public String getNm() { return userNm; }
	public void setNm(String nm) { this.userNm = nm; }
	public String getAiEmail() { return emlAddr; }
	public void setAiEmail(String aiEmail) { this.emlAddr = aiEmail; }
	public String getAiStatus() { return acntSttsCd; }
	public void setAiStatus(String aiStatus) { this.acntSttsCd = aiStatus; }
	public String getAiRole() { return authrtCd; }
	public void setAiRole(String aiRole) { this.authrtCd = aiRole; }
}


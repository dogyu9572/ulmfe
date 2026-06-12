package egovframework.let.adm.service.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminInfoVO {
	private String id;
	private String userNm;
	private String emlAddr;
	private String enpswd;
	private String acntSttsCd;
	private String authrtCd;
	private LocalDateTime regDt;
	private LocalDateTime mdfcnDt;
	private LocalDateTime lastCntnDt;

	public String getAiId() { return id; }
	public void setAiId(String aiId) { this.id = aiId; }
	public String getAiName() { return userNm; }
	public void setAiName(String aiName) { this.userNm = aiName; }
	public String getNm() { return userNm; }
	public void setNm(String nm) { this.userNm = nm; }
	public String getAiEmail() { return emlAddr; }
	public void setAiEmail(String aiEmail) { this.emlAddr = aiEmail; }
	public String getAiPassword() { return enpswd; }
	public void setAiPassword(String aiPassword) { this.enpswd = aiPassword; }
	public String getAiStatus() { return acntSttsCd; }
	public void setAiStatus(String aiStatus) { this.acntSttsCd = aiStatus; }
	public String getAiRole() { return authrtCd; }
	public void setAiRole(String aiRole) { this.authrtCd = aiRole; }
	public LocalDateTime getAiCreatedAt() { return regDt; }
	public void setAiCreatedAt(LocalDateTime aiCreatedAt) { this.regDt = aiCreatedAt; }
	public LocalDateTime getAiUpdatedAt() { return mdfcnDt; }
	public void setAiUpdatedAt(LocalDateTime aiUpdatedAt) { this.mdfcnDt = aiUpdatedAt; }
	public LocalDateTime getAiLastLogin() { return lastCntnDt; }
	public void setAiLastLogin(LocalDateTime aiLastLogin) { this.lastCntnDt = aiLastLogin; }
}


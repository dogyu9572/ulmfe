package egovframework.let.adm.service.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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

	/*
	 * 옛 필드명 호환용 별칭. 응답에는 내보내지 않는다(@JsonIgnore).
	 * 응답에 함께 실리면 화면이 행을 그대로 되돌려 보낼 때 표준 필드에 옛 값이 덮어써져
	 * 저장 성공 메시지가 뜨고도 값이 그대로 남는다. 요청은 계속 받아들인다.
	 */
	@JsonIgnore
	public String getAiId() { return id; }
	@JsonProperty("aiId")
	public void setAiId(String aiId) { this.id = aiId; }
	@JsonIgnore
	public String getAiName() { return userNm; }
	@JsonProperty("aiName")
	public void setAiName(String aiName) { this.userNm = aiName; }
	@JsonIgnore
	public String getNm() { return userNm; }
	@JsonProperty("nm")
	public void setNm(String nm) { this.userNm = nm; }
	@JsonIgnore
	public String getAiEmail() { return emlAddr; }
	@JsonProperty("aiEmail")
	public void setAiEmail(String aiEmail) { this.emlAddr = aiEmail; }
	@JsonIgnore
	public String getAiPassword() { return enpswd; }
	@JsonProperty("aiPassword")
	public void setAiPassword(String aiPassword) { this.enpswd = aiPassword; }
	@JsonIgnore
	public String getAiStatus() { return acntSttsCd; }
	@JsonProperty("aiStatus")
	public void setAiStatus(String aiStatus) { this.acntSttsCd = aiStatus; }
	@JsonIgnore
	public String getAiRole() { return authrtCd; }
	@JsonProperty("aiRole")
	public void setAiRole(String aiRole) { this.authrtCd = aiRole; }
	@JsonIgnore
	public LocalDateTime getAiCreatedAt() { return regDt; }
	@JsonProperty("aiCreatedAt")
	public void setAiCreatedAt(LocalDateTime aiCreatedAt) { this.regDt = aiCreatedAt; }
	@JsonIgnore
	public LocalDateTime getAiUpdatedAt() { return mdfcnDt; }
	@JsonProperty("aiUpdatedAt")
	public void setAiUpdatedAt(LocalDateTime aiUpdatedAt) { this.mdfcnDt = aiUpdatedAt; }
	@JsonIgnore
	public LocalDateTime getAiLastLogin() { return lastCntnDt; }
	@JsonProperty("aiLastLogin")
	public void setAiLastLogin(LocalDateTime aiLastLogin) { this.lastCntnDt = aiLastLogin; }
}


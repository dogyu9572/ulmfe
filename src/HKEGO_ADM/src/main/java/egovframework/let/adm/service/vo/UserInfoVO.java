package egovframework.let.adm.service.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoVO {
	private Integer userSn;
	private String userSeCd;
	private String authrtCd;
	private String userId;
	private String enpswd;
	private String userNm;
	private String mblTelno;
	private String emlAddr;
	private String zip;
	private String addr;
	private String dtlAddr;
	private String coNm;
	private String deptNm;
	private String jbgdNm;
	private String mmplSttsCd;
	private LocalDateTime lastCntnDt;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;
	private LocalDateTime trnsfDt;
	private LocalDateTime actvtnDt;
	private LocalDateTime drmcyRlsDt;
	private String whdwlUserIdHash;
	private String acntLckCd;
	private Integer acntLckCnt;
	private LocalDateTime acntLckDt;
	private String acntLckIpAddr;

	/*
	 * 옛 필드명 호환용 별칭. 응답에는 내보내지 않는다(@JsonIgnore).
	 * 응답에 함께 실리면 화면이 행을 그대로 되돌려 보낼 때 표준 필드에 옛 값이 덮어써져
	 * 저장 성공 메시지가 뜨고도 값이 그대로 남는다. 요청은 계속 받아들인다.
	 */
	@JsonIgnore
	public Integer getUsrIdx() { return userSn; }
	@JsonProperty("usrIdx")
	public void setUsrIdx(Integer usrIdx) { this.userSn = usrIdx; }
	@JsonIgnore
	public String getUsrGb() { return userSeCd; }
	@JsonProperty("usrGb")
	public void setUsrGb(String usrGb) { this.userSeCd = usrGb; }
	@JsonIgnore
	public String getUsrLevel() { return authrtCd; }
	@JsonProperty("usrLevel")
	public void setUsrLevel(String usrLevel) { this.authrtCd = usrLevel; }
	@JsonIgnore
	public String getUsrId() { return userId; }
	@JsonProperty("usrId")
	public void setUsrId(String usrId) { this.userId = usrId; }
	@JsonIgnore
	public String getUsrPwd() { return enpswd; }
	@JsonProperty("usrPwd")
	public void setUsrPwd(String usrPwd) { this.enpswd = usrPwd; }
	@JsonIgnore
	public String getUsrNm() { return userNm; }
	@JsonProperty("usrNm")
	public void setUsrNm(String usrNm) { this.userNm = usrNm; }
	@JsonIgnore
	public String getNm() { return userNm; }
	@JsonProperty("nm")
	public void setNm(String nm) { this.userNm = nm; }
	@JsonIgnore
	public String getUsrHp() { return mblTelno; }
	@JsonProperty("usrHp")
	public void setUsrHp(String usrHp) { this.mblTelno = usrHp; }
	@JsonIgnore
	public String getUsrEmail() { return emlAddr; }
	@JsonProperty("usrEmail")
	public void setUsrEmail(String usrEmail) { this.emlAddr = usrEmail; }
	@JsonIgnore
	public String getUsrZip() { return zip; }
	@JsonProperty("usrZip")
	public void setUsrZip(String usrZip) { this.zip = usrZip; }
	@JsonIgnore
	public String getUsrAddr1() { return addr; }
	@JsonProperty("usrAddr1")
	public void setUsrAddr1(String usrAddr1) { this.addr = usrAddr1; }
	@JsonIgnore
	public String getUsrAddr2() { return dtlAddr; }
	@JsonProperty("usrAddr2")
	public void setUsrAddr2(String usrAddr2) { this.dtlAddr = usrAddr2; }
	@JsonIgnore
	public String getUsrCmp() { return coNm; }
	@JsonProperty("usrCmp")
	public void setUsrCmp(String usrCmp) { this.coNm = usrCmp; }
	@JsonIgnore
	public String getUsrDept() { return deptNm; }
	@JsonProperty("usrDept")
	public void setUsrDept(String usrDept) { this.deptNm = usrDept; }
	@JsonIgnore
	public String getUsrPost() { return jbgdNm; }
	@JsonProperty("usrPost")
	public void setUsrPost(String usrPost) { this.jbgdNm = usrPost; }
	@JsonIgnore
	public String getUsrSta() { return mmplSttsCd; }
	@JsonProperty("usrSta")
	public void setUsrSta(String usrSta) { this.mmplSttsCd = usrSta; }
	@JsonIgnore
	public LocalDateTime getLastLogin() { return lastCntnDt; }
	@JsonProperty("lastLogin")
	public void setLastLogin(LocalDateTime lastLogin) { this.lastCntnDt = lastLogin; }
	@JsonIgnore
	public LocalDateTime getRegdt() { return regDt; }
	@JsonProperty("regdt")
	public void setRegdt(LocalDateTime regdt) { this.regDt = regdt; }
	@JsonIgnore
	public String getRegId() { return rgtr; }
	@JsonProperty("regId")
	public void setRegId(String regId) { this.rgtr = regId; }
	@JsonIgnore
	public LocalDateTime getModdt() { return mdfcnDt; }
	@JsonProperty("moddt")
	public void setModdt(LocalDateTime moddt) { this.mdfcnDt = moddt; }
	@JsonIgnore
	public String getModId() { return mdtr; }
	@JsonProperty("modId")
	public void setModId(String modId) { this.mdtr = modId; }
	@JsonIgnore
	public LocalDateTime getDeldt() { return delDt; }
	@JsonProperty("deldt")
	public void setDeldt(LocalDateTime deldt) { this.delDt = deldt; }
	@JsonIgnore
	public String getDelId() { return deltr; }
	@JsonProperty("delId")
	public void setDelId(String delId) { this.deltr = delId; }
}

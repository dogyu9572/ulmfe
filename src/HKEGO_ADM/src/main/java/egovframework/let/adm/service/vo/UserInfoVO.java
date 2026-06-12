package egovframework.let.adm.service.vo;

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

	public Integer getUsrIdx() { return userSn; }
	public void setUsrIdx(Integer usrIdx) { this.userSn = usrIdx; }
	public String getUsrGb() { return userSeCd; }
	public void setUsrGb(String usrGb) { this.userSeCd = usrGb; }
	public String getUsrLevel() { return authrtCd; }
	public void setUsrLevel(String usrLevel) { this.authrtCd = usrLevel; }
	public String getUsrId() { return userId; }
	public void setUsrId(String usrId) { this.userId = usrId; }
	public String getUsrPwd() { return enpswd; }
	public void setUsrPwd(String usrPwd) { this.enpswd = usrPwd; }
	public String getUsrNm() { return userNm; }
	public void setUsrNm(String usrNm) { this.userNm = usrNm; }
	public String getNm() { return userNm; }
	public void setNm(String nm) { this.userNm = nm; }
	public String getUsrHp() { return mblTelno; }
	public void setUsrHp(String usrHp) { this.mblTelno = usrHp; }
	public String getUsrEmail() { return emlAddr; }
	public void setUsrEmail(String usrEmail) { this.emlAddr = usrEmail; }
	public String getUsrZip() { return zip; }
	public void setUsrZip(String usrZip) { this.zip = usrZip; }
	public String getUsrAddr1() { return addr; }
	public void setUsrAddr1(String usrAddr1) { this.addr = usrAddr1; }
	public String getUsrAddr2() { return dtlAddr; }
	public void setUsrAddr2(String usrAddr2) { this.dtlAddr = usrAddr2; }
	public String getUsrCmp() { return coNm; }
	public void setUsrCmp(String usrCmp) { this.coNm = usrCmp; }
	public String getUsrDept() { return deptNm; }
	public void setUsrDept(String usrDept) { this.deptNm = usrDept; }
	public String getUsrPost() { return jbgdNm; }
	public void setUsrPost(String usrPost) { this.jbgdNm = usrPost; }
	public String getUsrSta() { return mmplSttsCd; }
	public void setUsrSta(String usrSta) { this.mmplSttsCd = usrSta; }
	public LocalDateTime getLastLogin() { return lastCntnDt; }
	public void setLastLogin(LocalDateTime lastLogin) { this.lastCntnDt = lastLogin; }
	public LocalDateTime getRegdt() { return regDt; }
	public void setRegdt(LocalDateTime regdt) { this.regDt = regdt; }
	public String getRegId() { return rgtr; }
	public void setRegId(String regId) { this.rgtr = regId; }
	public LocalDateTime getModdt() { return mdfcnDt; }
	public void setModdt(LocalDateTime moddt) { this.mdfcnDt = moddt; }
	public String getModId() { return mdtr; }
	public void setModId(String modId) { this.mdtr = modId; }
	public LocalDateTime getDeldt() { return delDt; }
	public void setDeldt(LocalDateTime deldt) { this.delDt = deldt; }
	public String getDelId() { return deltr; }
	public void setDelId(String delId) { this.deltr = delId; }
}

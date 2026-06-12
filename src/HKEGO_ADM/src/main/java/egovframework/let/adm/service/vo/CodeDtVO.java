package egovframework.let.adm.service.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CodeDtVO {
	private String cdId;
	private String cdDtlId;
	private String cdDtlNm;
	private String cdDtlCn;
	private Integer seq;
	private String useYn;
	private String etc1;
	private String etc2;
	private String etc3;
	private String atchFileMngNo;
	private LocalDateTime regDt;
	private String rgtr;

	public String getCodeId() { return cdId; }
	public void setCodeId(String codeId) { this.cdId = codeId; }
	public String getCode() { return cdDtlId; }
	public void setCode(String code) { this.cdDtlId = code; }
	public String getCodeNm() { return cdDtlNm; }
	public void setCodeNm(String codeNm) { this.cdDtlNm = codeNm; }
	public String getCodeDc() { return cdDtlCn; }
	public void setCodeDc(String codeDc) { this.cdDtlCn = codeDc; }
	public String getCodeEtc1() { return etc1; }
	public void setCodeEtc1(String codeEtc1) { this.etc1 = codeEtc1; }
	public String getCodeEtc2() { return etc2; }
	public void setCodeEtc2(String codeEtc2) { this.etc2 = codeEtc2; }
	public String getCodeEtc3() { return etc3; }
	public void setCodeEtc3(String codeEtc3) { this.etc3 = codeEtc3; }
	public String getCodeFile() { return atchFileMngNo; }
	public void setCodeFile(String codeFile) { this.atchFileMngNo = codeFile; }
}


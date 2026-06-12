package egovframework.let.adm.service.vo;

import lombok.Data;

@Data
public class CodeMaVO {
	private String cdId;
	private String cdNm;
	private String cdCn;
	private String useYn;

	public String getCodeId() { return cdId; }
	public void setCodeId(String codeId) { this.cdId = codeId; }
	public String getCodeIdNm() { return cdNm; }
	public void setCodeIdNm(String codeIdNm) { this.cdNm = codeIdNm; }
	public String getCodeIdDc() { return cdCn; }
	public void setCodeIdDc(String codeIdDc) { this.cdCn = codeIdDc; }
}


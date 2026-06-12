package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthGroupDto {
	private String authrtCd;
	private String authrtNm;
	private String authrtCn;
	private String useYn;

	public String getAgId() { return authrtCd; }
	public void setAgId(String agId) { this.authrtCd = agId; }
	public String getAgName() { return authrtNm; }
	public void setAgName(String agName) { this.authrtNm = agName; }
	public String getAgDesc() { return authrtCn; }
	public void setAgDesc(String agDesc) { this.authrtCn = agDesc; }
	public String getAgUseYn() { return useYn; }
	public void setAgUseYn(String agUseYn) { this.useYn = agUseYn; }
}

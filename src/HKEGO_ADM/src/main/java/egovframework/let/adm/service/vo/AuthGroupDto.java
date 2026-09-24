package egovframework.let.adm.service.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

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

	/*
	 * 옛 필드명 호환용 별칭. 응답에는 내보내지 않는다(@JsonIgnore).
	 * 응답에 함께 실리면 화면이 행을 그대로 되돌려 보낼 때 표준 필드(authrtNm)에 옛 값이 덮어써져
	 * "수정되었습니다"가 뜨고도 값이 그대로 남는다. 요청은 계속 받아들인다.
	 */
	@JsonIgnore
	public String getAgId() { return authrtCd; }
	@JsonProperty("agId")
	public void setAgId(String agId) { this.authrtCd = agId; }
	@JsonIgnore
	public String getAgName() { return authrtNm; }
	@JsonProperty("agName")
	public void setAgName(String agName) { this.authrtNm = agName; }
	@JsonIgnore
	public String getAgDesc() { return authrtCn; }
	@JsonProperty("agDesc")
	public void setAgDesc(String agDesc) { this.authrtCn = agDesc; }
	@JsonIgnore
	public String getAgUseYn() { return useYn; }
	@JsonProperty("agUseYn")
	public void setAgUseYn(String agUseYn) { this.useYn = agUseYn; }
}

package egovframework.let.adm.service.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopupDto {
	private Long popupSn;
	private String popupNm;
	private String popupCn;
	private Integer popupPstnX;
	private Integer popupPstnY;
	private Integer popupWdth;
	private Integer popupHght;
	private LocalDate pstgBgngYmd;
	private LocalDate pstgEndYmd;
	private String useYn;
	private String atchFileMngNo;
	private String popupUrlAddr;
	private String lnkgSeCd;

	/*
	 * 옛 필드명 호환용 별칭. 응답에는 내보내지 않는다(@JsonIgnore).
	 * 응답에 함께 실리면 화면이 행을 그대로 되돌려 보낼 때 표준 필드에 옛 값이 덮어써져
	 * 저장 성공 메시지가 뜨고도 값이 그대로 남는다. 요청은 계속 받아들인다.
	 */
	@JsonIgnore
	public Long getPopId() { return popupSn; }
	@JsonProperty("popId")
	public void setPopId(Long popId) { this.popupSn = popId; }
	@JsonIgnore
	public String getPopSj() { return popupNm; }
	@JsonProperty("popSj")
	public void setPopSj(String popSj) { this.popupNm = popSj; }
	@JsonIgnore
	public String getPopCn() { return popupCn; }
	@JsonProperty("popCn")
	public void setPopCn(String popCn) { this.popupCn = popCn; }
	@JsonIgnore
	public Integer getPopPosx() { return popupPstnX; }
	@JsonProperty("popPosx")
	public void setPopPosx(Integer popPosx) { this.popupPstnX = popPosx; }
	@JsonIgnore
	public Integer getPopPosy() { return popupPstnY; }
	@JsonProperty("popPosy")
	public void setPopPosy(Integer popPosy) { this.popupPstnY = popPosy; }
	@JsonIgnore
	public Integer getPopWidth() { return popupWdth; }
	@JsonProperty("popWidth")
	public void setPopWidth(Integer popWidth) { this.popupWdth = popWidth; }
	@JsonIgnore
	public Integer getPopHeight() { return popupHght; }
	@JsonProperty("popHeight")
	public void setPopHeight(Integer popHeight) { this.popupHght = popHeight; }
	@JsonIgnore
	public LocalDate getPopSdt() { return pstgBgngYmd; }
	@JsonProperty("popSdt")
	public void setPopSdt(LocalDate popSdt) { this.pstgBgngYmd = popSdt; }
	@JsonIgnore
	public LocalDate getPopEdt() { return pstgEndYmd; }
	@JsonProperty("popEdt")
	public void setPopEdt(LocalDate popEdt) { this.pstgEndYmd = popEdt; }
	@JsonIgnore
	public String getPopImg() { return atchFileMngNo; }
	@JsonProperty("popImg")
	public void setPopImg(String popImg) { this.atchFileMngNo = popImg; }
	@JsonIgnore
	public String getPopLink() { return popupUrlAddr; }
	@JsonProperty("popLink")
	public void setPopLink(String popLink) { this.popupUrlAddr = popLink; }
	@JsonIgnore
	public String getLinkType() { return lnkgSeCd; }
	@JsonProperty("linkType")
	public void setLinkType(String linkType) { this.lnkgSeCd = linkType; }
}

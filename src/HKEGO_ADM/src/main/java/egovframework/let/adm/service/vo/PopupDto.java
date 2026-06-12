package egovframework.let.adm.service.vo;

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

	public Long getPopId() { return popupSn; }
	public void setPopId(Long popId) { this.popupSn = popId; }
	public String getPopSj() { return popupNm; }
	public void setPopSj(String popSj) { this.popupNm = popSj; }
	public String getPopCn() { return popupCn; }
	public void setPopCn(String popCn) { this.popupCn = popCn; }
	public Integer getPopPosx() { return popupPstnX; }
	public void setPopPosx(Integer popPosx) { this.popupPstnX = popPosx; }
	public Integer getPopPosy() { return popupPstnY; }
	public void setPopPosy(Integer popPosy) { this.popupPstnY = popPosy; }
	public Integer getPopWidth() { return popupWdth; }
	public void setPopWidth(Integer popWidth) { this.popupWdth = popWidth; }
	public Integer getPopHeight() { return popupHght; }
	public void setPopHeight(Integer popHeight) { this.popupHght = popHeight; }
	public LocalDate getPopSdt() { return pstgBgngYmd; }
	public void setPopSdt(LocalDate popSdt) { this.pstgBgngYmd = popSdt; }
	public LocalDate getPopEdt() { return pstgEndYmd; }
	public void setPopEdt(LocalDate popEdt) { this.pstgEndYmd = popEdt; }
	public String getPopImg() { return atchFileMngNo; }
	public void setPopImg(String popImg) { this.atchFileMngNo = popImg; }
	public String getPopLink() { return popupUrlAddr; }
	public void setPopLink(String popLink) { this.popupUrlAddr = popLink; }
	public String getLinkType() { return lnkgSeCd; }
	public void setLinkType(String linkType) { this.lnkgSeCd = linkType; }
}

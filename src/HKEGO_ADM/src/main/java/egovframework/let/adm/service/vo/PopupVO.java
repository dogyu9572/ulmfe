package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopupVO {
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
	private String rgtr;
	private LocalDateTime regDt;
	private String mdtr;
	private LocalDateTime mdfcnDt;
	private String deltr;
	private LocalDateTime delDt;
}

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
public class BannerVO {
	private Integer bnrSn;
	private String bnrNm;
	private String bnrMainCn;
	private String bnrSubCn;
	private String pdtYmd;
	private String newBadgeYn;
	private String lnkgUrlAddr;
	private String lnkgSeCd;
	private String pstgBgngYmd;
	private String pstgEndYmd;
	private String pstgPrdUseYn;
	private String pcAtchFileId;
	private String moblAtchFileId;
	private Integer sortSeq;
	private String useYn;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;
}

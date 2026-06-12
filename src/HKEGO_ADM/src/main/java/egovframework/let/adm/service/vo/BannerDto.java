package egovframework.let.adm.service.vo;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerDto {
	private Integer bnrSn;
	private String bnrNm;
	private String bnrMainCn;
	private String bnrSubCn;
	@JsonAlias("bnrPdt")
	private String pdtYmd;
	@JsonAlias("bnrNew")
	private String newBadgeYn;
	private String lnkgUrlAddr;
	private String lnkgSeCd;
	private String pstgBgngYmd;
	private String pstgEndYmd;
	@JsonAlias("bnrDtop")
	private String pstgPrdUseYn;
	@JsonAlias("bnrImgpc")
	private String pcAtchFileId;
	@JsonAlias("bnrImgmo")
	private String moblAtchFileId;
	private Integer sortSeq;
	private String useYn;
}

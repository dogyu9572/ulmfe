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
public class BbsMasterVO {
	private String bbsId;
	private String bbsNm;
	private String bbsCn;
	private String bbsSkinCd;
	private String bbsImgFileId;
	private Integer pageArtclCnt;
	private String atchFileYn;
	private Integer atchFileCnt;
	private Integer atchFileSz;
	private String useYn;
	private String ansYn;
	private String cmntYn;
	private String sortYn;
	private String mainPstgYn;
	private String upendFixYn;
	private String thmbYn;
	private String lnkgYn;
	private String hdnYn;
	private String lckYn;
	private String newYn;
	private Integer newNmtm;
	private String popYn;
	private Integer popInqCnt;
	private String ctgrYn;
	private String ctgrCdId;
	private String etc1UseYn;
	private String etc1Nm;
	private String etc1TypeCd;
	private String etc1CdId;
	private String etc2UseYn;
	private String etc2Nm;
	private String etc2TypeCd;
	private String etc2CdId;
	private String etc3UseYn;
	private String etc3Nm;
	private String etc3TypeCd;
	private String etc3CdId;
	private String etc4UseYn;
	private String etc4Nm;
	private String etc4TypeCd;
	private String etc4CdId;
	private String etc5UseYn;
	private String etc5Nm;
	private String etc5TypeCd;
	private String etc5CdId;
	private String listAuthrtCd;
	private String dtlAuthrtCd;
	private String wrtAuthrtCd;
	private String rgtr;
	private LocalDateTime regDt;
	private String mdtr;
	private LocalDateTime mdfcnDt;
}

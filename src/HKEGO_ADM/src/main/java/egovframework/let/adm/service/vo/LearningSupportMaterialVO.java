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
public class LearningSupportMaterialVO {
	private String pstSn;
	private String pstTtl;
	private String pstCn;
	private String lrnTypeCd;
	private String lrnTypeNm;
	private String dataTypeCd;
	private String dataTypeNm;
	private String prgrmTypeCd;
	private String prgrmTypeNm;
	private Integer prgrmSn;
	private String prgrmNm;
	private String linkUrl;
	private String videoEmbedUrl;
	private String atchFileMngNo;
	private String wrtrNm;
	private String wrtrId;
	private String pstgYmd;
	private String useYn;
	private Integer inqCnt;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
}

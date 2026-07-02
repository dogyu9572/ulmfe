package egovframework.tablet.service.vo;

import lombok.Data;

@Data
public class TabletLearningResourceVO {
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
	private Integer fileSeq;
	private String fileUrl;
	private String orgnlFileNm;
	private String pstgYmd;
}

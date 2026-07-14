package egovframework.let.adm.service.vo;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MaterialDownloadStatsVO {
	private String pstSn;
	private String lrnTypeCd;
	private String lrnTypeNm;
	private String dataTypeCd;
	private String dataTypeNm;
	private String programNm;
	private String postTitle;
	private String attachmentFileMngNo;
	private Integer fileSeq;
	private String originalFileName;
	private Integer downloadCount;
	private LocalDateTime fileRegDt;
}

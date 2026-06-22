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
public class EducationContentQuestionVO {
	private Integer cntnQstnSn;
	private Integer cntnSn;
	private String qstnTypeCd;
	private String qstnTypeNm;
	private String qstnNm;
	private String qstnImgAtchFileId;
	private String optnCn;
	private Integer sortSeq;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
}

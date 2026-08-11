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
public class EsdQuestionVO {
	private Integer esdQstnSn;
	private String qstnTypeCd;
	private String qstnTypeNm;
	private String qstnCn;
	private String qstnImgAtchFileId;
	private String optnCn;
	private String cransNo;
	private String cransExpln;
	private String useYn;
	private Integer sortSeq;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdfr;
	private LocalDateTime delDt;
	private String dltr;
}

package egovframework.let.adm.service.vo;

import lombok.Data;

@Data
public class EsdQuestionDto {
	private String qstnTypeCd;
	private String qstnCn;
	private String qstnImgAtchFileId;
	private String optnCn;
	private String cransNo;
	private String cransExpln;
	private String useYn;
	private Integer sortSeq;
}

package egovframework.let.adm.service.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class EducationContentDto {
	private String cntnTypeCd;
	private String cardClsfCd;
	private String cntnTtl;
	private String cntnCn;
	private String prvdTypeCd;
	private String imgAtchFileId;
	private String videoUrlAddr;
	private String videoThmbAtchFileId;
	private String videoTtl;
	private String useYn;
	private List<QuestionDto> questions = new ArrayList<>();

	@Data
	public static class QuestionDto {
		private String qstnTypeCd;
		private String qstnNm;
		private String qstnImgAtchFileId;
		private String optnCn;
		private Integer sortSeq;
	}
}

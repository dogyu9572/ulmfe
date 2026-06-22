package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationContentVO {
	private Integer cntnSn;
	private String cntnTypeCd;
	private String cntnTypeNm;
	private String cardClsfCd;
	private String cardClsfNm;
	private String cntnTtl;
	private String cntnCn;
	private String prvdTypeCd;
	private String prvdTypeNm;
	private String imgAtchFileId;
	private String videoUrlAddr;
	private String videoThmbAtchFileId;
	private String videoTtl;
	private String useYn;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;

	@Builder.Default
	private List<EducationContentQuestionVO> questions = new ArrayList<>();
}

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
public class EducationProgramVO {
	private Integer prgrmSn;
	private String prgrmTypeCd;
	private String prgrmTypeNm;
	private String prgrmNm;
	private String trgtCn;
	private Integer totalTmMnt;
	private Integer maxNope;
	private String simpleExpln;
	private String startExpln;
	private String useYn;
	private Integer teamCnt;
	private String routeJson;
	private String stepJson;
	private String evalJson;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;
}

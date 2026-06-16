package egovframework.let.adm.service.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomepageOrgChartVO {
	private Integer orgMbrSn;
	private String frstClsfCd;
	private String frstClsfNm;
	private String scndClsfCd;
	private String scndClsfNm;
	private String taskCn;
	private String telno;
	private Integer sortSeq;
	private String useYn;
	private String delYn;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;
}

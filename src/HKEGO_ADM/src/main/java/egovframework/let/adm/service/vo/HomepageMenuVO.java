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
public class HomepageMenuVO {
	private String menuCd;
	private String parentMenuCd;
	private Integer menuDepth;
	private String menuNm;
	private String originalMenuNm;
	private Integer sortSeq;
	private String useYn;
	private String delYn;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
}

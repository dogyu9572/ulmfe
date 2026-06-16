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
public class HomepageSearchPageVO {
	private Integer srchPageSn;
	private String menu1DepthNm;
	private String menu2DepthNm;
	private String menu3DepthNm;
	private String pageTtl;
	private String pageCn;
	private String pageUrl;
	private String delYn;
	private LocalDateTime regDt;
	private String rgtr;
	private String rgtrNm;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;
}

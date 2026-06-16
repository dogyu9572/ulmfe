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
public class HomepageTermsVO {
	private Integer trmsSn;
	private String trmsTypeCd;
	private String trmsTypeNm;
	private String trmsTtl;
	private String trmsCn;
	private String currentYn;
	private String delYn;
	private LocalDateTime regDt;
	private String rgtr;
	private String rgtrNm;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;
}

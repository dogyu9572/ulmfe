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
public class SiteBasicSettingVO {
	private String stngId;
	private String siteTtl;
	private String hmpgAddr;
	private String mngrEmlAddr;
	private String ednstNm;
	private String ednstAddr;
	private String ednstTelno;
	private String logoFileId;
	private String faviconFileId;
	private String ftrCn;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
}

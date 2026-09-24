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
public class HomepageHistoryVO {
	private Integer hstrySn;
	private String hstryYr;
	/** 시점 라벨. 월 숫자가 아니라 "3. 16." / "2022. 10. ~ 2023. 9." 같은 자유 텍스트다. */
	private String hstryMm;
	private String hstryCn;
	private String imgFileId;
	private String useYn;
	private String delYn;
	private LocalDateTime regDt;
	private String rgtr;
	private LocalDateTime mdfcnDt;
	private String mdtr;
	private LocalDateTime delDt;
	private String deltr;
}

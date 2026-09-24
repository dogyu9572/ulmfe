// 휴관일(CLSR_DAY_MST) 한 건을 담는 VO
package egovframework.let.adm.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClosedDayVO {
	private Long clsrSn;
	private String clsrSeCd;
	private LocalDate bgngYmd;
	private LocalDate endYmd;
	private String clsrResnCn;
	private String useYn;
	private String rgtrNm;
	private LocalDateTime regDt;
	private String mdfrNm;
	private LocalDateTime mdfcnDt;
}

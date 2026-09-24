// 공개 화면에서 사용하는 휴관일 등록 기간 한 건
package egovframework.let.usr.service.vo;

import java.time.LocalDate;

import lombok.Data;
import lombok.NoArgsConstructor;

// MyBatis 가 resultType 으로만 생성하므로 기본 생성자와 세터만 있으면 된다.
@Data
@NoArgsConstructor
public class PublicClosedDayVO {
	private String clsrSeCd;
	private LocalDate bgngYmd;
	private LocalDate endYmd;
}

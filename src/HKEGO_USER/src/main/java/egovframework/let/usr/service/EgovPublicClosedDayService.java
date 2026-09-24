// 이달의 휴관일 조회 서비스 인터페이스
package egovframework.let.usr.service;

import egovframework.let.usr.service.vo.PublicClosedDayMonthVO;

public interface EgovPublicClosedDayService {
	PublicClosedDayMonthVO getClosedDaysOfMonth(String month);
}

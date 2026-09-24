// 휴관일 관리와 정기휴관 요일 설정을 담당하는 서비스 인터페이스
package egovframework.let.adm.service;

import java.util.List;
import java.util.Map;

import egovframework.let.adm.service.vo.ClosedDayVO;

public interface EgovClosedDayService {
	Map<String, Object> getClosedDayListPage(
		String useYn, String clsrSeCd, String startDate, String endDate, String searchKeyword, int page, int size
	);
	ClosedDayVO getClosedDayById(Long clsrSn);
	ClosedDayVO createClosedDay(ClosedDayVO closedDay, String adminName);
	ClosedDayVO updateClosedDay(Long clsrSn, ClosedDayVO closedDay, String adminName);
	void deleteClosedDay(Long clsrSn, String adminName);
	int deleteClosedDays(List<Long> clsrSnList, String adminName);
	String getRegularClosedDayCode();
	String saveRegularClosedDayCode(String rglrClsrDayCd, String adminName);
}

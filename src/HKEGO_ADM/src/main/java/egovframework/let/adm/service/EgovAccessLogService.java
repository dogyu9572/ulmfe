package egovframework.let.adm.service;

import java.util.Map;
import java.util.List;

import egovframework.let.adm.service.vo.AdminAccessLogVO;

public interface EgovAccessLogService {
	Map<String, Object> getAccessLogs(
		String menu1Cd,
		String menu2Cd,
		String userNm,
		String startDate,
		String endDate,
		int page,
		int size
	);

	List<AdminAccessLogVO> getAccessLogExcelRows(
		String menu1Cd,
		String menu2Cd,
		String userNm,
		String startDate,
		String endDate
	);
}

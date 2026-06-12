package egovframework.let.adm.service;

import java.util.Map;

public interface EgovAccessLogService {
	Map<String, Object> getAccessLogs(
		String usrId,
		String usrNm,
		String clientIp,
		String accessType,
		String startDate,
		String endDate,
		int page,
		int size
	);
}

package egovframework.let.adm.service;

import java.util.Map;

public interface EgovUserAccessLogService {
	Map<String, Object> getUserAccessLogs(
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

package egovframework.let.adm.service;

import java.util.List;
import java.util.Map;

import egovframework.let.adm.service.vo.NotificationSendLogVO;

public interface EgovNotificationSendLogService {
	Map<String, Object> getNotificationSendLogs(
		String targetCd, String startDate, String endDate, String searchType, String keyword, int page, int size
	);

	List<NotificationSendLogVO> getNotificationSendLogExcelRows(
		String targetCd, String startDate, String endDate, String searchType, String keyword
	);
}

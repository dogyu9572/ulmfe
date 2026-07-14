package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import egovframework.let.adm.service.EgovNotificationSendLogService;
import egovframework.let.adm.service.vo.NotificationSendLogVO;
import jakarta.annotation.Resource;

@Service("egovNotificationSendLogService")
public class EgovNotificationSendLogServiceImpl extends EgovAbstractServiceImpl implements EgovNotificationSendLogService {
	@Resource(name = "notificationSendLogDAO")
	private NotificationSendLogDAO notificationSendLogDAO;

	@Override
	public Map<String, Object> getNotificationSendLogs(
		String targetCd, String startDate, String endDate, String searchType, String keyword, int page, int size
	) {
		int safePage = Math.max(page, 1);
		int safeSize = Math.min(Math.max(size, 1), 100);
		int offset = (safePage - 1) * safeSize;
		List<NotificationSendLogVO> list = notificationSendLogDAO.selectList(
			targetCd, startDate, endDate, searchType, keyword, offset, safeSize
		);
		int count = notificationSendLogDAO.selectCount(targetCd, startDate, endDate, searchType, keyword);
		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("count", count);
		result.put("page", safePage);
		result.put("size", safeSize);
		return result;
	}

	@Override
	public List<NotificationSendLogVO> getNotificationSendLogExcelRows(
		String targetCd, String startDate, String endDate, String searchType, String keyword
	) {
		return notificationSendLogDAO.selectExcelList(targetCd, startDate, endDate, searchType, keyword);
	}
}

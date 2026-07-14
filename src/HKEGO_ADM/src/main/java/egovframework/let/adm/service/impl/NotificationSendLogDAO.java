package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.NotificationSendLogVO;

@Repository("notificationSendLogDAO")
public class NotificationSendLogDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.NotificationSendLogDAO.";

	public List<NotificationSendLogVO> selectList(
		String targetCd, String startDate, String endDate, String searchType, String keyword,
		int offset, int limit
	) {
		Map<String, Object> params = params(targetCd, startDate, endDate, searchType, keyword);
		params.put("offset", offset);
		params.put("limit", limit);
		return selectList(NS + "selectList", params);
	}

	public int selectCount(String targetCd, String startDate, String endDate, String searchType, String keyword) {
		Integer count = selectOne(NS + "selectCount", params(targetCd, startDate, endDate, searchType, keyword));
		return count == null ? 0 : count;
	}

	public List<NotificationSendLogVO> selectExcelList(
		String targetCd, String startDate, String endDate, String searchType, String keyword
	) {
		return selectList(NS + "selectExcelList", params(targetCd, startDate, endDate, searchType, keyword));
	}

	private Map<String, Object> params(
		String targetCd, String startDate, String endDate, String searchType, String keyword
	) {
		Map<String, Object> params = new HashMap<>();
		params.put("targetCd", targetCd);
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		params.put("searchType", searchType);
		params.put("keyword", keyword);
		return params;
	}
}

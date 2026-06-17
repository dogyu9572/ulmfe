package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.UserAccessLogVO;
import egovframework.let.adm.service.impl.UserAccessLogDAO;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovUserAccessLogService;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("egovUserAccessLogService")
public class EgovUserAccessLogServiceImpl extends EgovAbstractServiceImpl implements EgovUserAccessLogService {
	@Resource(name = "userAccessLogDAO")
	private UserAccessLogDAO userAccessLogDAO;

	public Map<String, Object> getUserAccessLogs(
		String usrId,
		String usrNm,
		String clientIp,
		String accessType,
		String startDate,
		String endDate,
		int page,
		int size
	) {
		int safePage = Math.max(page, 1);
		int safeSize = Math.max(size, 1);
		int offset = (safePage - 1) * safeSize;
		List<UserAccessLogVO> list = userAccessLogDAO.selectList(usrId, usrNm, clientIp, accessType, startDate, endDate, offset, safeSize);
		int count = userAccessLogDAO.selectCount(usrId, usrNm, clientIp, accessType, startDate, endDate);
		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("count", count);
		result.put("page", safePage);
		result.put("size", safeSize);
		return result;
	}

	public List<UserAccessLogVO> getUserAccessLogExcelRows(
		String usrId,
		String usrNm,
		String clientIp,
		String accessType,
		String startDate,
		String endDate
	) {
		return userAccessLogDAO.selectExcelList(usrId, usrNm, clientIp, accessType, startDate, endDate);
	}
}

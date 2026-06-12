package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.AdminAccessLogVO;
import egovframework.let.adm.service.impl.AdminAccessLogDAO;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovAccessLogService;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("egovAccessLogService")
public class EgovAccessLogServiceImpl extends EgovAbstractServiceImpl implements EgovAccessLogService {
	@Resource(name = "adminAccessLogDAO")
	private AdminAccessLogDAO adminAccessLogDAO;

	public Map<String, Object> getAccessLogs(
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
		List<AdminAccessLogVO> list = adminAccessLogDAO.selectList(usrId, usrNm, clientIp, accessType, startDate, endDate, offset, safeSize);
		int count = adminAccessLogDAO.selectCount(usrId, usrNm, clientIp, accessType, startDate, endDate);
		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("count", count);
		result.put("page", safePage);
		result.put("size", safeSize);
		return result;
	}
}

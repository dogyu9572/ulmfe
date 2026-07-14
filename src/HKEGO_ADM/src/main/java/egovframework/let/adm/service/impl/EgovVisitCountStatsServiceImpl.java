package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.Map;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import egovframework.let.adm.service.EgovVisitCountStatsService;
import jakarta.annotation.Resource;

@Service("egovVisitCountStatsService")
public class EgovVisitCountStatsServiceImpl extends EgovAbstractServiceImpl implements EgovVisitCountStatsService {
	@Resource(name = "visitCountStatsDAO")
	private VisitCountStatsDAO visitCountStatsDAO;

	@Override
	public Map<String, Object> getVisitCountStats(String startDate, String endDate) {
		Map<String, Object> result = new HashMap<>();
		result.put("summary", visitCountStatsDAO.selectSummary(startDate, endDate));
		result.put("schools", visitCountStatsDAO.selectSchoolStats(startDate, endDate));
		return result;
	}
}

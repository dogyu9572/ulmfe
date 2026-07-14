package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.VisitCountSummaryVO;
import egovframework.let.adm.service.vo.VisitSchoolStatsVO;

@Repository("visitCountStatsDAO")
public class VisitCountStatsDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.VisitCountStatsDAO.";

	public List<VisitCountSummaryVO> selectSummary(String startDate, String endDate) {
		return selectList(NS + "selectSummary", params(startDate, endDate));
	}

	public List<VisitSchoolStatsVO> selectSchoolStats(String startDate, String endDate) {
		return selectList(NS + "selectSchoolStats", params(startDate, endDate));
	}

	private Map<String, Object> params(String startDate, String endDate) {
		Map<String, Object> params = new HashMap<>();
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		return params;
	}
}

package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.EducationProgramStatsSourceVO;

@Repository("educationProgramStatsDAO")
public class EducationProgramStatsDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.EducationProgramStatsDAO.";

	public List<EducationProgramStatsSourceVO> selectStatsSources(String startDate, String endDate) {
		Map<String, Object> params = new HashMap<>();
		params.put("startDate", startDate);
		params.put("endDate", endDate);
		return selectList(NS + "selectStatsSources", params);
	}
}

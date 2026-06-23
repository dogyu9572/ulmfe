package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.LearningResultAnswerVO;
import egovframework.let.adm.service.vo.LearningResultStudentVO;
import egovframework.let.adm.service.vo.LearningResultVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("learningResultDAO")
public class LearningResultDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.LearningResultDAO.";

	public int countLearningResultList(
		String prgrmTypeCd,
		String startLrnYmd,
		String endLrnYmd,
		String searchType,
		String searchKeyword
	) {
		Integer count = selectOne(NS + "countLearningResultList", searchParam(prgrmTypeCd, startLrnYmd, endLrnYmd, searchType, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<LearningResultVO> selectLearningResultList(
		String prgrmTypeCd,
		String startLrnYmd,
		String endLrnYmd,
		String searchType,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(prgrmTypeCd, startLrnYmd, endLrnYmd, searchType, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectLearningResultList", param);
	}

	public LearningResultVO findResultDetail(Integer rsvtSn) {
		return selectOne(NS + "findResultDetail", rsvtSn);
	}

	public List<LearningResultStudentVO> selectResultStudents(Integer rsvtSn) {
		return selectList(NS + "selectResultStudents", rsvtSn);
	}

	public List<LearningResultAnswerVO> selectStudentAnswers(Integer rsvtSn, Integer stdntSn, String ansTypeCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("rsvtSn", rsvtSn);
		param.put("stdntSn", stdntSn);
		param.put("ansTypeCd", ansTypeCd);
		return selectList(NS + "selectStudentAnswers", param);
	}

	private Map<String, Object> searchParam(
		String prgrmTypeCd,
		String startLrnYmd,
		String endLrnYmd,
		String searchType,
		String searchKeyword
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("prgrmTypeCd", prgrmTypeCd);
		param.put("startLrnYmd", startLrnYmd);
		param.put("endLrnYmd", endLrnYmd);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}

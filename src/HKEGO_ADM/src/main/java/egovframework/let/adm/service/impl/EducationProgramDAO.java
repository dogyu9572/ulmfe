package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.EducationProgramVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("educationProgramDAO")
public class EducationProgramDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.EducationProgramDAO.";

	public int countEducationProgramList(String prgrmTypeCd, String useYn, String searchKeyword) {
		Integer count = selectOne(NS + "countEducationProgramList", searchParam(prgrmTypeCd, useYn, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<EducationProgramVO> selectEducationProgramList(
		String prgrmTypeCd,
		String useYn,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(prgrmTypeCd, useYn, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectEducationProgramList", param);
	}

	public EducationProgramVO findById(String prgrmTypeCd, Integer prgrmSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("prgrmTypeCd", prgrmTypeCd);
		param.put("prgrmSn", prgrmSn);
		return selectOne(NS + "findById", param);
	}

	public int insert(EducationProgramVO program) {
		return insert(NS + "insert", program);
	}

	public int update(EducationProgramVO program) {
		return update(NS + "update", program);
	}

	public int delete(String prgrmTypeCd, Integer prgrmSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("prgrmTypeCd", prgrmTypeCd);
		param.put("prgrmSn", prgrmSn);
		return update(NS + "delete", param);
	}

	private Map<String, Object> searchParam(String prgrmTypeCd, String useYn, String searchKeyword) {
		Map<String, Object> param = new HashMap<>();
		param.put("prgrmTypeCd", prgrmTypeCd);
		param.put("useYn", useYn);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}

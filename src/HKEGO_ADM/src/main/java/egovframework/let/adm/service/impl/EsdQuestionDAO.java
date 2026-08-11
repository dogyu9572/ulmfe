package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.EsdQuestionVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("esdQuestionDAO")
public class EsdQuestionDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.EsdQuestionDAO.";

	public int countList(String qstnTypeCd, String useYn, String searchKeyword) {
		Integer count = selectOne(NS + "countList", searchParam(qstnTypeCd, useYn, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<EsdQuestionVO> selectList(
		String qstnTypeCd,
		String useYn,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(qstnTypeCd, useYn, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectList", param);
	}

	public EsdQuestionVO findById(Integer esdQstnSn) {
		return selectOne(NS + "findById", Map.of("esdQstnSn", esdQstnSn));
	}

	public int insertQuestion(EsdQuestionVO question) {
		return insert(NS + "insertQuestion", question);
	}

	public int updateQuestion(EsdQuestionVO question) {
		return update(NS + "updateQuestion", question);
	}

	public int deleteQuestion(Integer esdQstnSn) {
		return update(NS + "deleteQuestion", Map.of("esdQstnSn", esdQstnSn));
	}

	private Map<String, Object> searchParam(String qstnTypeCd, String useYn, String searchKeyword) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnTypeCd", qstnTypeCd);
		param.put("useYn", useYn);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}

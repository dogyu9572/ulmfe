package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.EducationContentQuestionVO;
import egovframework.let.adm.service.vo.EducationContentVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("educationContentDAO")
public class EducationContentDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.EducationContentDAO.";

	public int countEducationContentList(String cntnTypeCd, String cardClsfCd, String useYn, String searchKeyword) {
		Integer count = selectOne(NS + "countEducationContentList", searchParam(cntnTypeCd, cardClsfCd, useYn, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<EducationContentVO> selectEducationContentList(
		String cntnTypeCd,
		String cardClsfCd,
		String useYn,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(cntnTypeCd, cardClsfCd, useYn, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectEducationContentList", param);
	}

	public EducationContentVO findById(Integer cntnSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("cntnSn", cntnSn);
		return selectOne(NS + "findById", param);
	}

	public int insert(EducationContentVO content) {
		return insert(NS + "insert", content);
	}

	public int update(EducationContentVO content) {
		return update(NS + "update", content);
	}

	public int delete(Integer cntnSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("cntnSn", cntnSn);
		return update(NS + "delete", param);
	}

	public List<EducationContentQuestionVO> selectQuestions(Integer cntnSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("cntnSn", cntnSn);
		return selectList(NS + "selectQuestions", param);
	}

	public int deleteQuestions(Integer cntnSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("cntnSn", cntnSn);
		return delete(NS + "deleteQuestions", param);
	}

	public int insertQuestion(EducationContentQuestionVO question) {
		return insert(NS + "insertQuestion", question);
	}

	private Map<String, Object> searchParam(String cntnTypeCd, String cardClsfCd, String useYn, String searchKeyword) {
		Map<String, Object> param = new HashMap<>();
		param.put("cntnTypeCd", cntnTypeCd);
		param.put("cardClsfCd", cardClsfCd);
		param.put("useYn", useYn);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}

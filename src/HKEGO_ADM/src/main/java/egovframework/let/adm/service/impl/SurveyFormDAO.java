package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.EvaluationFormVO;
import egovframework.let.adm.service.vo.EvaluationQuestionVO;
import egovframework.let.adm.service.vo.QuestionnaireResponseVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("surveyFormDAO")
public class SurveyFormDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.SurveyFormDAO.";
	private static final String SURVEY_TYPE = "SURVEY";

	public int countSurveyFormList(String startRegYmd, String endRegYmd, String searchKeyword) {
		Integer count = selectOne(NS + "countSurveyFormList", searchParam(startRegYmd, endRegYmd, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<EvaluationFormVO> selectSurveyFormList(
		String startRegYmd,
		String endRegYmd,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(startRegYmd, endRegYmd, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectSurveyFormList", param);
	}

	public EvaluationFormVO findById(Integer qstnrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrSn", qstnrSn);
		param.put("qstnrTypeCd", SURVEY_TYPE);
		return selectOne(NS + "findById", param);
	}

	public int insert(EvaluationFormVO form) {
		return insert(NS + "insert", form);
	}

	public int update(EvaluationFormVO form) {
		return update(NS + "update", form);
	}

	public int delete(Integer qstnrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrSn", qstnrSn);
		return update(NS + "delete", param);
	}

	public List<EvaluationQuestionVO> selectQuestions(Integer qstnrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrSn", qstnrSn);
		return selectList(NS + "selectQuestions", param);
	}

	public int deleteQuestions(Integer qstnrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrSn", qstnrSn);
		return delete(NS + "deleteQuestions", param);
	}

	public int insertQuestion(EvaluationQuestionVO question) {
		return insert(NS + "insertQuestion", question);
	}

	public int updateQuestion(EvaluationQuestionVO question) {
		return update(NS + "updateQuestion", question);
	}

	public int deleteQuestion(Integer qstnrSn, Integer qstnSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrSn", qstnrSn);
		param.put("qstnSn", qstnSn);
		return delete(NS + "deleteQuestion", param);
	}

	public List<QuestionnaireResponseVO> selectResponses(Integer qstnrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrSn", qstnrSn);
		return selectList(NS + "selectResponses", param);
	}

	private Map<String, Object> searchParam(String startRegYmd, String endRegYmd, String searchKeyword) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrTypeCd", SURVEY_TYPE);
		param.put("startRegYmd", startRegYmd);
		param.put("endRegYmd", endRegYmd);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}

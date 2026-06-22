package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.EvaluationFormVO;
import egovframework.let.adm.service.vo.EvaluationQuestionVO;
import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository("evaluationFormDAO")
public class EvaluationFormDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.EvaluationFormDAO.";
	private static final String EVALUATION_TYPE = "EVAL";

	public int countEvaluationFormList(
		String evlSeCd,
		String startRegYmd,
		String endRegYmd,
		String searchKeyword
	) {
		Integer count = selectOne(NS + "countEvaluationFormList", searchParam(evlSeCd, startRegYmd, endRegYmd, searchKeyword));
		return count == null ? 0 : count;
	}

	public List<EvaluationFormVO> selectEvaluationFormList(
		String evlSeCd,
		String startRegYmd,
		String endRegYmd,
		String searchKeyword,
		int offset,
		int limit
	) {
		Map<String, Object> param = searchParam(evlSeCd, startRegYmd, endRegYmd, searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectEvaluationFormList", param);
	}

	public EvaluationFormVO findById(Integer qstnrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrSn", qstnrSn);
		param.put("qstnrTypeCd", EVALUATION_TYPE);
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

	private Map<String, Object> searchParam(
		String evlSeCd,
		String startRegYmd,
		String endRegYmd,
		String searchKeyword
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("qstnrTypeCd", EVALUATION_TYPE);
		param.put("evlSeCd", evlSeCd);
		param.put("startRegYmd", startRegYmd);
		param.put("endRegYmd", endRegYmd);
		param.put("searchKeyword", searchKeyword);
		return param;
	}
}

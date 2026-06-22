package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.EvaluationFormDto;
import egovframework.let.adm.service.vo.EvaluationFormVO;

import java.util.Map;

public interface EgovSurveyFormService {
	Map<String, Object> getSurveyFormListPage(
		String startRegYmd,
		String endRegYmd,
		String searchKeyword,
		int page,
		int size
	);

	EvaluationFormVO getSurveyFormById(Integer qstnrSn);

	EvaluationFormVO createSurveyForm(EvaluationFormDto dto);

	EvaluationFormVO updateSurveyForm(Integer qstnrSn, EvaluationFormDto dto);

	void deleteSurveyForm(Integer qstnrSn);
}

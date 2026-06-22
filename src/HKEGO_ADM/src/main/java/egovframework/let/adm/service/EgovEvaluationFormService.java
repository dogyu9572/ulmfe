package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.EvaluationFormDto;
import egovframework.let.adm.service.vo.EvaluationFormVO;

import java.util.Map;

public interface EgovEvaluationFormService {
	Map<String, Object> getEvaluationFormListPage(
		String evlSeCd,
		String startRegYmd,
		String endRegYmd,
		String searchKeyword,
		int page,
		int size
	);

	EvaluationFormVO getEvaluationFormById(Integer qstnrSn);

	EvaluationFormVO createEvaluationForm(EvaluationFormDto dto);

	EvaluationFormVO updateEvaluationForm(Integer qstnrSn, EvaluationFormDto dto);

	void deleteEvaluationForm(Integer qstnrSn);
}

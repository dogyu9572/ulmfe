package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.EsdQuestionDto;
import egovframework.let.adm.service.vo.EsdQuestionVO;

import java.util.Map;

public interface EgovEsdQuestionService {
	Map<String, Object> getQuestionListPage(
		String qstnTypeCd,
		String useYn,
		String searchKeyword,
		int page,
		int size
	);

	EsdQuestionVO getQuestionById(Integer esdQstnSn);

	EsdQuestionVO createQuestion(EsdQuestionDto dto);

	EsdQuestionVO updateQuestion(Integer esdQstnSn, EsdQuestionDto dto);

	void deleteQuestion(Integer esdQstnSn);
}

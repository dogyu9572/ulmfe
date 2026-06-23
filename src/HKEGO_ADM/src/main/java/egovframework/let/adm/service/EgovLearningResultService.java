package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.LearningResultAnswerVO;
import egovframework.let.adm.service.vo.LearningResultVO;

import java.util.List;
import java.util.Map;

public interface EgovLearningResultService {
	Map<String, Object> getLearningResultListPage(
		String prgrmTypeCd,
		String startLrnYmd,
		String endLrnYmd,
		String searchType,
		String searchKeyword,
		int page,
		int size
	);

	LearningResultVO getLearningResultDetail(Integer rsvtSn);

	List<LearningResultAnswerVO> getStudentAnswers(Integer rsvtSn, Integer stdntSn, String ansTypeCd);
}

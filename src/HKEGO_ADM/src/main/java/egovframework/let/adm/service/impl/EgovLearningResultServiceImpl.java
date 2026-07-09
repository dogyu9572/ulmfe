package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovLearningResultService;
import egovframework.let.adm.service.vo.LearningResultAnswerVO;
import egovframework.let.adm.service.vo.LearningResultVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service("egovLearningResultService")
public class EgovLearningResultServiceImpl extends EgovAbstractServiceImpl implements EgovLearningResultService {
	@Resource(name = "learningResultDAO")
	private LearningResultDAO learningResultDAO;

	public Map<String, Object> getLearningResultListPage(
		String prgrmTypeCd,
		String startLrnYmd,
		String endLrnYmd,
		String searchType,
		String searchKeyword,
		int page,
		int size
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = learningResultDAO.countLearningResultList(
			normalize(prgrmTypeCd), normalize(startLrnYmd), normalize(endLrnYmd), normalize(searchType), normalize(searchKeyword)
		);
		List<LearningResultVO> list = learningResultDAO.selectLearningResultList(
			normalize(prgrmTypeCd), normalize(startLrnYmd), normalize(endLrnYmd), normalize(searchType), normalize(searchKeyword),
			offset, safeSize
		);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public LearningResultVO getLearningResultDetail(Integer rsvtSn) {
		LearningResultVO detail = learningResultDAO.findResultDetail(rsvtSn);
		if (detail == null) {
			throw new IllegalArgumentException("학습결과를 찾을 수 없습니다.");
		}
		detail.setStudents(learningResultDAO.selectResultStudents(rsvtSn));
		return detail;
	}

	public List<LearningResultAnswerVO> getStudentAnswers(Integer rsvtSn, Integer stdntSn, String ansTypeCd) {
		return deduplicateFallbackAnswers(learningResultDAO.selectStudentAnswers(rsvtSn, stdntSn, normalize(ansTypeCd)), stdntSn);
	}

	private List<LearningResultAnswerVO> deduplicateFallbackAnswers(List<LearningResultAnswerVO> answers, Integer currentStudentSn) {
		if (currentStudentSn == null || answers == null || answers.isEmpty()) {
			return answers;
		}
		Set<String> currentAnswerKeys = new HashSet<>();
		for (LearningResultAnswerVO answer : answers) {
			if (answer != null && currentStudentSn.equals(answer.getStdntSn())) {
				currentAnswerKeys.add(answerQuestionKey(answer));
			}
		}
		Set<String> displayedKeys = new HashSet<>();
		List<LearningResultAnswerVO> result = new ArrayList<>();
		for (LearningResultAnswerVO answer : answers) {
			if (answer == null) continue;
			String questionKey = answerQuestionKey(answer);
			boolean isFallback = !currentStudentSn.equals(answer.getStdntSn());
			if (isFallback && currentAnswerKeys.contains(questionKey)) continue;
			String displayKey = questionKey + "|" + normalizedText(answer.getAnsCn());
			if (!displayedKeys.add(displayKey)) continue;
			result.add(answer);
		}
		return result;
	}

	private String answerQuestionKey(LearningResultAnswerVO answer) {
		return String.join("|",
			normalizedText(answer.getAnsTypeCd()),
			normalizedText(answer.getStepCd()),
			normalizedText(answer.getCardClsfCd()),
			String.valueOf(answer.getCntnSn()),
			String.valueOf(answer.getQstnSn()),
			normalizedText(answer.getQstnCn())
		);
	}

	private String normalizedText(String value) {
		return value == null ? "" : value.trim();
	}

	private String normalize(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		return value.trim();
	}
}

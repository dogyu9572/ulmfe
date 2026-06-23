package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovLearningResultService;
import egovframework.let.adm.service.vo.LearningResultAnswerVO;
import egovframework.let.adm.service.vo.LearningResultVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

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
		return learningResultDAO.selectStudentAnswers(rsvtSn, stdntSn, normalize(ansTypeCd));
	}

	private String normalize(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		return value.trim();
	}
}

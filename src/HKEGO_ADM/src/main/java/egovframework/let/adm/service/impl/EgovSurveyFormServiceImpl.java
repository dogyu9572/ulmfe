package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovSurveyFormService;
import egovframework.let.adm.service.vo.EvaluationFormDto;
import egovframework.let.adm.service.vo.EvaluationFormVO;
import egovframework.let.adm.service.vo.EvaluationQuestionVO;
import egovframework.let.adm.service.vo.PageListResult;
import egovframework.let.adm.service.vo.QuestionnaireResponseVO;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;

@Service("egovSurveyFormService")
public class EgovSurveyFormServiceImpl extends EgovAbstractServiceImpl implements EgovSurveyFormService {
	private static final String SURVEY_TYPE = "SURVEY";

	@Resource(name = "surveyFormDAO")
	private SurveyFormDAO surveyFormDAO;

	public Map<String, Object> getSurveyFormListPage(
		String startRegYmd,
		String endRegYmd,
		String searchKeyword,
		int page,
		int size
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = surveyFormDAO.countSurveyFormList(startRegYmd, endRegYmd, searchKeyword);
		List<EvaluationFormVO> list = surveyFormDAO.selectSurveyFormList(
			startRegYmd, endRegYmd, searchKeyword, offset, safeSize
		);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public EvaluationFormVO getSurveyFormById(Integer qstnrSn) {
		EvaluationFormVO form = surveyFormDAO.findById(qstnrSn);
		if (form == null) {
			throw new IllegalArgumentException("설문지를 찾을 수 없습니다.");
		}
		form.setQuestions(surveyFormDAO.selectQuestions(qstnrSn));
		return form;
	}

	public List<QuestionnaireResponseVO> getSurveyResponses(Integer qstnrSn) {
		getSurveyFormById(qstnrSn);
		return surveyFormDAO.selectResponses(qstnrSn);
	}

	@Transactional
	public EvaluationFormVO createSurveyForm(EvaluationFormDto dto) {
		EvaluationFormVO form = toForm(null, dto, "admin");
		surveyFormDAO.insert(form);
		saveQuestions(form.getQstnrSn(), dto.getQuestions(), "admin");
		return getSurveyFormById(form.getQstnrSn());
	}

	@Transactional
	public EvaluationFormVO updateSurveyForm(Integer qstnrSn, EvaluationFormDto dto) {
		if (surveyFormDAO.findById(qstnrSn) == null) {
			throw new IllegalArgumentException("설문지를 찾을 수 없습니다.");
		}
		surveyFormDAO.update(toForm(qstnrSn, dto, "admin"));
		saveQuestions(qstnrSn, dto.getQuestions(), "admin");
		return getSurveyFormById(qstnrSn);
	}

	@Transactional
	public void deleteSurveyForm(Integer qstnrSn) {
		if (surveyFormDAO.findById(qstnrSn) == null) {
			throw new IllegalArgumentException("설문지를 찾을 수 없습니다.");
		}
		surveyFormDAO.delete(qstnrSn);
	}

	private EvaluationFormVO toForm(Integer qstnrSn, EvaluationFormDto dto, String adminId) {
		return EvaluationFormVO.builder()
			.qstnrSn(qstnrSn)
			.qstnrTypeCd(SURVEY_TYPE)
			.evlSeCd(null)
			.qstnrNm(normalizeRequired(dto.getQstnrNm(), "설문지 이름"))
			.rgtr(adminId)
			.mdtr(adminId)
			.build();
	}

	private void saveQuestions(Integer qstnrSn, List<EvaluationFormDto.QuestionDto> questions, String adminId) {
		Set<Integer> existingIds = new HashSet<>();
		for (EvaluationQuestionVO existing : surveyFormDAO.selectQuestions(qstnrSn)) {
			existingIds.add(existing.getQstnSn());
		}
		Set<Integer> keptIds = new HashSet<>();
		if (questions == null) questions = List.of();
		for (int i = 0; i < questions.size(); i++) {
			EvaluationFormDto.QuestionDto dto = questions.get(i);
			if (dto == null || isBlank(dto.getQstnNo()) && isBlank(dto.getQstnCn())) {
				continue;
			}
			EvaluationQuestionVO question = EvaluationQuestionVO.builder()
				.qstnSn(dto.getQstnSn() != null && existingIds.contains(dto.getQstnSn()) ? dto.getQstnSn() : null)
				.qstnrSn(qstnrSn)
				.qstnNo(normalizeRequired(dto.getQstnNo(), "문항 번호"))
				.ansTypeCd(normalizeAnswerType(dto.getAnsTypeCd()))
				.qstnCn(normalizeRequired(dto.getQstnCn(), "질문"))
				.sortSeq(dto.getSortSeq() == null ? i + 1 : dto.getSortSeq())
				.rgtr(adminId)
				.mdtr(adminId)
				.build();
			if (question.getQstnSn() == null) surveyFormDAO.insertQuestion(question);
			else surveyFormDAO.updateQuestion(question);
			keptIds.add(question.getQstnSn());
		}
		for (Integer existingId : existingIds) {
			if (!keptIds.contains(existingId)) surveyFormDAO.deleteQuestion(qstnrSn, existingId);
		}
	}

	private String normalizeAnswerType(String value) {
		String normalized = normalizeRequired(value, "답변유형");
		if (!"LIKERT5".equals(normalized) && !"LEVEL5".equals(normalized) && !"TEXT".equals(normalized)) {
			throw new IllegalArgumentException("답변유형을 올바르게 선택하세요.");
		}
		return normalized;
	}

	private String normalizeRequired(String value, String label) {
		String normalized = normalize(value);
		if (normalized == null) {
			throw new IllegalArgumentException(label + "을(를) 입력하세요.");
		}
		return normalized;
	}

	private String normalize(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		return value.trim();
	}

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}

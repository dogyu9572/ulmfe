package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovEvaluationFormService;
import egovframework.let.adm.service.vo.EvaluationFormDto;
import egovframework.let.adm.service.vo.EvaluationFormVO;
import egovframework.let.adm.service.vo.EvaluationQuestionVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service("egovEvaluationFormService")
public class EgovEvaluationFormServiceImpl extends EgovAbstractServiceImpl implements EgovEvaluationFormService {
	private static final String EVALUATION_TYPE = "EVAL";

	@Resource(name = "evaluationFormDAO")
	private EvaluationFormDAO evaluationFormDAO;

	public Map<String, Object> getEvaluationFormListPage(
		String evlSeCd,
		String startRegYmd,
		String endRegYmd,
		String searchKeyword,
		int page,
		int size
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = evaluationFormDAO.countEvaluationFormList(evlSeCd, startRegYmd, endRegYmd, searchKeyword);
		List<EvaluationFormVO> list = evaluationFormDAO.selectEvaluationFormList(
			evlSeCd, startRegYmd, endRegYmd, searchKeyword, offset, safeSize
		);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public EvaluationFormVO getEvaluationFormById(Integer qstnrSn) {
		EvaluationFormVO form = evaluationFormDAO.findById(qstnrSn);
		if (form == null) {
			throw new IllegalArgumentException("평가지를 찾을 수 없습니다.");
		}
		form.setQuestions(evaluationFormDAO.selectQuestions(qstnrSn));
		return form;
	}

	@Transactional
	public EvaluationFormVO createEvaluationForm(EvaluationFormDto dto) {
		EvaluationFormVO form = toForm(null, dto, "admin");
		evaluationFormDAO.insert(form);
		saveQuestions(form.getQstnrSn(), dto.getQuestions(), "admin");
		return getEvaluationFormById(form.getQstnrSn());
	}

	@Transactional
	public EvaluationFormVO updateEvaluationForm(Integer qstnrSn, EvaluationFormDto dto) {
		if (evaluationFormDAO.findById(qstnrSn) == null) {
			throw new IllegalArgumentException("평가지를 찾을 수 없습니다.");
		}
		evaluationFormDAO.update(toForm(qstnrSn, dto, "admin"));
		saveQuestions(qstnrSn, dto.getQuestions(), "admin");
		return getEvaluationFormById(qstnrSn);
	}

	@Transactional
	public void deleteEvaluationForm(Integer qstnrSn) {
		if (evaluationFormDAO.findById(qstnrSn) == null) {
			throw new IllegalArgumentException("평가지를 찾을 수 없습니다.");
		}
		evaluationFormDAO.delete(qstnrSn);
	}

	private EvaluationFormVO toForm(Integer qstnrSn, EvaluationFormDto dto, String adminId) {
		return EvaluationFormVO.builder()
			.qstnrSn(qstnrSn)
			.qstnrTypeCd(EVALUATION_TYPE)
			.evlSeCd(normalizeEvaluationType(dto.getEvlSeCd()))
			.qstnrNm(normalizeRequired(dto.getQstnrNm(), "평가지 이름"))
			.rgtr(adminId)
			.mdtr(adminId)
			.build();
	}

	private void saveQuestions(Integer qstnrSn, List<EvaluationFormDto.QuestionDto> questions, String adminId) {
		evaluationFormDAO.deleteQuestions(qstnrSn);
		if (questions == null) {
			return;
		}
		for (int i = 0; i < questions.size(); i++) {
			EvaluationFormDto.QuestionDto dto = questions.get(i);
			if (dto == null || isBlank(dto.getQstnNo()) && isBlank(dto.getQstnCn())) {
				continue;
			}
			EvaluationQuestionVO question = EvaluationQuestionVO.builder()
				.qstnrSn(qstnrSn)
				.qstnNo(normalizeRequired(dto.getQstnNo(), "문항 번호"))
				.ansTypeCd(normalizeAnswerType(dto.getAnsTypeCd()))
				.qstnCn(normalizeRequired(dto.getQstnCn(), "질문"))
				.sortSeq(dto.getSortSeq() == null ? i + 1 : dto.getSortSeq())
				.rgtr(adminId)
				.mdtr(adminId)
				.build();
			evaluationFormDAO.insertQuestion(question);
		}
	}

	private String normalizeEvaluationType(String value) {
		String normalized = normalizeRequired(value, "구분");
		if (!"STUDENT".equals(normalized) && !"TEACHER".equals(normalized)) {
			throw new IllegalArgumentException("구분은 학생 또는 선생님 운영 중 선택하세요.");
		}
		return normalized;
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

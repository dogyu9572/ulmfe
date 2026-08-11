package egovframework.let.adm.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.let.adm.service.EgovEsdQuestionService;
import egovframework.let.adm.service.vo.EsdQuestionDto;
import egovframework.let.adm.service.vo.EsdQuestionVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service("egovEsdQuestionService")
@RequiredArgsConstructor
public class EgovEsdQuestionServiceImpl extends EgovAbstractServiceImpl implements EgovEsdQuestionService {
	private final ObjectMapper objectMapper;

	@Resource(name = "esdQuestionDAO")
	private EsdQuestionDAO esdQuestionDAO;

	@Override
	public Map<String, Object> getQuestionListPage(
		String qstnTypeCd,
		String useYn,
		String searchKeyword,
		int page,
		int size
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = esdQuestionDAO.countList(normalize(qstnTypeCd), normalizeYnFilter(useYn), normalize(searchKeyword));
		List<EsdQuestionVO> list = esdQuestionDAO.selectList(
			normalize(qstnTypeCd), normalizeYnFilter(useYn), normalize(searchKeyword), offset, safeSize
		);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	@Override
	public EsdQuestionVO getQuestionById(Integer esdQstnSn) {
		EsdQuestionVO question = esdQuestionDAO.findById(esdQstnSn);
		if (question == null) {
			throw new IllegalArgumentException("문항을 찾을 수 없습니다.");
		}
		return question;
	}

	@Override
	@Transactional
	public EsdQuestionVO createQuestion(EsdQuestionDto dto) {
		EsdQuestionVO question = toQuestion(null, dto, "admin");
		esdQuestionDAO.insertQuestion(question);
		return getQuestionById(question.getEsdQstnSn());
	}

	@Override
	@Transactional
	public EsdQuestionVO updateQuestion(Integer esdQstnSn, EsdQuestionDto dto) {
		getQuestionById(esdQstnSn);
		EsdQuestionVO question = toQuestion(esdQstnSn, dto, "admin");
		if (esdQuestionDAO.updateQuestion(question) == 0) {
			throw new IllegalArgumentException("문항을 수정하지 못했습니다.");
		}
		return getQuestionById(esdQstnSn);
	}

	@Override
	@Transactional
	public void deleteQuestion(Integer esdQstnSn) {
		getQuestionById(esdQstnSn);
		if (esdQuestionDAO.deleteQuestion(esdQstnSn) == 0) {
			throw new IllegalArgumentException("문항을 삭제하지 못했습니다.");
		}
	}

	private EsdQuestionVO toQuestion(Integer esdQstnSn, EsdQuestionDto dto, String adminId) {
		if (dto == null) {
			throw new IllegalArgumentException("문항 정보가 없습니다.");
		}
		String qstnTypeCd = normalizeRequired(dto.getQstnTypeCd(), "문항 유형").toUpperCase();
		if (!List.of("OX", "SELECT").contains(qstnTypeCd)) {
			throw new IllegalArgumentException("문항 유형을 올바르게 선택하세요.");
		}
		List<String> options = normalizeOptions(qstnTypeCd, dto.getOptnCn());
		int correctAnswerNo = parseCorrectAnswerNo(dto.getCransNo(), options.size());
		return EsdQuestionVO.builder()
			.esdQstnSn(esdQstnSn)
			.qstnTypeCd(qstnTypeCd)
			.qstnCn(normalizeRequired(dto.getQstnCn(), "질문 내용"))
			.qstnImgAtchFileId(normalize(dto.getQstnImgAtchFileId()))
			.optnCn(writeOptions(options))
			.cransNo(String.valueOf(correctAnswerNo))
			.cransExpln(normalize(dto.getCransExpln()))
			.useYn(normalizeYn(dto.getUseYn()))
			.sortSeq(dto.getSortSeq() == null ? 0 : Math.max(0, dto.getSortSeq()))
			.rgtr(adminId)
			.mdfr(adminId)
			.build();
	}

	private List<String> normalizeOptions(String qstnTypeCd, String optnCn) {
		if ("OX".equals(qstnTypeCd)) {
			return List.of("O", "X");
		}
		try {
			List<String> options = objectMapper.readValue(
				optnCn == null ? "[]" : optnCn,
				new TypeReference<List<String>>() { }
			).stream().map(this::normalize).filter(value -> value != null).toList();
			if (options.size() < 2 || options.size() > 5) {
				throw new IllegalArgumentException("객관식 보기는 2개 이상 5개 이하로 입력하세요.");
			}
			return options;
		} catch (JsonProcessingException e) {
			throw new IllegalArgumentException("객관식 보기 형식이 올바르지 않습니다.");
		}
	}

	private int parseCorrectAnswerNo(String value, int optionCount) {
		try {
			int answerNo = Integer.parseInt(normalizeRequired(value, "정답 번호"));
			if (answerNo < 1 || answerNo > optionCount) {
				throw new IllegalArgumentException("정답 번호를 보기 범위 안에서 선택하세요.");
			}
			return answerNo;
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException("정답 번호를 올바르게 선택하세요.");
		}
	}

	private String writeOptions(List<String> options) {
		try {
			return objectMapper.writeValueAsString(options);
		} catch (JsonProcessingException e) {
			throw new IllegalArgumentException("보기 내용을 저장하지 못했습니다.");
		}
	}

	private String normalizeRequired(String value, String label) {
		String normalized = normalize(value);
		if (normalized == null) {
			throw new IllegalArgumentException(label + "을(를) 입력하세요.");
		}
		return normalized;
	}

	private String normalize(String value) {
		return value == null || value.trim().isEmpty() ? null : value.trim();
	}

	private String normalizeYn(String value) {
		return "N".equalsIgnoreCase(value) ? "N" : "Y";
	}

	private String normalizeYnFilter(String value) {
		return "Y".equalsIgnoreCase(value) || "N".equalsIgnoreCase(value) ? value.toUpperCase() : null;
	}
}

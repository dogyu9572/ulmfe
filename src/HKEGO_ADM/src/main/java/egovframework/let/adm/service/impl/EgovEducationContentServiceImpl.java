package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovEducationContentService;
import egovframework.let.adm.service.vo.EducationContentDto;
import egovframework.let.adm.service.vo.EducationContentQuestionVO;
import egovframework.let.adm.service.vo.EducationContentVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service("egovEducationContentService")
public class EgovEducationContentServiceImpl extends EgovAbstractServiceImpl implements EgovEducationContentService {
	@Resource(name = "educationContentDAO")
	private EducationContentDAO educationContentDAO;

	public Map<String, Object> getEducationContentListPage(
		String cntnTypeCd,
		String cardClsfCd,
		String useYn,
		String searchKeyword,
		int page,
		int size
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = educationContentDAO.countEducationContentList(cntnTypeCd, cardClsfCd, useYn, searchKeyword);
		List<EducationContentVO> list = educationContentDAO.selectEducationContentList(
			cntnTypeCd, cardClsfCd, useYn, searchKeyword, offset, safeSize
		);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public EducationContentVO getEducationContentById(Integer cntnSn) {
		EducationContentVO content = educationContentDAO.findById(cntnSn);
		if (content == null) {
			throw new IllegalArgumentException("콘텐츠를 찾을 수 없습니다.");
		}
		content.setQuestions(educationContentDAO.selectQuestions(cntnSn));
		return content;
	}

	@Transactional
	public EducationContentVO createEducationContent(EducationContentDto dto) {
		EducationContentVO content = toContent(null, dto, "admin");
		educationContentDAO.insert(content);
		saveQuestions(content.getCntnSn(), dto.getQuestions(), "admin");
		return getEducationContentById(content.getCntnSn());
	}

	@Transactional
	public EducationContentVO updateEducationContent(Integer cntnSn, EducationContentDto dto) {
		if (educationContentDAO.findById(cntnSn) == null) {
			throw new IllegalArgumentException("콘텐츠를 찾을 수 없습니다.");
		}
		educationContentDAO.update(toContent(cntnSn, dto, "admin"));
		saveQuestions(cntnSn, dto.getQuestions(), "admin");
		return getEducationContentById(cntnSn);
	}

	@Transactional
	public void deleteEducationContent(Integer cntnSn) {
		if (educationContentDAO.findById(cntnSn) == null) {
			throw new IllegalArgumentException("콘텐츠를 찾을 수 없습니다.");
		}
		educationContentDAO.delete(cntnSn);
	}

	private EducationContentVO toContent(Integer cntnSn, EducationContentDto dto, String adminId) {
		String cntnTypeCd = normalizeContentType(dto.getCntnTypeCd());
		String useYn = yn(dto.getUseYn(), "Y");
		return EducationContentVO.builder()
			.cntnSn(cntnSn)
			.cntnTypeCd(cntnTypeCd)
			.cardClsfCd(normalize(dto.getCardClsfCd()))
			.cntnTtl(normalizeRequired(dto.getCntnTtl(), "제목"))
			.cntnCn(normalize(dto.getCntnCn()))
			.prvdTypeCd(normalizeProvideType(dto.getPrvdTypeCd()))
			.imgAtchFileId(normalize(dto.getImgAtchFileId()))
			.videoUrlAddr(normalize(dto.getVideoUrlAddr()))
			.videoThmbAtchFileId(normalize(dto.getVideoThmbAtchFileId()))
			.videoTtl(normalize(dto.getVideoTtl()))
			.useYn(useYn)
			.rgtr(adminId)
			.mdtr(adminId)
			.build();
	}

	private void saveQuestions(Integer cntnSn, List<EducationContentDto.QuestionDto> questions, String adminId) {
		educationContentDAO.deleteQuestions(cntnSn);
		if (questions == null) {
			return;
		}
		for (int i = 0; i < questions.size(); i++) {
			EducationContentDto.QuestionDto dto = questions.get(i);
			if (dto == null || isBlank(dto.getQstnNm())) {
				continue;
			}
			EducationContentQuestionVO question = EducationContentQuestionVO.builder()
				.cntnSn(cntnSn)
				.qstnTypeCd(normalizeQuestionType(dto.getQstnTypeCd()))
				.qstnNm(normalizeRequired(dto.getQstnNm(), "문항풀이명"))
				.qstnImgAtchFileId(normalize(dto.getQstnImgAtchFileId()))
				.optnCn(normalize(dto.getOptnCn()))
				.sortSeq(dto.getSortSeq() == null ? i + 1 : dto.getSortSeq())
				.rgtr(adminId)
				.mdtr(adminId)
				.build();
			educationContentDAO.insertQuestion(question);
		}
	}

	private String normalizeContentType(String value) {
		String normalized = normalizeRequired(value, "콘텐츠 타입");
		if (!List.of("INFO", "VIDEO", "SELECT", "DATA", "PHOTO", "SENTENCE").contains(normalized)) {
			throw new IllegalArgumentException("콘텐츠 타입을 올바르게 선택하세요.");
		}
		return normalized;
	}

	private String normalizeProvideType(String value) {
		String normalized = normalize(value);
		if (normalized == null) {
			return null;
		}
		if (!List.of("IMAGE", "VIDEO").contains(normalized)) {
			throw new IllegalArgumentException("제공 형태를 올바르게 선택하세요.");
		}
		return normalized;
	}

	private String normalizeQuestionType(String value) {
		String normalized = normalizeRequired(value, "문항 분류");
		List<String> allowedTypes = List.of("SELECT", "DATA", "PHOTO", "SENTENCE");
		List<String> selectedTypes = new ArrayList<>();
		for (String token : normalized.split(",")) {
			String type = token.trim();
			if (type.isEmpty()) {
				continue;
			}
			if (!allowedTypes.contains(type)) {
				throw new IllegalArgumentException("문항 분류를 올바르게 선택하세요.");
			}
			if (!selectedTypes.contains(type)) {
				selectedTypes.add(type);
			}
		}
		if (selectedTypes.isEmpty()) {
			throw new IllegalArgumentException("문항 분류를 선택하세요.");
		}
		return String.join(",", selectedTypes);
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

	private String yn(String value, String defaultValue) {
		return "Y".equalsIgnoreCase(value) ? "Y" : "N".equalsIgnoreCase(value) ? "N" : defaultValue;
	}
}

package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovLearningSupportMaterialService;
import egovframework.let.adm.service.vo.EducationProgramVO;
import egovframework.let.adm.service.vo.LearningSupportMaterialVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service("egovLearningSupportMaterialService")
public class EgovLearningSupportMaterialServiceImpl extends EgovAbstractServiceImpl implements EgovLearningSupportMaterialService {
	@Resource(name = "learningSupportMaterialDAO")
	private LearningSupportMaterialDAO learningSupportMaterialDAO;

	public Map<String, Object> getLearningSupportMaterialListPage(
		String lrnTypeCd,
		String dataTypeCd,
		String startRegYmd,
		String endRegYmd,
		String searchType,
		String searchKeyword,
		int page,
		int size
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = learningSupportMaterialDAO.countList(
			normalize(lrnTypeCd), normalize(dataTypeCd), normalize(startRegYmd), normalize(endRegYmd),
			normalize(searchType), normalize(searchKeyword)
		);
		List<LearningSupportMaterialVO> list = learningSupportMaterialDAO.selectList(
			normalize(lrnTypeCd), normalize(dataTypeCd), normalize(startRegYmd), normalize(endRegYmd),
			normalize(searchType), normalize(searchKeyword), offset, safeSize
		);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public LearningSupportMaterialVO getLearningSupportMaterialById(String pstSn) {
		LearningSupportMaterialVO material = learningSupportMaterialDAO.findById(normalizeRequired(pstSn, "자료"));
		if (material == null) {
			throw new IllegalArgumentException("학습지원 자료를 찾을 수 없습니다.");
		}
		return material;
	}

	@Transactional
	public LearningSupportMaterialVO createLearningSupportMaterial(LearningSupportMaterialVO material) {
		LearningSupportMaterialVO normalized = normalizeMaterial(material, null);
		normalized.setPstSn(generatePostId());
		normalized.setWrtrNm(defaultValue(normalized.getWrtrNm(), "관리자"));
		normalized.setWrtrId(defaultValue(normalized.getWrtrId(), "admin"));
		normalized.setRgtr(defaultValue(normalized.getRgtr(), "admin"));
		normalized.setMdtr(defaultValue(normalized.getMdtr(), "admin"));
		int rows = learningSupportMaterialDAO.insert(normalized);
		if (rows <= 0) {
			throw new IllegalStateException("학습지원 자료 등록에 실패했습니다.");
		}
		return getLearningSupportMaterialById(normalized.getPstSn());
	}

	@Transactional
	public LearningSupportMaterialVO updateLearningSupportMaterial(String pstSn, LearningSupportMaterialVO material) {
		if (learningSupportMaterialDAO.findById(normalizeRequired(pstSn, "자료")) == null) {
			throw new IllegalArgumentException("학습지원 자료를 찾을 수 없습니다.");
		}
		LearningSupportMaterialVO normalized = normalizeMaterial(material, pstSn);
		normalized.setMdtr(defaultValue(normalized.getMdtr(), "admin"));
		int rows = learningSupportMaterialDAO.update(normalized);
		if (rows <= 0) {
			throw new IllegalStateException("학습지원 자료 수정에 실패했습니다.");
		}
		return getLearningSupportMaterialById(pstSn);
	}

	@Transactional
	public void deleteLearningSupportMaterial(String pstSn) {
		if (learningSupportMaterialDAO.findById(normalizeRequired(pstSn, "자료")) == null) {
			throw new IllegalArgumentException("학습지원 자료를 찾을 수 없습니다.");
		}
		int rows = learningSupportMaterialDAO.delete(pstSn);
		if (rows <= 0) {
			throw new IllegalStateException("학습지원 자료 삭제에 실패했습니다.");
		}
	}

	public List<EducationProgramVO> getActiveProgramOptions() {
		return learningSupportMaterialDAO.selectActiveProgramOptions();
	}

	private LearningSupportMaterialVO normalizeMaterial(LearningSupportMaterialVO material, String pstSn) {
		if (material == null) {
			throw new IllegalArgumentException("저장할 자료가 없습니다.");
		}
		String lrnTypeCd = normalizeRequired(material.getLrnTypeCd(), "학습유형");
		String dataTypeCd = normalizeRequired(material.getDataTypeCd(), "자료구분");
		String pstTtl = normalizeRequired(material.getPstTtl(), "제목");
		String linkUrl = normalize(material.getLinkUrl());
		String videoEmbedUrl = normalize(material.getVideoEmbedUrl());
		if ("LINK".equals(dataTypeCd) && linkUrl == null) {
			throw new IllegalArgumentException("링크를 입력하세요.");
		}
		if ("VIDEO".equals(dataTypeCd) && videoEmbedUrl == null) {
			throw new IllegalArgumentException("영상 임베드 링크를 입력하세요.");
		}
		return LearningSupportMaterialVO.builder()
			.pstSn(pstSn)
			.pstTtl(pstTtl)
			.pstCn(normalize(material.getPstCn()))
			.lrnTypeCd(lrnTypeCd)
			.dataTypeCd(dataTypeCd)
			.prgrmTypeCd(normalize(material.getPrgrmTypeCd()))
			.prgrmSn(material.getPrgrmSn())
			.linkUrl(linkUrl)
			.videoEmbedUrl(videoEmbedUrl)
			.atchFileMngNo(normalize(material.getAtchFileMngNo()))
			.wrtrNm(normalize(material.getWrtrNm()))
			.wrtrId(normalize(material.getWrtrId()))
			.pstgYmd(normalize(material.getPstgYmd()) == null ? LocalDate.now().toString() : normalize(material.getPstgYmd()))
			.useYn("N".equalsIgnoreCase(material.getUseYn()) ? "N" : "Y")
			.inqCnt(material.getInqCnt() == null ? 0 : Math.max(0, material.getInqCnt()))
			.rgtr(normalize(material.getRgtr()))
			.mdtr(normalize(material.getMdtr()))
			.build();
	}

	private String generatePostId() {
		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		Random random = new Random();
		StringBuilder sb = new StringBuilder();
		do {
			sb.setLength(0);
			for (int i = 0; i < 10; i++) {
				sb.append(chars.charAt(random.nextInt(chars.length())));
			}
		} while (learningSupportMaterialDAO.exists(sb.toString()) > 0);
		return sb.toString();
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

	private String defaultValue(String value, String defaultValue) {
		String normalized = normalize(value);
		return normalized == null ? defaultValue : normalized;
	}
}

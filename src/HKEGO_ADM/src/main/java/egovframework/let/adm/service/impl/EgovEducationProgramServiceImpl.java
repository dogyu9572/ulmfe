package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovEducationProgramService;
import egovframework.let.adm.service.vo.EducationProgramDto;
import egovframework.let.adm.service.vo.EducationProgramVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service("egovEducationProgramService")
public class EgovEducationProgramServiceImpl extends EgovAbstractServiceImpl implements EgovEducationProgramService {
	@Resource(name = "educationProgramDAO")
	private EducationProgramDAO educationProgramDAO;

	public Map<String, Object> getEducationProgramListPage(String prgrmTypeCd, String useYn, String searchKeyword, int page, int size) {
		String type = normalizeProgramType(prgrmTypeCd);
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = educationProgramDAO.countEducationProgramList(type, useYn, searchKeyword);
		List<EducationProgramVO> list = educationProgramDAO.selectEducationProgramList(type, useYn, searchKeyword, offset, safeSize);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public EducationProgramVO getEducationProgramById(String prgrmTypeCd, Integer prgrmSn) {
		EducationProgramVO program = educationProgramDAO.findById(normalizeProgramType(prgrmTypeCd), prgrmSn);
		if (program == null) {
			throw new IllegalArgumentException("프로그램을 찾을 수 없습니다.");
		}
		return program;
	}

	@Transactional
	public EducationProgramVO createEducationProgram(String prgrmTypeCd, EducationProgramDto dto) {
		EducationProgramVO program = toProgram(null, normalizeProgramType(prgrmTypeCd), dto, "admin");
		educationProgramDAO.insert(program);
		return getEducationProgramById(program.getPrgrmTypeCd(), program.getPrgrmSn());
	}

	@Transactional
	public EducationProgramVO updateEducationProgram(String prgrmTypeCd, Integer prgrmSn, EducationProgramDto dto) {
		String type = normalizeProgramType(prgrmTypeCd);
		if (educationProgramDAO.findById(type, prgrmSn) == null) {
			throw new IllegalArgumentException("프로그램을 찾을 수 없습니다.");
		}
		educationProgramDAO.update(toProgram(prgrmSn, type, dto, "admin"));
		return getEducationProgramById(type, prgrmSn);
	}

	@Transactional
	public void deleteEducationProgram(String prgrmTypeCd, Integer prgrmSn) {
		String type = normalizeProgramType(prgrmTypeCd);
		if (educationProgramDAO.findById(type, prgrmSn) == null) {
			throw new IllegalArgumentException("프로그램을 찾을 수 없습니다.");
		}
		educationProgramDAO.delete(type, prgrmSn);
	}

	private EducationProgramVO toProgram(Integer prgrmSn, String prgrmTypeCd, EducationProgramDto dto, String adminId) {
		return EducationProgramVO.builder()
			.prgrmSn(prgrmSn)
			.prgrmTypeCd(prgrmTypeCd)
			.prgrmNm(normalizeRequired(dto.getPrgrmNm(), programNameLabel(prgrmTypeCd)))
			.trgtCn(normalize(dto.getTrgtCn()))
			.totalTmMnt(nonNegative(dto.getTotalTmMnt(), "총 시간"))
			.maxNope(nonNegative(dto.getMaxNope(), "최대 인원"))
			.simpleExpln(normalize(dto.getSimpleExpln()))
			.startExpln(normalize(dto.getStartExpln()))
			.useYn(yn(dto.getUseYn(), "Y"))
			.teamCnt(nonNegative(dto.getTeamCnt(), "총 팀/동선 수"))
			.routeJson(normalize(dto.getRouteJson()))
			.stepJson(normalize(dto.getStepJson()))
			.evalJson(normalize(dto.getEvalJson()))
			.rgtr(adminId)
			.mdtr(adminId)
			.build();
	}

	private String normalizeProgramType(String value) {
		String normalized = normalizeRequired(value, "프로그램 유형");
		if (!List.of("EXPLORE", "MISSION").contains(normalized)) {
			throw new IllegalArgumentException("프로그램 유형을 올바르게 선택하세요.");
		}
		return normalized;
	}

	private String programNameLabel(String type) {
		return "MISSION".equals(type) ? "미션명" : "프로그램명";
	}

	private Integer nonNegative(Integer value, String label) {
		if (value == null) {
			return null;
		}
		if (value < 0) {
			throw new IllegalArgumentException(label + "은(는) 0 이상으로 입력하세요.");
		}
		return value;
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

	private String yn(String value, String defaultValue) {
		return "Y".equalsIgnoreCase(value) ? "Y" : "N".equalsIgnoreCase(value) ? "N" : defaultValue;
	}
}

package egovframework.let.adm.service.impl;

import java.util.List;
import java.util.Map;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovEduProgramIntroService;
import egovframework.let.adm.service.EgovFileInfoService;
import egovframework.let.adm.service.vo.EduProgramIntroVO;
import jakarta.annotation.Resource;

/** 홈페이지 교육프로그램 소개 관리 */
@Service("egovEduProgramIntroService")
public class EgovEduProgramIntroServiceImpl extends EgovAbstractServiceImpl implements EgovEduProgramIntroService {

	@Resource(name = "eduProgramIntroDAO")
	private EduProgramIntroDAO eduProgramIntroDAO;

	@Resource(name = "egovFileInfoService")
	private EgovFileInfoService fileInfoService;

	@Override
	public List<EduProgramIntroVO> getIntroList(String prgrmCtgryCd, String useYn, String keyword) {
		return eduProgramIntroDAO.selectIntroList(trimToNull(prgrmCtgryCd), trimToNull(useYn), trimToNull(keyword));
	}

	@Override
	public EduProgramIntroVO getIntro(Integer prgrmIntrdSn) {
		return prgrmIntrdSn != null ? eduProgramIntroDAO.selectIntro(prgrmIntrdSn) : null;
	}

	@Override
	public List<Map<String, Object>> getCategoryCodes() {
		return eduProgramIntroDAO.selectCategoryCodes();
	}

	@Override
	@Transactional
	public EduProgramIntroVO saveIntro(EduProgramIntroVO intro) {
		validate(intro);
		intro.setPrgrmTtl(intro.getPrgrmTtl().trim());
		intro.setUseYn("N".equalsIgnoreCase(intro.getUseYn()) ? "N" : "Y");
		if (intro.getPrgrmIntrdSn() == null) {
			if (intro.getSortSeq() == null || intro.getSortSeq() <= 0) {
				intro.setSortSeq(eduProgramIntroDAO.selectNextSortSeq());
			}
			eduProgramIntroDAO.insertIntro(intro);
		} else if (eduProgramIntroDAO.updateIntro(intro) == 0) {
			// 이미 삭제됐거나 없는 번호면 화면에 성공 메시지만 뜨고 값은 그대로 남는다.
			throw new IllegalArgumentException("수정할 프로그램을 찾을 수 없습니다.");
		}
		return getIntro(intro.getPrgrmIntrdSn());
	}

	@Override
	@Transactional
	public void deleteIntro(Integer prgrmIntrdSn, String deltr) {
		if (prgrmIntrdSn == null) {
			throw new IllegalArgumentException("삭제할 프로그램 번호가 없습니다.");
		}
		EduProgramIntroVO target = eduProgramIntroDAO.selectIntro(prgrmIntrdSn);
		eduProgramIntroDAO.deleteIntro(prgrmIntrdSn, deltr);
		// 소개를 지워도 이미지가 남으면 주소를 아는 사람이 계속 받을 수 있다. CI 삭제와 같은 방식이다.
		if (target != null) {
			fileInfoService.deleteFileGroup(target.getImgFileId());
		}
	}

	@Override
	@Transactional
	public void updateIntroSeq(Integer prgrmIntrdSn, Integer sortSeq, String mdtr) {
		if (prgrmIntrdSn == null || sortSeq == null) {
			throw new IllegalArgumentException("순서를 변경할 프로그램 정보가 없습니다.");
		}
		eduProgramIntroDAO.updateIntroSeq(prgrmIntrdSn, sortSeq, mdtr);
	}

	private static String trimToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private void validate(EduProgramIntroVO intro) {
		if (intro == null) {
			throw new IllegalArgumentException("저장할 프로그램 정보가 없습니다.");
		}
		if (intro.getPrgrmTtl() == null || intro.getPrgrmTtl().trim().isEmpty()) {
			throw new IllegalArgumentException("타이틀을 입력해주세요.");
		}
		if (intro.getPrgrmTtl().trim().length() > 200) {
			throw new IllegalArgumentException("타이틀은 200자 이내로 입력해주세요.");
		}
		requireCategory(intro.getPrgrmCtgryCd());
		if (intro.getAplyUrlAddr() != null && intro.getAplyUrlAddr().length() > 1000) {
			throw new IllegalArgumentException("신청 링크는 1000자 이내로 입력해주세요.");
		}
	}

	/** 분류는 공통코드 COM048 에서 관리하므로 코드 목록을 조회해 확인한다. */
	private void requireCategory(String prgrmCtgryCd) {
		String code = trimToNull(prgrmCtgryCd);
		if (code == null) {
			throw new IllegalArgumentException("프로그램 분류를 선택해주세요.");
		}
		boolean exists = eduProgramIntroDAO.selectCategoryCodes().stream()
			.anyMatch(row -> code.equals(String.valueOf(row.get("code"))));
		if (!exists) {
			throw new IllegalArgumentException("프로그램 분류가 올바르지 않습니다.");
		}
	}
}

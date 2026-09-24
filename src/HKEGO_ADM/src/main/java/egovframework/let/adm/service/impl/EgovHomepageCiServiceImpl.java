package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovFileInfoService;
import java.util.List;
import java.util.Set;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovHomepageCiService;
import egovframework.let.adm.service.vo.HomepageCiVO;
import jakarta.annotation.Resource;

@Service("egovHomepageCiService")
public class EgovHomepageCiServiceImpl extends EgovAbstractServiceImpl implements EgovHomepageCiService {
	/** 사용자 페이지 마크업이 구분마다 다르므로 코드는 네 값으로 고정한다. FILE은 CI 통합 다운로드 파일이다. */
	private static final Set<String> CI_SE_CODES = Set.of("SYMBOL", "SIGN", "CHAR", "FILE");
	/** 심벌마크와 통합 다운로드 파일은 노출 항목이 항상 한 건이다. */
	private static final Set<String> SINGLE_USE_CODES = Set.of("SYMBOL", "FILE");

	@Resource(name = "egovFileInfoService")
	private EgovFileInfoService fileInfoService;

	@Resource(name = "homepageCiDAO")
	private HomepageCiDAO homepageCiDAO;

	@Override
	public List<HomepageCiVO> getCiList(String ciSeCd) {
		return homepageCiDAO.selectCiList(requireCiSeCd(ciSeCd));
	}

	@Override
	public HomepageCiVO getCi(Integer ciSn) {
		return ciSn != null ? homepageCiDAO.selectCi(ciSn) : null;
	}

	@Override
	@Transactional
	public HomepageCiVO saveCi(HomepageCiVO ci) {
		validate(ci);
		ci.setCiSeCd(requireCiSeCd(ci.getCiSeCd()));
		ci.setCiTtl(ci.getCiTtl().trim());
		ci.setUseYn("N".equalsIgnoreCase(ci.getUseYn()) ? "N" : "Y");
		if (ci.getCiSn() == null) {
			if (ci.getSortSeq() == null || ci.getSortSeq() <= 0) {
				ci.setSortSeq(homepageCiDAO.selectNextSortSeq(ci.getCiSeCd()));
			}
			homepageCiDAO.insertCi(ci);
		} else if (homepageCiDAO.updateCi(ci) == 0) {
			// 이미 삭제됐거나 없는 번호면 화면에 성공 메시지만 뜨고 값은 그대로 남는다.
			throw new IllegalArgumentException("수정할 CI를 찾을 수 없습니다.");
		}
		if (SINGLE_USE_CODES.contains(ci.getCiSeCd()) && "Y".equals(ci.getUseYn())) {
			homepageCiDAO.clearOtherUseYn(ci.getCiSeCd(), ci.getCiSn());
		}
		return getCi(ci.getCiSn());
	}

	@Override
	@Transactional
	public void deleteCi(Integer ciSn, String deltr) {
		if (ciSn == null) {
			throw new IllegalArgumentException("삭제할 CI 번호가 없습니다.");
		}
		HomepageCiVO target = homepageCiDAO.selectCi(ciSn);
		homepageCiDAO.deleteCi(ciSn, deltr);
		// CI 를 지워도 이미지가 남으면 주소를 아는 사람이 계속 받을 수 있다.
		if (target != null) {
			fileInfoService.deleteFileGroup(target.getImgFileId());
			// 삭제로 비는 번호를 그대로 두면 순서에 빈칸이 생긴다. 같은 구분 안에서 1부터 다시 매긴다.
			resequence(target.getCiSeCd(), deltr);
		}
	}

	private void resequence(String ciSeCd, String mdtr) {
		List<HomepageCiVO> remains = homepageCiDAO.selectCiList(ciSeCd);
		if (remains == null) {
			return;
		}
		int seq = 1;
		for (HomepageCiVO item : remains) {
			if (item.getSortSeq() == null || item.getSortSeq() != seq) {
				homepageCiDAO.updateCiSeq(item.getCiSn(), seq, mdtr);
			}
			seq++;
		}
	}

	@Override
	@Transactional
	public void updateCiSeq(Integer ciSn, Integer sortSeq, String mdtr) {
		if (ciSn == null || sortSeq == null) {
			throw new IllegalArgumentException("순서를 변경할 CI 정보가 없습니다.");
		}
		homepageCiDAO.updateCiSeq(ciSn, sortSeq, mdtr);
	}

	private String requireCiSeCd(String ciSeCd) {
		String code = ciSeCd != null ? ciSeCd.trim().toUpperCase() : "";
		if (!CI_SE_CODES.contains(code)) {
			throw new IllegalArgumentException("CI 구분이 올바르지 않습니다.");
		}
		return code;
	}

	private void validate(HomepageCiVO ci) {
		if (ci == null) {
			throw new IllegalArgumentException("저장할 CI 정보가 없습니다.");
		}
		if (ci.getCiTtl() == null || ci.getCiTtl().trim().isEmpty()) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		}
		if (ci.getCiTtl().trim().length() > 100) {
			throw new IllegalArgumentException("제목은 100자 이내로 입력해주세요.");
		}
		if (ci.getImgFileId() == null || ci.getImgFileId().trim().isEmpty()) {
			throw new IllegalArgumentException("파일을 등록해주세요.");
		}
	}
}

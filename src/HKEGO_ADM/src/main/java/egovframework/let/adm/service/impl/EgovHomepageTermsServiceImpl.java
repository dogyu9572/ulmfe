package egovframework.let.adm.service.impl;

import java.util.List;
import java.util.Map;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovHomepageTermsService;
import egovframework.let.adm.service.vo.HomepageTermsVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;

@Service("egovHomepageTermsService")
public class EgovHomepageTermsServiceImpl extends EgovAbstractServiceImpl implements EgovHomepageTermsService {
	@Resource(name = "homepageTermsDAO")
	private HomepageTermsDAO homepageTermsDAO;

	@Override
	public Map<String, Object> getTermsList(String termsTypeCd, String currentYn, String searchType,
		String searchKeyword, String startRegDate, String endRegDate, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = homepageTermsDAO.selectTermsCount(
			termsTypeCd, currentYn, searchType, searchKeyword, startRegDate, endRegDate);
		return PageListResult.of(
			homepageTermsDAO.selectTermsList(termsTypeCd, currentYn, searchType, searchKeyword,
				startRegDate, endRegDate, offset, safeSize),
			totalCount,
			safePage,
			safeSize
		);
	}

	@Override
	public HomepageTermsVO getTerms(Integer trmsSn) {
		return trmsSn != null ? homepageTermsDAO.selectTerms(trmsSn) : null;
	}

	@Override
	@Transactional
	public HomepageTermsVO saveTerms(HomepageTermsVO terms) {
		validate(terms);
		terms.setTrmsTypeCd(terms.getTrmsTypeCd().trim());
		terms.setTrmsTypeNm(resolveTypeName(terms.getTrmsTypeCd()));
		terms.setTrmsTtl(terms.getTrmsTtl().trim());
		terms.setTrmsCn(terms.getTrmsCn().trim());
		terms.setCurrentYn("Y".equalsIgnoreCase(terms.getCurrentYn()) ? "Y" : "N");
		if ("Y".equals(terms.getCurrentYn())) {
			homepageTermsDAO.clearCurrentTerms(terms.getTrmsTypeCd(), terms.getTrmsSn());
		}
		if (terms.getTrmsSn() == null) {
			homepageTermsDAO.insertTerms(terms);
		} else {
			homepageTermsDAO.updateTerms(terms);
		}
		return getTerms(terms.getTrmsSn());
	}

	@Override
	@Transactional
	public void deleteTerms(Integer trmsSn, String deltr) {
		if (trmsSn == null) {
			throw new IllegalArgumentException("삭제할 약관 번호가 없습니다.");
		}
		homepageTermsDAO.deleteTerms(trmsSn, deltr);
	}

	@Override
	@Transactional
	public void deleteTermsList(List<Integer> trmsSns, String deltr) {
		if (trmsSns == null || trmsSns.isEmpty()) {
			throw new IllegalArgumentException("삭제할 약관을 선택해주세요.");
		}
		homepageTermsDAO.deleteTermsList(trmsSns, deltr);
	}

	private void validate(HomepageTermsVO terms) {
		if (terms == null) {
			throw new IllegalArgumentException("저장할 약관 정보가 없습니다.");
		}
		if (isBlank(terms.getTrmsTypeCd())) {
			throw new IllegalArgumentException("약관을 선택해주세요.");
		}
		if (isBlank(terms.getTrmsTtl())) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		}
		if (isBlank(terms.getTrmsCn())) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}
	}

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}

	private String resolveTypeName(String typeCd) {
		return switch (typeCd) {
			case "USE" -> "이용약관";
			case "PRIVACY" -> "개인정보처리방침";
			case "VIDEO" -> "영상정보처리기기 운영방침";
			case "EMAIL" -> "이메일무단수집거부";
			default -> typeCd;
		};
	}
}

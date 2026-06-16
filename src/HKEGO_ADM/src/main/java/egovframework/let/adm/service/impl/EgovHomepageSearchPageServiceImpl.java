package egovframework.let.adm.service.impl;

import java.util.List;
import java.util.Map;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovHomepageSearchPageService;
import egovframework.let.adm.service.vo.HomepageSearchPageVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;

@Service("egovHomepageSearchPageService")
public class EgovHomepageSearchPageServiceImpl extends EgovAbstractServiceImpl implements EgovHomepageSearchPageService {
	@Resource(name = "homepageSearchPageDAO")
	private HomepageSearchPageDAO homepageSearchPageDAO;

	@Override
	public Map<String, Object> getSearchPageList(String menu1DepthNm, String menu2DepthNm, String menu3DepthNm,
		String searchType, String searchKeyword, String startRegDate, String endRegDate, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = homepageSearchPageDAO.selectSearchPageCount(
			menu1DepthNm, menu2DepthNm, menu3DepthNm, searchType, searchKeyword, startRegDate, endRegDate);
		return PageListResult.of(
			homepageSearchPageDAO.selectSearchPageList(menu1DepthNm, menu2DepthNm, menu3DepthNm, searchType, searchKeyword,
				startRegDate, endRegDate, offset, safeSize),
			totalCount,
			safePage,
			safeSize
		);
	}

	@Override
	public HomepageSearchPageVO getSearchPage(Integer srchPageSn) {
		return srchPageSn != null ? homepageSearchPageDAO.selectSearchPage(srchPageSn) : null;
	}

	@Override
	@Transactional
	public HomepageSearchPageVO saveSearchPage(HomepageSearchPageVO searchPage) {
		validate(searchPage);
		searchPage.setMenu1DepthNm(trimToEmpty(searchPage.getMenu1DepthNm()));
		searchPage.setMenu2DepthNm(trimToEmpty(searchPage.getMenu2DepthNm()));
		searchPage.setMenu3DepthNm(trimToEmpty(searchPage.getMenu3DepthNm()));
		searchPage.setPageTtl(searchPage.getPageTtl().trim());
		searchPage.setPageCn(searchPage.getPageCn().trim());
		searchPage.setPageUrl(searchPage.getPageUrl().trim());
		if (searchPage.getSrchPageSn() == null) {
			homepageSearchPageDAO.insertSearchPage(searchPage);
		} else {
			homepageSearchPageDAO.updateSearchPage(searchPage);
		}
		return getSearchPage(searchPage.getSrchPageSn());
	}

	@Override
	@Transactional
	public void deleteSearchPage(Integer srchPageSn, String deltr) {
		if (srchPageSn == null) {
			throw new IllegalArgumentException("삭제할 통합검색 페이지 번호가 없습니다.");
		}
		homepageSearchPageDAO.deleteSearchPage(srchPageSn, deltr);
	}

	@Override
	@Transactional
	public void deleteSearchPageList(List<Integer> srchPageSns, String deltr) {
		if (srchPageSns == null || srchPageSns.isEmpty()) {
			throw new IllegalArgumentException("삭제할 통합검색 페이지를 선택해주세요.");
		}
		homepageSearchPageDAO.deleteSearchPageList(srchPageSns, deltr);
	}

	private void validate(HomepageSearchPageVO searchPage) {
		if (searchPage == null) {
			throw new IllegalArgumentException("저장할 통합검색 페이지 정보가 없습니다.");
		}
		if (isBlank(searchPage.getMenu1DepthNm())) {
			throw new IllegalArgumentException("1depth 메뉴명을 입력해주세요.");
		}
		if (isBlank(searchPage.getPageTtl())) {
			throw new IllegalArgumentException("제목을 입력해주세요.");
		}
		if (isBlank(searchPage.getPageCn())) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}
		if (isBlank(searchPage.getPageUrl())) {
			throw new IllegalArgumentException("페이지 URL을 입력해주세요.");
		}
	}

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}

	private String trimToEmpty(String value) {
		return value == null ? "" : value.trim();
	}
}

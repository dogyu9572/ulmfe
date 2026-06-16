package egovframework.let.adm.service;

import java.util.List;
import java.util.Map;

import egovframework.let.adm.service.vo.HomepageSearchPageVO;

public interface EgovHomepageSearchPageService {
	Map<String, Object> getSearchPageList(String menu1DepthNm, String menu2DepthNm, String menu3DepthNm,
		String searchType, String searchKeyword, String startRegDate, String endRegDate, int page, int size);
	HomepageSearchPageVO getSearchPage(Integer srchPageSn);
	HomepageSearchPageVO saveSearchPage(HomepageSearchPageVO searchPage);
	void deleteSearchPage(Integer srchPageSn, String deltr);
	void deleteSearchPageList(List<Integer> srchPageSns, String deltr);
}

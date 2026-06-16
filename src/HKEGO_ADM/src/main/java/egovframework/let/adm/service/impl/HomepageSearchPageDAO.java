package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.HomepageSearchPageVO;

@Repository("homepageSearchPageDAO")
public class HomepageSearchPageDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.HomepageSearchPageDAO.";

	public List<HomepageSearchPageVO> selectSearchPageList(String menu1DepthNm, String menu2DepthNm, String menu3DepthNm,
		String searchType, String searchKeyword, String startRegDate, String endRegDate, int offset, int size) {
		Map<String, Object> param = new HashMap<>();
		param.put("menu1DepthNm", menu1DepthNm);
		param.put("menu2DepthNm", menu2DepthNm);
		param.put("menu3DepthNm", menu3DepthNm);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("startRegDate", startRegDate);
		param.put("endRegDate", endRegDate);
		param.put("offset", offset);
		param.put("size", size);
		return selectList(NS + "selectSearchPageList", param);
	}

	public int selectSearchPageCount(String menu1DepthNm, String menu2DepthNm, String menu3DepthNm,
		String searchType, String searchKeyword, String startRegDate, String endRegDate) {
		Map<String, Object> param = new HashMap<>();
		param.put("menu1DepthNm", menu1DepthNm);
		param.put("menu2DepthNm", menu2DepthNm);
		param.put("menu3DepthNm", menu3DepthNm);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("startRegDate", startRegDate);
		param.put("endRegDate", endRegDate);
		Integer count = selectOne(NS + "selectSearchPageCount", param);
		return count == null ? 0 : count;
	}

	public HomepageSearchPageVO selectSearchPage(Integer srchPageSn) {
		return selectOne(NS + "selectSearchPage", srchPageSn);
	}

	public int insertSearchPage(HomepageSearchPageVO searchPage) {
		return insert(NS + "insertSearchPage", searchPage);
	}

	public int updateSearchPage(HomepageSearchPageVO searchPage) {
		return update(NS + "updateSearchPage", searchPage);
	}

	public int deleteSearchPage(Integer srchPageSn, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("srchPageSn", srchPageSn);
		param.put("deltr", deltr);
		return update(NS + "deleteSearchPage", param);
	}

	public int deleteSearchPageList(List<Integer> srchPageSns, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("srchPageSns", srchPageSns);
		param.put("deltr", deltr);
		return update(NS + "deleteSearchPageList", param);
	}
}

package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.HomepageTermsVO;

@Repository("homepageTermsDAO")
public class HomepageTermsDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.HomepageTermsDAO.";

	public List<HomepageTermsVO> selectTermsList(String termsTypeCd, String currentYn, String searchType,
		String searchKeyword, String startRegDate, String endRegDate, int offset, int size) {
		Map<String, Object> param = new HashMap<>();
		param.put("termsTypeCd", termsTypeCd);
		param.put("currentYn", currentYn);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("startRegDate", startRegDate);
		param.put("endRegDate", endRegDate);
		param.put("offset", offset);
		param.put("size", size);
		return selectList(NS + "selectTermsList", param);
	}

	public int selectTermsCount(String termsTypeCd, String currentYn, String searchType,
		String searchKeyword, String startRegDate, String endRegDate) {
		Map<String, Object> param = new HashMap<>();
		param.put("termsTypeCd", termsTypeCd);
		param.put("currentYn", currentYn);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("startRegDate", startRegDate);
		param.put("endRegDate", endRegDate);
		Integer count = selectOne(NS + "selectTermsCount", param);
		return count == null ? 0 : count;
	}

	public HomepageTermsVO selectTerms(Integer trmsSn) {
		return selectOne(NS + "selectTerms", trmsSn);
	}

	public int insertTerms(HomepageTermsVO terms) {
		return insert(NS + "insertTerms", terms);
	}

	public int updateTerms(HomepageTermsVO terms) {
		return update(NS + "updateTerms", terms);
	}

	public int clearCurrentTerms(String trmsTypeCd, Integer exceptTrmsSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("trmsTypeCd", trmsTypeCd);
		param.put("exceptTrmsSn", exceptTrmsSn);
		return update(NS + "clearCurrentTerms", param);
	}

	public int deleteTerms(Integer trmsSn, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("trmsSn", trmsSn);
		param.put("deltr", deltr);
		return update(NS + "deleteTerms", param);
	}

	public int deleteTermsList(List<Integer> trmsSns, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("trmsSns", trmsSns);
		param.put("deltr", deltr);
		return update(NS + "deleteTermsList", param);
	}
}

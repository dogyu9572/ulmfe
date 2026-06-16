package egovframework.let.adm.service;

import java.util.List;
import java.util.Map;

import egovframework.let.adm.service.vo.HomepageTermsVO;

public interface EgovHomepageTermsService {
	Map<String, Object> getTermsList(String termsTypeCd, String currentYn, String searchType, String searchKeyword,
		String startRegDate, String endRegDate, int page, int size);
	HomepageTermsVO getTerms(Integer trmsSn);
	HomepageTermsVO saveTerms(HomepageTermsVO terms);
	void deleteTerms(Integer trmsSn, String deltr);
	void deleteTermsList(List<Integer> trmsSns, String deltr);
}

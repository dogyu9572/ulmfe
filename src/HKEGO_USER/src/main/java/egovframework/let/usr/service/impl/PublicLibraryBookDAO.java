package egovframework.let.usr.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicLibraryBookVO;
import egovframework.let.usr.service.vo.PublicBoardCategoryVO;

@Repository("publicLibraryBookDAO")
public class PublicLibraryBookDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicLibraryBookDAO.";

	public List<PublicLibraryBookVO> selectBooks(
		String searchType,
		String keyword,
		String recommendedYn,
		String category,
		boolean newOnly,
		String newBookYear,
		String newBookMonth,
		int offset,
		int size
	) {
		return selectList(NS + "selectBooks", params(
			searchType, keyword, recommendedYn, category, newOnly, newBookYear, newBookMonth, offset, size
		));
	}

	public int countBooks(
		String searchType,
		String keyword,
		String recommendedYn,
		String category,
		boolean newOnly,
		String newBookYear,
		String newBookMonth
	) {
		Integer count = selectOne(NS + "countBooks", params(
			searchType, keyword, recommendedYn, category, newOnly, newBookYear, newBookMonth, 0, 1
		));
		return count == null ? 0 : count;
	}

	public PublicLibraryBookVO selectBook(Integer bookId) {
		return selectOne(NS + "selectBook", bookId);
	}

	public List<PublicLibraryBookVO> selectRelatedBooks(Integer bookId) {
		return selectList(NS + "selectRelatedBooks", bookId);
	}

	public List<PublicBoardCategoryVO> selectRecommendationCategories() {
		return selectList(NS + "selectRecommendationCategories");
	}

	private Map<String, Object> params(
		String searchType,
		String keyword,
		String recommendedYn,
		String category,
		boolean newOnly,
		String newBookYear,
		String newBookMonth,
		int offset,
		int size
	) {
		Map<String, Object> params = new HashMap<>();
		params.put("searchType", searchType);
		params.put("keyword", keyword);
		params.put("recommendedYn", recommendedYn);
		params.put("category", category);
		params.put("newOnly", newOnly);
		params.put("newBookYear", newBookYear);
		params.put("newBookMonth", newBookMonth);
		params.put("offset", offset);
		params.put("size", size);
		return params;
	}
}

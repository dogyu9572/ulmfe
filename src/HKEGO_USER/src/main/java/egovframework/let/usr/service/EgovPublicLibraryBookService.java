package egovframework.let.usr.service;

import egovframework.let.usr.service.vo.PublicLibraryBookVO;
import egovframework.let.usr.service.vo.PublicBoardCategoryVO;
import egovframework.let.usr.service.vo.PublicPageResult;

import java.util.List;

public interface EgovPublicLibraryBookService {
	PublicPageResult<PublicLibraryBookVO> getBooks(
		String searchType,
		String keyword,
		String recommendedYn,
		String category,
		boolean newOnly,
		String newBookYear,
		String newBookMonth,
		int page,
		int size
	);

	List<PublicBoardCategoryVO> getRecommendationCategories();

	PublicLibraryBookVO getBook(Integer bookId);
}

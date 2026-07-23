package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicLibraryBookService;
import egovframework.let.usr.service.vo.PublicBoardCategoryVO;
import egovframework.let.usr.service.vo.PublicLibraryBookVO;
import egovframework.let.usr.service.vo.PublicPageResult;
import lombok.RequiredArgsConstructor;

@Service("egovPublicLibraryBookService")
@RequiredArgsConstructor
public class EgovPublicLibraryBookServiceImpl implements EgovPublicLibraryBookService {
	private final PublicLibraryBookDAO publicLibraryBookDAO;

	@Override
	@Transactional(readOnly = true)
	public PublicPageResult<PublicLibraryBookVO> getBooks(
		String searchType,
		String keyword,
		String recommendedYn,
		String category,
		boolean newOnly,
		String newBookYear,
		String newBookMonth,
		int page,
		int size
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(100, Math.max(1, size));
		String safeSearchType = switch (searchType == null ? "" : searchType) {
			case "title", "content" -> searchType;
			default -> "all";
		};
		String safeKeyword = keyword == null ? "" : keyword.trim();
		String safeRecommendedYn = "Y".equalsIgnoreCase(recommendedYn) ? "Y" : "";
		String safeCategory = category == null ? "" : category.trim();
		String safeYear = newBookYear == null ? "" : newBookYear.trim();
		String safeMonth = newBookMonth == null ? "" : newBookMonth.trim();
		int totalCount = publicLibraryBookDAO.countBooks(
			safeSearchType, safeKeyword, safeRecommendedYn, safeCategory, newOnly, safeYear, safeMonth
		);
		List<PublicLibraryBookVO> books = publicLibraryBookDAO.selectBooks(
			safeSearchType,
			safeKeyword,
			safeRecommendedYn,
			safeCategory,
			newOnly,
			safeYear,
			safeMonth,
			(safePage - 1) * safeSize,
			safeSize
		);
		return PublicPageResult.of(books, totalCount, safePage, safeSize);
	}

	@Override
	@Transactional(readOnly = true)
	public List<PublicBoardCategoryVO> getRecommendationCategories() {
		return publicLibraryBookDAO.selectRecommendationCategories();
	}

	@Override
	@Transactional(readOnly = true)
	public PublicLibraryBookVO getBook(Integer bookId) {
		if (bookId == null || bookId <= 0) return null;
		PublicLibraryBookVO book = publicLibraryBookDAO.selectBook(bookId);
		if (book != null) {
			book.setRelatedBooks(publicLibraryBookDAO.selectRelatedBooks(bookId));
		}
		return book;
	}
}

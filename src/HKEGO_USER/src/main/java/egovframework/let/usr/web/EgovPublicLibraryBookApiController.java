package egovframework.let.usr.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicLibraryBookService;
import egovframework.let.usr.service.vo.PublicLibraryBookVO;
import egovframework.let.usr.service.vo.PublicBoardCategoryVO;
import egovframework.let.usr.service.vo.PublicPageResult;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/library/books")
@RequiredArgsConstructor
public class EgovPublicLibraryBookApiController {
	private final EgovPublicLibraryBookService publicLibraryBookService;

	@GetMapping
	public ApiResponse<PublicPageResult<PublicLibraryBookVO>> getBooks(
		@RequestParam(required = false, defaultValue = "all") String searchType,
		@RequestParam(required = false, defaultValue = "") String keyword,
		@RequestParam(required = false, defaultValue = "") String recommendedYn,
		@RequestParam(required = false, defaultValue = "") String category,
		@RequestParam(required = false, defaultValue = "false") boolean newOnly,
		@RequestParam(required = false, defaultValue = "") String newBookYear,
		@RequestParam(required = false, defaultValue = "") String newBookMonth,
		@RequestParam(required = false, defaultValue = "1") int page,
		@RequestParam(required = false, defaultValue = "8") int size
	) {
		return ApiResponse.success("도서 목록을 조회했습니다.", publicLibraryBookService.getBooks(
			searchType, keyword, recommendedYn, category, newOnly, newBookYear, newBookMonth, page, size
		));
	}

	@GetMapping("/categories")
	public ApiResponse<java.util.List<PublicBoardCategoryVO>> getRecommendationCategories() {
		return ApiResponse.success("추천도서 분류를 조회했습니다.", publicLibraryBookService.getRecommendationCategories());
	}

	@GetMapping("/{bookId}")
	public ApiResponse<PublicLibraryBookVO> getBook(@PathVariable Integer bookId) {
		return ApiResponse.success("도서 상세를 조회했습니다.", publicLibraryBookService.getBook(bookId));
	}
}

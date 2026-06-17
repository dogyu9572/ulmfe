package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovLibraryBookService;
import egovframework.let.adm.service.vo.LibraryBookDto;
import egovframework.let.adm.service.vo.LibraryBookVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/library-books")
@RequiredArgsConstructor
public class EgovLibraryBookManageApiController {
	private final EgovLibraryBookService libraryBookService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getLibraryBooks(
		@RequestParam(required = false) String expsrYn,
		@RequestParam(required = false) String rcmdtnYn,
		@RequestParam(required = false) String rcmdtnClsfCd,
		@RequestParam(required = false) String newBookYr,
		@RequestParam(required = false) String newBookMm,
		@RequestParam(required = false) String startRegYmd,
		@RequestParam(required = false) String endRegYmd,
		@RequestParam(required = false) String searchType,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		return ApiResponse.success(
			"도서 목록 조회 성공",
			libraryBookService.getLibraryBookListPage(
				expsrYn, rcmdtnYn, rcmdtnClsfCd, newBookYr, newBookMm, startRegYmd, endRegYmd,
				searchType, searchKeyword, page, size
			)
		);
	}

	@GetMapping("/{bookSn}")
	public ApiResponse<LibraryBookVO> getLibraryBook(@PathVariable Integer bookSn) {
		return ApiResponse.success("도서 상세 조회 성공", libraryBookService.getLibraryBookById(bookSn));
	}

	@PostMapping
	public ApiResponse<LibraryBookVO> createLibraryBook(@RequestBody LibraryBookDto dto) {
		return ApiResponse.success("도서 등록 성공", libraryBookService.createLibraryBook(dto));
	}

	@PutMapping("/{bookSn}")
	public ApiResponse<LibraryBookVO> updateLibraryBook(
		@PathVariable Integer bookSn,
		@RequestBody LibraryBookDto dto
	) {
		return ApiResponse.success("도서 수정 성공", libraryBookService.updateLibraryBook(bookSn, dto));
	}

	@DeleteMapping("/{bookSn}")
	public ApiResponse<Void> deleteLibraryBook(@PathVariable Integer bookSn) {
		libraryBookService.deleteLibraryBook(bookSn);
		return ApiResponse.success("도서 삭제 성공", null);
	}

	@GetMapping("/related-candidates")
	public ApiResponse<List<LibraryBookVO>> getRelatedBookCandidates(
		@RequestParam(required = false) Integer excludeBookSn,
		@RequestParam(required = false) String searchType,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "50") int limit
	) {
		return ApiResponse.success(
			"관련자료 도서 조회 성공",
			libraryBookService.getRelatedBookCandidates(excludeBookSn, searchType, searchKeyword, limit)
		);
	}
}

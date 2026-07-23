package egovframework.let.usr.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicBoardService;
import egovframework.let.usr.service.vo.PublicBoardPostVO;
import egovframework.let.usr.service.vo.PublicBoardCategoryVO;
import egovframework.let.usr.service.vo.PublicPageResult;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/user/boards")
@RequiredArgsConstructor
public class EgovPublicBoardApiController {
	private final EgovPublicBoardService publicBoardService;

	@GetMapping("/{boardId}")
	public ResponseEntity<ApiResponse<PublicPageResult<PublicBoardPostVO>>> getPosts(
		@PathVariable String boardId,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "10") int size,
		@RequestParam(defaultValue = "all") String searchType,
		@RequestParam(required = false) String keyword,
		@RequestParam(required = false) String category,
		@RequestParam(required = false) String programType
	) {
		try {
			return ResponseEntity.ok(ApiResponse.success(
				"게시글 목록을 조회했습니다.",
				publicBoardService.getPosts(boardId, page, size, searchType, keyword, category, programType)
			));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
		}
	}

	@GetMapping("/{boardId}/{postId}")
	public ResponseEntity<ApiResponse<PublicBoardPostVO>> getPost(
		@PathVariable String boardId,
		@PathVariable String postId,
		@RequestParam(defaultValue = "true") boolean increaseViewCount
	) {
		try {
			return ResponseEntity.ok(ApiResponse.success(
				"게시글 상세를 조회했습니다.",
				publicBoardService.getPost(boardId, postId, increaseViewCount)
			));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
		}
	}

	@GetMapping("/{boardId}/categories")
	public ResponseEntity<ApiResponse<List<PublicBoardCategoryVO>>> getCategories(@PathVariable String boardId) {
		try {
			return ResponseEntity.ok(ApiResponse.success(
				"게시판 분류를 조회했습니다.",
				publicBoardService.getCategories(boardId)
			));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
		}
	}
}

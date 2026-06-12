package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.BbsPostVO;
import egovframework.let.adm.service.EgovBbsPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/bbs-post")
@RequiredArgsConstructor
public class EgovBbsPostManageApiController {

	private final EgovBbsPostService bbsPostService;

	/**
	 * 게시글 목록 조회 (관리자용, 페이징, 검색)
	 */
	@GetMapping("/{bbsId}")
	public ApiResponse<Map<String, Object>> getBbsPostList(
			@PathVariable String bbsId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "20") int size,
			@RequestParam(required = false) String searchType,
			@RequestParam(required = false) String searchKeyword,
			@RequestParam(required = false) String category,
			@RequestParam(required = false) String startDate,
			@RequestParam(required = false) String endDate) {
		try {
			List<BbsPostVO> posts = bbsPostService.getBbsPostListForAdmin(
					bbsId, page, size, searchType, searchKeyword, category, startDate, endDate);
			int totalCount = bbsPostService.getBbsPostCountForAdmin(
					bbsId, searchType, searchKeyword, category, startDate, endDate);
			Map<String, Object> data = new HashMap<>();
			data.put("posts", posts);
			data.put("totalCount", totalCount);
			data.put("page", page);
			data.put("size", size);
			data.put("totalPages", (int) Math.ceil((double) totalCount / size));
			return ApiResponse.success("게시글 목록 조회 성공", data);
		} catch (Exception e) {
			log.error("게시글 목록 조회 오류: bbsId={}", bbsId, e);
			return ApiResponse.error("게시글 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 게시글 상세 조회 (조회수 증가)
	 */
	@GetMapping("/{bbsId}/{postId}")
	public ApiResponse<BbsPostVO> getBbsPostById(
			@PathVariable String bbsId,
			@PathVariable String postId) {
		try {
			bbsPostService.incrementViewCount(bbsId, postId);
			BbsPostVO post = bbsPostService.getBbsPostById(bbsId, postId);
			return ApiResponse.success("게시글 상세 조회 성공", post);
		} catch (Exception e) {
			log.error("게시글 상세 조회 오류: bbsId={}, postId={}", bbsId, postId, e);
			return ApiResponse.error("게시글 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 게시글 등록
	 */
	@PostMapping("/{bbsId}")
	public ApiResponse<BbsPostVO> createBbsPost(
			@PathVariable String bbsId,
			@RequestBody BbsPostVO bbsPost) {
		try {
			bbsPost.setBbsId(bbsId);
			BbsPostVO created = bbsPostService.createBbsPost(bbsPost);
			return ApiResponse.success("게시글 등록 성공", created);
		} catch (Exception e) {
			log.error("게시글 등록 오류: bbsId={}", bbsId, e);
			return ApiResponse.error("게시글 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 게시글 수정
	 */
	@PutMapping("/{bbsId}/{postId}")
	public ApiResponse<BbsPostVO> updateBbsPost(
			@PathVariable String bbsId,
			@PathVariable String postId,
			@RequestBody BbsPostVO bbsPost) {
		try {
			bbsPost.setBbsId(bbsId);
			bbsPost.setPostId(postId);
			BbsPostVO updated = bbsPostService.updateBbsPost(bbsPost);
			return ApiResponse.success("게시글 수정 성공", updated);
		} catch (Exception e) {
			log.error("게시글 수정 오류: bbsId={}, postId={}", bbsId, postId, e);
			return ApiResponse.error("게시글 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * 게시글 삭제
	 */
	@DeleteMapping("/{bbsId}/{postId}")
	public ApiResponse<Void> deleteBbsPost(
			@PathVariable String bbsId,
			@PathVariable String postId) {
		try {
			bbsPostService.deleteBbsPost(bbsId, postId);
			return ApiResponse.success("게시글 삭제 성공", null);
		} catch (Exception e) {
			log.error("게시글 삭제 오류: bbsId={}, postId={}", bbsId, postId, e);
			return ApiResponse.error("게시글 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}

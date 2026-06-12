package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.BbsMasterVO;
import egovframework.let.adm.service.EgovBbsMasterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/bbs-master")
@RequiredArgsConstructor
public class EgovBbsMasterManageApiController {

	private final EgovBbsMasterService bbsMasterService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getBbsMasterList(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		try {
			Map<String, Object> data = bbsMasterService.getBbsMasterListPage(page, size);
			return ApiResponse.success("게시판 마스터 목록 조회 성공", data);
		} catch (Exception e) {
			log.error("게시판 마스터 목록 조회 오류", e);
			return ApiResponse.error("게시판 마스터 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@GetMapping("/active")
	public ApiResponse<Map<String, Object>> getActiveBbsMasterList(
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		try {
			Map<String, Object> data = bbsMasterService.getActiveBbsMasterListPage(page, size);
			return ApiResponse.success("사용 중인 게시판 마스터 목록 조회 성공", data);
		} catch (Exception e) {
			log.error("사용 중인 게시판 마스터 목록 조회 오류", e);
			return ApiResponse.error("사용 중인 게시판 마스터 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@GetMapping("/{bbsId}")
	public ApiResponse<BbsMasterVO> getBbsMasterById(@PathVariable String bbsId) {
		try {
			BbsMasterVO bbsMaster = bbsMasterService.getBbsMasterById(bbsId);
			return ApiResponse.success("게시판 마스터 상세 조회 성공", bbsMaster);
		} catch (Exception e) {
			log.error("게시판 마스터 상세 조회 오류: {}", bbsId, e);
			return ApiResponse.error("게시판 마스터 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping
	public ApiResponse<BbsMasterVO> createBbsMaster(@RequestBody BbsMasterVO bbsMaster, HttpServletRequest request) {
		try {
			String adminId = request.getSession(false) != null ? (String) request.getSession(false).getAttribute("adminId") : null;
			BbsMasterVO created = bbsMasterService.createBbsMaster(bbsMaster, adminId);
			return ApiResponse.success("게시판 마스터 등록 성공", created);
		} catch (Exception e) {
			log.error("게시판 마스터 등록 오류", e);
			return ApiResponse.error("게시판 마스터 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PutMapping("/{bbsId}")
	public ApiResponse<BbsMasterVO> updateBbsMaster(
			@PathVariable String bbsId,
			@RequestBody BbsMasterVO bbsMaster,
			HttpServletRequest request) {
		try {
			bbsMaster.setBbsId(bbsId);
			String adminId = request.getSession(false) != null ? (String) request.getSession(false).getAttribute("adminId") : null;
			BbsMasterVO updated = bbsMasterService.updateBbsMaster(bbsMaster, adminId);
			return ApiResponse.success("게시판 마스터 수정 성공", updated);
		} catch (Exception e) {
			log.error("게시판 마스터 수정 오류: {}", bbsId, e);
			return ApiResponse.error("게시판 마스터 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@DeleteMapping("/{bbsId}")
	public ApiResponse<Void> deleteBbsMaster(@PathVariable String bbsId) {
		try {
			bbsMasterService.deleteBbsMaster(bbsId);
			return ApiResponse.success("게시판 마스터 삭제 성공", null);
		} catch (Exception e) {
			log.error("게시판 마스터 삭제 오류: {}", bbsId, e);
			return ApiResponse.error("게시판 마스터 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}

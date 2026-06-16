package egovframework.let.adm.web;

import java.util.Map;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovHomepageHistoryService;
import egovframework.let.adm.service.vo.HomepageHistoryVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin/history")
@RequiredArgsConstructor
public class EgovHomepageHistoryManageApiController {
	private final EgovHomepageHistoryService homepageHistoryService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getHistoryList(
		@RequestParam(value = "searchKeyword", required = false) String searchKeyword,
		@RequestParam(value = "useYn", required = false) String useYn,
		@RequestParam(value = "page", defaultValue = "1") int page,
		@RequestParam(value = "size", defaultValue = "20") int size) {
		try {
			return ApiResponse.success("연혁 목록을 조회했습니다.",
				homepageHistoryService.getHistoryList(searchKeyword, useYn, page, size));
		} catch (Exception e) {
			log.error("연혁 목록 조회 오류", e);
			return ApiResponse.error("연혁 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@GetMapping("/{hstrySn}")
	public ApiResponse<HomepageHistoryVO> getHistory(@PathVariable Integer hstrySn) {
		try {
			HomepageHistoryVO history = homepageHistoryService.getHistory(hstrySn);
			return history != null
				? ApiResponse.success("연혁 상세를 조회했습니다.", history)
				: ApiResponse.error("연혁 정보를 찾을 수 없습니다.");
		} catch (Exception e) {
			log.error("연혁 상세 조회 오류", e);
			return ApiResponse.error("연혁 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping
	public ApiResponse<HomepageHistoryVO> createHistory(@RequestBody HomepageHistoryVO history) {
		try {
			return ApiResponse.success("연혁이 등록되었습니다.", homepageHistoryService.saveHistory(history));
		} catch (Exception e) {
			log.error("연혁 등록 오류", e);
			return ApiResponse.error("연혁 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PutMapping("/{hstrySn}")
	public ApiResponse<HomepageHistoryVO> updateHistory(@PathVariable Integer hstrySn, @RequestBody HomepageHistoryVO history) {
		try {
			history.setHstrySn(hstrySn);
			return ApiResponse.success("연혁이 수정되었습니다.", homepageHistoryService.saveHistory(history));
		} catch (Exception e) {
			log.error("연혁 수정 오류", e);
			return ApiResponse.error("연혁 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@DeleteMapping("/{hstrySn}")
	public ApiResponse<Void> deleteHistory(
		@PathVariable Integer hstrySn,
		@RequestParam(value = "deltr", required = false) String deltr) {
		try {
			homepageHistoryService.deleteHistory(hstrySn, deltr);
			return ApiResponse.success("연혁이 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("연혁 삭제 오류", e);
			return ApiResponse.error("연혁 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping("/delete")
	public ApiResponse<Void> deleteHistories(@RequestBody Map<String, Object> body) {
		try {
			Object raw = body.get("hstrySns");
			if (!(raw instanceof List<?> rawList)) {
				return ApiResponse.error("삭제할 연혁을 선택해주세요.");
			}
			List<Integer> hstrySns = rawList.stream()
				.map(v -> v instanceof Number ? ((Number) v).intValue() : Integer.parseInt(String.valueOf(v)))
				.toList();
			String deltr = body.get("deltr") != null ? String.valueOf(body.get("deltr")) : null;
			homepageHistoryService.deleteHistories(hstrySns, deltr);
			return ApiResponse.success("선택한 연혁이 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("연혁 선택삭제 오류", e);
			return ApiResponse.error("연혁 선택삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}

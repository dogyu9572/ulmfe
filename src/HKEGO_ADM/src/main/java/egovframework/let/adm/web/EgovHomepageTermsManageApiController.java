package egovframework.let.adm.web;

import java.util.List;
import java.util.Map;

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
import egovframework.let.adm.service.EgovHomepageTermsService;
import egovframework.let.adm.service.vo.HomepageTermsVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin/terms")
@RequiredArgsConstructor
public class EgovHomepageTermsManageApiController {
	private final EgovHomepageTermsService homepageTermsService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getTermsList(
		@RequestParam(value = "termsTypeCd", required = false) String termsTypeCd,
		@RequestParam(value = "currentYn", required = false) String currentYn,
		@RequestParam(value = "searchType", required = false) String searchType,
		@RequestParam(value = "searchKeyword", required = false) String searchKeyword,
		@RequestParam(value = "startRegDate", required = false) String startRegDate,
		@RequestParam(value = "endRegDate", required = false) String endRegDate,
		@RequestParam(value = "page", defaultValue = "1") int page,
		@RequestParam(value = "size", defaultValue = "20") int size) {
		try {
			return ApiResponse.success("약관 목록을 조회했습니다.",
				homepageTermsService.getTermsList(termsTypeCd, currentYn, searchType, searchKeyword,
					startRegDate, endRegDate, page, size));
		} catch (Exception e) {
			log.error("약관 목록 조회 오류", e);
			return ApiResponse.error("약관 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@GetMapping("/{trmsSn}")
	public ApiResponse<HomepageTermsVO> getTerms(@PathVariable Integer trmsSn) {
		try {
			HomepageTermsVO terms = homepageTermsService.getTerms(trmsSn);
			return terms != null
				? ApiResponse.success("약관 상세를 조회했습니다.", terms)
				: ApiResponse.error("약관 정보를 찾을 수 없습니다.");
		} catch (Exception e) {
			log.error("약관 상세 조회 오류", e);
			return ApiResponse.error("약관 상세 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping
	public ApiResponse<HomepageTermsVO> createTerms(@RequestBody HomepageTermsVO terms) {
		try {
			return ApiResponse.success("약관이 등록되었습니다.", homepageTermsService.saveTerms(terms));
		} catch (Exception e) {
			log.error("약관 등록 오류", e);
			return ApiResponse.error("약관 등록 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PutMapping("/{trmsSn}")
	public ApiResponse<HomepageTermsVO> updateTerms(@PathVariable Integer trmsSn, @RequestBody HomepageTermsVO terms) {
		try {
			terms.setTrmsSn(trmsSn);
			return ApiResponse.success("약관이 수정되었습니다.", homepageTermsService.saveTerms(terms));
		} catch (Exception e) {
			log.error("약관 수정 오류", e);
			return ApiResponse.error("약관 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@DeleteMapping("/{trmsSn}")
	public ApiResponse<Void> deleteTerms(
		@PathVariable Integer trmsSn,
		@RequestParam(value = "deltr", required = false) String deltr) {
		try {
			homepageTermsService.deleteTerms(trmsSn, deltr);
			return ApiResponse.success("약관이 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("약관 삭제 오류", e);
			return ApiResponse.error("약관 삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping("/delete")
	public ApiResponse<Void> deleteTermsList(@RequestBody Map<String, Object> body) {
		try {
			Object raw = body.get("trmsSns");
			if (!(raw instanceof List<?> rawList)) {
				return ApiResponse.error("삭제할 약관을 선택해주세요.");
			}
			List<Integer> trmsSns = rawList.stream()
				.map(v -> v instanceof Number ? ((Number) v).intValue() : Integer.parseInt(String.valueOf(v)))
				.toList();
			String deltr = body.get("deltr") != null ? String.valueOf(body.get("deltr")) : null;
			homepageTermsService.deleteTermsList(trmsSns, deltr);
			return ApiResponse.success("선택한 약관이 삭제되었습니다.", null);
		} catch (Exception e) {
			log.error("약관 선택삭제 오류", e);
			return ApiResponse.error("약관 선택삭제 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}

package egovframework.let.usr.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicSearchService;
import egovframework.let.usr.service.vo.PublicSearchPageVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/search")
@RequiredArgsConstructor
public class EgovPublicSearchApiController {
	private final EgovPublicSearchService publicSearchService;

	@GetMapping
	public ApiResponse<List<PublicSearchPageVO>> searchPages(
		@RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
		if (keyword.length() > 100) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "검색어는 100자 이내로 입력해주세요.");
		}
		return ApiResponse.success("통합검색 결과를 조회했습니다.", publicSearchService.searchPages(keyword));
	}
}

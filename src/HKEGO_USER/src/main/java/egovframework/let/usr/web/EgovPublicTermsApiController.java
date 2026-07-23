package egovframework.let.usr.web;

import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicTermsService;
import egovframework.let.usr.service.vo.PublicTermsVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/terms")
@RequiredArgsConstructor
public class EgovPublicTermsApiController {
	private static final Set<String> PUBLIC_TERMS_TYPES = Set.of("USE", "PRIVACY", "VIDEO", "EMAIL");

	private final EgovPublicTermsService publicTermsService;

	@GetMapping("/{termsTypeCode}")
	public ApiResponse<PublicTermsVO> getCurrentTerms(@PathVariable String termsTypeCode) {
		String normalizedTypeCode = termsTypeCode.trim().toUpperCase(Locale.ROOT);
		if (!PUBLIC_TERMS_TYPES.contains(normalizedTypeCode)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 약관 유형입니다.");
		}
		return ApiResponse.success("약관을 조회했습니다.", publicTermsService.getCurrentTerms(normalizedTypeCode));
	}
}

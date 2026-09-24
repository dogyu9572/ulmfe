package egovframework.let.usr.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicCiService;
import egovframework.let.usr.service.vo.PublicCiVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/ci")
@RequiredArgsConstructor
public class EgovPublicCiApiController {
	private final EgovPublicCiService publicCiService;

	@GetMapping
	public ApiResponse<List<PublicCiVO>> getVisibleCiItems() {
		return ApiResponse.success("CI를 조회했습니다.", publicCiService.getVisibleCiItems());
	}
}

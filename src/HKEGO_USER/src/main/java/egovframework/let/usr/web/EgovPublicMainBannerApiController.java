package egovframework.let.usr.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicMainBannerService;
import egovframework.let.usr.service.vo.PublicMainBannerVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/main/banners")
@RequiredArgsConstructor
public class EgovPublicMainBannerApiController {
	private final EgovPublicMainBannerService publicMainBannerService;

	@GetMapping
	public ApiResponse<List<PublicMainBannerVO>> getVisibleBanners() {
		return ApiResponse.success(
			"메인 배너를 조회했습니다.",
			publicMainBannerService.getVisibleBanners()
		);
	}
}

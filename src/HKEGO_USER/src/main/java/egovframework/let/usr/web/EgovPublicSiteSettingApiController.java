package egovframework.let.usr.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicSiteSettingService;
import egovframework.let.usr.service.vo.PublicSiteSettingVO;
import lombok.RequiredArgsConstructor;

/** 사용자 사이트가 제목·로고·파비콘·푸터 정보를 받아 가는 창구다. */
@RestController
@RequestMapping("/api/user/site-setting")
@RequiredArgsConstructor
public class EgovPublicSiteSettingApiController {
	private final EgovPublicSiteSettingService publicSiteSettingService;

	@GetMapping
	public ApiResponse<PublicSiteSettingVO> getSiteSetting() {
		return ApiResponse.success("기본설정을 조회했습니다.", publicSiteSettingService.getSiteSetting());
	}
}

package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovSiteBasicSettingService;
import egovframework.let.adm.service.vo.SiteBasicSettingVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin/site-basic-setting")
@RequiredArgsConstructor
public class EgovSiteBasicSettingManageApiController {
	private final EgovSiteBasicSettingService siteBasicSettingService;

	@GetMapping
	public ApiResponse<SiteBasicSettingVO> getSiteBasicSetting() {
		try {
			return ApiResponse.success("기본설정을 조회했습니다.", siteBasicSettingService.getSiteBasicSetting());
		} catch (Exception e) {
			log.error("기본설정 조회 오류", e);
			return ApiResponse.error("기본설정 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PutMapping
	public ApiResponse<SiteBasicSettingVO> saveSiteBasicSetting(@RequestBody SiteBasicSettingVO setting) {
		try {
			return ApiResponse.success("기본설정이 저장되었습니다.", siteBasicSettingService.saveSiteBasicSetting(setting));
		} catch (Exception e) {
			log.error("기본설정 저장 오류", e);
			return ApiResponse.error("기본설정 저장 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}

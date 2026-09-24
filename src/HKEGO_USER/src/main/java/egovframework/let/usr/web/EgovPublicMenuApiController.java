package egovframework.let.usr.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicMenuService;
import egovframework.let.usr.service.vo.PublicMenuVO;
import lombok.RequiredArgsConstructor;

/** 사용자 사이트 헤더가 메뉴 이름과 노출 여부를 받아 가는 창구다. */
@RestController
@RequestMapping("/api/user/menus")
@RequiredArgsConstructor
public class EgovPublicMenuApiController {
	private final EgovPublicMenuService publicMenuService;

	@GetMapping
	public ApiResponse<List<PublicMenuVO>> getVisibleMenus() {
		return ApiResponse.success("메뉴를 조회했습니다.", publicMenuService.getVisibleMenus());
	}
}

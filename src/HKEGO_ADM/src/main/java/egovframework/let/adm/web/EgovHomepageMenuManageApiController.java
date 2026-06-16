package egovframework.let.adm.web;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovHomepageMenuService;
import egovframework.let.adm.service.vo.HomepageMenuVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin/homepage-menus")
@RequiredArgsConstructor
public class EgovHomepageMenuManageApiController {
	private final EgovHomepageMenuService homepageMenuService;

	@GetMapping
	public ApiResponse<List<HomepageMenuVO>> getMenuList() {
		try {
			return ApiResponse.success("홈페이지 메뉴 목록을 조회했습니다.", homepageMenuService.getMenuList());
		} catch (Exception e) {
			log.error("홈페이지 메뉴 목록 조회 오류", e);
			return ApiResponse.error("홈페이지 메뉴 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PutMapping("/{menuCd}")
	public ApiResponse<HomepageMenuVO> updateMenu(@PathVariable String menuCd, @RequestBody HomepageMenuVO menu) {
		try {
			menu.setMenuCd(menuCd);
			return ApiResponse.success("홈페이지 메뉴가 수정되었습니다.", homepageMenuService.updateMenu(menu));
		} catch (Exception e) {
			log.error("홈페이지 메뉴 수정 오류", e);
			return ApiResponse.error("홈페이지 메뉴 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@PostMapping("/{menuCd}/move")
	public ApiResponse<List<HomepageMenuVO>> moveMenu(@PathVariable String menuCd, @RequestBody Map<String, String> body) {
		try {
			homepageMenuService.moveMenu(menuCd, body.get("direction"), body.get("mdtr"));
			return ApiResponse.success("홈페이지 메뉴 순서가 수정되었습니다.", homepageMenuService.getMenuList());
		} catch (Exception e) {
			log.error("홈페이지 메뉴 순서 수정 오류", e);
			return ApiResponse.error("홈페이지 메뉴 순서 수정 중 오류가 발생했습니다: " + e.getMessage());
		}
	}
}

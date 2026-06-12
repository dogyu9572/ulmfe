package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.AuthGroupDto;
import egovframework.let.adm.service.EgovAuthGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class EgovAuthGroupManageApiController {
	private final EgovAuthGroupService authGroupService;

	@GetMapping("/groups")
	public ApiResponse<Map<String, Object>> getAuthGroupList(
			@RequestParam(value = "useYn", required = false) String useYn,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size) {
		Map<String, Object> result = authGroupService.getAuthGroupListPage(useYn, page, size);
		return ApiResponse.success("권한 그룹 목록을 조회했습니다.", result);
	}

	@GetMapping("/groups/{agId}")
	public ApiResponse<AuthGroupDto> getAuthGroup(@PathVariable String agId) {
		AuthGroupDto result = authGroupService.getAuthGroup(agId);
		if (result == null) {
			return ApiResponse.error("해당하는 권한 그룹을 찾을 수 없습니다.");
		}
		return ApiResponse.success("권한 그룹을 조회했습니다.", result);
	}

	@PostMapping("/groups")
	public ApiResponse<Void> createAuthGroup(@RequestBody AuthGroupDto dto) {
		authGroupService.createAuthGroup(dto);
		return ApiResponse.success("권한 그룹이 등록되었습니다.", null);
	}

	@PutMapping("/groups/{agId}")
	public ApiResponse<Void> updateAuthGroup(@PathVariable String agId, @RequestBody AuthGroupDto dto) {
		dto.setAgId(agId);
		authGroupService.updateAuthGroup(dto);
		return ApiResponse.success("권한 그룹이 수정되었습니다.", null);
	}

	@DeleteMapping("/groups/{agId}")
	public ApiResponse<Void> deleteAuthGroup(@PathVariable String agId) {
		try {
			authGroupService.deleteAuthGroup(agId);
			return ApiResponse.success("권한 그룹이 삭제되었습니다.", null);
		} catch (RuntimeException e) {
			return ApiResponse.error(e.getMessage());
		}
	}

	@GetMapping("/groups/{groupId}/menus")
	public ApiResponse<List<String>> getAuthMenus(@PathVariable String groupId) {
		List<String> menuCodes = authGroupService.getAuthMenuCodes(groupId);
		return ApiResponse.success("권한 그룹별 메뉴 권한을 조회했습니다.", menuCodes);
	}

	@PostMapping("/groups/{groupId}/menus")
	public ApiResponse<Void> setAuthMenus(
			@PathVariable String groupId,
			@RequestBody Map<String, List<String>> body,
			HttpServletRequest request) {
		List<String> menuCodes = body.get("menuCodes");
		String regemp = request.getSession(false) != null
				? (String) request.getSession().getAttribute("adminId")
				: null;
		authGroupService.setAuthMenus(groupId, menuCodes != null ? menuCodes : List.of(), regemp);
		return ApiResponse.success("권한 그룹별 메뉴 권한이 설정되었습니다.", null);
	}
}

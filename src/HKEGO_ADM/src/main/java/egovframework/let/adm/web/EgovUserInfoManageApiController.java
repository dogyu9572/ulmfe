package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.UserInfoVO;
import egovframework.let.adm.service.EgovUserInfoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class EgovUserInfoManageApiController {
	private final EgovUserInfoService userInfoService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getUserList(
		@RequestParam(required = false) String usrGb,
		@RequestParam(required = false) String usrLevel,
		@RequestParam(required = false) String usrSta,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate,
		@RequestParam(required = false) String searchType,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "10") int pageSize
	) {
		Map<String, Object> result = userInfoService.getUserList(
			usrGb, usrLevel, usrSta, startDate, endDate, searchType, searchKeyword, page, pageSize
		);
		return ApiResponse.success("회원 목록을 조회했습니다.", result);
	}

	@GetMapping("/{usrIdx}")
	public ApiResponse<UserInfoVO> getUser(@PathVariable Integer usrIdx) {
		UserInfoVO user = userInfoService.getUser(usrIdx);
		if (user == null) {
			return ApiResponse.error("회원을 찾을 수 없습니다.");
		}
		return ApiResponse.success("회원 정보를 조회했습니다.", user);
	}

	@PostMapping
	public ApiResponse<UserInfoVO> createUser(@RequestBody UserInfoVO userInfo, HttpServletRequest request) {
		if (userInfoService.getUserById(userInfo.getUsrId()) != null) {
			return ApiResponse.error("이미 존재하는 회원 ID입니다.");
		}
		String actorId = resolveActorId(request);
		userInfoService.createUser(userInfo, actorId);
		return ApiResponse.success("회원이 등록되었습니다.", userInfo);
	}

	@PutMapping("/{usrIdx}")
	public ApiResponse<UserInfoVO> updateUser(
		@PathVariable Integer usrIdx,
		@RequestBody UserInfoVO userInfo,
		HttpServletRequest request
	) {
		UserInfoVO existing = userInfoService.getUser(usrIdx);
		if (existing == null) {
			return ApiResponse.error("회원을 찾을 수 없습니다.");
		}
		userInfo.setUsrIdx(usrIdx);
		userInfoService.updateUser(userInfo, resolveActorId(request));
		return ApiResponse.success("회원 정보가 수정되었습니다.", userInfo);
	}

	@PatchMapping("/{usrIdx}/status")
	public ApiResponse<Void> updateUserStatus(
		@PathVariable Integer usrIdx,
		@RequestBody Map<String, String> request,
		HttpServletRequest servletRequest
	) {
		UserInfoVO existing = userInfoService.getUser(usrIdx);
		if (existing == null) {
			return ApiResponse.error("회원을 찾을 수 없습니다.");
		}
		userInfoService.updateUserStatus(usrIdx, request.get("usrSta"), resolveActorId(servletRequest));
		return ApiResponse.success("회원 상태가 변경되었습니다.", null);
	}

	@PatchMapping("/{usrIdx}/password")
	public ApiResponse<Void> updatePassword(
		@PathVariable Integer usrIdx,
		@RequestBody Map<String, String> request,
		HttpServletRequest servletRequest
	) {
		UserInfoVO existing = userInfoService.getUser(usrIdx);
		if (existing == null) {
			return ApiResponse.error("회원을 찾을 수 없습니다.");
		}
		userInfoService.updateUserPassword(usrIdx, request.get("newPassword"), resolveActorId(servletRequest));
		return ApiResponse.success("비밀번호가 변경되었습니다.", null);
	}

	@PostMapping("/{usrIdx}/withdraw")
	public ApiResponse<Void> withdrawUser(@PathVariable Integer usrIdx, HttpServletRequest request) {
		UserInfoVO existing = userInfoService.getUser(usrIdx);
		if (existing == null) {
			return ApiResponse.error("회원을 찾을 수 없습니다.");
		}
		userInfoService.withdrawUser(usrIdx, resolveActorId(request));
		return ApiResponse.success("회원 탈퇴가 완료되었습니다.", null);
	}

	private String resolveActorId(HttpServletRequest request) {
		try {
			HttpSession session = request.getSession(false);
			if (session == null) {
				return "system";
			}
			String adminId = (String) session.getAttribute("adminId");
			if (adminId != null && !adminId.isBlank()) {
				return adminId;
			}
		} catch (Exception e) {
			log.warn("세션 사용자 식별 실패: {}", e.getMessage());
		}
		return "system";
	}
}

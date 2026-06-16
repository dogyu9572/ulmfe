package egovframework.let.uat.uia.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.vo.LoginRequest;
import egovframework.let.adm.service.vo.LoginResponse;
import egovframework.let.adm.service.vo.SessionInfo;
import egovframework.let.adm.service.vo.AdminAccessLogVO;
import egovframework.let.adm.service.vo.AdminInfoVO;
import egovframework.let.adm.service.EgovAuthGroupService;
import egovframework.let.adm.service.EgovAccessEnvironmentService;
import egovframework.let.adm.service.EgovAdminService;
import egovframework.let.adm.service.EgovAdminRolePolicyService;
import egovframework.com.security.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class EgovAdminLoginApiController {
	private final EgovAdminService adminService;
	private final EgovAdminRolePolicyService adminRolePolicyService;
	private final EgovAuthGroupService authGroupService;
	private final EgovAccessEnvironmentService accessEnvironmentService;
	private final LoginAttemptService loginAttemptService;

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest,
		HttpServletRequest request) {
		String clientIp = getClientIp(request);
		String userAgent = request.getHeader("User-Agent");
		String referer = request.getHeader("Referer");
		String userId = loginRequest.getUserId() != null ? loginRequest.getUserId().trim() : "";

		if (loginAttemptService.isBlocked(clientIp, userId)) {
			long remain = loginAttemptService.remainingLockSeconds(clientIp, userId);
			return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
				.body(ApiResponse.error("로그인 시도 횟수를 초과했습니다. " + remain + "초 후 다시 시도해주세요."));
		}

		AdminInfoVO admin = adminService.findById(loginRequest.getUserId());

		if (admin == null || admin.getEnpswd() == null
			|| !adminService.matchesPassword(loginRequest.getPassword(), admin.getEnpswd())) {
			loginAttemptService.loginFailed(clientIp, userId);
			recordAccessLog(admin, loginRequest.getUserId(), clientIp, userAgent, referer, request, 400, "LOGIN_FAIL");
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error("아이디 또는 비밀번호가 올바르지 않습니다."));
		}

		if (admin.getAcntSttsCd() != null && !"ACTIVE".equalsIgnoreCase(admin.getAcntSttsCd())) {
			recordAccessLog(admin, admin.getId(), clientIp, userAgent, referer, request, 400, "LOGIN_DENY");
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.error("비활성 관리자 계정입니다."));
		}

		loginAttemptService.loginSucceeded(clientIp, userId);

		HttpSession session = request.getSession(true);
		request.changeSessionId();
		session.setMaxInactiveInterval(accessEnvironmentService.getSessionTimeoutMinutes() * 60);
		session.setAttribute("adminId", admin.getId());
		session.setAttribute("adminName", admin.getUserNm());
		session.setAttribute("adminRole", admin.getAuthrtCd());

		adminService.updateLastLogin(admin.getId());

		recordAccessLog(admin, admin.getId(), clientIp, userAgent, referer, request, 200, "LOGIN");

		LoginResponse response = LoginResponse.builder()
			.token("")
			.adminId(admin.getId())
			.adminName(admin.getUserNm())
			.role(admin.getAuthrtCd())
			.build();

		return ResponseEntity.ok(ApiResponse.success("로그인에 성공했습니다.", response));
	}

	/**
	 * 현재 세션 유효 여부 및 남은 시간(초) 조회.
	 * 마지막 접근 시각 기준으로 maxInactiveInterval 만큼 유효.
	 */
	@GetMapping("/session")
	public ResponseEntity<ApiResponse<SessionInfo>> session(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session == null) {
			return ResponseEntity.ok(ApiResponse.success("세션 없음",
				SessionInfo.builder()
					.valid(false)
					.adminId("")
					.adminName("")
					.adminRole("")
					.adminRoleName("")
					.canManageAdmin(false)
					.superAdmin(false)
					.allowedMenuPaths(java.util.List.of())
					.remainingSeconds(0)
					.build()));
		}
		String adminId = (String) session.getAttribute("adminId");
		String adminName = (String) session.getAttribute("adminName");
		String adminRole = (String) session.getAttribute("adminRole");
		session.setMaxInactiveInterval(accessEnvironmentService.getSessionTimeoutMinutes() * 60);
		int maxInactiveSeconds = session.getMaxInactiveInterval();
		long lastAccessedMs = session.getLastAccessedTime();
		long remainingMs = maxInactiveSeconds * 1000L - (System.currentTimeMillis() - lastAccessedMs);
		int remainingSeconds = (int) Math.max(0, remainingMs / 1000);
		SessionInfo info = SessionInfo.builder()
			.valid(remainingSeconds > 0)
			.adminId(adminId != null ? adminId : "")
			.adminName(adminName != null ? adminName : "")
			.adminRole(adminRole != null ? adminRole : "")
			.adminRoleName(adminRolePolicyService.resolveRoleName(adminRole))
			.canManageAdmin(adminRolePolicyService.canManageAdmin(adminRole))
			.superAdmin(adminRolePolicyService.isSuperRole(adminRole))
			.allowedMenuPaths(adminRole != null ? authGroupService.getAuthorizedMenuPaths(adminRole) : java.util.List.of())
			.remainingSeconds(remainingSeconds)
			.build();
		return ResponseEntity.ok(ApiResponse.success("세션 조회 성공", info));
	}

	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			String adminId = (String) session.getAttribute("adminId");
			AdminInfoVO admin = adminId != null ? adminService.findById(adminId) : null;
			String clientIp = getClientIp(request);
			String userAgent = request.getHeader("User-Agent");
			String referer = request.getHeader("Referer");
			recordAccessLog(
				admin,
				adminId != null ? adminId : "",
				clientIp,
				userAgent,
				referer,
				request,
				200,
				"LOGOUT"
			);
			session.invalidate();
		}
		SecurityContextHolder.clearContext();
		return ResponseEntity.ok(ApiResponse.success("로그아웃했습니다.", null));
	}

	private void recordAccessLog(AdminInfoVO admin, String userId, String clientIp, String userAgent, String referer,
		HttpServletRequest request, int status, String accessType) {
		AdminAccessLogVO log = new AdminAccessLogVO();
		log.setUsrIdx(null);
		log.setUsrId(userId);
		log.setUserNm(admin != null ? admin.getUserNm() : null);
		log.setClientIp(clientIp);
		log.setUserAgent(userAgent);
		log.setReferer(referer);
		log.setSessionId(request.getSession(false) != null ? request.getSession(false).getId() : null);
		log.setRequestUri(request.getRequestURI());
		log.setRequestMethod(request.getMethod());
		log.setResponseStatus(status);
		log.setAccessType(accessType);
		adminService.recordAccessLog(log);
	}

	private String getClientIp(HttpServletRequest request) {
		String ip = request.getHeader("X-Forwarded-For");
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("Proxy-Client-IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("WL-Proxy-Client-IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("HTTP_CLIENT_IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("HTTP_X_FORWARDED_FOR");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr();
		}
		if (ip != null && ip.contains(",")) {
			ip = ip.split(",")[0].trim();
		}
		return ip;
	}
}


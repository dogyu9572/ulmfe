package egovframework.tablet.web;

import egovframework.tablet.common.ApiResponse;
import egovframework.tablet.service.TabletService;
import egovframework.tablet.service.vo.TabletAttendanceRequest;
import egovframework.tablet.service.vo.TabletLoginRequest;
import egovframework.tablet.service.vo.TabletLoginResponse;
import egovframework.tablet.service.vo.TabletSessionResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tablet")
public class TabletApiController {
	private final TabletService tabletService;

	public TabletApiController(TabletService tabletService) {
		this.tabletService = tabletService;
	}

	@PostMapping("/auth/login")
	public ResponseEntity<ApiResponse<TabletLoginResponse>> login(@Valid @RequestBody TabletLoginRequest loginRequest, HttpServletRequest request) {
		try {
			return ResponseEntity.ok(ApiResponse.success("로그인에 성공했습니다.", tabletService.login(loginRequest, request)));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@GetMapping("/auth/session")
	public ApiResponse<TabletLoginResponse> session(HttpServletRequest request) {
		return ApiResponse.success("세션 조회 성공", tabletService.getLoginSession(request.getSession(false)));
	}

	@PostMapping("/auth/logout")
	public ApiResponse<Void> logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		SecurityContextHolder.clearContext();
		return ApiResponse.success("로그아웃했습니다.", null);
	}

	@GetMapping("/session")
	public ApiResponse<TabletSessionResponse> getTodaySession(@RequestParam(required = false) String rsvtYmd) {
		return ApiResponse.success("태블릿 세션 조회 성공", tabletService.getTodaySession(rsvtYmd));
	}

	@PostMapping("/reservations/{rsvtSn}/attendance")
	public ResponseEntity<ApiResponse<Void>> markAttendance(@PathVariable Integer rsvtSn, @RequestBody TabletAttendanceRequest request) {
		try {
			tabletService.markAttendance(rsvtSn, request.getStudentSns());
			return ResponseEntity.ok(ApiResponse.success("출석 처리 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> handleValidationError(MethodArgumentNotValidException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("아이디와 비밀번호를 입력해주세요."));
	}
}

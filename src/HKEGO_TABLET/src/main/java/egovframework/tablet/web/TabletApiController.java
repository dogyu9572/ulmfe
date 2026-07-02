package egovframework.tablet.web;

import egovframework.tablet.common.ApiResponse;
import egovframework.tablet.service.TabletService;
import egovframework.tablet.service.vo.TabletAttendanceRequest;
import egovframework.tablet.service.vo.TabletLearningResourceVO;
import egovframework.tablet.service.vo.TabletLoginRequest;
import egovframework.tablet.service.vo.TabletLoginResponse;
import egovframework.tablet.service.vo.TabletMissionFinalSubmitRequest;
import egovframework.tablet.service.vo.TabletMissionSubmitRequest;
import egovframework.tablet.service.vo.TabletSessionResponse;
import egovframework.tablet.service.vo.TabletTeacherCallRequest;
import egovframework.tablet.service.vo.TabletTeacherCallVO;
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

import java.util.List;

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

	@GetMapping("/learning-resources")
	public ApiResponse<List<TabletLearningResourceVO>> getLearningResources(
		@RequestParam String prgrmTypeCd,
		@RequestParam Integer prgrmSn
	) {
		return ApiResponse.success("학습지원 자료실 조회 성공", tabletService.getLearningResources(prgrmTypeCd, prgrmSn));
	}

	@GetMapping("/reservations/{rsvtSn}/teacher-calls")
	public ApiResponse<List<TabletTeacherCallVO>> getTeacherCalls(@PathVariable Integer rsvtSn) {
		return ApiResponse.success("선생님 호출 내역 조회 성공", tabletService.getTeacherCalls(rsvtSn));
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

	@PostMapping("/reservations/{rsvtSn}/mission")
	public ResponseEntity<ApiResponse<Void>> submitMission(@PathVariable Integer rsvtSn, @RequestBody TabletMissionSubmitRequest request) {
		try {
			tabletService.submitMission(rsvtSn, request);
			return ResponseEntity.ok(ApiResponse.success("미션 응답 저장 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@PostMapping("/reservations/{rsvtSn}/mission-final")
	public ResponseEntity<ApiResponse<Void>> submitMissionFinal(@PathVariable Integer rsvtSn, @RequestBody TabletMissionFinalSubmitRequest request) {
		try {
			tabletService.submitMissionFinal(rsvtSn, request);
			return ResponseEntity.ok(ApiResponse.success("최종 미션 응답 저장 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@PostMapping("/reservations/{rsvtSn}/teacher-calls")
	public ResponseEntity<ApiResponse<Void>> createTeacherCall(@PathVariable Integer rsvtSn, @RequestBody TabletTeacherCallRequest request) {
		try {
			tabletService.createTeacherCall(rsvtSn, request);
			return ResponseEntity.ok(ApiResponse.success("선생님 호출 요청 저장 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@PostMapping("/teacher-calls/{callSn}/read")
	public ResponseEntity<ApiResponse<Void>> markTeacherCallRead(@PathVariable Long callSn) {
		try {
			tabletService.markTeacherCallRead(callSn);
			return ResponseEntity.ok(ApiResponse.success("선생님 호출 읽음 처리 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@PostMapping("/reservations/{rsvtSn}/teacher-calls/read-all")
	public ResponseEntity<ApiResponse<Void>> markAllTeacherCallsRead(@PathVariable Integer rsvtSn) {
		try {
			tabletService.markAllTeacherCallsRead(rsvtSn);
			return ResponseEntity.ok(ApiResponse.success("선생님 호출 전체 읽음 처리 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> handleValidationError(MethodArgumentNotValidException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("아이디와 비밀번호를 입력해주세요."));
	}
}

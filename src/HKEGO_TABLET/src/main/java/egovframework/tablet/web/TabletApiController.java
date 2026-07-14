package egovframework.tablet.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.tablet.common.ApiResponse;
import egovframework.tablet.service.TabletService;
import egovframework.tablet.service.TabletPushService;
import egovframework.tablet.service.vo.TabletAttendanceRequest;
import egovframework.tablet.service.vo.TabletLearningResourceVO;
import egovframework.tablet.service.vo.TabletLoginRequest;
import egovframework.tablet.service.vo.TabletLoginResponse;
import egovframework.tablet.service.vo.TabletMakerAnswerRequest;
import egovframework.tablet.service.vo.TabletMissionFinalSubmitRequest;
import egovframework.tablet.service.vo.TabletMissionSubmitRequest;
import egovframework.tablet.service.vo.TabletSessionResponse;
import egovframework.tablet.service.vo.TabletTeacherCallRequest;
import egovframework.tablet.service.vo.TabletTeacherCallVO;
import egovframework.tablet.service.vo.TabletTeacherMessageReadRequest;
import egovframework.tablet.service.vo.TabletTeacherMessageRequest;
import egovframework.tablet.service.vo.TabletTeacherMessageVO;
import egovframework.tablet.service.vo.TabletPushDeviceRequest;
import egovframework.tablet.service.vo.TabletPushDeviceResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.net.URI;

@RestController
@RequestMapping("/api/tablet")
public class TabletApiController {
	private final TabletService tabletService;
	private final TabletPushService tabletPushService;
	private final ObjectMapper objectMapper;

	public TabletApiController(TabletService tabletService, TabletPushService tabletPushService, ObjectMapper objectMapper) {
		this.tabletService = tabletService;
		this.tabletPushService = tabletPushService;
		this.objectMapper = objectMapper;
	}

	@PutMapping("/push/devices/{deviceId}")
	public ResponseEntity<ApiResponse<TabletPushDeviceResponse>> registerPushDevice(
		@PathVariable String deviceId,
		@RequestBody TabletPushDeviceRequest request
	) {
		try {
			return ResponseEntity.ok(ApiResponse.success(
				"푸시 알림 기기 정보가 저장되었습니다.",
				tabletPushService.registerDevice(deviceId, request)
			));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
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

	@GetMapping("/learning-resources/{pstSn}/open")
	public ResponseEntity<Void> openLearningResource(
		@PathVariable String pstSn,
		@RequestParam(required = false) Integer fileSeq
	) {
		try {
			return ResponseEntity.status(HttpStatus.FOUND)
				.location(URI.create(tabletService.recordLearningResourceDownload(pstSn, fileSeq)))
				.build();
		} catch (IllegalArgumentException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping("/reservations/{rsvtSn}/teacher-calls")
	public ApiResponse<List<TabletTeacherCallVO>> getTeacherCalls(@PathVariable Integer rsvtSn) {
		return ApiResponse.success("선생님 호출 내역 조회 성공", tabletService.getTeacherCalls(rsvtSn));
	}

	@GetMapping("/reservations/{rsvtSn}/teacher-messages")
	public ApiResponse<List<TabletTeacherMessageVO>> getTeacherMessages(@PathVariable Integer rsvtSn) {
		return ApiResponse.success("선생님 메시지 발송 내역 조회 성공", tabletService.getTeacherMessages(rsvtSn));
	}

	@GetMapping("/reservations/{rsvtSn}/teacher-messages/unread")
	public ApiResponse<List<TabletTeacherMessageVO>> getUnreadTeacherMessages(
		@PathVariable Integer rsvtSn,
		@RequestParam List<Integer> studentSns
	) {
		return ApiResponse.success("선생님 메시지 수신 내역 조회 성공", tabletService.getUnreadTeacherMessages(rsvtSn, studentSns));
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

	@PostMapping(value = "/reservations/{rsvtSn}/mission-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ApiResponse<Void>> submitMissionFiles(
		@PathVariable Integer rsvtSn,
		@RequestParam String payload,
		MultipartHttpServletRequest request
	) {
		try {
			TabletMissionSubmitRequest parsedPayload = objectMapper.readValue(payload, TabletMissionSubmitRequest.class);
			Map<String, MultipartFile> filesByFieldName = new HashMap<>();
			Iterator<String> fileNames = request.getFileNames();
			while (fileNames.hasNext()) {
				String fieldName = fileNames.next();
				MultipartFile file = request.getFile(fieldName);
				if (file != null && !file.isEmpty()) filesByFieldName.put(fieldName, file);
			}
			tabletService.submitMissionFiles(rsvtSn, parsedPayload, filesByFieldName);
			return ResponseEntity.ok(ApiResponse.success("미션 응답 저장 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("미션 응답 저장 요청이 올바르지 않습니다."));
		}
	}

	@PostMapping(value = "/reservations/{rsvtSn}/maker", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ApiResponse<Void>> submitMaker(
		@PathVariable Integer rsvtSn,
		@RequestParam String answers,
		MultipartHttpServletRequest request
	) {
		try {
			List<TabletMakerAnswerRequest> parsedAnswers = objectMapper.readValue(answers, new TypeReference<>() {});
			Map<Integer, MultipartFile> filesByStudentSn = new HashMap<>();
			Iterator<String> fileNames = request.getFileNames();
			while (fileNames.hasNext()) {
				String fieldName = fileNames.next();
				if (!fieldName.startsWith("file_")) continue;
				try {
					Integer studentSn = Integer.parseInt(fieldName.substring("file_".length()));
					MultipartFile file = request.getFile(fieldName);
					if (file != null && !file.isEmpty()) filesByStudentSn.put(studentSn, file);
				} catch (NumberFormatException ignored) {
					// 파일 필드명 규칙에 맞지 않으면 무시합니다.
				}
			}
			tabletService.submitMaker(rsvtSn, parsedAnswers, filesByStudentSn);
			return ResponseEntity.ok(ApiResponse.success("메이커 활동지 저장 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("메이커 활동지 저장 요청이 올바르지 않습니다."));
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

	@PostMapping("/reservations/{rsvtSn}/teacher-messages")
	public ResponseEntity<ApiResponse<Void>> createTeacherMessage(@PathVariable Integer rsvtSn, @RequestBody TabletTeacherMessageRequest request) {
		try {
			tabletService.createTeacherMessage(rsvtSn, request);
			return ResponseEntity.ok(ApiResponse.success("메시지를 발송했습니다.", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@PostMapping("/teacher-messages/{msgSn}/read")
	public ResponseEntity<ApiResponse<Void>> markTeacherMessageRead(@PathVariable Long msgSn, @RequestBody TabletTeacherMessageReadRequest request) {
		try {
			tabletService.markTeacherMessageRead(msgSn, request.getStudentSns());
			return ResponseEntity.ok(ApiResponse.success("메시지 확인 처리 성공", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> handleValidationError(MethodArgumentNotValidException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("아이디와 비밀번호를 입력해주세요."));
	}
}

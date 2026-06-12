package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovUserAccessLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/user-access-log")
@RequiredArgsConstructor
public class EgovUserAccessLogManageApiController {
	private final EgovUserAccessLogService userAccessLogService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getUserAccessLogs(
		@RequestParam(required = false) String userId,
		@RequestParam(required = false) String userNm,
		@RequestParam(required = false) String ipAddr,
		@RequestParam(required = false) String cntnTypeCd,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"사용자접속로그 조회 성공",
			userAccessLogService.getUserAccessLogs(userId, userNm, ipAddr, cntnTypeCd, startDate, endDate, page, size)
		);
	}
}

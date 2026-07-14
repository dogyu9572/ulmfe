package egovframework.let.usr.web;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/user")
public class EgovUserAccessLogApiController {

	private final JdbcTemplate jdbcTemplate;

	public EgovUserAccessLogApiController(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostMapping("/main")
	public ApiResponse<Void> record(@RequestBody(required = false) AccessLogRequest body, HttpServletRequest request) {
		String requestUri = limit(body != null ? body.requestUri() : null, 500, "/");
		String accessType = "MAIN".equals(body != null ? body.accessType() : null) ? "MAIN" : "PAGE";
		String sessionId = request.getSession(true).getId();

		jdbcTemplate.update(
			"INSERT INTO USER_ACCESS_LOG ("
				+ "USER_SN, USER_ID, USER_NM, IP_ADDR, USER_AGT_NM, RFRER_ADDR, SSN_ID, "
				+ "DMND_URI_ADDR, DMND_MTHD_CD, RSPNS_STTS_CD, CNTN_TYPE_CD, REG_DT"
				+ ") VALUES (0, '', '', ?, ?, ?, ?, ?, 'GET', 200, ?, NOW())",
			clientIp(request),
			limit(request.getHeader("User-Agent"), 500, null),
			limit(request.getHeader("Referer"), 500, null),
			limit(sessionId, 100, null),
			requestUri,
			accessType
		);
		return ApiResponse.success("접속 기록 저장 성공", null);
	}

	private String clientIp(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			return limit(forwarded.split(",")[0].trim(), 50, null);
		}
		String realIp = request.getHeader("X-Real-IP");
		if (realIp != null && !realIp.isBlank()) {
			return limit(realIp.trim(), 50, null);
		}
		return limit(request.getRemoteAddr(), 50, null);
	}

	private String limit(String value, int maxLength, String defaultValue) {
		if (value == null || value.isBlank()) return defaultValue;
		String normalized = value.trim();
		return normalized.length() <= maxLength ? normalized : normalized.substring(0, maxLength);
	}

	public record AccessLogRequest(String requestUri, String accessType) {}
}

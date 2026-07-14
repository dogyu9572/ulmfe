package egovframework.com.security;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import egovframework.let.adm.service.EgovAdminService;
import egovframework.let.adm.service.vo.AdminAccessLogVO;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
/** 관리자 변경·다운로드 동작을 기존 접속로그 테이블에 기록한다. */
public class AdminActionLoggingFilter extends OncePerRequestFilter {
	private final EgovAdminService adminService;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String uri = request.getRequestURI();
		if (!uri.startsWith("/api/admin/")) return true;
		if (uri.startsWith("/api/admin/access-log") || uri.startsWith("/api/admin/upload")) return true;
		if (uri.equals("/api/admin/auth/login")
			|| uri.equals("/api/admin/auth/logout")
			|| uri.equals("/api/admin/auth/session")) return true;
		String method = request.getMethod();
		return "GET".equals(method) && !isDownloadOrPrint(uri);
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		HttpSession session = request.getSession(false);
		String adminId = session == null ? "" : stringValue(session.getAttribute("adminId"));
		String adminName = session == null ? "" : stringValue(session.getAttribute("adminName"));
		String sessionId = session == null ? null : session.getId();

		try {
			filterChain.doFilter(request, response);
		} finally {
			if (!adminId.isBlank()) {
				try {
					AdminAccessLogVO log = new AdminAccessLogVO();
					log.setUserId(adminId);
					log.setUserNm(adminName);
					log.setIpAddr(clientIp(request));
					log.setUserAgtNm(request.getHeader("User-Agent"));
					log.setRfrerAddr(request.getHeader("Referer"));
					log.setSsnId(sessionId);
					log.setDmndUriAddr(request.getRequestURI());
					log.setDmndMthdCd(request.getMethod());
					log.setRspnsSttsCd(response.getStatus());
					log.setCntnTypeCd(actionCode(request.getMethod(), request.getRequestURI()));
					adminService.recordAccessLog(log);
				} catch (Exception e) {
					log.warn("관리자 행동 로그 저장 실패: {} {}", request.getMethod(), request.getRequestURI(), e);
				}
			}
		}
	}

	private String actionCode(String method, String uri) {
		String lowerUri = uri.toLowerCase();
		if (isDownloadOrPrint(uri)) return lowerUri.contains("print") ? "PRINT" : "DOWNLOAD";
		if ("DELETE".equals(method) || lowerUri.contains("/delete") || lowerUri.endsWith("/withdraw")) return "DELETE";
		if ("PUT".equals(method) || "PATCH".equals(method)) return "UPDATE";
		if (lowerUri.endsWith("/move") || lowerUri.matches(".*/groups/[^/]+/menus$")) return "UPDATE";
		return "CREATE";
	}

	private boolean isDownloadOrPrint(String uri) {
		String value = uri.toLowerCase();
		return value.contains("/excel") || value.contains("/download") || value.contains("/export") || value.contains("/print");
	}

	private String clientIp(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",")[0].trim();
		String realIp = request.getHeader("X-Real-IP");
		return realIp == null || realIp.isBlank() ? request.getRemoteAddr() : realIp.trim();
	}

	private String stringValue(Object value) {
		return value == null ? "" : String.valueOf(value);
	}
}

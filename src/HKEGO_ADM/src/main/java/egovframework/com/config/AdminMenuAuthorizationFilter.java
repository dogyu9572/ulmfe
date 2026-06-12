package egovframework.com.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.cmm.ApiResponse;
import egovframework.com.security.AdminMenuAuthorizationService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class AdminMenuAuthorizationFilter extends OncePerRequestFilter {
	private final AdminMenuAuthorizationService adminMenuAuthorizationService;
	private final ObjectMapper objectMapper;

	public AdminMenuAuthorizationFilter(
		AdminMenuAuthorizationService adminMenuAuthorizationService,
		ObjectMapper objectMapper) {
		this.adminMenuAuthorizationService = adminMenuAuthorizationService;
		this.objectMapper = objectMapper;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String uri = request.getRequestURI();
		return uri == null || !uri.startsWith("/api/admin/");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		HttpSession session = request.getSession(false);
		if (session == null || session.getAttribute("adminId") == null) {
			filterChain.doFilter(request, response);
			return;
		}

		String adminRole = (String) session.getAttribute("adminRole");
		String uri = request.getRequestURI();

		if (!adminMenuAuthorizationService.isAuthorized(adminRole, uri)) {
			ApiResponse<Void> body = ApiResponse.error("메뉴 접근 권한이 없습니다.");
			response.setStatus(HttpStatus.FORBIDDEN.value());
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(objectMapper.writeValueAsString(body));
			return;
		}

		filterChain.doFilter(request, response);
	}
}

package egovframework.com.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import egovframework.let.adm.service.EgovAdminRolePolicyService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {
	private final EgovAdminRolePolicyService adminRolePolicyService;
	private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

	public SessionAuthenticationFilter(EgovAdminRolePolicyService adminRolePolicyService) {
		this.adminRolePolicyService = adminRolePolicyService;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		HttpSession session = request.getSession(false);
		if (session != null && SecurityContextHolder.getContext().getAuthentication() == null) {
			String adminId = (String) session.getAttribute("adminId");
			String adminRole = (String) session.getAttribute("adminRole");
			if (adminId != null && !adminId.isBlank()) {
				String role = adminRolePolicyService.normalizeAuthority(adminRole);
				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
					adminId,
					null,
					List.of(new SimpleGrantedAuthority(role)));
				authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				SecurityContext context = SecurityContextHolder.createEmptyContext();
				context.setAuthentication(authentication);
				SecurityContextHolder.setContext(context);
				// 세션에 저장하지 않으면 뒤의 SessionManagementFilter가 매 요청을 "새 인증"으로 보고
				// sessionFixation(migrateSession)을 실행해 요청마다 세션ID가 바뀐다.
				// 브라우저는 새 쿠키를 따라가지만 쿠키를 고정해 보내는 클라이언트는 2번째 요청부터 401이 된다.
				securityContextRepository.saveContext(context, request, response);
			}
		}
		filterChain.doFilter(request, response);
	}
}

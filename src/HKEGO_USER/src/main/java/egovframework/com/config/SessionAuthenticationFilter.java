package egovframework.com.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {
	private static final String DEFAULT_USER_ROLE = "USER";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		HttpSession session = request.getSession(false);
		if (session != null && SecurityContextHolder.getContext().getAuthentication() == null) {
			String userId = (String) session.getAttribute("userId");
			String userRole = (String) session.getAttribute("userRole");
			if (userId != null && !userId.isBlank()) {
				String role = (userRole == null || userRole.isBlank()) ? DEFAULT_USER_ROLE : userRole.trim().toUpperCase();
				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
					userId,
					null,
					List.of(new SimpleGrantedAuthority(role)));
				authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		}
		filterChain.doFilter(request, response);
	}
}

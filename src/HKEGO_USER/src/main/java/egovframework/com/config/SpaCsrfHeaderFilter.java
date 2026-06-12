package egovframework.com.config;

import java.io.IOException;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 프론트(3013)와 API(9013) 분리 환경에서 CSRF 토큰을 응답 헤더로 노출한다.
 */
@Component
public class SpaCsrfHeaderFilter extends OncePerRequestFilter {
	private final CsrfTokenRepository csrfTokenRepository;

	public SpaCsrfHeaderFilter(CsrfTokenRepository csrfTokenRepository) {
		this.csrfTokenRepository = csrfTokenRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		CsrfToken csrfToken = csrfTokenRepository.loadToken(request);
		if (csrfToken == null) {
			csrfToken = csrfTokenRepository.generateToken(request);
			csrfTokenRepository.saveToken(csrfToken, request, response);
		}
		response.setHeader(csrfToken.getHeaderName(), csrfToken.getToken());
		filterChain.doFilter(request, response);
	}
}

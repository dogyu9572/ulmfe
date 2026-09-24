package egovframework.com.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.util.StringUtils;

@Configuration
public class CsrfConfig {
	@Value("${app.security.csrf-cookie-same-site:Lax}")
	private String csrfCookieSameSite;

	@Value("${app.security.csrf-cookie-secure:false}")
	private boolean csrfCookieSecure;

	@Value("${server.servlet.context-path:}")
	private String contextPath;

	@Bean
	public CsrfTokenRepository csrfTokenRepository() {
		CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
		// 동일 호스트 path 배포(/usfec-adm·/usfec-tab·/usfec)에서 쿠키 충돌 방지
		repository.setCookiePath(StringUtils.hasText(contextPath) ? contextPath : "/");
		repository.setCookieName("XSRF-TOKEN");
		repository.setHeaderName("X-XSRF-TOKEN");
		repository.setCookieCustomizer(cookie -> {
			cookie.sameSite(csrfCookieSameSite);
			cookie.secure(csrfCookieSecure);
		});
		return repository;
	}
}

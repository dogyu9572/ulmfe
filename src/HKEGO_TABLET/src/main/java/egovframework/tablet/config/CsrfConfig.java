package egovframework.tablet.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;

@Configuration
public class CsrfConfig {
	@Value("${app.security.csrf-cookie-same-site:Lax}")
	private String csrfCookieSameSite;

	@Value("${app.security.csrf-cookie-secure:false}")
	private boolean csrfCookieSecure;

	@Bean
	public CsrfTokenRepository csrfTokenRepository() {
		CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
		repository.setCookiePath("/");
		repository.setCookieName("XSRF-TOKEN");
		repository.setHeaderName("X-XSRF-TOKEN");
		repository.setCookieCustomizer(cookie -> {
			cookie.sameSite(csrfCookieSameSite);
			cookie.secure(csrfCookieSecure);
		});
		return repository;
	}
}

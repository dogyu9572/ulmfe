package egovframework.com.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
public class SecurityConfig {
	private final SessionAuthenticationEntryPoint sessionAuthenticationEntryPoint;
	private final SessionAuthenticationFilter sessionAuthenticationFilter;
	private final SessionAccessDeniedHandler sessionAccessDeniedHandler;
	private final SpaCsrfHeaderFilter spaCsrfHeaderFilter;

	public SecurityConfig(
		SessionAuthenticationEntryPoint sessionAuthenticationEntryPoint,
		SessionAuthenticationFilter sessionAuthenticationFilter,
		SessionAccessDeniedHandler sessionAccessDeniedHandler,
		SpaCsrfHeaderFilter spaCsrfHeaderFilter) {
		this.sessionAuthenticationEntryPoint = sessionAuthenticationEntryPoint;
		this.sessionAuthenticationFilter = sessionAuthenticationFilter;
		this.sessionAccessDeniedHandler = sessionAccessDeniedHandler;
		this.spaCsrfHeaderFilter = spaCsrfHeaderFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, CsrfTokenRepository csrfTokenRepository) throws Exception {
		CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
		requestHandler.setCsrfRequestAttributeName(null);

		http
			.csrf(csrf -> csrf
				.csrfTokenRepository(csrfTokenRepository)
				.csrfTokenRequestHandler(requestHandler))
			.headers(headers -> headers
				.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
				.contentTypeOptions(withDefaults -> {}))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/api/user/main", "/api/user/auth/**").permitAll()
				.requestMatchers("/uploads/**").permitAll()
				.requestMatchers("/api/user/**").authenticated()
				.anyRequest().permitAll()
			)
			.httpBasic(httpBasic -> httpBasic.disable())
			.formLogin(form -> form.disable())
			.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
				.sessionFixation(fixation -> fixation.migrateSession())
				.maximumSessions(1)
				.maxSessionsPreventsLogin(false))
			.exceptionHandling(exception -> exception
				.authenticationEntryPoint(sessionAuthenticationEntryPoint)
				.accessDeniedHandler(sessionAccessDeniedHandler))
			.addFilterBefore(spaCsrfHeaderFilter, CsrfFilter.class)
			.addFilterBefore(sessionAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}

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

import egovframework.com.security.AdminActionLoggingFilter;
import egovframework.let.adm.service.EgovAdminRolePolicyService;

@Configuration(proxyBeanMethods = false)
public class SecurityConfig {
	private final SessionAuthenticationEntryPoint sessionAuthenticationEntryPoint;
	private final SessionAuthenticationFilter sessionAuthenticationFilter;
	private final SessionAccessDeniedHandler sessionAccessDeniedHandler;
	private final EgovAdminRolePolicyService adminRolePolicyService;
	private final SpaCsrfHeaderFilter spaCsrfHeaderFilter;
	private final AdminMenuAuthorizationFilter adminMenuAuthorizationFilter;
	private final AdminActionLoggingFilter adminActionLoggingFilter;

	public SecurityConfig(
		SessionAuthenticationEntryPoint sessionAuthenticationEntryPoint,
		SessionAuthenticationFilter sessionAuthenticationFilter,
		SessionAccessDeniedHandler sessionAccessDeniedHandler,
		EgovAdminRolePolicyService adminRolePolicyService,
		SpaCsrfHeaderFilter spaCsrfHeaderFilter,
		AdminMenuAuthorizationFilter adminMenuAuthorizationFilter,
		AdminActionLoggingFilter adminActionLoggingFilter) {
		this.sessionAuthenticationEntryPoint = sessionAuthenticationEntryPoint;
		this.sessionAuthenticationFilter = sessionAuthenticationFilter;
		this.sessionAccessDeniedHandler = sessionAccessDeniedHandler;
		this.adminRolePolicyService = adminRolePolicyService;
		this.spaCsrfHeaderFilter = spaCsrfHeaderFilter;
		this.adminMenuAuthorizationFilter = adminMenuAuthorizationFilter;
		this.adminActionLoggingFilter = adminActionLoggingFilter;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http, CsrfTokenRepository csrfTokenRepository) throws Exception {
		CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
		requestHandler.setCsrfRequestAttributeName(null);

		http
			.csrf(csrf -> csrf
				.csrfTokenRepository(csrfTokenRepository)
				.csrfTokenRequestHandler(requestHandler)
				.ignoringRequestMatchers("/api/admin/auth/login"))
			.headers(headers -> headers
				.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
				.contentTypeOptions(withDefaults -> {}))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/api/admin/auth/login", "/api/admin/auth/session").permitAll()
				.requestMatchers("/uploads/**").authenticated()
				.requestMatchers("/api/admin/admins/**", "/api/admin/auth/groups/**")
				.hasAnyAuthority(adminRolePolicyService.getAdminManagementAuthorities())
				.requestMatchers("/api/admin/**").authenticated()
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
			.addFilterBefore(sessionAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
			.addFilterAfter(adminMenuAuthorizationFilter, SessionAuthenticationFilter.class)
			.addFilterAfter(adminActionLoggingFilter, AdminMenuAuthorizationFilter.class);

		return http.build();
	}
}

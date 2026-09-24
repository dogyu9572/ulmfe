// 세션 인증 필터 회귀 테스트 — 요청마다 세션ID가 바뀌지 않는지(A-2) 실제 시큐리티 필터체인으로 검증한다
package egovframework.com.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import egovframework.com.security.AdminActionLoggingFilter;
import egovframework.com.security.AdminMenuAuthorizationService;
import egovframework.let.adm.service.EgovAdminRolePolicyService;
import egovframework.let.adm.service.EgovAdminService;
import jakarta.servlet.Filter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = SessionAuthenticationFilterTest.TestConfig.class)
class SessionAuthenticationFilterTest {

	private static final String SECURITY_CONTEXT_KEY = "SPRING_SECURITY_CONTEXT";

	@EnableWebMvc
	@EnableWebSecurity
	@Configuration(proxyBeanMethods = false)
	@Import(SecurityConfig.class)
	static class TestConfig {
		@Bean ObjectMapper objectMapper() { return new ObjectMapper(); }
		@Bean CsrfTokenRepository csrfTokenRepository() { return new HttpSessionCsrfTokenRepository(); }
		@Bean EgovAdminRolePolicyService adminRolePolicyService() {
			EgovAdminRolePolicyService service = Mockito.mock(EgovAdminRolePolicyService.class);
			Mockito.when(service.normalizeAuthority(Mockito.any())).thenReturn("ROLE_ADMIN");
			Mockito.when(service.getAdminManagementAuthorities()).thenReturn(new String[] {"ROLE_ADMIN"});
			return service;
		}
		@Bean SessionAuthenticationFilter sessionAuthenticationFilter(EgovAdminRolePolicyService policy) {
			return new SessionAuthenticationFilter(policy);
		}
		@Bean SessionAuthenticationEntryPoint sessionAuthenticationEntryPoint(ObjectMapper mapper) {
			return new SessionAuthenticationEntryPoint(mapper);
		}
		@Bean SessionAccessDeniedHandler sessionAccessDeniedHandler(ObjectMapper mapper) {
			return new SessionAccessDeniedHandler(mapper);
		}
		@Bean SpaCsrfHeaderFilter spaCsrfHeaderFilter(CsrfTokenRepository repository) {
			return new SpaCsrfHeaderFilter(repository);
		}
		@Bean AdminMenuAuthorizationFilter adminMenuAuthorizationFilter(ObjectMapper mapper) {
			return new AdminMenuAuthorizationFilter(Mockito.mock(AdminMenuAuthorizationService.class), mapper);
		}
		@Bean AdminActionLoggingFilter adminActionLoggingFilter() {
			return new AdminActionLoggingFilter(Mockito.mock(EgovAdminService.class));
		}
		@Bean ProbeController probeController() { return new ProbeController(); }
	}

	@RestController
	static class ProbeController {
		@GetMapping("/probe")
		String probe() { return "ok"; }
	}

	@Autowired
	private WebApplicationContext context;

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		SecurityContextHolder.clearContext();
		Filter springSecurityFilterChain = context.getBean("springSecurityFilterChain", Filter.class);
		mockMvc = MockMvcBuilders.webAppContextSetup(context).addFilters(springSecurityFilterChain).build();
	}

	private MockHttpSession loggedInSession() {
		MockHttpSession session = new MockHttpSession();
		session.setAttribute("adminId", "admin");
		session.setAttribute("adminRole", "SUPER");
		return session;
	}

	@Test
	void 인증_요청을_반복해도_클라이언트가_들고있는_세션이_살아있다() throws Exception {
		MockHttpSession session = loggedInSession();
		String firstId = session.getId();

		for (int i = 0; i < 3; i++) {
			SecurityContextHolder.clearContext();
			mockMvc.perform(get("/probe").session(session)).andExpect(status().isOk());
			assertFalse(session.isInvalid(),
				"요청 " + (i + 1) + "회차에서 세션이 무효화됐다 — 쿠키를 고정해 보내는 클라이언트는 이 시점부터 401이 된다");
			assertEquals(firstId, session.getId(), "세션ID가 교체되었다");
			assertEquals("admin", session.getAttribute("adminId"), "세션 속성이 유실되었다");
		}
	}

	@Test
	void 첫_인증_요청에서_SecurityContext를_세션에_저장한다() throws Exception {
		MockHttpSession session = loggedInSession();
		mockMvc.perform(get("/probe").session(session)).andExpect(status().isOk());
		assertNotNull(session.getAttribute(SECURITY_CONTEXT_KEY),
			"세션에 SecurityContext가 없으면 SessionManagementFilter가 매 요청 세션을 새로 만든다");
	}
}

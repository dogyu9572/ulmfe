// 전역 예외 advice 통합 테스트 — try/catch 없는 매핑의 예외가 규약(ApiResponse)과 올바른 상태코드로 나가는지 검증한다
package egovframework.com.cmm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.http.HttpStatus;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = ApiExceptionAdviceTest.TestConfig.class)
class ApiExceptionAdviceTest {

	@EnableWebMvc
	@Configuration(proxyBeanMethods = false)
	static class TestConfig {
		@Bean ApiExceptionAdvice apiExceptionAdvice() { return new ApiExceptionAdvice(); }
		@Bean ThrowingController throwingController() { return new ThrowingController(); }
	}

	/** try/catch 가 없는 실제 컨트롤러(코드 관리·배너·팝업 등 105개 매핑)를 대신한다. */
	@RestController
	static class ThrowingController {
		@GetMapping("/api/admin/test/validation")
		public ApiResponse<Void> validation() {
			throw new RuntimeException("이미 존재하는 코드ID입니다: COM001");
		}

		@GetMapping("/api/admin/test/illegal-argument")
		public ApiResponse<Void> illegalArgument() {
			throw new IllegalArgumentException("제목을 입력하세요.");
		}

		@GetMapping("/api/admin/test/blank-message")
		public ApiResponse<Void> blankMessage() {
			throw new IllegalArgumentException("   ");
		}

		@GetMapping("/api/admin/test/db-error")
		public ApiResponse<Void> dbError() {
			throw new DataIntegrityViolationException("Data too long for column 'PST_TTL' at row 1");
		}

		@GetMapping("/api/admin/test/not-found")
		public ApiResponse<Void> notFound() {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}

		@GetMapping("/api/admin/test/ok-but-failed")
		public ApiResponse<Void> okButFailed() {
			return ApiResponse.error("삭제할 게시글을 찾을 수 없습니다.");
		}
	}

	private MockMvc mockMvc;

	@BeforeEach
	void setUp(@Autowired WebApplicationContext context) {
		mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
	}

	@Test
	void RuntimeException_검증메시지는_400과_원문으로_나간다() throws Exception {
		// 수정 전에는 핸들러가 없어 500 + success·message 필드가 없는 Spring 기본 응답이었다
		mockMvc.perform(get("/api/admin/test/validation"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.message").value("이미 존재하는 코드ID입니다: COM001"));
	}

	@Test
	void IllegalArgumentException_은_기존_핸들러가_계속_처리한다() throws Exception {
		mockMvc.perform(get("/api/admin/test/illegal-argument"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("제목을 입력하세요."));
	}

	@Test
	void 검증예외의_메시지가_비어있으면_400과_기본문구로_나간다() throws Exception {
		// 핸들러 두 개를 하나로 합칠 때 이 경로가 500 으로 떨어지지 않는지 고정한다
		mockMvc.perform(get("/api/admin/test/blank-message"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("요청 값이 올바르지 않습니다."));
	}

	@Test
	void DB예외는_500이면서_SQL_상세를_노출하지_않는다() throws Exception {
		mockMvc.perform(get("/api/admin/test/db-error"))
			.andExpect(status().isInternalServerError())
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.message").value("요청 처리 중 오류가 발생했습니다."));
	}

	@Test
	void 상태코드를_가진_예외는_그_코드를_유지한다() throws Exception {
		// ErrorResponse 분기가 없으면 404가 500으로 바뀐다. 없는 정적 리소스 요청이 오류 로그를 채우는 회귀 방지용이다.
		mockMvc.perform(get("/api/admin/test/not-found"))
			.andExpect(status().isNotFound());
	}

	@Test
	void 실패응답의_200은_400으로_보정된다() throws Exception {
		mockMvc.perform(get("/api/admin/test/ok-but-failed"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.message").value("삭제할 게시글을 찾을 수 없습니다."));
	}
}

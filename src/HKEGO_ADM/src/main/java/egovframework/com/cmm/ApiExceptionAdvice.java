package egovframework.com.cmm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import jakarta.servlet.http.HttpServletResponse;

/**
 * 관리자 API 공통 오류 처리.
 * - 업무 검증 실패를 500이 아닌 400으로 내리고, 그 메시지를 화면까지 전달한다.
 * - ApiResponse 의 success=false 응답이 HTTP 200 으로 나가지 않게 상태 코드를 맞춘다.
 * 예외 상세(SQL·매퍼 경로·커넥션 ID)는 로그로만 남기고 응답 본문에는 담지 않는다.
 */
@Slf4j
@RestControllerAdvice
public class ApiExceptionAdvice implements ResponseBodyAdvice<Object> {

	/**
	 * try/catch 가 없는 컨트롤러 매핑에서 올라온 예외를 모두 받는다.
	 * 검증 메시지는 400 으로 그대로 전달하고, DB·IO 예외는 고정 문구로 바꿔 500 으로 내리면서 상세는 로그에만 남긴다.
	 * 이 핸들러가 없으면 Spring 기본 오류 응답이 나가 프론트가 읽는 success·message 필드가 아예 없다.
	 */
	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException e) {
		// Spring 이 상태 코드를 정해 던지는 예외(없는 정적 리소스의 NoResourceFoundException 등)는
		// 전역 advice 가 컨트롤러 밖 예외까지 받으므로 여기로 들어온다. 그 코드를 그대로 유지해 404가 500이 되지 않게 한다.
		if (e instanceof ErrorResponse errorResponse) {
			return ResponseEntity.status(errorResponse.getStatusCode())
				.body(ApiResponse.error("요청을 처리할 수 없습니다."));
		}
		if (ApiResponse.isUserFacing(e)) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
		if (e instanceof IllegalArgumentException || e instanceof IllegalStateException) {
			// 검증 예외인데 메시지가 비어 있는 경우. 500 이 아니라 400 으로 내린다.
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("요청 값이 올바르지 않습니다."));
		}
		log.error("관리자 API 처리 중 오류가 발생했습니다.", e);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ApiResponse.error("요청 처리 중 오류가 발생했습니다."));
	}

	@Override
	public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
		return true;
	}

	@Override
	public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
			Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request,
			ServerHttpResponse response) {
		if (body instanceof ApiResponse<?> apiResponse && !apiResponse.isSuccess()
				&& response instanceof ServletServerHttpResponse servletResponse) {
			HttpServletResponse raw = servletResponse.getServletResponse();
			// ponytail: 실패 원인을 4xx/5xx로 세분하지 않고 400 하나로 내린다. 원인 구분이 필요해지면 그때 나눈다.
			if (raw.getStatus() == HttpServletResponse.SC_OK) {
				raw.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		}
		return body;
	}
}

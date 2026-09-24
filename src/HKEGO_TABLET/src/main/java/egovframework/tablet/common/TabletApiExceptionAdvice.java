package egovframework.tablet.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

/**
 * 태블릿 API 공통 오류 처리.
 * 학생 화면의 진입점인 /api/tablet/session 을 비롯해 try/catch 가 없는 매핑이 여럿 있어,
 * 데이터 상태에 따른 예외 하나가 Spring 기본 오류 응답으로 나가면 학생 화면 전체가 멈춘다.
 * 여기서 응답 형식을 ApiResponse 규약으로 통일하고 예외 상세는 로그에만 남긴다.
 */
@Slf4j
@RestControllerAdvice
public class TabletApiExceptionAdvice {

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Void>> handleInvalidRequest(IllegalArgumentException e) {
		String message = (e.getMessage() == null || e.getMessage().isBlank())
			? "요청 값이 올바르지 않습니다." : e.getMessage();
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(message));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> handleValidationError(MethodArgumentNotValidException e) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("요청 값이 올바르지 않습니다."));
	}

	/**
	 * DB·IO 등 예상하지 못한 예외. 원인 문구를 응답에 담지 않고 로그로만 남긴다.
	 * ponytail: 원인별로 상태 코드를 나누지 않고 500 하나로 내린다. 구분이 필요해지면 그때 나눈다.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleUnexpectedError(Exception e) {
		// Spring 이 상태 코드를 정해 던지는 예외(없는 정적 리소스의 NoResourceFoundException 등)는
		// 전역 advice 가 컨트롤러 밖 예외까지 받으므로 여기로 들어온다. 그 코드를 유지해 404가 500이 되지 않게 한다.
		if (e instanceof ErrorResponse errorResponse) {
			return ResponseEntity.status(errorResponse.getStatusCode())
				.body(ApiResponse.error("요청을 처리할 수 없습니다."));
		}
		log.error("태블릿 API 처리 중 오류가 발생했습니다.", e);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ApiResponse.error("요청 처리 중 오류가 발생했습니다."));
	}
}

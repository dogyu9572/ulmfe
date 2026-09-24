package egovframework.com.cmm;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

/**
 * 사용자 포털 공개 API 공통 오류 처리.
 * 1:1문의 컨트롤러만 자체 @ExceptionHandler 를 갖고 있었고 나머지 11개 컨트롤러는 무방비여서,
 * 데이터 상태에 따른 예외가 규약(ApiResponse) 밖 응답으로 나가면 프론트가 읽을 success·message 필드가 없었다.
 * 컨트롤러 로컬 핸들러가 이 advice 보다 우선하므로 1:1문의의 기존 동작은 그대로 유지된다.
 */
@Slf4j
@RestControllerAdvice
public class PublicApiExceptionAdvice {

	@ExceptionHandler(SecurityException.class)
	public ResponseEntity<ApiResponse<Void>> handleForbidden(SecurityException e) {
		String message = ApiResponse.isUserFacing(e) ? e.getMessage() : "접근 권한이 없습니다.";
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(message));
	}

	/**
	 * 예외를 잡지 않는 컨트롤러 매핑에서 올라온 것을 모두 받는다.
	 * 검증 메시지는 400 으로 전달하고, 그 외는 고정 문구로 바꿔 상세를 로그에만 남긴다.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleUnexpectedError(Exception e) {
		// Spring 이 상태 코드를 정해 던지는 예외(ResponseStatusException, 없는 정적 리소스 등)는
		// 전역 advice 가 컨트롤러 밖 예외까지 받으므로 여기로 들어온다. 그 코드를 유지해 404가 500이 되지 않게 한다.
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
		log.error("사용자 포털 API 처리 중 오류가 발생했습니다.", e);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ApiResponse.error("요청 처리 중 오류가 발생했습니다."));
	}
}

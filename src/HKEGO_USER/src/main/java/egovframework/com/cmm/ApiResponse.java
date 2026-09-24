package egovframework.com.cmm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
	private boolean success;
	private String message;
	private T data;

	public static <T> ApiResponse<T> success(String message, T data) {
		return ApiResponse.<T>builder()
			.success(true)
			.message(message)
			.data(data)
			.build();
	}

	/**
	 * 서비스 계층이 사용자에게 보여줄 목적으로 던진 업무 검증 예외인지 판정한다.
	 * RuntimeException 은 하위 클래스를 뺀 그 클래스 자체일 때만 인정한다.
	 * DB·IO 예외는 모두 RuntimeException 의 하위 클래스라서 이 조건에서 걸러지고,
	 * SQL·매퍼 경로가 방문자에게 노출되지 않는다.
	 * HKEGO_ADM 의 같은 이름 메서드와 규칙이 같다. 모듈이 서로 독립이라 공유하지 못하고 복제한다.
	 */
	public static boolean isUserFacing(Throwable e) {
		if (e == null || e.getMessage() == null || e.getMessage().isBlank()) {
			return false;
		}
		return e instanceof IllegalArgumentException
			|| e instanceof IllegalStateException
			|| e.getClass() == RuntimeException.class;
	}

	public static <T> ApiResponse<T> error(String message) {
		return ApiResponse.<T>builder()
			.success(false)
			.message(message)
			.data(null)
			.build();
	}
}


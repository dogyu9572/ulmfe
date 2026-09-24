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
	 * DB·IO 예외(BadSqlGrammarException, DataIntegrityViolationException 등)는 모두
	 * RuntimeException 의 하위 클래스라서 이 조건에서 걸러지고, SQL·매퍼 경로가 응답에 새어나가지 않는다.
	 */
	public static boolean isUserFacing(Throwable e) {
		if (e == null || e.getMessage() == null || e.getMessage().isBlank()) {
			return false;
		}
		// ponytail: 검증 throw 59곳을 IllegalArgumentException 으로 바꾸는 대신 클래스 일치로 판정한다.
		// 새 예외 타입으로 검증 메시지를 던지게 되면 그때 이 조건에 추가한다.
		return e instanceof IllegalArgumentException
			|| e instanceof IllegalStateException
			|| e.getClass() == RuntimeException.class;
	}

	/**
	 * 업무 검증 예외의 메시지는 그대로 쓰고, 그 외(DB/IO 등)는 고정 문구로 대체한다.
	 * 예외 상세(SQL·매퍼 경로·커넥션 ID)가 응답에 새어나가지 않게 하는 것이 목적이다.
	 */
	public static String messageOf(Throwable e, String fallback) {
		return isUserFacing(e) ? e.getMessage() : fallback;
	}

	public static <T> ApiResponse<T> error(String message) {
		return ApiResponse.<T>builder()
			.success(false)
			.message(message)
			.data(null)
			.build();
	}
}


// 업무 검증 예외와 DB·IO 예외를 가르는 판정 단위 테스트 — 검증 메시지는 화면까지 가고 SQL 상세는 막히는지 확인한다
package egovframework.com.cmm;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.BadSqlGrammarException;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiResponseUserFacingTest {

	@Test
	void 서비스가_RuntimeException_으로_던진_검증메시지는_사용자에게_전달한다() {
		// 이 단정이 수정의 역검증이다. isUserFacing 에서 RuntimeException 조건을 빼면 실패한다.
		RuntimeException e = new RuntimeException("허용되지 않는 이미지 형식입니다.");
		assertTrue(ApiResponse.isUserFacing(e));
		assertEquals("허용되지 않는 이미지 형식입니다.", ApiResponse.messageOf(e, "파일 업로드 중 오류가 발생했습니다."));
	}

	@Test
	void IllegalArgument_와_IllegalState_는_그대로_전달한다() {
		assertTrue(ApiResponse.isUserFacing(new IllegalArgumentException("제목을 입력하세요.")));
		assertTrue(ApiResponse.isUserFacing(new IllegalStateException("이미 마감된 예약입니다.")));
	}

	@Test
	void DB예외는_RuntimeException_하위라서_메시지가_막힌다() {
		// SQL 전문·매퍼 경로·커넥션 ID 가 응답에 새어나가지 않아야 한다
		BadSqlGrammarException sqlError = new BadSqlGrammarException(
			"selectPost", "SELECT * FROM BBS_ARTICLE WHERE PST_SN = ?", new SQLException("Unknown column"));
		assertFalse(ApiResponse.isUserFacing(sqlError));
		assertEquals("저장 중 오류가 발생했습니다.", ApiResponse.messageOf(sqlError, "저장 중 오류가 발생했습니다."));

		DataIntegrityViolationException constraintError =
			new DataIntegrityViolationException("Data too long for column 'PST_TTL'");
		assertFalse(ApiResponse.isUserFacing(constraintError));
		assertEquals("등록에 실패했습니다.", ApiResponse.messageOf(constraintError, "등록에 실패했습니다."));
	}

	@Test
	void RuntimeException_의_사용자정의_하위클래스도_막는다() {
		class InternalFailure extends RuntimeException {
			InternalFailure(String message) {
				super(message);
			}
		}
		assertFalse(ApiResponse.isUserFacing(new InternalFailure("내부 상태 오류 상세")));
	}

	@Test
	void 메시지가_없거나_공백이면_fallback_을_쓴다() {
		assertFalse(ApiResponse.isUserFacing(new RuntimeException()));
		assertFalse(ApiResponse.isUserFacing(new IllegalArgumentException("   ")));
		assertFalse(ApiResponse.isUserFacing(null));
		assertEquals("기본 문구", ApiResponse.messageOf(new RuntimeException("  "), "기본 문구"));
	}
}

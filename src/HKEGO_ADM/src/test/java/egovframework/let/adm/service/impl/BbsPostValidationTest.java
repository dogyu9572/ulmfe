// 게시글 서버측 입력 검증 단위 테스트 — DB·스프링 컨텍스트 없이 validate만 리플렉션으로 호출한다
package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.vo.BbsPostVO;
import org.junit.jupiter.api.Test;

import org.mockito.Mockito;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class BbsPostValidationTest {

	private void validate(BbsPostVO post) {
		try {
			Method method = EgovBbsPostServiceImpl.class.getDeclaredMethod("validate", BbsPostVO.class);
			method.setAccessible(true);
			method.invoke(new EgovBbsPostServiceImpl(), post);
		} catch (InvocationTargetException e) {
			if (e.getCause() instanceof RuntimeException cause) {
				throw cause;
			}
			throw new IllegalStateException(e);
		} catch (ReflectiveOperationException e) {
			throw new IllegalStateException(e);
		}
	}

	private BbsPostVO post(String title) {
		BbsPostVO vo = new BbsPostVO();
		vo.setPstTtl(title);
		return vo;
	}

	@Test
	void 제목이_없거나_공백이면_거부한다() {
		assertEquals("제목을 입력하세요.", assertThrows(IllegalArgumentException.class, () -> validate(post(null))).getMessage());
		assertEquals("제목을 입력하세요.", assertThrows(IllegalArgumentException.class, () -> validate(post(""))).getMessage());
		assertEquals("제목을 입력하세요.", assertThrows(IllegalArgumentException.class, () -> validate(post("   "))).getMessage());
	}

	@Test
	void 제목은_앞뒤_공백을_제거하고_길이_상한을_넘기면_거부한다() {
		BbsPostVO trimmed = post("  공지  ");
		validate(trimmed);
		assertEquals("공지", trimmed.getPstTtl());
		assertThrows(IllegalArgumentException.class, () -> validate(post("가".repeat(501))));
	}

	@Test
	void 사용여부는_Y_또는_N_만_받는다() {
		BbsPostVO bad = post("제목");
		bad.setUseYn("ZZZ");
		assertThrows(IllegalArgumentException.class, () -> validate(bad));

		BbsPostVO good = post("제목");
		good.setUseYn("N");
		assertDoesNotThrow(() -> validate(good));
	}

	@Test
	void 수정_시_작성자는_요청_본문이_아니라_기존_값을_유지한다() throws Exception {
		BbsPostVO existing = post("원본");
		existing.setBbsId("ZEHSB");
		existing.setPostId("ABC123");
		existing.setWrtrId("admin");
		existing.setWrtrNm("총괄관리자");

		BbsPostVO forged = post("수정본");
		forged.setBbsId("ZEHSB");
		forged.setPostId("ABC123");
		forged.setWrtrId("hacker");
		forged.setWrtrNm("해커");

		EgovBbsPostServiceImpl service = new EgovBbsPostServiceImpl();
		BbsPostDAO dao = Mockito.mock(BbsPostDAO.class);
		Mockito.when(dao.selectBbsPostById("ZEHSB", "ABC123")).thenReturn(existing);
		Mockito.when(dao.updateBbsPost(Mockito.any())).thenReturn(1);
		Field daoField = EgovBbsPostServiceImpl.class.getDeclaredField("bbsPostDAO");
		daoField.setAccessible(true);
		daoField.set(service, dao);

		service.updateBbsPost(forged);

		assertEquals("admin", forged.getWrtrId());
		assertEquals("총괄관리자", forged.getWrtrNm());
	}

	@Test
	void 등록일자는_yyyy_MM_dd_형식만_받는다() {
		BbsPostVO notDate = post("제목");
		notDate.setPstgYmd("not-a-date");
		assertThrows(IllegalArgumentException.class, () -> validate(notDate));

		BbsPostVO outOfRange = post("제목");
		outOfRange.setPstgYmd("2026-13-45");
		assertThrows(IllegalArgumentException.class, () -> validate(outOfRange));

		BbsPostVO ok = post("제목");
		ok.setPstgYmd("2026-08-19");
		assertDoesNotThrow(() -> validate(ok));
	}
}

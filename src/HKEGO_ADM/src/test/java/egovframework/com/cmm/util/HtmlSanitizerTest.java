// HTML sanitize 단위 테스트 — 스크립트 실행 수단은 제거하고 에디터 서식은 남는지 검증한다
package egovframework.com.cmm.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HtmlSanitizerTest {

	@Test
	void 이벤트핸들러와_스크립트를_제거한다() {
		String cleaned = HtmlSanitizer.clean("<p>본문</p><img src=\"x\" onerror=\"alert(1)\"><script>alert(2)</script>");
		assertFalse(cleaned.contains("onerror"));
		assertFalse(cleaned.contains("<script"));
		assertTrue(cleaned.contains("<p>본문</p>"));
	}

	@Test
	void javascript_URL_을_제거한다() {
		assertFalse(HtmlSanitizer.clean("<a href=\"javascript:alert(1)\">클릭</a>").contains("javascript:"));
	}

	@Test
	void 에디터가_쓰는_서식과_업로드_이미지는_남긴다() {
		String cleaned = HtmlSanitizer.clean("<p style=\"text-align:center\"><img src=\"/uploads/bbs/ZEHSB/a.jpg\" style=\"width: 830px;\"></p>");
		assertTrue(cleaned.contains("/uploads/bbs/ZEHSB/a.jpg"));
		assertTrue(cleaned.contains("style"));
	}

	@Test
	void null_과_공백은_그대로_통과시킨다() {
		assertEquals(null, HtmlSanitizer.clean(null));
		assertEquals("", HtmlSanitizer.clean(""));
	}
}

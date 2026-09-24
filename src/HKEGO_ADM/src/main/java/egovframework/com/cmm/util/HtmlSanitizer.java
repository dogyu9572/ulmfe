// 관리자 에디터로 입력된 HTML 본문에서 스크립트 실행 요소를 제거하는 유틸
package egovframework.com.cmm.util;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

public final class HtmlSanitizer {

	/** 에디터가 만들어내는 서식·이미지·표는 살리고 스크립트 실행 수단만 걷어낸다. */
	private static final Safelist SAFELIST = Safelist.relaxed()
		.addTags("figure", "figcaption", "hr", "span", "iframe")
		.addAttributes(":all", "style", "class", "id", "title")
		.addAttributes("iframe", "src", "width", "height", "allow", "allowfullscreen", "frameborder")
		.addAttributes("a", "target", "rel")
		.addAttributes("img", "width", "height", "loading")
		.addProtocols("iframe", "src", "http", "https")
		.addProtocols("img", "src", "http", "https", "data")
		// 업로드 이미지는 /uploads/... 상대경로로 저장되므로 상대 URL을 지운다면 본문 이미지가 사라진다
		.preserveRelativeLinks(true);

	private static final Document.OutputSettings OUTPUT = new Document.OutputSettings().prettyPrint(false);

	/**
	 * 프로토콜 검사용 기준 URL. 업로드 이미지는 /uploads/... 상대경로라 기준 URL이 없으면
	 * jsoup이 "프로토콜 없음"으로 보고 src 를 통째로 지운다.
	 * preserveRelativeLinks(true) 와 짝을 이뤄 검사만 절대경로로 하고 저장값은 상대경로 그대로 둔다.
	 */
	private static final String BASE_URI = "https://localhost/";

	private HtmlSanitizer() {
	}

	/**
	 * on* 이벤트 핸들러, script/object 태그, javascript: URL 을 제거한 HTML 을 돌려준다.
	 * null 은 null 그대로 통과시켜 "값 없음"과 "빈 값"의 구분을 유지한다.
	 */
	public static String clean(String html) {
		if (html == null || html.isBlank()) {
			return html;
		}
		return Jsoup.clean(html, BASE_URI, SAFELIST, OUTPUT);
	}
}

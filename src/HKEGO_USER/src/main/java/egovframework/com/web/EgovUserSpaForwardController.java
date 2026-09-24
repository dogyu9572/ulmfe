package egovframework.com.web;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;

/**
 * Next.js 정적 export(out/) 를 WAR static 으로 서빙할 때 HTML 폴백과 옛 주소 리다이렉트.
 * next.config redirects 는 export 런타임에서 동작하지 않으므로 Spring 이 대신 처리한다.
 * context-path(/usfec) 아래 매핑은 컨텍스트 상대 경로로 동작한다.
 */
@Controller
public class EgovUserSpaForwardController {

	private static final Set<String> RESERVED_SECTIONS = Set.of("api", "uploads", "_next", "pub");

	@GetMapping("/")
	public String index() {
		return "forward:/index.html";
	}

	@GetMapping({"/support/faq", "/support/faq/"})
	public String legacyFaq() {
		return "redirect:/news/faq/";
	}

	@GetMapping({"/gallery", "/gallery/", "/gallery/index", "/gallery/index/"})
	public String legacyGallery() {
		return "redirect:/news/gallery/";
	}

	/**
	 * 퍼블 원본 total_search/index.html 이 welcome 파일로 잡히면 /total_search 로 잘린다.
	 * 검색어 쿼리는 유지한 채 Next 페이지 주소로 보낸다.
	 */
	@GetMapping({"/total_search", "/total_search/", "/total_search/index.html"})
	public String totalSearch(HttpServletRequest request) {
		String query = request.getQueryString();
		if (query == null || query.isEmpty()) {
			return "redirect:/total_search/index/";
		}
		return "redirect:/total_search/index/?" + query;
	}

	@GetMapping({
			"/program/esd_pbl", "/program/esd_pbl/",
			"/program/elementary", "/program/elementary/",
			"/program/mission", "/program/mission/",
			"/program/biggame", "/program/biggame/",
			"/program/special", "/program/special/",
			"/program/free", "/program/free/",
			"/program/elementary1", "/program/elementary1/",
			"/program/elementary2", "/program/elementary2/",
			"/program/elementary3", "/program/elementary3/",
			"/program/elementary4", "/program/elementary4/",
			"/program/elementary5", "/program/elementary5/",
			"/program/mission1", "/program/mission1/",
			"/program/mission2", "/program/mission2/",
			"/program/mission3", "/program/mission3/"
	})
	public String legacyProgram() {
		return "redirect:/program/list/";
	}

	@GetMapping({"/{section}/{slug}", "/{section}/{slug}/"})
	public String subpage(@PathVariable String section, @PathVariable String slug) {
		if (RESERVED_SECTIONS.contains(section)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}
		return "forward:/" + section + "/" + slug + "/index.html";
	}
}

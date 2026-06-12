package egovframework.com.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Next.js 정적 빌드(out/)를 백엔드 단일 포트로 서빙할 때 index.html 폴백.
 */
@Controller
public class EgovUserSpaForwardController {

	@GetMapping("/")
	public String index() {
		return "forward:/index.html";
	}
}

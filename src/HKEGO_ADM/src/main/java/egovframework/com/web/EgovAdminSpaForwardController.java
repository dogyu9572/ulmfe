package egovframework.com.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 빌드된 React 앱(classpath:/static)을 백엔드 단일 포트로 서빙할 때,
 * 브라우저가 /admin/** 로 직접 요청하면 정적 파일이 없어 404가 나므로 index.html 로 폴백한다.
 * context-path(/usfec-adm) 아래에서도 매핑은 컨텍스트 상대 경로로 동작한다.
 * (/api/**, /uploads/** 는 기존 컨트롤러가 처리)
 */
@Controller
public class EgovAdminSpaForwardController {

	@GetMapping("/")
	public String index() {
		return "forward:/index.html";
	}

	@GetMapping("/admin/**")
	public String adminSpa() {
		return "forward:/index.html";
	}
}

package egovframework.tablet.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 빌드된 React 앱(classpath:/static)을 백엔드 단일 포트로 서빙할 때
 * 브라우저 직접 접근 경로를 index.html로 전달한다.
 */
@Controller
public class TabletSpaForwardController {

	@GetMapping({"/", "/index", "/select-user", "/select_user", "/student/**", "/teacher/**"})
	public String tabletSpa() {
		return "forward:/index.html";
	}
}

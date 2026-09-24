package egovframework.com.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 카탈로그/인그레스 probe 용 생존 확인.
 * 공개 URL: https://use.go.kr/usfec/livez.do (context-path /usfec)
 */
@RestController
public class EgovHealthCheckController {

	@RequestMapping("/livez.do")
	public ResponseEntity<Void> healthCheck(HttpServletRequest request) {
		return new ResponseEntity<>(HttpStatus.OK);
	}
}

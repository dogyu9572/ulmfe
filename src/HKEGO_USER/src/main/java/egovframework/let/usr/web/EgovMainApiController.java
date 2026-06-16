package egovframework.let.usr.web;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;

@RestController
@RequestMapping("/api/user")
public class EgovMainApiController {

	@GetMapping("/main")
	public ApiResponse<Map<String, Object>> main() {
		Map<String, Object> data = new LinkedHashMap<>();
		data.put("siteName", "HKEGO");
		data.put("title", "HKEGO 사용자 포털");
		data.put("description", "HKEGO 사용자 서비스 메인 페이지입니다.");
		data.put("serverTime", LocalDateTime.now().toString());
		return ApiResponse.success("메인 정보를 조회했습니다.", data);
	}
}

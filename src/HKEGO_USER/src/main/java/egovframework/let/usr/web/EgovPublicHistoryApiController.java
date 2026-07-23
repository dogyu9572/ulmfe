package egovframework.let.usr.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicHistoryService;
import egovframework.let.usr.service.vo.PublicHistoryVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/history")
@RequiredArgsConstructor
public class EgovPublicHistoryApiController {
	private final EgovPublicHistoryService publicHistoryService;

	@GetMapping
	public ApiResponse<List<PublicHistoryVO>> getVisibleHistories() {
		return ApiResponse.success("연혁을 조회했습니다.", publicHistoryService.getVisibleHistories());
	}
}

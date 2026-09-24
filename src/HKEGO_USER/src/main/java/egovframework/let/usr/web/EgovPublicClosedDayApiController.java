// 메인 화면 이달의 휴관일 공개 API 컨트롤러
package egovframework.let.usr.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicClosedDayService;
import egovframework.let.usr.service.vo.PublicClosedDayMonthVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/main/closed-days")
@RequiredArgsConstructor
public class EgovPublicClosedDayApiController {
	private final EgovPublicClosedDayService publicClosedDayService;

	@GetMapping
	public ApiResponse<PublicClosedDayMonthVO> getClosedDaysOfMonth(
			@RequestParam(required = false) String month) {
		return ApiResponse.success(
			"이달의 휴관일을 조회했습니다.",
			publicClosedDayService.getClosedDaysOfMonth(month)
		);
	}
}

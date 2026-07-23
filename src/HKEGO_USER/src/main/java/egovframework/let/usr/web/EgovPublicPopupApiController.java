package egovframework.let.usr.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicPopupService;
import egovframework.let.usr.service.vo.PublicPopupVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/main/popups")
@RequiredArgsConstructor
public class EgovPublicPopupApiController {
	private final EgovPublicPopupService publicPopupService;

	@GetMapping
	public ApiResponse<List<PublicPopupVO>> getVisiblePopups() {
		return ApiResponse.success("메인 팝업을 조회했습니다.", publicPopupService.getVisiblePopups());
	}
}

package egovframework.let.usr.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicOrganizationService;
import egovframework.let.usr.service.vo.PublicOrganizationMemberVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/organization")
@RequiredArgsConstructor
public class EgovPublicOrganizationApiController {
	private final EgovPublicOrganizationService publicOrganizationService;

	@GetMapping
	public ApiResponse<List<PublicOrganizationMemberVO>> getVisibleMembers() {
		return ApiResponse.success("조직도를 조회했습니다.", publicOrganizationService.getVisibleMembers());
	}
}

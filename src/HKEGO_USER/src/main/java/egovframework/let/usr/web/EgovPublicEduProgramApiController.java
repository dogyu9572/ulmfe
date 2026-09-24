package egovframework.let.usr.web;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.usr.service.EgovPublicEduProgramService;
import egovframework.let.usr.service.vo.PublicEduProgramVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/edu-programs")
@RequiredArgsConstructor
public class EgovPublicEduProgramApiController {
	private final EgovPublicEduProgramService publicEduProgramService;

	@GetMapping
	public ApiResponse<List<PublicEduProgramVO>> getPrograms() {
		return ApiResponse.success("교육프로그램을 조회했습니다.", publicEduProgramService.getVisiblePrograms());
	}

	@GetMapping("/categories")
	public ApiResponse<List<PublicEduProgramVO>> getCategories() {
		return ApiResponse.success("프로그램 분류를 조회했습니다.", publicEduProgramService.getCategories());
	}
}

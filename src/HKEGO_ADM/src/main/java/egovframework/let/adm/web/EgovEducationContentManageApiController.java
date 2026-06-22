package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovEducationContentService;
import egovframework.let.adm.service.vo.EducationContentDto;
import egovframework.let.adm.service.vo.EducationContentVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/education-contents")
@RequiredArgsConstructor
public class EgovEducationContentManageApiController {
	private final EgovEducationContentService educationContentService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getEducationContents(
		@RequestParam(required = false) String cntnTypeCd,
		@RequestParam(required = false) String cardClsfCd,
		@RequestParam(required = false) String useYn,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"콘텐츠 목록 조회 성공",
			educationContentService.getEducationContentListPage(cntnTypeCd, cardClsfCd, useYn, searchKeyword, page, size)
		);
	}

	@GetMapping("/{cntnSn}")
	public ApiResponse<EducationContentVO> getEducationContent(@PathVariable Integer cntnSn) {
		return ApiResponse.success("콘텐츠 상세 조회 성공", educationContentService.getEducationContentById(cntnSn));
	}

	@PostMapping
	public ApiResponse<EducationContentVO> createEducationContent(@RequestBody EducationContentDto dto) {
		return ApiResponse.success("콘텐츠 등록 성공", educationContentService.createEducationContent(dto));
	}

	@PutMapping("/{cntnSn}")
	public ApiResponse<EducationContentVO> updateEducationContent(
		@PathVariable Integer cntnSn,
		@RequestBody EducationContentDto dto
	) {
		return ApiResponse.success("콘텐츠 수정 성공", educationContentService.updateEducationContent(cntnSn, dto));
	}

	@DeleteMapping("/{cntnSn}")
	public ApiResponse<Void> deleteEducationContent(@PathVariable Integer cntnSn) {
		educationContentService.deleteEducationContent(cntnSn);
		return ApiResponse.success("콘텐츠 삭제 성공", null);
	}
}

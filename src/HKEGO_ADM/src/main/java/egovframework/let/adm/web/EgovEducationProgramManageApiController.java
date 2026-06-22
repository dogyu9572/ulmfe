package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovEducationProgramService;
import egovframework.let.adm.service.vo.EducationProgramDto;
import egovframework.let.adm.service.vo.EducationProgramVO;
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
@RequestMapping("/api/admin/education-programs")
@RequiredArgsConstructor
public class EgovEducationProgramManageApiController {
	private final EgovEducationProgramService educationProgramService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getEducationPrograms(
		@RequestParam String prgrmTypeCd,
		@RequestParam(required = false) String useYn,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"프로그램 목록 조회 성공",
			educationProgramService.getEducationProgramListPage(prgrmTypeCd, useYn, searchKeyword, page, size)
		);
	}

	@GetMapping("/{prgrmTypeCd}/{prgrmSn}")
	public ApiResponse<EducationProgramVO> getEducationProgram(@PathVariable String prgrmTypeCd, @PathVariable Integer prgrmSn) {
		return ApiResponse.success("프로그램 상세 조회 성공", educationProgramService.getEducationProgramById(prgrmTypeCd, prgrmSn));
	}

	@PostMapping("/{prgrmTypeCd}")
	public ApiResponse<EducationProgramVO> createEducationProgram(@PathVariable String prgrmTypeCd, @RequestBody EducationProgramDto dto) {
		return ApiResponse.success("프로그램 등록 성공", educationProgramService.createEducationProgram(prgrmTypeCd, dto));
	}

	@PutMapping("/{prgrmTypeCd}/{prgrmSn}")
	public ApiResponse<EducationProgramVO> updateEducationProgram(
		@PathVariable String prgrmTypeCd,
		@PathVariable Integer prgrmSn,
		@RequestBody EducationProgramDto dto
	) {
		return ApiResponse.success("프로그램 수정 성공", educationProgramService.updateEducationProgram(prgrmTypeCd, prgrmSn, dto));
	}

	@DeleteMapping("/{prgrmTypeCd}/{prgrmSn}")
	public ApiResponse<Void> deleteEducationProgram(@PathVariable String prgrmTypeCd, @PathVariable Integer prgrmSn) {
		educationProgramService.deleteEducationProgram(prgrmTypeCd, prgrmSn);
		return ApiResponse.success("프로그램 삭제 성공", null);
	}
}

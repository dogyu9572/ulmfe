package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovLearningSupportMaterialService;
import egovframework.let.adm.service.vo.EducationProgramVO;
import egovframework.let.adm.service.vo.LearningSupportMaterialVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/learning-support-materials")
@RequiredArgsConstructor
public class EgovLearningSupportMaterialManageApiController {
	private final EgovLearningSupportMaterialService learningSupportMaterialService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getLearningSupportMaterials(
		@RequestParam(required = false) String lrnTypeCd,
		@RequestParam(required = false) String dataTypeCd,
		@RequestParam(required = false) String startRegYmd,
		@RequestParam(required = false) String endRegYmd,
		@RequestParam(required = false) String searchType,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"학습지원 자료실 목록 조회 성공",
			learningSupportMaterialService.getLearningSupportMaterialListPage(
				lrnTypeCd, dataTypeCd, startRegYmd, endRegYmd, searchType, searchKeyword, page, size
			)
		);
	}

	@GetMapping("/{pstSn}")
	public ApiResponse<LearningSupportMaterialVO> getLearningSupportMaterial(@PathVariable String pstSn) {
		return ApiResponse.success("학습지원 자료실 상세 조회 성공", learningSupportMaterialService.getLearningSupportMaterialById(pstSn));
	}

	@PostMapping
	public ApiResponse<LearningSupportMaterialVO> createLearningSupportMaterial(@RequestBody LearningSupportMaterialVO material) {
		return ApiResponse.success("학습지원 자료실 등록 성공", learningSupportMaterialService.createLearningSupportMaterial(material));
	}

	@PutMapping("/{pstSn}")
	public ApiResponse<LearningSupportMaterialVO> updateLearningSupportMaterial(
		@PathVariable String pstSn,
		@RequestBody LearningSupportMaterialVO material
	) {
		return ApiResponse.success("학습지원 자료실 수정 성공", learningSupportMaterialService.updateLearningSupportMaterial(pstSn, material));
	}

	@DeleteMapping("/{pstSn}")
	public ApiResponse<Void> deleteLearningSupportMaterial(@PathVariable String pstSn) {
		learningSupportMaterialService.deleteLearningSupportMaterial(pstSn);
		return ApiResponse.success("학습지원 자료실 삭제 성공", null);
	}

	@GetMapping("/program-options")
	public ApiResponse<List<EducationProgramVO>> getProgramOptions() {
		return ApiResponse.success("프로그램 목록 조회 성공", learningSupportMaterialService.getActiveProgramOptions());
	}
}

package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovEsdQuestionService;
import egovframework.let.adm.service.vo.EsdQuestionDto;
import egovframework.let.adm.service.vo.EsdQuestionVO;
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

import java.util.Map;

@RestController
@RequestMapping("/api/admin/esd-questions")
@RequiredArgsConstructor
public class EgovEsdQuestionManageApiController {
	private final EgovEsdQuestionService esdQuestionService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getQuestionList(
		@RequestParam(required = false) String qstnTypeCd,
		@RequestParam(required = false) String useYn,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"지속가능발전교육 문제 목록 조회 성공",
			esdQuestionService.getQuestionListPage(qstnTypeCd, useYn, searchKeyword, page, size)
		);
	}

	@GetMapping("/{esdQstnSn}")
	public ApiResponse<EsdQuestionVO> getQuestion(@PathVariable Integer esdQstnSn) {
		return ApiResponse.success("지속가능발전교육 문제 상세 조회 성공", esdQuestionService.getQuestionById(esdQstnSn));
	}

	@PostMapping
	public ApiResponse<EsdQuestionVO> createQuestion(@RequestBody EsdQuestionDto dto) {
		return ApiResponse.success("지속가능발전교육 문제 등록 성공", esdQuestionService.createQuestion(dto));
	}

	@PutMapping("/{esdQstnSn}")
	public ApiResponse<EsdQuestionVO> updateQuestion(
		@PathVariable Integer esdQstnSn,
		@RequestBody EsdQuestionDto dto
	) {
		return ApiResponse.success("지속가능발전교육 문제 수정 성공", esdQuestionService.updateQuestion(esdQstnSn, dto));
	}

	@DeleteMapping("/{esdQstnSn}")
	public ApiResponse<Void> deleteQuestion(@PathVariable Integer esdQstnSn) {
		esdQuestionService.deleteQuestion(esdQstnSn);
		return ApiResponse.success("지속가능발전교육 문제 삭제 성공", null);
	}
}

package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovEvaluationFormService;
import egovframework.let.adm.service.vo.EvaluationFormDto;
import egovframework.let.adm.service.vo.EvaluationFormVO;
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
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/evaluation-forms")
@RequiredArgsConstructor
public class EgovEvaluationFormManageApiController {
	private final EgovEvaluationFormService evaluationFormService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getEvaluationForms(
		@RequestParam(required = false) String evlSeCd,
		@RequestParam(required = false) String startRegYmd,
		@RequestParam(required = false) String endRegYmd,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"평가지 목록 조회 성공",
			evaluationFormService.getEvaluationFormListPage(evlSeCd, startRegYmd, endRegYmd, searchKeyword, page, size)
		);
	}

	@GetMapping("/{qstnrSn}")
	public ApiResponse<EvaluationFormVO> getEvaluationForm(@PathVariable Integer qstnrSn) {
		return ApiResponse.success("평가지 상세 조회 성공", evaluationFormService.getEvaluationFormById(qstnrSn));
	}

	@GetMapping("/{qstnrSn}/results.xlsx")
	public ResponseEntity<byte[]> downloadEvaluationResults(@PathVariable Integer qstnrSn) throws Exception {
		EvaluationFormVO form = evaluationFormService.getEvaluationFormById(qstnrSn);
		byte[] body = QuestionnaireResultExcelWriter.create(
			form,
			evaluationFormService.getEvaluationResponses(qstnrSn),
			false
		);
		return excelResponse("evaluation-" + qstnrSn + "-results.xlsx", body);
	}

	@PostMapping
	public ApiResponse<EvaluationFormVO> createEvaluationForm(@RequestBody EvaluationFormDto dto) {
		return ApiResponse.success("평가지 등록 성공", evaluationFormService.createEvaluationForm(dto));
	}

	@PutMapping("/{qstnrSn}")
	public ApiResponse<EvaluationFormVO> updateEvaluationForm(
		@PathVariable Integer qstnrSn,
		@RequestBody EvaluationFormDto dto
	) {
		return ApiResponse.success("평가지 수정 성공", evaluationFormService.updateEvaluationForm(qstnrSn, dto));
	}

	@DeleteMapping("/{qstnrSn}")
	public ApiResponse<Void> deleteEvaluationForm(@PathVariable Integer qstnrSn) {
		evaluationFormService.deleteEvaluationForm(qstnrSn);
		return ApiResponse.success("평가지 삭제 성공", null);
	}

	private ResponseEntity<byte[]> excelResponse(String fileName, byte[] body) {
		ContentDisposition disposition = ContentDisposition.attachment()
			.filename(fileName, StandardCharsets.UTF_8)
			.build();
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
			.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(body);
	}
}

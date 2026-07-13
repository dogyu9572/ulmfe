package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovSurveyFormService;
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
@RequestMapping("/api/admin/survey-forms")
@RequiredArgsConstructor
public class EgovSurveyFormManageApiController {
	private final EgovSurveyFormService surveyFormService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getSurveyForms(
		@RequestParam(required = false) String startRegYmd,
		@RequestParam(required = false) String endRegYmd,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"설문지 목록 조회 성공",
			surveyFormService.getSurveyFormListPage(startRegYmd, endRegYmd, searchKeyword, page, size)
		);
	}

	@GetMapping("/{qstnrSn}")
	public ApiResponse<EvaluationFormVO> getSurveyForm(@PathVariable Integer qstnrSn) {
		return ApiResponse.success("설문지 상세 조회 성공", surveyFormService.getSurveyFormById(qstnrSn));
	}

	@GetMapping("/{qstnrSn}/results.xlsx")
	public ResponseEntity<byte[]> downloadSurveyResults(@PathVariable Integer qstnrSn) throws Exception {
		EvaluationFormVO form = surveyFormService.getSurveyFormById(qstnrSn);
		byte[] body = QuestionnaireResultExcelWriter.create(
			form,
			surveyFormService.getSurveyResponses(qstnrSn),
			true
		);
		return excelResponse("survey-" + qstnrSn + "-results.xlsx", body);
	}

	@PostMapping
	public ApiResponse<EvaluationFormVO> createSurveyForm(@RequestBody EvaluationFormDto dto) {
		return ApiResponse.success("설문지 등록 성공", surveyFormService.createSurveyForm(dto));
	}

	@PutMapping("/{qstnrSn}")
	public ApiResponse<EvaluationFormVO> updateSurveyForm(
		@PathVariable Integer qstnrSn,
		@RequestBody EvaluationFormDto dto
	) {
		return ApiResponse.success("설문지 수정 성공", surveyFormService.updateSurveyForm(qstnrSn, dto));
	}

	@DeleteMapping("/{qstnrSn}")
	public ApiResponse<Void> deleteSurveyForm(@PathVariable Integer qstnrSn) {
		surveyFormService.deleteSurveyForm(qstnrSn);
		return ApiResponse.success("설문지 삭제 성공", null);
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

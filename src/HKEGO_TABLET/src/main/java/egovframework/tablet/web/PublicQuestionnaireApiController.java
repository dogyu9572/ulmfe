package egovframework.tablet.web;

import egovframework.tablet.common.ApiResponse;
import egovframework.tablet.service.TabletService;
import egovframework.tablet.service.vo.PublicQuestionnaireSubmitRequest;
import egovframework.tablet.service.vo.TabletQuestionnaireVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/questionnaires")
@RequiredArgsConstructor
public class PublicQuestionnaireApiController {
	private final TabletService tabletService;

	@GetMapping("/{linkCd}")
	public ResponseEntity<ApiResponse<TabletQuestionnaireVO>> getQuestionnaire(@PathVariable String linkCd) {
		try {
			return ResponseEntity.ok(ApiResponse.success("설문 조회 성공", tabletService.getQuestionnaireByLink(linkCd)));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
		}
	}

	/** 링크·QR 접속자의 익명 제출. 예약·학생에 귀속하지 않으며 중복 제출을 막지 않는다. */
	@PostMapping("/{linkCd}/responses")
	public ResponseEntity<ApiResponse<Integer>> submitQuestionnaire(
		@PathVariable String linkCd,
		@Valid @RequestBody PublicQuestionnaireSubmitRequest request
	) {
		try {
			int saved = tabletService.submitPublicQuestionnaire(linkCd, request.getAnswers());
			return ResponseEntity.ok(ApiResponse.success("응답이 제출되었습니다.", saved));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
		}
	}
}

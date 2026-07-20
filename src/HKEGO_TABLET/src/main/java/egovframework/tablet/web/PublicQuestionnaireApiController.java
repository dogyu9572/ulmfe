package egovframework.tablet.web;

import egovframework.tablet.common.ApiResponse;
import egovframework.tablet.service.TabletService;
import egovframework.tablet.service.vo.TabletQuestionnaireVO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
}

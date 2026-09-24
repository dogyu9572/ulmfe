package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovLearningReservationService;
import egovframework.let.adm.service.vo.LearningReservationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/field-operation-status")
@RequiredArgsConstructor
public class EgovLearningFieldStatusManageApiController {
	private final EgovLearningReservationService learningReservationService;

	@GetMapping
	public ApiResponse<List<LearningReservationVO>> getFieldOperationStatus(
		@RequestParam(required = false) String rsvtYmd
	) {
		String targetDate = normalizeDate(rsvtYmd);
		List<LearningReservationVO> reservations = learningReservationService
			.getLearningReservationExcelRows(null, null, targetDate, targetDate, null, null)
			.stream()
			.map(row -> row.getRsvtSn() == null ? row : learningReservationService.getLearningReservationById(row.getRsvtSn()))
			.toList();
		return ApiResponse.success("현장 운영 현황 조회 성공", reservations);
	}

	@GetMapping("/{rsvtSn}/bonus")
	public ApiResponse<List<String>> getOpenedBonusClasses(@PathVariable Integer rsvtSn) {
		return ApiResponse.success("보너스 개방 반 조회 성공", learningReservationService.getOpenedBonusClasses(rsvtSn));
	}

	@PostMapping("/{rsvtSn}/bonus")
	public ApiResponse<Void> openBonusStage(@PathVariable Integer rsvtSn, @RequestBody Map<String, String> request) {
		learningReservationService.openBonusStage(rsvtSn, request.get("clasNm"));
		return ApiResponse.success("보너스 스테이지 개방 성공", null);
	}

	@DeleteMapping("/{rsvtSn}/bonus/{clasNm}")
	public ApiResponse<Void> closeBonusStage(@PathVariable Integer rsvtSn, @PathVariable String clasNm) {
		learningReservationService.closeBonusStage(rsvtSn, clasNm);
		return ApiResponse.success("보너스 스테이지 개방 취소 성공", null);
	}

	private String normalizeDate(String value) {
		if (value == null || value.trim().isEmpty()) {
			return LocalDate.now().toString();
		}
		return value.trim();
	}
}

package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovLearningReservationService;
import egovframework.let.adm.service.vo.LearningReservationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

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

	private String normalizeDate(String value) {
		if (value == null || value.trim().isEmpty()) {
			return LocalDate.now().toString();
		}
		return value.trim();
	}
}

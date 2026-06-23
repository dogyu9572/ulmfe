package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovLearningReservationService;
import egovframework.let.adm.service.vo.LearningReservationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/learning-calendar")
@RequiredArgsConstructor
public class EgovLearningCalendarManageApiController {
	private final EgovLearningReservationService learningReservationService;

	@GetMapping
	public ApiResponse<List<LearningReservationVO>> getLearningCalendarReservations(
		@RequestParam(required = false) String startRsvtYmd,
		@RequestParam(required = false) String endRsvtYmd
	) {
		return ApiResponse.success(
			"예약 캘린더 조회 성공",
			learningReservationService.getLearningReservationExcelRows(null, null, startRsvtYmd, endRsvtYmd, null, null)
		);
	}
}

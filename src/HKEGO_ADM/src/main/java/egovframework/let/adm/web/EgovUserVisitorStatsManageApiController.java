package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovUserVisitorStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/user-visitor-stats")
@RequiredArgsConstructor
public class EgovUserVisitorStatsManageApiController {

	private final EgovUserVisitorStatsService userVisitorStatsService;

	@GetMapping("/summary")
	public ApiResponse<Map<String, Object>> summary(
			@RequestParam(required = false) String baseDate) {
		try {
			LocalDate ref = parseDate(baseDate, LocalDate.now());
			return ApiResponse.success("방문자 요약 조회 성공", userVisitorStatsService.getSummary(ref));
		} catch (IllegalArgumentException e) {
			return ApiResponse.error(e.getMessage());
		} catch (Exception e) {
			log.error("방문자 요약 조회 오류", e);
			return ApiResponse.error("방문자 요약 조회 중 오류가 발생했습니다.");
		}
	}

	@GetMapping("/yearly")
	public ApiResponse<List<Map<String, Object>>> yearly(
			@RequestParam int startYear,
			@RequestParam int endYear) {
		try {
			validateYearRange(startYear, endYear);
			return ApiResponse.success("연별 방문자 조회 성공", userVisitorStatsService.getYearlyStats(startYear, endYear));
		} catch (IllegalArgumentException e) {
			return ApiResponse.error(e.getMessage());
		} catch (Exception e) {
			log.error("연별 방문자 조회 오류", e);
			return ApiResponse.error("연별 방문자 조회 중 오류가 발생했습니다.");
		}
	}

	@GetMapping("/monthly")
	public ApiResponse<List<Map<String, Object>>> monthly(
			@RequestParam int startYear,
			@RequestParam int endYear) {
		try {
			validateYearRange(startYear, endYear);
			return ApiResponse.success("월별 방문자 조회 성공", userVisitorStatsService.getMonthlyStats(startYear, endYear));
		} catch (IllegalArgumentException e) {
			return ApiResponse.error(e.getMessage());
		} catch (Exception e) {
			log.error("월별 방문자 조회 오류", e);
			return ApiResponse.error("월별 방문자 조회 중 오류가 발생했습니다.");
		}
	}

	@GetMapping("/daily")
	public ApiResponse<List<Map<String, Object>>> daily(
			@RequestParam String startDate,
			@RequestParam String endDate) {
		try {
			LocalDate from = parseDateRequired(startDate, "시작일");
			LocalDate to = parseDateRequired(endDate, "종료일");
			if (from.isAfter(to)) {
				return ApiResponse.error("시작일이 종료일보다 늦을 수 없습니다.");
			}
			if (from.plusYears(2).isBefore(to)) {
				return ApiResponse.error("조회 기간은 최대 2년까지 가능합니다.");
			}
			return ApiResponse.success("일별 방문자 조회 성공", userVisitorStatsService.getDailyStats(from, to));
		} catch (IllegalArgumentException e) {
			return ApiResponse.error(e.getMessage());
		} catch (Exception e) {
			log.error("일별 방문자 조회 오류", e);
			return ApiResponse.error("일별 방문자 조회 중 오류가 발생했습니다.");
		}
	}

	@GetMapping("/hourly")
	public ApiResponse<List<Map<String, Object>>> hourly(
			@RequestParam String startDate,
			@RequestParam String endDate) {
		try {
			LocalDate from = parseDateRequired(startDate, "시작일");
			LocalDate to = parseDateRequired(endDate, "종료일");
			if (from.isAfter(to)) {
				return ApiResponse.error("시작일이 종료일보다 늦을 수 없습니다.");
			}
			if (from.plusMonths(3).isBefore(to)) {
				return ApiResponse.error("시간별 조회 기간은 최대 3개월까지 가능합니다.");
			}
			return ApiResponse.success("시간별 방문자 조회 성공", userVisitorStatsService.getHourlyStats(from, to));
		} catch (IllegalArgumentException e) {
			return ApiResponse.error(e.getMessage());
		} catch (Exception e) {
			log.error("시간별 방문자 조회 오류", e);
			return ApiResponse.error("시간별 방문자 조회 중 오류가 발생했습니다.");
		}
	}

	private LocalDate parseDate(String value, LocalDate defaultValue) {
		if (value == null || value.isBlank()) {
			return defaultValue;
		}
		return LocalDate.parse(value.trim());
	}

	private LocalDate parseDateRequired(String value, String label) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(label + "을(를) 입력하세요.");
		}
		return LocalDate.parse(value.trim());
	}

	private void validateYearRange(int startYear, int endYear) {
		int current = LocalDate.now().getYear();
		if (startYear < 2000 || endYear < 2000 || startYear > current + 1 || endYear > current + 1) {
			throw new IllegalArgumentException("연도 범위가 올바르지 않습니다.");
		}
		if (Math.abs(endYear - startYear) > 30) {
			throw new IllegalArgumentException("연도 범위는 최대 30년까지 조회할 수 있습니다.");
		}
	}
}

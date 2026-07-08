package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Date;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class EgovDashboardManageApiController {
	private final JdbcTemplate jdbcTemplate;

	@GetMapping
	public ApiResponse<Map<String, Object>> summary() {
		Map<String, Object> data = new HashMap<>();
		data.put("adminCount", queryForCount("SELECT COUNT(*) FROM ADMIN_MST"));
		data.put("activeAdminCount", queryForCount("SELECT COUNT(*) FROM ADMIN_MST WHERE ACNT_STTS_CD = 'ACTIVE'"));
		data.put("boardCount", queryForCount("SELECT COUNT(*) FROM BBS_ARTICLE"));
		data.put("memberTotalCount", queryForCount("SELECT COUNT(*) FROM USER_MST WHERE DEL_DT IS NULL"));
		data.put("memberTypeCounts", buildMemberTypeCounts());
		return ApiResponse.success("대시보드 요약", data);
	}

	private List<Map<String, Object>> buildMemberTypeCounts() {
		List<Map<String, Object>> rows = jdbcTemplate.queryForList(
			"SELECT C.CD_DTL_ID AS usrGb, C.CD_DTL_NM AS codeName, C.SORT_SEQ AS seq, COUNT(U.USER_SN) AS memberCount "
				+ "FROM CMMN_CD_DTL C "
				+ "LEFT JOIN USER_MST U ON U.USER_SE_CD = C.CD_DTL_ID AND U.DEL_DT IS NULL "
				+ "WHERE C.CD_ID = 'COM010' AND C.USE_YN = 'Y' "
				+ "GROUP BY C.CD_DTL_ID, C.CD_DTL_NM, C.SORT_SEQ "
				+ "ORDER BY C.SORT_SEQ ASC, C.CD_DTL_ID ASC"
		);

		List<Map<String, Object>> out = new ArrayList<>();
		for (Map<String, Object> row : rows) {
			Map<String, Object> item = new HashMap<>();
			item.put("usrGb", row.get("usrGb"));
			item.put("codeName", row.get("codeName"));
			item.put("memberCount", toLong(row.get("memberCount")));
			out.add(item);
		}
		return out;
	}

	@GetMapping("/visitor-stats")
	public ApiResponse<Map<String, Object>> visitorStats(
		@RequestParam(value = "days", required = false, defaultValue = "20") Integer days) {
		int period = (days == null || days < 1) ? 20 : Math.min(days, 90);
		LocalDate fromDate = LocalDate.now().minusDays(period - 1L);
		LocalDate toDate = LocalDate.now();

		List<Map<String, Object>> rows = jdbcTemplate.queryForList(
			"SELECT DATE(REG_DT) AS visitDate, COUNT(*) AS visitCount, COUNT(DISTINCT IP_ADDR) AS uniqueVisitorCount " +
				"FROM USER_ACCESS_LOG " +
				"WHERE CNTN_TYPE_CD = 'MAIN' " +
				"AND DATE(REG_DT) BETWEEN ? AND ? " +
				"GROUP BY DATE(REG_DT) " +
				"ORDER BY DATE(REG_DT) ASC",
			Date.valueOf(fromDate),
			Date.valueOf(toDate)
		);

		Map<String, Map<String, Object>> byDate = new HashMap<>();
		for (Map<String, Object> row : rows) {
			Object dateObj = row.get("visitDate");
			if (dateObj != null) {
				byDate.put(String.valueOf(dateObj), row);
			}
		}

		List<Map<String, Object>> dailyStats = new java.util.ArrayList<>();
		for (int i = 0; i < period; i++) {
			LocalDate d = fromDate.plusDays(i);
			String key = d.toString();
			Map<String, Object> found = byDate.get(key);
			Map<String, Object> item = new HashMap<>();
			item.put("visitDate", key);
			item.put("visitCount", found != null ? toLong(found.get("visitCount")) : 0L);
			item.put("uniqueVisitorCount", found != null ? toLong(found.get("uniqueVisitorCount")) : 0L);
			dailyStats.add(item);
		}

		Map<String, Object> data = new HashMap<>();
		data.put("days", period);
		data.put("todayVisitCount", dailyStats.isEmpty() ? 0L : dailyStats.get(dailyStats.size() - 1).get("visitCount"));
		data.put("todayUniqueVisitorCount", dailyStats.isEmpty() ? 0L : dailyStats.get(dailyStats.size() - 1).get("uniqueVisitorCount"));
		data.put("dailyStats", dailyStats);
		return ApiResponse.success("방문자 통계를 조회했습니다.", data);
	}

	/**
	 * 대시보드 요약 차트: 이전년·금년 월별 순방문자(일 IP 기준 고유), 최근 8주 주간 순방문자
	 */
	@GetMapping("/visitor-summary-charts")
	public ApiResponse<Map<String, Object>> visitorSummaryCharts() {
		int currentYear = LocalDate.now().getYear();
		int prevYear = currentYear - 1;

		Map<String, Object> data = new HashMap<>();
		data.put("prevYear", prevYear);
		data.put("prevYearMonthly", buildMonthlyUniqueVisitors(prevYear));
		data.put("currentYear", currentYear);
		data.put("currentYearMonthly", buildMonthlyUniqueVisitors(currentYear));
		data.put("weeklyLast8", buildWeeklyUniqueVisitorsLast8());
		return ApiResponse.success("방문자 요약 차트를 조회했습니다.", data);
	}

	private List<Map<String, Object>> buildMonthlyUniqueVisitors(int year) {
		List<Map<String, Object>> rows = jdbcTemplate.queryForList(
			"SELECT MONTH(REG_DT) AS m, COUNT(DISTINCT IP_ADDR) AS uniqueVisitorCount "
				+ "FROM USER_ACCESS_LOG WHERE CNTN_TYPE_CD = 'MAIN' AND YEAR(REG_DT) = ? "
				+ "GROUP BY MONTH(REG_DT) ORDER BY MONTH(REG_DT)",
			year
		);
		Map<Integer, Long> byMonth = new HashMap<>();
		for (Map<String, Object> row : rows) {
			Object mo = row.get("m");
			if (mo != null) {
				int m = ((Number) mo).intValue();
				byMonth.put(m, toLong(row.get("uniqueVisitorCount")));
			}
		}
		List<Map<String, Object>> out = new ArrayList<>();
		for (int m = 1; m <= 12; m++) {
			Map<String, Object> item = new HashMap<>();
			item.put("month", m);
			item.put("label", m + "월");
			item.put("uniqueVisitorCount", byMonth.getOrDefault(m, 0L));
			out.add(item);
		}
		return out;
	}

	private List<Map<String, Object>> buildWeeklyUniqueVisitorsLast8() {
		LocalDate today = LocalDate.now();
		LocalDate mondayThisWeek = today.with(DayOfWeek.MONDAY);
		List<Map<String, Object>> out = new ArrayList<>();
		for (int i = 7; i >= 0; i--) {
			LocalDate weekStart = mondayThisWeek.minusWeeks(i);
			LocalDate weekEndExclusive = weekStart.plusWeeks(1);
			Long cnt = jdbcTemplate.queryForObject(
				"SELECT COUNT(DISTINCT IP_ADDR) FROM USER_ACCESS_LOG WHERE CNTN_TYPE_CD = 'MAIN' "
					+ "AND REG_DT >= ? AND REG_DT < ?",
				Long.class,
				Timestamp.valueOf(weekStart.atStartOfDay()),
				Timestamp.valueOf(weekEndExclusive.atStartOfDay())
			);
			long v = cnt != null ? cnt : 0L;
			Map<String, Object> item = new HashMap<>();
			item.put("weekStart", weekStart.toString());
			item.put("label", weekStart.getMonthValue() + "/" + weekStart.getDayOfMonth());
			item.put("uniqueVisitorCount", v);
			out.add(item);
		}
		return out;
	}

	private long queryForCount(String sql) {
		Long v = jdbcTemplate.queryForObject(sql, Long.class);
		return v != null ? v : 0L;
	}

	private long toLong(Object value) {
		if (value == null) return 0L;
		if (value instanceof Number n) return n.longValue();
		try {
			return Long.parseLong(String.valueOf(value));
		} catch (Exception e) {
			return 0L;
		}
	}
}

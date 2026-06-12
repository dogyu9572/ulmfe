package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovUserVisitorStatsService;

import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("egovUserVisitorStatsService")
public class EgovUserVisitorStatsServiceImpl extends EgovAbstractServiceImpl implements EgovUserVisitorStatsService {

	private static final String MAIN_ACCESS = "MAIN";

	@Resource(name = "jdbcTemplate")
	private JdbcTemplate jdbcTemplate;

	public Map<String, Object> getSummary(LocalDate baseDate) {
		LocalDate ref = baseDate != null ? baseDate : LocalDate.now();
		LocalDate yesterday = ref.minusDays(1);

		long totalCount = countMainAccess(null, null);
		long yesterdayCount = countMainAccessOnDate(yesterday);
		long todayCount = countMainAccessOnDate(ref);

		Map<String, Object> peak = findPeakDayUpTo(ref);
		String peakDate = peak != null ? String.valueOf(peak.get("visitDate")) : null;
		long peakCount = peak != null ? toLong(peak.get("visitCount")) : 0L;

		Map<String, Object> data = new HashMap<>();
		data.put("baseDate", ref.toString());
		data.put("totalVisitCount", totalCount);
		data.put("yesterdayDate", yesterday.toString());
		data.put("yesterdayVisitCount", yesterdayCount);
		data.put("todayDate", ref.toString());
		data.put("todayVisitCount", todayCount);
		data.put("peakDate", peakDate);
		data.put("peakVisitCount", peakCount);
		return data;
	}

	public List<Map<String, Object>> getYearlyStats(int startYear, int endYear) {
		int from = Math.min(startYear, endYear);
		int to = Math.max(startYear, endYear);
		List<Map<String, Object>> rows = jdbcTemplate.queryForList(
			"SELECT YEAR(REG_DT) AS y, COUNT(*) AS visitCount "
				+ "FROM USER_ACCESS_LOG "
				+ "WHERE CNTN_TYPE_CD = ? AND YEAR(REG_DT) BETWEEN ? AND ? "
				+ "GROUP BY YEAR(REG_DT) ORDER BY YEAR(REG_DT) ASC",
			MAIN_ACCESS, from, to
		);
		Map<Integer, Long> byYear = new HashMap<>();
		for (Map<String, Object> row : rows) {
			Object y = row.get("y");
			if (y != null) {
				byYear.put(((Number) y).intValue(), toLong(row.get("visitCount")));
			}
		}
		List<Map<String, Object>> out = new ArrayList<>();
		for (int y = from; y <= to; y++) {
			Map<String, Object> item = new HashMap<>();
			item.put("year", y);
			item.put("label", y + "년");
			item.put("visitCount", byYear.getOrDefault(y, 0L));
			out.add(item);
		}
		return out;
	}

	public List<Map<String, Object>> getMonthlyStats(int startYear, int endYear) {
		int fromY = Math.min(startYear, endYear);
		int toY = Math.max(startYear, endYear);
		YearMonth from = YearMonth.of(fromY, 1);
		YearMonth to = YearMonth.of(toY, 12);

		List<Map<String, Object>> rows = jdbcTemplate.queryForList(
			"SELECT YEAR(REG_DT) AS y, MONTH(REG_DT) AS m, COUNT(*) AS visitCount "
				+ "FROM USER_ACCESS_LOG "
				+ "WHERE CNTN_TYPE_CD = ? "
				+ "AND DATE(REG_DT) >= ? AND DATE(REG_DT) <= ? "
				+ "GROUP BY YEAR(REG_DT), MONTH(REG_DT) "
				+ "ORDER BY YEAR(REG_DT) ASC, MONTH(REG_DT) ASC",
			MAIN_ACCESS,
			Date.valueOf(from.atDay(1)),
			Date.valueOf(to.atEndOfMonth())
		);

		Map<String, Long> byYm = new HashMap<>();
		for (Map<String, Object> row : rows) {
			int y = ((Number) row.get("y")).intValue();
			int m = ((Number) row.get("m")).intValue();
			byYm.put(ymKey(y, m), toLong(row.get("visitCount")));
		}

		List<Map<String, Object>> out = new ArrayList<>();
		for (YearMonth ym = from; !ym.isAfter(to); ym = ym.plusMonths(1)) {
			Map<String, Object> item = new HashMap<>();
			item.put("year", ym.getYear());
			item.put("month", ym.getMonthValue());
			item.put("label", ym.getYear() + "-" + String.format("%02d", ym.getMonthValue()));
			item.put("visitCount", byYm.getOrDefault(ymKey(ym.getYear(), ym.getMonthValue()), 0L));
			out.add(item);
		}
		return out;
	}

	public List<Map<String, Object>> getDailyStats(LocalDate startDate, LocalDate endDate) {
		LocalDate from = startDate.isBefore(endDate) ? startDate : endDate;
		LocalDate to = startDate.isBefore(endDate) ? endDate : startDate;

		List<Map<String, Object>> rows = jdbcTemplate.queryForList(
			"SELECT DATE(REG_DT) AS visitDate, COUNT(*) AS visitCount "
				+ "FROM USER_ACCESS_LOG "
				+ "WHERE CNTN_TYPE_CD = ? AND DATE(REG_DT) BETWEEN ? AND ? "
				+ "GROUP BY DATE(REG_DT) ORDER BY DATE(REG_DT) ASC",
			MAIN_ACCESS, Date.valueOf(from), Date.valueOf(to)
		);

		Map<String, Long> byDate = new HashMap<>();
		for (Map<String, Object> row : rows) {
			Object d = row.get("visitDate");
			if (d != null) {
				byDate.put(String.valueOf(d), toLong(row.get("visitCount")));
			}
		}

		List<Map<String, Object>> out = new ArrayList<>();
		for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
			String key = d.toString();
			Map<String, Object> item = new HashMap<>();
			item.put("visitDate", key);
			item.put("label", key);
			item.put("visitCount", byDate.getOrDefault(key, 0L));
			out.add(item);
		}
		return out;
	}

	public List<Map<String, Object>> getHourlyStats(LocalDate startDate, LocalDate endDate) {
		LocalDate from = startDate.isBefore(endDate) ? startDate : endDate;
		LocalDate to = startDate.isBefore(endDate) ? endDate : startDate;

		List<Map<String, Object>> rows = jdbcTemplate.queryForList(
			"SELECT HOUR(REG_DT) AS h, COUNT(*) AS visitCount "
				+ "FROM USER_ACCESS_LOG "
				+ "WHERE CNTN_TYPE_CD = ? AND DATE(REG_DT) BETWEEN ? AND ? "
				+ "GROUP BY HOUR(REG_DT) ORDER BY HOUR(REG_DT) ASC",
			MAIN_ACCESS, Date.valueOf(from), Date.valueOf(to)
		);

		Map<Integer, Long> byHour = new HashMap<>();
		for (Map<String, Object> row : rows) {
			Object h = row.get("h");
			if (h != null) {
				byHour.put(((Number) h).intValue(), toLong(row.get("visitCount")));
			}
		}

		List<Map<String, Object>> out = new ArrayList<>();
		for (int hour = 0; hour < 24; hour++) {
			Map<String, Object> item = new HashMap<>();
			item.put("hour", hour);
			item.put("label", String.format("%02d시", hour));
			item.put("visitCount", byHour.getOrDefault(hour, 0L));
			out.add(item);
		}
		return out;
	}

	private long countMainAccess(LocalDate from, LocalDate to) {
		if (from == null && to == null) {
			Long v = jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM USER_ACCESS_LOG WHERE CNTN_TYPE_CD = ?",
				Long.class,
				MAIN_ACCESS
			);
			return v != null ? v : 0L;
		}
		Long v = jdbcTemplate.queryForObject(
			"SELECT COUNT(*) FROM USER_ACCESS_LOG WHERE CNTN_TYPE_CD = ? AND DATE(REG_DT) BETWEEN ? AND ?",
			Long.class,
			MAIN_ACCESS,
			Date.valueOf(from),
			Date.valueOf(to)
		);
		return v != null ? v : 0L;
	}

	private long countMainAccessOnDate(LocalDate date) {
		Long v = jdbcTemplate.queryForObject(
			"SELECT COUNT(*) FROM USER_ACCESS_LOG WHERE CNTN_TYPE_CD = ? AND DATE(REG_DT) = ?",
			Long.class,
			MAIN_ACCESS,
			Date.valueOf(date)
		);
		return v != null ? v : 0L;
	}

	private Map<String, Object> findPeakDayUpTo(LocalDate ref) {
		List<Map<String, Object>> rows = jdbcTemplate.queryForList(
			"SELECT DATE(REG_DT) AS visitDate, COUNT(*) AS visitCount "
				+ "FROM USER_ACCESS_LOG "
				+ "WHERE CNTN_TYPE_CD = ? AND DATE(REG_DT) <= ? "
				+ "GROUP BY DATE(REG_DT) "
				+ "ORDER BY visitCount DESC, visitDate DESC "
				+ "LIMIT 1",
			MAIN_ACCESS,
			Date.valueOf(ref)
		);
		if (rows.isEmpty()) {
			return null;
		}
		Map<String, Object> row = rows.get(0);
		Map<String, Object> out = new HashMap<>();
		Object d = row.get("visitDate");
		out.put("visitDate", d != null ? String.valueOf(d) : null);
		out.put("visitCount", toLong(row.get("visitCount")));
		return out;
	}

	private static String ymKey(int year, int month) {
		return year + "-" + month;
	}

	private long toLong(Object value) {
		if (value == null) {
			return 0L;
		}
		if (value instanceof Number n) {
			return n.longValue();
		}
		try {
			return Long.parseLong(String.valueOf(value));
		} catch (Exception e) {
			return 0L;
		}
	}
}

package egovframework.let.adm.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface EgovUserVisitorStatsService {
	Map<String, Object> getSummary(LocalDate baseDate);
	List<Map<String, Object>> getYearlyStats(int startYear, int endYear);
	List<Map<String, Object>> getMonthlyStats(int startYear, int endYear);
	List<Map<String, Object>> getDailyStats(LocalDate startDate, LocalDate endDate);
	List<Map<String, Object>> getHourlyStats(LocalDate startDate, LocalDate endDate);
}

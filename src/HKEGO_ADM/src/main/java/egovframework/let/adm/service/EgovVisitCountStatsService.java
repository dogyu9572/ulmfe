package egovframework.let.adm.service;

import java.util.Map;

public interface EgovVisitCountStatsService {
	Map<String, Object> getVisitCountStats(String startDate, String endDate);
}

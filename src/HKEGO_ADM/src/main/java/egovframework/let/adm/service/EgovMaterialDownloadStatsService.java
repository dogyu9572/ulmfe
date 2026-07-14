package egovframework.let.adm.service;

import java.util.List;
import java.util.Map;

import egovframework.let.adm.service.vo.MaterialDownloadStatsVO;

public interface EgovMaterialDownloadStatsService {
	Map<String, Object> getMaterialDownloadStats(
		String lrnTypeCd, String dataTypeCd, String startDate, String endDate,
		String searchType, String keyword, int page, int size
	);

	List<MaterialDownloadStatsVO> getMaterialDownloadStatsExcelRows(
		String lrnTypeCd, String dataTypeCd, String startDate, String endDate,
		String searchType, String keyword
	);
}

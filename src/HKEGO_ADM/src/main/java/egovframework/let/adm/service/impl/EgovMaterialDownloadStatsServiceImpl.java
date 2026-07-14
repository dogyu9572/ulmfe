package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import egovframework.let.adm.service.EgovMaterialDownloadStatsService;
import egovframework.let.adm.service.vo.MaterialDownloadStatsVO;
import jakarta.annotation.Resource;

@Service("egovMaterialDownloadStatsService")
public class EgovMaterialDownloadStatsServiceImpl extends EgovAbstractServiceImpl implements EgovMaterialDownloadStatsService {
	@Resource(name = "materialDownloadStatsDAO")
	private MaterialDownloadStatsDAO materialDownloadStatsDAO;

	@Override
	public Map<String, Object> getMaterialDownloadStats(
		String lrnTypeCd, String dataTypeCd, String startDate, String endDate,
		String searchType, String keyword, int page, int size
	) {
		int safePage = Math.max(page, 1);
		int safeSize = Math.min(Math.max(size, 1), 100);
		int offset = (safePage - 1) * safeSize;
		List<MaterialDownloadStatsVO> list = materialDownloadStatsDAO.selectList(
			lrnTypeCd, dataTypeCd, startDate, endDate, searchType, keyword, offset, safeSize
		);
		int count = materialDownloadStatsDAO.selectCount(lrnTypeCd, dataTypeCd, startDate, endDate, searchType, keyword);
		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("count", count);
		result.put("page", safePage);
		result.put("size", safeSize);
		return result;
	}

	@Override
	public List<MaterialDownloadStatsVO> getMaterialDownloadStatsExcelRows(
		String lrnTypeCd, String dataTypeCd, String startDate, String endDate,
		String searchType, String keyword
	) {
		return materialDownloadStatsDAO.selectExcelList(lrnTypeCd, dataTypeCd, startDate, endDate, searchType, keyword);
	}
}

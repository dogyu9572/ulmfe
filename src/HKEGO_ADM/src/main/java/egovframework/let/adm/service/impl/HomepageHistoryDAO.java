package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.HomepageHistoryVO;

@Repository("homepageHistoryDAO")
public class HomepageHistoryDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.HomepageHistoryDAO.";

	public List<HomepageHistoryVO> selectHistoryList(String searchKeyword, String useYn, int offset, int size) {
		Map<String, Object> param = new HashMap<>();
		param.put("searchKeyword", searchKeyword);
		param.put("useYn", useYn);
		param.put("offset", offset);
		param.put("size", size);
		return selectList(NS + "selectHistoryList", param);
	}

	public int selectHistoryCount(String searchKeyword, String useYn) {
		Map<String, Object> param = new HashMap<>();
		param.put("searchKeyword", searchKeyword);
		param.put("useYn", useYn);
		Integer count = selectOne(NS + "selectHistoryCount", param);
		return count == null ? 0 : count;
	}

	public HomepageHistoryVO selectHistory(Integer hstrySn) {
		return selectOne(NS + "selectHistory", hstrySn);
	}

	public int insertHistory(HomepageHistoryVO history) {
		return insert(NS + "insertHistory", history);
	}

	public int updateHistory(HomepageHistoryVO history) {
		return update(NS + "updateHistory", history);
	}

	public int deleteHistory(Integer hstrySn, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("hstrySn", hstrySn);
		param.put("deltr", deltr);
		return update(NS + "deleteHistory", param);
	}

	public int deleteHistories(List<Integer> hstrySns, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("hstrySns", hstrySns);
		param.put("deltr", deltr);
		return update(NS + "deleteHistories", param);
	}
}

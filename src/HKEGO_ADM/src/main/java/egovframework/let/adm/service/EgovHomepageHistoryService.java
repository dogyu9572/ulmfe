package egovframework.let.adm.service;

import java.util.Map;

import egovframework.let.adm.service.vo.HomepageHistoryVO;

public interface EgovHomepageHistoryService {
	Map<String, Object> getHistoryList(String searchKeyword, String useYn, int page, int size);
	HomepageHistoryVO getHistory(Integer hstrySn);
	HomepageHistoryVO saveHistory(HomepageHistoryVO history);
	void deleteHistory(Integer hstrySn, String deltr);
	void deleteHistories(java.util.List<Integer> hstrySns, String deltr);
}

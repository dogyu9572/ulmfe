package egovframework.let.adm.service;

import java.util.Map;

import egovframework.let.adm.service.vo.BbsMasterVO;

public interface EgovBbsMasterService {
	Map<String, Object> getBbsMasterListPage(int page, int size);
	BbsMasterVO getBbsMasterById(String bbsId);
	BbsMasterVO createBbsMaster(BbsMasterVO bbsMaster, String adminId);
	BbsMasterVO updateBbsMaster(BbsMasterVO bbsMaster, String adminId);
	void deleteBbsMaster(String bbsId);
	Map<String, Object> getActiveBbsMasterListPage(int page, int size);
}

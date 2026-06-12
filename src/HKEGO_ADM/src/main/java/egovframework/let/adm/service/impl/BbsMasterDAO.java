package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.BbsMasterVO;

@Repository("bbsMasterDAO")
public class BbsMasterDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.BbsMasterDAO.";

	public int countBbsMasterList() {
		Integer count = selectOne(NS + "countBbsMasterList");
		return count == null ? 0 : count;
	}

	public List<BbsMasterVO> selectBbsMasterList(int offset, int limit) {
		Map<String, Object> param = new HashMap<>();
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectBbsMasterList", param);
	}

	public BbsMasterVO selectBbsMasterById(String bbsId) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		return selectOne(NS + "selectBbsMasterById", param);
	}

	public int insertBbsMaster(BbsMasterVO bbsMaster) {
		return insert(NS + "insertBbsMaster", bbsMaster);
	}

	public int updateBbsMaster(BbsMasterVO bbsMaster) {
		return update(NS + "updateBbsMaster", bbsMaster);
	}

	public int deleteBbsMaster(String bbsId) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		return delete(NS + "deleteBbsMaster", param);
	}

	public int checkBbsIdExists(String bbsId) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		Integer count = selectOne(NS + "checkBbsIdExists", param);
		return count == null ? 0 : count;
	}

	public int countActiveBbsMasterList() {
		Integer count = selectOne(NS + "countActiveBbsMasterList");
		return count == null ? 0 : count;
	}

	public List<BbsMasterVO> selectActiveBbsMasterList(int offset, int limit) {
		Map<String, Object> param = new HashMap<>();
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectActiveBbsMasterList", param);
	}
}

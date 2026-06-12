package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.BbsPostVO;

@Repository("bbsPostDAO")
public class BbsPostDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.BbsPostDAO.";

	public List<BbsPostVO> selectBbsPostListForAdmin(String bbsId, int offset, int limit) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectBbsPostListForAdmin", param);
	}

	public int selectBbsPostCountForAdmin(String bbsId) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		Integer count = selectOne(NS + "selectBbsPostCountForAdmin", param);
		return count == null ? 0 : count;
	}

	public List<BbsPostVO> selectBbsPostListForAdminSearch(
		String bbsId, String searchType, String searchKeyword, String ctgrCd,
		String startDate, String endDate, int offset, int limit
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("ctgrCd", ctgrCd);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectBbsPostListForAdminSearch", param);
	}

	public int selectBbsPostCountForAdminSearch(
		String bbsId, String searchType, String searchKeyword, String ctgrCd,
		String startDate, String endDate
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("ctgrCd", ctgrCd);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		Integer count = selectOne(NS + "selectBbsPostCountForAdminSearch", param);
		return count == null ? 0 : count;
	}

	public BbsPostVO selectBbsPostById(String bbsId, String pstSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		param.put("pstSn", pstSn);
		return selectOne(NS + "selectBbsPostById", param);
	}

	public int insertBbsPost(BbsPostVO bbsPost) {
		return insert(NS + "insertBbsPost", bbsPost);
	}

	public int updateBbsPost(BbsPostVO bbsPost) {
		return update(NS + "updateBbsPost", bbsPost);
	}

	public int deleteBbsPost(String bbsId, String pstSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		param.put("pstSn", pstSn);
		return delete(NS + "deleteBbsPost", param);
	}

	public int updateViewCount(String bbsId, String pstSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		param.put("pstSn", pstSn);
		return update(NS + "updateViewCount", param);
	}

	public int checkPostIdExists(String bbsId, String pstSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bbsId", bbsId);
		param.put("pstSn", pstSn);
		Integer count = selectOne(NS + "checkPostIdExists", param);
		return count == null ? 0 : count;
	}
}

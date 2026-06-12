package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.BannerVO;

@Repository("bannerDAO")
public class BannerDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.BannerDAO.";

	public int countBannerList(
		String useYn, String startPublishDate, String endPublishDate,
		String startRegDate, String endRegDate, String searchType, String searchKeyword
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("useYn", useYn);
		param.put("startPublishDate", startPublishDate);
		param.put("endPublishDate", endPublishDate);
		param.put("startRegDate", startRegDate);
		param.put("endRegDate", endRegDate);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		Integer count = selectOne(NS + "countBannerList", param);
		return count == null ? 0 : count;
	}

	public List<BannerVO> selectBannerList(
		String useYn, String startPublishDate, String endPublishDate,
		String startRegDate, String endRegDate, String searchType, String searchKeyword,
		int offset, int limit
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("useYn", useYn);
		param.put("startPublishDate", startPublishDate);
		param.put("endPublishDate", endPublishDate);
		param.put("startRegDate", startRegDate);
		param.put("endRegDate", endRegDate);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectBannerList", param);
	}

	public BannerVO findById(Integer bnrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bnrSn", bnrSn);
		return selectOne(NS + "findById", param);
	}

	public int insert(BannerVO banner) {
		return insert(NS + "insert", banner);
	}

	public int update(BannerVO banner) {
		return update(NS + "update", banner);
	}

	public int delete(Integer bnrSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("bnrSn", bnrSn);
		return update(NS + "delete", param);
	}

	public int updateSeq(Integer bnrSn, Integer sortSeq) {
		Map<String, Object> param = new HashMap<>();
		param.put("bnrSn", bnrSn);
		param.put("sortSeq", sortSeq);
		return update(NS + "updateSeq", param);
	}
}

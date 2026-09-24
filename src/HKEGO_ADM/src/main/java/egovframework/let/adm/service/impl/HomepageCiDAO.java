package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.HomepageCiVO;

@Repository("homepageCiDAO")
public class HomepageCiDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.HomepageCiDAO.";

	public List<HomepageCiVO> selectCiList(String ciSeCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("ciSeCd", ciSeCd);
		return selectList(NS + "selectCiList", param);
	}

	public HomepageCiVO selectCi(Integer ciSn) {
		return selectOne(NS + "selectCi", ciSn);
	}

	public int insertCi(HomepageCiVO ci) {
		return insert(NS + "insertCi", ci);
	}

	public int updateCi(HomepageCiVO ci) {
		return update(NS + "updateCi", ci);
	}

	public int deleteCi(Integer ciSn, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("ciSn", ciSn);
		param.put("deltr", deltr);
		return update(NS + "deleteCi", param);
	}

	public int updateCiSeq(Integer ciSn, Integer sortSeq, String mdtr) {
		Map<String, Object> param = new HashMap<>();
		param.put("ciSn", ciSn);
		param.put("sortSeq", sortSeq);
		param.put("mdtr", mdtr);
		return update(NS + "updateCiSeq", param);
	}

	/** 심벌마크처럼 한 건만 노출해야 하는 구분에서 나머지 행의 사용 여부를 내린다. */
	public int clearOtherUseYn(String ciSeCd, Integer keepCiSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("ciSeCd", ciSeCd);
		param.put("keepCiSn", keepCiSn);
		return update(NS + "clearOtherUseYn", param);
	}

	public Integer selectNextSortSeq(String ciSeCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("ciSeCd", ciSeCd);
		return selectOne(NS + "selectNextSortSeq", param);
	}
}

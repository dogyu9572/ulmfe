package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.HomepageOrgChartVO;

@Repository("homepageOrgChartDAO")
public class HomepageOrgChartDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.HomepageOrgChartDAO.";

	public List<HomepageOrgChartVO> selectMemberList(String frstClsfCd, String scndClsfCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("frstClsfCd", frstClsfCd);
		param.put("scndClsfCd", scndClsfCd);
		return selectList(NS + "selectMemberList", param);
	}

	public HomepageOrgChartVO selectMember(Integer orgMbrSn) {
		return selectOne(NS + "selectMember", orgMbrSn);
	}

	public int insertMember(HomepageOrgChartVO member) {
		return insert(NS + "insertMember", member);
	}

	public int updateMember(HomepageOrgChartVO member) {
		return update(NS + "updateMember", member);
	}

	public int deleteMember(Integer orgMbrSn, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("orgMbrSn", orgMbrSn);
		param.put("deltr", deltr);
		return update(NS + "deleteMember", param);
	}
}

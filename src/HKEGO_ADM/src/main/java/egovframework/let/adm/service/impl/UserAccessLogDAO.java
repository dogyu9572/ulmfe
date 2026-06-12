package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.UserAccessLogVO;

@Repository("userAccessLogDAO")
public class UserAccessLogDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.UserAccessLogDAO.";

	public List<UserAccessLogVO> selectList(
		String userId, String userNm, String ipAddr, String cntnTypeCd,
		String startDate, String endDate, int offset, int limit
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("userId", userId);
		param.put("userNm", userNm);
		param.put("ipAddr", ipAddr);
		param.put("cntnTypeCd", cntnTypeCd);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		param.put("offset", offset);
		param.put("size", limit);
		return selectList(NS + "selectList", param);
	}

	public int selectCount(
		String userId, String userNm, String ipAddr, String cntnTypeCd,
		String startDate, String endDate
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("userId", userId);
		param.put("userNm", userNm);
		param.put("ipAddr", ipAddr);
		param.put("cntnTypeCd", cntnTypeCd);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		Integer count = selectOne(NS + "selectCount", param);
		return count == null ? 0 : count;
	}
}

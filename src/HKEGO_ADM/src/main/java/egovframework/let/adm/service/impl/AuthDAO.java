package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.AuthGroupVO;
import egovframework.let.adm.service.vo.AuthInfoVO;

@Repository("authDAO")
public class AuthDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.AuthDAO.";

	public int countAuthGroupList(String useYn) {
		Map<String, Object> param = new HashMap<>();
		param.put("useYn", useYn);
		Integer count = selectOne(NS + "countAuthGroupList", param);
		return count == null ? 0 : count;
	}

	public List<AuthGroupVO> selectAuthGroupList(String useYn, int offset, int limit) {
		Map<String, Object> param = new HashMap<>();
		param.put("useYn", useYn);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectAuthGroupList", param);
	}

	public AuthGroupVO selectAuthGroup(String authrtCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("authrtCd", authrtCd);
		return selectOne(NS + "selectAuthGroup", param);
	}

	public int insertAuthGroup(AuthGroupVO authGroup) {
		return insert(NS + "insertAuthGroup", authGroup);
	}

	public int updateAuthGroup(AuthGroupVO authGroup) {
		return update(NS + "updateAuthGroup", authGroup);
	}

	public int deleteAuthGroup(String authrtCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("authrtCd", authrtCd);
		return delete(NS + "deleteAuthGroup", param);
	}

	public int countUsersByAuthGroup(String authrtCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("authId", authrtCd);
		Integer count = selectOne(NS + "countUsersByAuthGroup", param);
		return count == null ? 0 : count;
	}

	public List<AuthInfoVO> selectAuthInfoList(String authrtCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("authrtCd", authrtCd);
		return selectList(NS + "selectAuthInfoList", param);
	}

	public int insertAuthInfo(AuthInfoVO authInfo) {
		return insert(NS + "insertAuthInfo", authInfo);
	}

	public int deleteAllAuthInfo(String authrtCd) {
		Map<String, Object> param = new HashMap<>();
		param.put("authrtCd", authrtCd);
		return delete(NS + "deleteAllAuthInfo", param);
	}
}

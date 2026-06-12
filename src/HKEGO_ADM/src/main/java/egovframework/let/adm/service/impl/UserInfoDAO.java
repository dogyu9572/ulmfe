package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.UserInfoVO;

@Repository("userInfoDAO")
public class UserInfoDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.UserInfoDAO.";

	public List<UserInfoVO> selectUserList(
		String userSeCd, String authrtCd, String mmplSttsCd, String startDate, String endDate,
		String searchType, String searchKeyword, String encryptedKeyword, int offset, int pageSize
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("userSeCd", userSeCd);
		param.put("authrtCd", authrtCd);
		param.put("mmplSttsCd", mmplSttsCd);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("encryptedKeyword", encryptedKeyword);
		param.put("offset", offset);
		param.put("pageSize", pageSize);
		return selectList(NS + "selectUserList", param);
	}

	public int selectUserListCount(
		String userSeCd, String authrtCd, String mmplSttsCd, String startDate, String endDate,
		String searchType, String searchKeyword, String encryptedKeyword
	) {
		Map<String, Object> param = new HashMap<>();
		param.put("userSeCd", userSeCd);
		param.put("authrtCd", authrtCd);
		param.put("mmplSttsCd", mmplSttsCd);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		param.put("searchType", searchType);
		param.put("searchKeyword", searchKeyword);
		param.put("encryptedKeyword", encryptedKeyword);
		Integer count = selectOne(NS + "selectUserListCount", param);
		return count == null ? 0 : count;
	}

	public UserInfoVO selectUser(Integer userSn) {
		Map<String, Object> param = new HashMap<>();
		param.put("userSn", userSn);
		return selectOne(NS + "selectUser", param);
	}

	public UserInfoVO selectUserById(String userId) {
		Map<String, Object> param = new HashMap<>();
		param.put("userId", userId);
		return selectOne(NS + "selectUserById", param);
	}

	public int insertUser(UserInfoVO userInfo) {
		return insert(NS + "insertUser", userInfo);
	}

	public int updateUser(UserInfoVO userInfo) {
		return update(NS + "updateUser", userInfo);
	}

	public int updateUserStatus(Integer userSn, String mmplSttsCd, String mdtr) {
		Map<String, Object> param = new HashMap<>();
		param.put("userSn", userSn);
		param.put("mmplSttsCd", mmplSttsCd);
		param.put("mdtr", mdtr);
		return update(NS + "updateUserStatus", param);
	}

	public int updatePassword(Integer userSn, String enpswd, String mdtr) {
		Map<String, Object> param = new HashMap<>();
		param.put("userSn", userSn);
		param.put("enpswd", enpswd);
		param.put("mdtr", mdtr);
		return update(NS + "updatePassword", param);
	}

	public int withdrawUser(Integer userSn, String deltr) {
		Map<String, Object> param = new HashMap<>();
		param.put("userSn", userSn);
		param.put("deltr", deltr);
		return update(NS + "withdrawUser", param);
	}
}

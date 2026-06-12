package egovframework.let.adm.service;

import java.util.Map;

import egovframework.let.adm.service.vo.UserInfoVO;

public interface EgovUserInfoService {
	Map<String, Object> getUserList(
		String usrGb,
		String usrLevel,
		String usrSta,
		String startDate,
		String endDate,
		String searchType,
		String searchKeyword,
		int page,
		int pageSize
	);
	UserInfoVO getUser(Integer usrIdx);
	UserInfoVO getUserById(String usrId);
	void createUser(UserInfoVO userInfo, String actorId);
	void updateUser(UserInfoVO userInfo, String actorId);
	void updateUserStatus(Integer usrIdx, String usrSta, String actorId);
	void updateUserPassword(Integer usrIdx, String newPassword, String actorId);
	void withdrawUser(Integer usrIdx, String actorId);
}

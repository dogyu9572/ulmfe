package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.UserInfoVO;
import egovframework.let.adm.service.impl.UserInfoDAO;
import egovframework.let.adm.util.CryptoUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovUserInfoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("egovUserInfoService")
public class EgovUserInfoServiceImpl extends EgovAbstractServiceImpl implements EgovUserInfoService {
	@Resource(name = "userInfoDAO")
	private UserInfoDAO userInfoDAO;
	@Resource(name = "passwordEncoder")
	private PasswordEncoder passwordEncoder;
	@Resource(name = "cryptoUtil")
	private CryptoUtil cryptoUtil;

	public Map<String, Object> getUserList(
		String userSeCd,
		String authrtCd,
		String mmplSttsCd,
		String startDate,
		String endDate,
		String searchType,
		String searchKeyword,
		int page,
		int pageSize
	) {
		int offset = (page - 1) * pageSize;
		String mapperSearchType = searchType;
		String mapperSearchKeyword = searchKeyword;
		String encryptedKeyword = null;
		boolean hasKeyword = searchKeyword != null && !searchKeyword.trim().isEmpty();
		if (hasKeyword) {
			if ("mblTelno".equals(searchType)) {
				mapperSearchType = "mblTelno";
				mapperSearchKeyword = cryptoUtil.encrypt(searchKeyword.trim().replaceAll("[^0-9]", ""));
			} else if ("emlAddr".equals(searchType)) {
				mapperSearchType = "emlAddr";
				mapperSearchKeyword = cryptoUtil.encrypt(searchKeyword.trim());
			} else if (searchType == null || "all".equals(searchType) || searchType.isEmpty()) {
				mapperSearchType = "all";
				mapperSearchKeyword = searchKeyword.trim();
				encryptedKeyword = cryptoUtil.encrypt(searchKeyword.trim());
			}
		}
		List<UserInfoVO> users = userInfoDAO.selectUserList(
			userSeCd, authrtCd, mmplSttsCd, startDate, endDate, mapperSearchType, mapperSearchKeyword, encryptedKeyword, offset, pageSize
		);
		int totalCount = userInfoDAO.selectUserListCount(
			userSeCd, authrtCd, mmplSttsCd, startDate, endDate, mapperSearchType, mapperSearchKeyword, encryptedKeyword
		);
		for (UserInfoVO user : users) {
			decryptPersonalInfo(user);
		}

		Map<String, Object> result = new HashMap<>();
		result.put("list", users);
		result.put("totalCount", totalCount);
		return result;
	}

	public UserInfoVO getUser(Integer userSn) {
		UserInfoVO user = userInfoDAO.selectUser(userSn);
		if (user != null) {
			decryptPersonalInfo(user);
		}
		return user;
	}

	public UserInfoVO getUserById(String userId) {
		UserInfoVO user = userInfoDAO.selectUserById(userId);
		if (user != null) {
			decryptPersonalInfo(user);
		}
		return user;
	}

	@Transactional
	public void createUser(UserInfoVO userInfo, String actorId) {
		if (userInfo.getEnpswd() == null || userInfo.getEnpswd().trim().isEmpty()) {
			throw new IllegalArgumentException("비밀번호를 입력해주세요.");
		}
		if (userInfo.getMmplSttsCd() == null || userInfo.getMmplSttsCd().isEmpty()) {
			userInfo.setMmplSttsCd("Y");
		}
		userInfo.setEnpswd(passwordEncoder.encode(userInfo.getEnpswd()));
		encryptPersonalInfo(userInfo);
		userInfo.setRgtr(actorId);
		userInfoDAO.insertUser(userInfo);
	}

	@Transactional
	public void updateUser(UserInfoVO userInfo, String actorId) {
		if (userInfo.getEnpswd() != null && !userInfo.getEnpswd().trim().isEmpty()) {
			userInfo.setEnpswd(passwordEncoder.encode(userInfo.getEnpswd()));
		} else {
			userInfo.setEnpswd(null);
		}
		encryptPersonalInfo(userInfo);
		userInfo.setMdtr(actorId);
		userInfoDAO.updateUser(userInfo);
	}

	@Transactional
	public void updateUserStatus(Integer userSn, String mmplSttsCd, String actorId) {
		userInfoDAO.updateUserStatus(userSn, mmplSttsCd, actorId);
	}

	@Transactional
	public void updateUserPassword(Integer userSn, String newPassword, String actorId) {
		if (newPassword == null || newPassword.trim().isEmpty()) {
			throw new IllegalArgumentException("비밀번호를 입력해주세요.");
		}
		userInfoDAO.updatePassword(userSn, passwordEncoder.encode(newPassword), actorId);
	}

	@Transactional
	public void withdrawUser(Integer userSn, String actorId) {
		userInfoDAO.withdrawUser(userSn, actorId);
	}

	private void encryptPersonalInfo(UserInfoVO userInfo) {
		if (userInfo.getMblTelno() != null && !userInfo.getMblTelno().trim().isEmpty()) {
			String cleanHp = userInfo.getMblTelno().replaceAll("[^0-9]", "");
			userInfo.setMblTelno(cryptoUtil.encrypt(cleanHp));
		}
		if (userInfo.getEmlAddr() != null && !userInfo.getEmlAddr().trim().isEmpty()) {
			userInfo.setEmlAddr(cryptoUtil.encrypt(userInfo.getEmlAddr().trim()));
		}
		if (userInfo.getAddr() != null && !userInfo.getAddr().trim().isEmpty()) {
			userInfo.setAddr(cryptoUtil.encrypt(userInfo.getAddr().trim()));
		}
		if (userInfo.getDtlAddr() != null && !userInfo.getDtlAddr().trim().isEmpty()) {
			userInfo.setDtlAddr(cryptoUtil.encrypt(userInfo.getDtlAddr().trim()));
		}
	}

	private void decryptPersonalInfo(UserInfoVO userInfo) {
		if (userInfo.getMblTelno() != null && !userInfo.getMblTelno().trim().isEmpty()) {
			userInfo.setMblTelno(cryptoUtil.safeDecrypt(userInfo.getMblTelno()));
		}
		if (userInfo.getEmlAddr() != null && !userInfo.getEmlAddr().trim().isEmpty()) {
			userInfo.setEmlAddr(cryptoUtil.safeDecrypt(userInfo.getEmlAddr()));
		}
		if (userInfo.getAddr() != null && !userInfo.getAddr().trim().isEmpty()) {
			userInfo.setAddr(cryptoUtil.safeDecrypt(userInfo.getAddr()));
		}
		if (userInfo.getDtlAddr() != null && !userInfo.getDtlAddr().trim().isEmpty()) {
			userInfo.setDtlAddr(cryptoUtil.safeDecrypt(userInfo.getDtlAddr()));
		}
	}
}

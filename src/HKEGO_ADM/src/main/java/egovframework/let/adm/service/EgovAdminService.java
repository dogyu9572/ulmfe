package egovframework.let.adm.service;

import java.util.Map;

import egovframework.let.adm.service.vo.AdminAccessLogVO;
import egovframework.let.adm.service.vo.AdminInfoVO;

public interface EgovAdminService {
	AdminInfoVO findById(String adminId);
	Map<String, Object> findAllPage(String status, String role, int page, int size);
	void create(AdminInfoVO admin, String rawPassword);
	void update(AdminInfoVO admin);
	void changePassword(String adminId, String rawPassword);
	void delete(String adminId);
	void recordAccessLog(AdminAccessLogVO log);
	void updateLastLogin(String adminId);
	boolean matchesPassword(String rawPassword, String encodedPassword);
}

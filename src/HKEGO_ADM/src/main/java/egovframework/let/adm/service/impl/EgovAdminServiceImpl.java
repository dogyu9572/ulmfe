package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.PageListResult;
import egovframework.let.adm.service.vo.AdminAccessLogVO;
import egovframework.let.adm.service.vo.AdminInfoVO;
import egovframework.let.adm.service.impl.AdminAccessLogDAO;
import egovframework.let.adm.service.impl.AdminDAO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovAdminService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service("egovAdminService")
public class EgovAdminServiceImpl extends EgovAbstractServiceImpl implements EgovAdminService {
	@Resource(name = "adminDAO")
	private AdminDAO adminDAO;
	@Resource(name = "adminAccessLogDAO")
	private AdminAccessLogDAO accessLogDAO;

	@Resource
	private PasswordEncoder passwordEncoder;

	public AdminInfoVO findById(String adminId) {
		return adminDAO.findById(adminId);
	}

	public Map<String, Object> findAllPage(String status, String role, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = adminDAO.countAdminList(status, role);
		List<AdminInfoVO> list = adminDAO.selectAdminList(status, role, offset, safeSize);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	@Transactional
	public void create(AdminInfoVO admin, String rawPassword) {
		admin.setEnpswd(passwordEncoder.encode(rawPassword));
		if (admin.getAcntSttsCd() == null) {
			admin.setAcntSttsCd("ACTIVE");
		}
		if (admin.getAuthrtCd() == null) {
			admin.setAuthrtCd("ADMIN");
		}
		adminDAO.insert(admin);
	}

	@Transactional
	public void update(AdminInfoVO admin) {
		adminDAO.update(admin);
	}

	@Transactional
	public void changePassword(String adminId, String rawPassword) {
		String encoded = passwordEncoder.encode(rawPassword);
		adminDAO.updatePassword(adminId, encoded);
	}

	@Transactional
	public void delete(String adminId) {
		adminDAO.delete(adminId);
	}

	@Transactional
	public void recordAccessLog(AdminAccessLogVO log) {
		accessLogDAO.insert(log);
	}

	@Transactional
	public void updateLastLogin(String adminId) {
		AdminInfoVO admin = adminDAO.findById(adminId);
		if (admin != null) {
			admin.setLastCntnDt(LocalDateTime.now());
			adminDAO.update(admin);
		}
	}

	public boolean matchesPassword(String rawPassword, String encodedPassword) {
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}
}


package egovframework.let.adm.service.impl;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovAccessEnvironmentService;
import egovframework.let.adm.service.vo.AccessEnvironmentSettingVO;
import egovframework.let.adm.service.vo.AdminAllowedIpVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;

@Service("egovAccessEnvironmentService")
public class EgovAccessEnvironmentServiceImpl extends EgovAbstractServiceImpl implements EgovAccessEnvironmentService {
	private static final String DEFAULT_STNG_ID = "DEFAULT";
	private static final int DEFAULT_SESSION_TIMEOUT_MIN = 30;
	private static final List<Integer> ALLOWED_SESSION_TIMEOUTS = List.of(30, 60, 120, 180, 240);
	private static final Pattern IPV4_PATTERN = Pattern.compile(
		"^(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}$");

	@Resource(name = "accessEnvironmentDAO")
	private AccessEnvironmentDAO accessEnvironmentDAO;

	@Override
	public AccessEnvironmentSettingVO getSetting() {
		AccessEnvironmentSettingVO setting = accessEnvironmentDAO.selectSetting();
		if (setting == null) {
			return AccessEnvironmentSettingVO.builder()
				.stngId(DEFAULT_STNG_ID)
				.sessionTimeoutMin(DEFAULT_SESSION_TIMEOUT_MIN)
				.build();
		}
		return setting;
	}

	@Override
	@Transactional
	public AccessEnvironmentSettingVO saveSetting(AccessEnvironmentSettingVO setting) {
		if (setting == null) {
			throw new IllegalArgumentException("저장할 접속시간 설정이 없습니다.");
		}
		Integer timeoutMin = setting.getSessionTimeoutMin();
		if (!ALLOWED_SESSION_TIMEOUTS.contains(timeoutMin)) {
			throw new IllegalArgumentException("접속시간은 30분, 1시간, 2시간, 3시간, 4시간 중 선택해야 합니다.");
		}
		setting.setStngId(DEFAULT_STNG_ID);
		accessEnvironmentDAO.upsertSetting(setting);
		return getSetting();
	}

	@Override
	public int getSessionTimeoutMinutes() {
		Integer timeoutMin = getSetting().getSessionTimeoutMin();
		return timeoutMin != null && timeoutMin > 0 ? timeoutMin : DEFAULT_SESSION_TIMEOUT_MIN;
	}

	@Override
	public Map<String, Object> getAllowedIpList(String prmIpAddr, String startDate, String endDate, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = accessEnvironmentDAO.selectAllowedIpCount(prmIpAddr, startDate, endDate);
		List<AdminAllowedIpVO> list = accessEnvironmentDAO.selectAllowedIpList(prmIpAddr, startDate, endDate, offset, safeSize);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	@Override
	public AdminAllowedIpVO getAllowedIp(Integer prmIpSn) {
		return prmIpSn != null ? accessEnvironmentDAO.selectAllowedIp(prmIpSn) : null;
	}

	@Override
	@Transactional
	public AdminAllowedIpVO saveAllowedIp(AdminAllowedIpVO allowedIp) {
		if (allowedIp == null) {
			throw new IllegalArgumentException("저장할 IP 정보가 없습니다.");
		}
		String prmIpAddr = allowedIp.getPrmIpAddr() != null ? allowedIp.getPrmIpAddr().trim() : "";
		if (!IPV4_PATTERN.matcher(prmIpAddr).matches()) {
			throw new IllegalArgumentException("접속 IP 형식이 올바르지 않습니다.");
		}
		allowedIp.setPrmIpAddr(prmIpAddr);
		if (allowedIp.getPrmIpSn() == null) {
			accessEnvironmentDAO.insertAllowedIp(allowedIp);
		} else {
			accessEnvironmentDAO.updateAllowedIp(allowedIp);
		}
		return getAllowedIp(allowedIp.getPrmIpSn());
	}

	@Override
	@Transactional
	public void deleteAllowedIp(Integer prmIpSn) {
		if (prmIpSn == null) {
			throw new IllegalArgumentException("삭제할 IP 번호가 없습니다.");
		}
		accessEnvironmentDAO.deleteAllowedIp(prmIpSn);
	}

	@Override
	@Transactional
	public void deleteAllowedIps(List<Integer> prmIpSns) {
		if (prmIpSns == null || prmIpSns.isEmpty()) {
			throw new IllegalArgumentException("삭제할 IP를 선택해주세요.");
		}
		accessEnvironmentDAO.deleteAllowedIps(prmIpSns);
	}
}

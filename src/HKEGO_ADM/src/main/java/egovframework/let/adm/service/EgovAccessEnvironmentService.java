package egovframework.let.adm.service;

import java.util.List;
import java.util.Map;

import egovframework.let.adm.service.vo.AccessEnvironmentSettingVO;
import egovframework.let.adm.service.vo.AdminAllowedIpVO;

public interface EgovAccessEnvironmentService {
	AccessEnvironmentSettingVO getSetting();
	AccessEnvironmentSettingVO saveSetting(AccessEnvironmentSettingVO setting);
	int getSessionTimeoutMinutes();
	Map<String, Object> getAllowedIpList(String prmIpAddr, String startDate, String endDate, int page, int size);
	AdminAllowedIpVO getAllowedIp(Integer prmIpSn);
	AdminAllowedIpVO saveAllowedIp(AdminAllowedIpVO allowedIp);
	void deleteAllowedIp(Integer prmIpSn);
	void deleteAllowedIps(List<Integer> prmIpSns);
}

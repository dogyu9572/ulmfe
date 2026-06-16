package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.AccessEnvironmentSettingVO;
import egovframework.let.adm.service.vo.AdminAllowedIpVO;

@Repository("accessEnvironmentDAO")
public class AccessEnvironmentDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.AccessEnvironmentDAO.";

	public AccessEnvironmentSettingVO selectSetting() {
		return selectOne(NS + "selectSetting");
	}

	public int upsertSetting(AccessEnvironmentSettingVO setting) {
		return insert(NS + "upsertSetting", setting);
	}

	public List<AdminAllowedIpVO> selectAllowedIpList(String prmIpAddr, String startDate, String endDate, int offset, int size) {
		Map<String, Object> param = new HashMap<>();
		param.put("prmIpAddr", prmIpAddr);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		param.put("offset", offset);
		param.put("size", size);
		return selectList(NS + "selectAllowedIpList", param);
	}

	public int selectAllowedIpCount(String prmIpAddr, String startDate, String endDate) {
		Map<String, Object> param = new HashMap<>();
		param.put("prmIpAddr", prmIpAddr);
		param.put("startDate", startDate);
		param.put("endDate", endDate);
		Integer count = selectOne(NS + "selectAllowedIpCount", param);
		return count == null ? 0 : count;
	}

	public AdminAllowedIpVO selectAllowedIp(Integer prmIpSn) {
		return selectOne(NS + "selectAllowedIp", prmIpSn);
	}

	public int insertAllowedIp(AdminAllowedIpVO allowedIp) {
		return insert(NS + "insertAllowedIp", allowedIp);
	}

	public int updateAllowedIp(AdminAllowedIpVO allowedIp) {
		return update(NS + "updateAllowedIp", allowedIp);
	}

	public int deleteAllowedIp(Integer prmIpSn) {
		return delete(NS + "deleteAllowedIp", prmIpSn);
	}

	public int deleteAllowedIps(List<Integer> prmIpSns) {
		return delete(NS + "deleteAllowedIps", prmIpSns);
	}
}

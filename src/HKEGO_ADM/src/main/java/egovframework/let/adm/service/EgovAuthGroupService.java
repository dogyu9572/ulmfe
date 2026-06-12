package egovframework.let.adm.service;

import java.util.List;
import java.util.Map;

import egovframework.let.adm.service.vo.AuthGroupDto;

public interface EgovAuthGroupService {
	Map<String, Object> getAuthGroupListPage(String useYn, int page, int size);
	AuthGroupDto getAuthGroup(String agId);
	void createAuthGroup(AuthGroupDto dto);
	void updateAuthGroup(AuthGroupDto dto);
	void deleteAuthGroup(String agId);
	List<String> getAuthMenuCodes(String groupId);
	List<String> getAuthorizedMenuPaths(String groupId);
	void setAuthMenus(String groupId, List<String> menuCodes, String regemp);
}

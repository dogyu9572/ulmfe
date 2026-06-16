package egovframework.let.adm.service;

import java.util.List;

import egovframework.let.adm.service.vo.HomepageMenuVO;

public interface EgovHomepageMenuService {
	List<HomepageMenuVO> getMenuList();
	HomepageMenuVO updateMenu(HomepageMenuVO menu);
	void moveMenu(String menuCd, String direction, String mdtr);
}

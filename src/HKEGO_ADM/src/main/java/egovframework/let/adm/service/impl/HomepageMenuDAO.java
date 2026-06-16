package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.HomepageMenuVO;

@Repository("homepageMenuDAO")
public class HomepageMenuDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.HomepageMenuDAO.";

	public List<HomepageMenuVO> selectMenuList() {
		return selectList(NS + "selectMenuList");
	}

	public HomepageMenuVO selectMenu(String menuCd) {
		return selectOne(NS + "selectMenu", menuCd);
	}

	public List<HomepageMenuVO> selectSiblingMenus(String parentMenuCd, Integer menuDepth) {
		Map<String, Object> param = new HashMap<>();
		param.put("parentMenuCd", parentMenuCd);
		param.put("menuDepth", menuDepth);
		return selectList(NS + "selectSiblingMenus", param);
	}

	public int updateMenu(HomepageMenuVO menu) {
		return update(NS + "updateMenu", menu);
	}

	public int updateMenuSort(String menuCd, Integer sortSeq, String mdtr) {
		Map<String, Object> param = new HashMap<>();
		param.put("menuCd", menuCd);
		param.put("sortSeq", sortSeq);
		param.put("mdtr", mdtr);
		return update(NS + "updateMenuSort", param);
	}
}

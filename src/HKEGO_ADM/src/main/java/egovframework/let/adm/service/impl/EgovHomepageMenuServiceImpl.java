package egovframework.let.adm.service.impl;

import java.util.List;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovHomepageMenuService;
import egovframework.let.adm.service.vo.HomepageMenuVO;
import jakarta.annotation.Resource;

@Service("egovHomepageMenuService")
public class EgovHomepageMenuServiceImpl extends EgovAbstractServiceImpl implements EgovHomepageMenuService {
	@Resource(name = "homepageMenuDAO")
	private HomepageMenuDAO homepageMenuDAO;

	@Override
	public List<HomepageMenuVO> getMenuList() {
		return homepageMenuDAO.selectMenuList();
	}

	@Override
	@Transactional
	public HomepageMenuVO updateMenu(HomepageMenuVO menu) {
		if (menu == null || isBlank(menu.getMenuCd())) {
			throw new IllegalArgumentException("수정할 메뉴를 선택해주세요.");
		}
		if (isBlank(menu.getMenuNm())) {
			throw new IllegalArgumentException("메뉴명을 입력해주세요.");
		}
		menu.setMenuNm(menu.getMenuNm().trim());
		menu.setUseYn("N".equalsIgnoreCase(menu.getUseYn()) ? "N" : "Y");
		homepageMenuDAO.updateMenu(menu);
		return homepageMenuDAO.selectMenu(menu.getMenuCd());
	}

	@Override
	@Transactional
	public void moveMenu(String menuCd, String direction, String mdtr) {
		HomepageMenuVO current = homepageMenuDAO.selectMenu(menuCd);
		if (current == null) {
			throw new IllegalArgumentException("이동할 메뉴를 찾을 수 없습니다.");
		}
		List<HomepageMenuVO> siblings = homepageMenuDAO.selectSiblingMenus(
			current.getParentMenuCd(), current.getMenuDepth());
		int index = -1;
		for (int i = 0; i < siblings.size(); i++) {
			if (menuCd.equals(siblings.get(i).getMenuCd())) {
				index = i;
				break;
			}
		}
		if (index < 0) {
			throw new IllegalArgumentException("동일 뎁스 메뉴 목록을 찾을 수 없습니다.");
		}
		int targetIndex = "up".equalsIgnoreCase(direction) ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= siblings.size()) {
			return;
		}
		HomepageMenuVO target = siblings.get(targetIndex);
		homepageMenuDAO.updateMenuSort(current.getMenuCd(), target.getSortSeq(), mdtr);
		homepageMenuDAO.updateMenuSort(target.getMenuCd(), current.getSortSeq(), mdtr);
	}

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}

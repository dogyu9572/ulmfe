package egovframework.let.usr.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicMenuVO;

/** 홈페이지 메뉴(HMPG_MENU) 중 노출 대상만 읽는다. */
@Repository("publicMenuDAO")
public class PublicMenuDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicMenuDAO.";

	public List<PublicMenuVO> selectVisibleMenus() {
		return selectList(NS + "selectVisibleMenus");
	}
}

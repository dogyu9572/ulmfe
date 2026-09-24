package egovframework.let.usr.service;

import java.util.List;

import egovframework.let.usr.service.vo.PublicMenuVO;

/** 사용자 사이트에 노출할 홈페이지 메뉴를 조회한다. */
public interface EgovPublicMenuService {
	List<PublicMenuVO> getVisibleMenus();
}

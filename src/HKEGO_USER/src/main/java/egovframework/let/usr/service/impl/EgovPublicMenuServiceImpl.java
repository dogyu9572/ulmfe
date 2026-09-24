package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicMenuService;
import egovframework.let.usr.service.vo.PublicMenuVO;
import lombok.RequiredArgsConstructor;

/** 사용자 사이트 헤더에 내려줄 메뉴 목록을 만든다. */
@Service("egovPublicMenuService")
@RequiredArgsConstructor
public class EgovPublicMenuServiceImpl implements EgovPublicMenuService {
	private final PublicMenuDAO publicMenuDAO;

	@Override
	@Transactional(readOnly = true)
	public List<PublicMenuVO> getVisibleMenus() {
		return publicMenuDAO.selectVisibleMenus();
	}
}

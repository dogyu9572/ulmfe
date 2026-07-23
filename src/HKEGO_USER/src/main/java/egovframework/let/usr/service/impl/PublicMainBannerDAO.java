package egovframework.let.usr.service.impl;

import java.util.List;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicMainBannerVO;

@Repository("publicMainBannerDAO")
public class PublicMainBannerDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicMainBannerDAO.";

	public List<PublicMainBannerVO> selectVisibleBanners() {
		return selectList(NS + "selectVisibleBanners");
	}
}

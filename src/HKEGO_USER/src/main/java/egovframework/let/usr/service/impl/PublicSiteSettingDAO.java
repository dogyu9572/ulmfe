package egovframework.let.usr.service.impl;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.usr.service.vo.PublicSiteSettingVO;

/** 기본설정(SITE_BASIC_STNG) 한 건을 읽는다. */
@Repository("publicSiteSettingDAO")
public class PublicSiteSettingDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.usr.service.impl.PublicSiteSettingDAO.";

	public PublicSiteSettingVO selectSiteSetting() {
		return selectOne(NS + "selectSiteSetting");
	}
}

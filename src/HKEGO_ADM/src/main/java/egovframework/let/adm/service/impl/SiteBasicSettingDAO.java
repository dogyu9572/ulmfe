package egovframework.let.adm.service.impl;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.SiteBasicSettingVO;

@Repository("siteBasicSettingDAO")
public class SiteBasicSettingDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.SiteBasicSettingDAO.";

	public SiteBasicSettingVO selectDefaultSetting() {
		return selectOne(NS + "selectDefaultSetting");
	}

	public int upsertDefaultSetting(SiteBasicSettingVO setting) {
		return insert(NS + "upsertDefaultSetting", setting);
	}
}

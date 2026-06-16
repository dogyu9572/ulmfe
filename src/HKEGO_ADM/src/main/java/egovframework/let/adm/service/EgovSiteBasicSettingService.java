package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.SiteBasicSettingVO;

public interface EgovSiteBasicSettingService {
	SiteBasicSettingVO getSiteBasicSetting();
	SiteBasicSettingVO saveSiteBasicSetting(SiteBasicSettingVO setting);
}

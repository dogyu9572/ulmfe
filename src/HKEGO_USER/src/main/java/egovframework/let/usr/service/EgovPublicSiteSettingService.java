package egovframework.let.usr.service;

import egovframework.let.usr.service.vo.PublicSiteSettingVO;

/** 사용자 사이트가 쓰는 기본설정을 조회한다. */
public interface EgovPublicSiteSettingService {
	PublicSiteSettingVO getSiteSetting();
}

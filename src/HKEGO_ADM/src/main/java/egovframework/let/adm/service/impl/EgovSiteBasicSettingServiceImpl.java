package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.EgovSiteBasicSettingService;
import egovframework.let.adm.service.vo.SiteBasicSettingVO;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("egovSiteBasicSettingService")
public class EgovSiteBasicSettingServiceImpl extends EgovAbstractServiceImpl implements EgovSiteBasicSettingService {
	private static final String DEFAULT_STNG_ID = "DEFAULT";

	@Resource(name = "siteBasicSettingDAO")
	private SiteBasicSettingDAO siteBasicSettingDAO;

	public SiteBasicSettingVO getSiteBasicSetting() {
		SiteBasicSettingVO setting = siteBasicSettingDAO.selectDefaultSetting();
		return setting != null ? setting : SiteBasicSettingVO.builder().stngId(DEFAULT_STNG_ID).build();
	}

	@Transactional
	public SiteBasicSettingVO saveSiteBasicSetting(SiteBasicSettingVO setting) {
		if (setting == null) {
			throw new RuntimeException("저장할 기본설정 정보가 없습니다.");
		}
		setting.setStngId(DEFAULT_STNG_ID);
		validateRequired(setting.getSiteTtl(), "사이트 타이틀");
		validateRequired(setting.getHmpgAddr(), "사이트 URL");
		validateRequired(setting.getMngrEmlAddr(), "관리자 이메일");
		int rows = siteBasicSettingDAO.upsertDefaultSetting(setting);
		if (rows <= 0) {
			throw new RuntimeException("기본설정 저장에 실패했습니다.");
		}
		return getSiteBasicSetting();
	}

	private void validateRequired(String value, String label) {
		if (value == null || value.isBlank()) {
			throw new RuntimeException(label + "을(를) 입력하세요.");
		}
	}
}

package egovframework.let.usr.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicSiteSettingService;
import egovframework.let.usr.service.vo.PublicSiteSettingVO;

/** 기본설정을 사용자 사이트가 쓰기 좋은 형태로 돌려준다. 설정이 없으면 빈 값으로 채워 화면이 기본값을 쓰게 한다. */
@Service("egovPublicSiteSettingService")
public class EgovPublicSiteSettingServiceImpl implements EgovPublicSiteSettingService {
	private final PublicSiteSettingDAO publicSiteSettingDAO;
	private final String kakaoMapAppKey;

	public EgovPublicSiteSettingServiceImpl(
		PublicSiteSettingDAO publicSiteSettingDAO,
		@Value("${app.kakao.map-app-key:}") String kakaoMapAppKey
	) {
		this.publicSiteSettingDAO = publicSiteSettingDAO;
		this.kakaoMapAppKey = kakaoMapAppKey == null ? "" : kakaoMapAppKey.trim();
	}

	@Override
	@Transactional(readOnly = true)
	public PublicSiteSettingVO getSiteSetting() {
		PublicSiteSettingVO setting = publicSiteSettingDAO.selectSiteSetting();
		if (setting == null) {
			setting = PublicSiteSettingVO.builder().build();
		}
		setting.setKakaoMapAppKey(kakaoMapAppKey);
		return setting;
	}
}

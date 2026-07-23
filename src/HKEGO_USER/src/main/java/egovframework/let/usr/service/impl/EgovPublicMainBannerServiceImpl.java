package egovframework.let.usr.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicMainBannerService;
import egovframework.let.usr.service.vo.PublicMainBannerVO;
import lombok.RequiredArgsConstructor;

@Service("egovPublicMainBannerService")
@RequiredArgsConstructor
public class EgovPublicMainBannerServiceImpl implements EgovPublicMainBannerService {
	private final PublicMainBannerDAO publicMainBannerDAO;

	@Override
	@Transactional(readOnly = true)
	public List<PublicMainBannerVO> getVisibleBanners() {
		return publicMainBannerDAO.selectVisibleBanners();
	}
}

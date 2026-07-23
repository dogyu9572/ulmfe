package egovframework.let.usr.service;

import java.util.List;

import egovframework.let.usr.service.vo.PublicMainBannerVO;

public interface EgovPublicMainBannerService {
	List<PublicMainBannerVO> getVisibleBanners();
}

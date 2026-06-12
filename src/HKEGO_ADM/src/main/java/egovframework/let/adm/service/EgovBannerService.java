package egovframework.let.adm.service;

import java.util.Map;

import egovframework.let.adm.service.vo.BannerDto;
import egovframework.let.adm.service.vo.BannerVO;

public interface EgovBannerService {
	Map<String, Object> getBannerListPage(
		String useYn, String startPublishDate, String endPublishDate,
		String startRegDate, String endRegDate, String searchType, String searchKeyword, int page, int size
	);
	BannerVO getBannerById(Integer bnrIdx);
	BannerVO createBanner(BannerDto dto);
	BannerVO updateBanner(Integer bnrIdx, BannerDto dto);
	void deleteBanner(Integer bnrIdx);
	void updateBannerSeq(Integer bnrIdx, Integer bnrSeq);
}

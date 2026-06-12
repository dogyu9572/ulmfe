package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.BannerDto;
import egovframework.let.adm.service.vo.PageListResult;
import egovframework.let.adm.service.vo.BannerVO;
import egovframework.let.adm.service.impl.BannerDAO;
import lombok.extern.slf4j.Slf4j;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovBannerService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service("egovBannerService")
public class EgovBannerServiceImpl extends EgovAbstractServiceImpl implements EgovBannerService {

	@Resource(name = "bannerDAO")
	private BannerDAO bannerDAO;

	public Map<String, Object> getBannerListPage(String useYn, String startPublishDate, String endPublishDate,
			String startRegDate, String endRegDate, String searchType, String searchKeyword, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = bannerDAO.countBannerList(useYn, startPublishDate, endPublishDate,
				startRegDate, endRegDate, searchType, searchKeyword);
		List<BannerVO> list = bannerDAO.selectBannerList(useYn, startPublishDate, endPublishDate,
				startRegDate, endRegDate, searchType, searchKeyword, offset, safeSize);
		log.info("배너 목록 조회: {}건 / 전체 {}건", list.size(), totalCount);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public BannerVO getBannerById(Integer bnrSn) {
		BannerVO banner = bannerDAO.findById(bnrSn);
		if (banner == null) {
			throw new RuntimeException("배너를 찾을 수 없습니다.");
		}
		return banner;
	}

	@Transactional
	public BannerVO createBanner(BannerDto dto) {
		BannerVO banner = BannerVO.builder()
				.bnrNm(dto.getBnrNm())
				.bnrMainCn(dto.getBnrMainCn())
				.bnrSubCn(dto.getBnrSubCn())
				.pdtYmd(dto.getPdtYmd())
				.newBadgeYn(dto.getNewBadgeYn() != null ? dto.getNewBadgeYn() : "N")
				.lnkgUrlAddr(dto.getLnkgUrlAddr())
				.lnkgSeCd(dto.getLnkgSeCd() != null ? dto.getLnkgSeCd() : "B")
				.pstgBgngYmd(dto.getPstgBgngYmd())
				.pstgEndYmd(dto.getPstgEndYmd())
				.pstgPrdUseYn(dto.getPstgPrdUseYn() != null ? dto.getPstgPrdUseYn() : "N")
				.pcAtchFileId(dto.getPcAtchFileId())
				.moblAtchFileId(dto.getMoblAtchFileId())
				.sortSeq(dto.getSortSeq() != null ? dto.getSortSeq() : 0)
				.useYn(dto.getUseYn() != null ? dto.getUseYn() : "Y")
				.rgtr("admin")
				.regDt(LocalDateTime.now())
				.build();
		bannerDAO.insert(banner);
		log.info("배너 등록: bnrSn={}", banner.getBnrSn());
		return banner;
	}

	@Transactional
	public BannerVO updateBanner(Integer bnrSn, BannerDto dto) {
		BannerVO existing = bannerDAO.findById(bnrSn);
		if (existing == null) {
			throw new RuntimeException("배너를 찾을 수 없습니다.");
		}
		BannerVO banner = BannerVO.builder()
				.bnrSn(bnrSn)
				.bnrNm(dto.getBnrNm())
				.bnrMainCn(dto.getBnrMainCn())
				.bnrSubCn(dto.getBnrSubCn())
				.pdtYmd(dto.getPdtYmd())
				.newBadgeYn(dto.getNewBadgeYn() != null ? dto.getNewBadgeYn() : "N")
				.lnkgUrlAddr(dto.getLnkgUrlAddr())
				.lnkgSeCd(dto.getLnkgSeCd() != null ? dto.getLnkgSeCd() : "B")
				.pstgBgngYmd(dto.getPstgBgngYmd())
				.pstgEndYmd(dto.getPstgEndYmd())
				.pstgPrdUseYn(dto.getPstgPrdUseYn() != null ? dto.getPstgPrdUseYn() : "N")
				.pcAtchFileId(dto.getPcAtchFileId())
				.moblAtchFileId(dto.getMoblAtchFileId())
				.sortSeq(dto.getSortSeq() != null ? dto.getSortSeq() : 0)
				.useYn(dto.getUseYn() != null ? dto.getUseYn() : "Y")
				.mdtr("admin")
				.mdfcnDt(LocalDateTime.now())
				.build();
		bannerDAO.update(banner);
		return bannerDAO.findById(bnrSn);
	}

	@Transactional
	public void deleteBanner(Integer bnrSn) {
		BannerVO existing = bannerDAO.findById(bnrSn);
		if (existing == null) {
			throw new RuntimeException("배너를 찾을 수 없습니다.");
		}
		bannerDAO.delete(bnrSn);
		log.info("배너 삭제(논리): bnrSn={}", bnrSn);
	}

	@Transactional
	public void updateBannerSeq(Integer bnrSn, Integer sortSeq) {
		int updated = bannerDAO.updateSeq(bnrSn, sortSeq);
		if (updated == 0) {
			throw new RuntimeException("배너 순서 변경에 실패했습니다.");
		}
	}
}

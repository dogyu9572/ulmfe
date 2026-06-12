package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.PageListResult;
import egovframework.let.adm.service.vo.PopupDto;
import egovframework.let.adm.service.vo.PopupVO;
import egovframework.let.adm.service.impl.PopupDAO;
import lombok.extern.slf4j.Slf4j;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovPopupService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service("egovPopupService")
public class EgovPopupServiceImpl extends EgovAbstractServiceImpl implements EgovPopupService {

	@Resource(name = "popupDAO")
	private PopupDAO popupDAO;

	public Map<String, Object> getPopupListPage(String useYn, String startPublishDate, String endPublishDate,
			String startRegDate, String endRegDate, String searchType, String searchKeyword, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = popupDAO.selectPopupCount(useYn, startPublishDate, endPublishDate,
				startRegDate, endRegDate, searchType, searchKeyword);
		List<PopupVO> list = popupDAO.selectPopupList(useYn, startPublishDate, endPublishDate,
				startRegDate, endRegDate, searchType, searchKeyword, offset, safeSize);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public PopupVO getPopupById(Long popupSn) {
		PopupVO popup = popupDAO.selectPopupById(popupSn);
		if (popup == null) {
			throw new RuntimeException("팝업을 찾을 수 없습니다.");
		}
		return popup;
	}

	@Transactional
	public PopupVO createPopup(PopupDto dto) {
		PopupVO popup = PopupVO.builder()
				.popupNm(dto.getPopupNm())
				.popupCn(dto.getPopupCn())
				.popupPstnX(dto.getPopupPstnX())
				.popupPstnY(dto.getPopupPstnY())
				.popupWdth(dto.getPopupWdth())
				.popupHght(dto.getPopupHght())
				.pstgBgngYmd(dto.getPstgBgngYmd())
				.pstgEndYmd(dto.getPstgEndYmd())
				.useYn(dto.getUseYn() != null ? dto.getUseYn() : "N")
				.atchFileMngNo(dto.getAtchFileMngNo())
				.popupUrlAddr(dto.getPopupUrlAddr())
				.lnkgSeCd(dto.getLnkgSeCd() != null ? dto.getLnkgSeCd() : "P")
				.rgtr("admin")
				.regDt(LocalDateTime.now())
				.build();
		popupDAO.insertPopup(popup);
		log.info("팝업 등록: popupSn={}", popup.getPopupSn());
		return popup;
	}

	@Transactional
	public PopupVO updatePopup(Long popupSn, PopupDto dto) {
		PopupVO existing = popupDAO.selectPopupById(popupSn);
		if (existing == null) {
			throw new RuntimeException("팝업을 찾을 수 없습니다.");
		}
		PopupVO popup = PopupVO.builder()
				.popupSn(popupSn)
				.popupNm(dto.getPopupNm())
				.popupCn(dto.getPopupCn())
				.popupPstnX(dto.getPopupPstnX())
				.popupPstnY(dto.getPopupPstnY())
				.popupWdth(dto.getPopupWdth())
				.popupHght(dto.getPopupHght())
				.pstgBgngYmd(dto.getPstgBgngYmd())
				.pstgEndYmd(dto.getPstgEndYmd())
				.useYn(dto.getUseYn() != null ? dto.getUseYn() : "N")
				.atchFileMngNo(dto.getAtchFileMngNo())
				.popupUrlAddr(dto.getPopupUrlAddr())
				.lnkgSeCd(dto.getLnkgSeCd() != null ? dto.getLnkgSeCd() : "P")
				.mdtr("admin")
				.mdfcnDt(LocalDateTime.now())
				.build();
		popupDAO.updatePopup(popup);
		return popupDAO.selectPopupById(popupSn);
	}

	@Transactional
	public void deletePopup(Long popupSn) {
		PopupVO existing = popupDAO.selectPopupById(popupSn);
		if (existing == null) {
			throw new RuntimeException("팝업을 찾을 수 없습니다.");
		}
		popupDAO.deletePopup(popupSn, "admin");
		log.info("팝업 삭제(논리): popupSn={}", popupSn);
	}
}

package egovframework.let.adm.service;

import java.util.Map;

import egovframework.let.adm.service.vo.PopupDto;
import egovframework.let.adm.service.vo.PopupVO;

public interface EgovPopupService {
	Map<String, Object> getPopupListPage(
		String useYn, String startPublishDate, String endPublishDate,
		String startRegDate, String endRegDate, String searchType, String searchKeyword, int page, int size
	);
	PopupVO getPopupById(Long popId);
	PopupVO createPopup(PopupDto dto);
	PopupVO updatePopup(Long popId, PopupDto dto);
	void deletePopup(Long popId);
}
